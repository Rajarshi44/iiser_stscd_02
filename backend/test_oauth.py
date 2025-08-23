#!/usr/bin/env python3
"""
Simple OAuth test script to help debug GitHub integration
"""

import os
from dotenv import load_dotenv
from app.services.github_service import GitHubIntegration

load_dotenv()

def test_oauth_config():
    """Test OAuth configuration"""
    print("🔍 Testing OAuth Configuration")
    print("=" * 40)
    
    # Check environment variables
    client_id = os.getenv("GITHUB_CLIENT_ID")
    client_secret = os.getenv("GITHUB_CLIENT_SECRET")
    redirect_uri = os.getenv("GITHUB_REDIRECT_URI")
    
    print(f"Client ID: {'✅ Set' if client_id else '❌ Missing'}")
    print(f"Client Secret: {'✅ Set' if client_secret else '❌ Missing'}")
    print(f"Redirect URI: {'✅ Set' if redirect_uri else '❌ Missing'}")
    
    if not all([client_id, client_secret, redirect_uri]):
        print("\n❌ Missing required environment variables!")
        print("Please check your .env file")
        return
    
    # Test OAuth URL generation
    print(f"\n🔗 Testing OAuth URL generation...")
    github_integration = GitHubIntegration(client_id, client_secret, redirect_uri)
    
    oauth_url = github_integration.get_oauth_url("test_state")
    print(f"Generated OAuth URL: {oauth_url}")
    
    # Test the flow
    print(f"\n📋 OAuth Flow Test:")
    print(f"1. Visit: {oauth_url}")
    print(f"2. GitHub will redirect to: {redirect_uri}")
    print(f"3. Check if the callback receives the 'code' parameter")
    
    print(f"\n🔧 Debug Endpoints:")
    print(f"- OAuth Debug: http://localhost:5000/debug/oauth")
    print(f"- Test Endpoint: http://localhost:5000/test")
    print(f"- Health Check: http://localhost:5000/")

if __name__ == "__main__":
    test_oauth_config() 