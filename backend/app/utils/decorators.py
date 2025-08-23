import jwt
from flask import request, jsonify
from functools import wraps
from ..config import Config

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
