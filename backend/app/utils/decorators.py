import jwt
from flask import request, jsonify
from functools import wraps
from ..config import Config
from ..services.supabase_client import supabase

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return jsonify({"message": "Token is missing"}), 401
        try:
            token = token.replace("Bearer ", "")
            data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
            current_user_id = data["user_id"]
        except Exception:
            return jsonify({"message": "Token is invalid"}), 401
        return f(current_user_id, *args, **kwargs)
    return decorated

def auth_required(f):
    """
    Authentication decorator that supports both Bearer tokens and cookies.
    Falls back from Bearer token to cookie authentication.
    """
    @wraps(f)
    def decorated(*args, **kwargs):
        # Try Bearer token first
        token = request.headers.get("Authorization")
        if token:
            try:
                token = token.replace("Bearer ", "")
                data = jwt.decode(token, Config.JWT_SECRET, algorithms=["HS256"])
                current_user_id = data["user_id"]
                return f(current_user_id, *args, **kwargs)
            except Exception:
                pass  # Fall through to cookie auth
        
        # Try GitHub token cookie
        github_token = request.cookies.get('github_token')
        if github_token:
            try:
                # Get user from database using the GitHub token
                user_result = supabase.table("users").select("id").eq("github_access_token", github_token).execute()
                if user_result.data:
                    current_user_id = user_result.data[0]["id"]
                    return f(current_user_id, *args, **kwargs)
            except Exception as e:
                print(f"Cookie auth error: {e}")
                pass
        
        # Try user_id cookie as fallback
        user_id = request.cookies.get('user_id')
        if user_id:
            try:
                current_user_id = int(user_id)
                return f(current_user_id, *args, **kwargs)
            except (ValueError, TypeError):
                pass
        
        return jsonify({"message": "Authentication required"}), 401
    return decorated
