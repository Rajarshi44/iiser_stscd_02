from flask import Blueprint, request, jsonify
from ..services.supabase_client import supabase
from datetime import datetime, timezone, timedelta
import jwt
import os
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

bp = Blueprint('auth', __name__)

@bp.route("/auth/github/exchange", methods=["POST"])
def github_exchange():
    """Exchange GitHub authorization code for access token"""
    try:
        # Validate request content type
        if not request.is_json:
            return jsonify({"error": "Content-Type must be application/json"}), 400
        
        data = request.get_json()
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
            
        code = data.get('code')
        state = data.get('state')
        
        if not code:
            return jsonify({"error": "Authorization code is required"}), 400
        
        # Validate environment variables
        github_client_id = os.getenv("GITHUB_CLIENT_ID")
        github_client_secret = os.getenv("GITHUB_CLIENT_SECRET")
        jwt_secret = os.getenv("JWT_SECRET_KEY")
        
        if not all([github_client_id, github_client_secret, jwt_secret]):
            logger.error("Missing required environment variables")
            return jsonify({"error": "Server configuration error"}), 500
        
        # Exchange code for access token
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": github_client_id,
            "client_secret": github_client_secret,
            "code": code
        }
        
        # Add state if provided (recommended for security)
        if state:
            token_data["state"] = state
        
        headers = {
            "Accept": "application/json",
            "User-Agent": "YourAppName/1.0"  # GitHub requires User-Agent
        }
        
        # Make request with timeout
        try:
            response = requests.post(
                token_url, 
                data=token_data, 
                headers=headers,
                timeout=10
            )
            response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"GitHub token exchange failed: {e}")
            return jsonify({"error": "Failed to exchange code for token"}), 400
        
        token_response = response.json()
        
        # Check for GitHub API errors
        if "error" in token_response:
            logger.error(f"GitHub API error: {token_response}")
            return jsonify({"error": f"GitHub OAuth error: {token_response.get('error_description', 'Unknown error')}"}), 400
        
        access_token = token_response.get("access_token")
        if not access_token:
            logger.error(f"No access token in response: {token_response}")
            return jsonify({"error": "No access token received from GitHub"}), 400
        
        # Get user info from GitHub with proper headers
        user_headers = {
            "Authorization": f"Bearer {access_token}",  # Use Bearer instead of token
            "Accept": "application/vnd.github+json",
            "User-Agent": "YourAppName/1.0",
            "X-GitHub-Api-Version": "2022-11-28"
        }
        
        try:
            user_response = requests.get(
                "https://api.github.com/user",
                headers=user_headers,
                timeout=10
            )
            user_response.raise_for_status()
        except requests.exceptions.RequestException as e:
            logger.error(f"GitHub user info request failed: {e}")
            return jsonify({"error": "Failed to get user info from GitHub"}), 400
        
        github_user = user_response.json()
        
        # Validate required GitHub user data
        if not github_user.get("id") or not github_user.get("login"):
            logger.error(f"Invalid GitHub user data: {github_user}")
            return jsonify({"error": "Invalid user data from GitHub"}), 400
        
        # Get user's primary email if not public
        email = github_user.get("email")
        if not email:
            try:
                emails_response = requests.get(
                    "https://api.github.com/user/emails",
                    headers=user_headers,
                    timeout=10
                )
                if emails_response.status_code == 200:
                    emails = emails_response.json()
                    primary_email = next((e["email"] for e in emails if e["primary"]), None)
                    if primary_email:
                        email = primary_email
            except Exception as e:
                logger.warning(f"Could not fetch user emails: {e}")
        
        # Prepare user data
        current_time = datetime.now(timezone.utc).isoformat()
        user_data = {
            "github_user_id": github_user["id"],
            "github_username": github_user["login"],
            "github_access_token": access_token,  # Consider encrypting this
            "email": email,
            "name": github_user.get("name"),
            "avatar_url": github_user.get("avatar_url"),
            "updated_at": current_time
        }
        
        # Database operations with error handling
        try:
            # Check if user exists
            existing_user = supabase.table("users").select("*").eq("github_user_id", github_user["id"]).execute()
            
            if existing_user.data:
                # Update existing user
                user_result = supabase.table("users").update(user_data).eq("github_user_id", github_user["id"]).execute()
                if not user_result.data:
                    logger.error("Failed to update existing user")
                    return jsonify({"error": "Failed to update user"}), 500
                user_id = existing_user.data[0]["id"]
                logger.info(f"Updated existing user: {user_id}")
            else:
                # Create new user
                user_data["created_at"] = current_time
                user_result = supabase.table("users").insert(user_data).execute()
                if not user_result.data:
                    logger.error("Failed to create new user")
                    return jsonify({"error": "Failed to create user"}), 500
                user_id = user_result.data[0]["id"]
                logger.info(f"Created new user: {user_id}")
                
        except Exception as e:
            logger.error(f"Database operation failed: {e}")
            return jsonify({"error": "Database operation failed"}), 500
        
        # Generate JWT token with more claims
        try:
            token_payload = {
                "user_id": user_id,
                "github_username": github_user["login"],
                "iat": datetime.now(timezone.utc),
                "exp": datetime.now(timezone.utc) + timedelta(days=7)
            }
            
            token = jwt.encode(
                token_payload,
                jwt_secret,
                algorithm="HS256"
            )
        except Exception as e:
            logger.error(f"JWT token generation failed: {e}")
            return jsonify({"error": "Failed to generate authentication token"}), 500
        
        # Success response
        response_data = {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "github_username": github_user["login"],
                "name": github_user.get("name"),
                "email": email,
                "avatar_url": github_user.get("avatar_url")
            }
        }
        
        logger.info(f"Successful GitHub OAuth for user: {github_user['login']}")
        return jsonify(response_data), 200
        
    except Exception as e:
        logger.error(f"Unexpected error in GitHub exchange: {e}")
        return jsonify({"error": "Authentication failed due to server error"}), 500