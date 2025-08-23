from flask import Flask
from flask_cors import CORS
from .config import Config
from .services.supabase_client import supabase
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Get frontend URL from environment or use default
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    
    # Configure CORS
    CORS(app, 
          origins=[frontend_url, "http://localhost:3000","http://127.0.0.1:3000"],
          methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
          supports_credentials=True)

    # Register blueprints
    from .routes import github, ai_services, ai_career
    app.register_blueprint(github.bp, url_prefix="")
    app.register_blueprint(ai_services.bp, url_prefix="")
    app.register_blueprint(ai_career.bp, url_prefix="")

    @app.route("/")
    def home():
        return {"status": "ok", "message": "Flask backend running"}

    return app
