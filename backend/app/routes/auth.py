from flask import Blueprint, request, jsonify
import requests, jwt
from datetime import datetime, timedelta, timezone
from ..config import Config
from ..services.supabase_client import supabase

bp = Blueprint("auth", __name__)

@bp.route("/github", methods=["POST"])
def github_login():
    code = request.json.get("code")
    token_url = "https://github.com/login/oauth/access_token"
    
    # Exchange code for token
    res = requests.post(token_url, data={
        "client_id": Config.GITHUB_CLIENT_ID,
        "client_secret": Config.GITHUB_CLIENT_SECRET,
        "code": code
    }, headers={"Accept": "application/json"})

    token_data = res.json()
    access_token = token_data.get("access_token")

    # Fetch user profile
    user_res = requests.get("https://api.github.com/user",
                            headers={"Authorization": f"token {access_token}"})
    user = user_res.json()

    # Upsert into Supabase
    supabase.table("users").upsert({
        "github_user_id": user["id"],
        "github_username": user["login"],
        "avatar_url": user.get("avatar_url"),
        "github_access_token": access_token
    }).execute()

    # JWT for frontend session
    payload = {"sub": user["id"], "exp": datetime.now(timezone.utc) + timedelta(hours=12)}
    jwt_token = jwt.encode(payload, Config.JWT_SECRET, algorithm="HS256")

    return jsonify({"token": jwt_token, "user": user})
