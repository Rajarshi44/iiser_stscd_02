from flask import Flask
from flask_cors import CORS
from .config import Config
from .services.supabase_client import supabase

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)  # Allow frontend to call API

    # Register blueprints
    from .routes import github, ai_services, ai_career
    app.register_blueprint(github.bp, url_prefix="")
    app.register_blueprint(ai_services.bp, url_prefix="")
    app.register_blueprint(ai_career.bp, url_prefix="")

    @app.route("/")
    def home():
        return {"status": "ok", "message": "Flask backend running"}

    return app
