from flask import Blueprint, request, jsonify
from ..services.supabase_client import supabase
from datetime import datetime, timezone, timedelta
import jwt
import os
import requests


@bp.route("/auth/github/exchange", methods=["POST"])
def github_exchange():
    """Exchange GitHub authorization code for access token"""
    try:
        data = request.get_json()
        code = data.get('code')
        state = data.get('state')
        
        if not code:
            return jsonify({"error": "Authorization code is required"}), 400
        
        # Exchange code for access token
        token_url = "https://github.com/login/oauth/access_token"
        token_data = {
            "client_id": os.getenv("GITHUB_CLIENT_ID"),
            "client_secret": os.getenv("GITHUB_CLIENT_SECRET"),
            "code": code,
            "state": state
        }
        
        headers = {"Accept": "application/json"}
        response = requests.post(token_url, data=token_data, headers=headers)
        
        if response.status_code != 200:
            return jsonify({"error": "Failed to exchange code for token"}), 400
        
        token_response = response.json()
        access_token = token_response.get("access_token")
        
        if not access_token:
            return jsonify({"error": "No access token received"}), 400
        
        # Get user info from GitHub
        user_response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}"}
        )
        
        if user_response.status_code != 200:
            return jsonify({"error": "Failed to get user info"}), 400
        
        github_user = user_response.json()
        
        # Store/update user in database
        user_data = {
            "github_user_id": github_user["id"],
            "github_username": github_user["login"],
            "github_access_token": access_token,
            "email": github_user.get("email"),
            "name": github_user.get("name"),
            "avatar_url": github_user.get("avatar_url"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Check if user exists
        existing_user = supabase.table("users").select("*").eq("github_user_id", github_user["id"]).execute()
        
        if existing_user.data:
            # Update existing user
            user_result = supabase.table("users").update(user_data).eq("github_user_id", github_user["id"]).execute()
            user_id = existing_user.data[0]["id"]
        else:
            # Create new user
            user_data["created_at"] = datetime.now(timezone.utc).isoformat()
            user_result = supabase.table("users").insert(user_data).execute()
            user_id = user_result.data[0]["id"] if user_result.data else None
        
        if not user_id:
            return jsonify({"error": "Failed to create/update user"}), 500
        
        # Generate JWT token
        token = jwt.encode(
            {"user_id": user_id, "exp": datetime.now(timezone.utc) + timedelta(days=7)},
            os.getenv("JWT_SECRET_KEY"),
            algorithm="HS256"
        )
        
        return jsonify({
            "success": True,
            "token": token,
            "user_info": {
                "id": user_id,
                "github_username": github_user["login"],
                "name": github_user.get("name"),
                "avatar_url": github_user.get("avatar_url")
            }
        })
        
    except Exception as e:
        print(f"GitHub exchange error: {e}")
        return jsonify({"error": "Authentication failed"}), 500