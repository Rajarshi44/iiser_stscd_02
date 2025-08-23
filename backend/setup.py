#!/usr/bin/env python3
"""
Setup script for the Flask backend
This script helps you configure the environment and start the server
"""

import os
import sys
from pathlib import Path

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_path = Path(".env")
    
    if env_path.exists():
        print("✅ .env file already exists")
        return
    
    print("📝 Creating .env file...")
    
    env_content = """# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
"""
    
    with open(env_path, "w") as f:
        f.write(env_content)
    
    print("✅ .env file created successfully!")
    print("⚠️  Please update the .env file with your actual credentials")

def check_dependencies():
    """Check if required packages are installed"""
    print("🔍 Checking dependencies...")
    
    try:
        import flask
        import supabase
        import jwt
        import requests
        print("✅ All required packages are installed")
    except ImportError as e:
        print(f"❌ Missing package: {e}")
        print("Please run: pip install -r requirements.txt")
        return False
    
    return True

def check_env_vars():
    """Check if environment variables are set"""
    print("🔍 Checking environment variables...")
    
    from dotenv import load_dotenv
    load_dotenv()
    
    required_vars = [
        "SUPABASE_URL",
        "SUPABASE_KEY", 
        "GITHUB_CLIENT_ID",
        "GITHUB_CLIENT_SECRET"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("Please update your .env file with the required values")
        return False
    else:
        print("✅ All required environment variables are set")
        return False

def main():
    print("🚀 Flask Backend Setup")
    print("=" * 40)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Create .env file if needed
    create_env_file()
    
    # Check environment variables
    check_env_vars()
    
    print("\n📋 Next steps:")
    print("1. Update the .env file with your actual credentials")
    print("2. Set up GitHub OAuth app at: https://github.com/settings/developers")
    print("3. Set up Supabase project at: https://supabase.com")
    print("4. Run the server: python run.py")
    
    print("\n🔗 Useful URLs:")
    print("- Backend: http://localhost:5000")
    print("- Test endpoint: http://localhost:5000/test")
    print("- GitHub OAuth: http://localhost:5000/auth/github")

if __name__ == "__main__":
    main() 