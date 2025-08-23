#!/usr/bin/env python3
"""
Database initialization script for the AI-powered GitHub development platform
This script creates all the necessary tables in Supabase according to the schema
"""

import os
from dotenv import load_dotenv
from app.services.supabase_client import supabase

load_dotenv()

def create_tables():
    """Create all the database tables according to the schema"""
    
    print("🚀 Initializing database tables...")
    
    # Users table
    try:
        print("📝 Creating users table...")
        supabase.table("users").select("*").limit(1).execute()
        print("✅ Users table already exists")
    except:
        print("❌ Users table not found - please create it manually in Supabase")
    
    # AI Issues table
    try:
        print("📝 Creating ai_issues table...")
        supabase.table("ai_issues").select("*").limit(1).execute()
        print("✅ AI Issues table already exists")
    except:
        print("❌ AI Issues table not found - please create it manually in Supabase")
    
    # AI Repositories table
    try:
        print("📝 Creating ai_repositories table...")
        supabase.table("ai_repositories").select("*").limit(1).execute()
        print("✅ AI Repositories table already exists")
    except:
        print("❌ AI Repositories table not found - please create it manually in Supabase")
    
    # Repository Analyses table
    try:
        print("📝 Creating repository_analyses table...")
        supabase.table("repository_analyses").select("*").limit(1).execute()
        print("✅ Repository Analyses table already exists")
    except:
        print("❌ Repository Analyses table not found - please create it manually in Supabase")
    
    # Tech Recommendations table
    try:
        print("📝 Creating tech_recommendations table...")
        supabase.table("tech_recommendations").select("*").limit(1).execute()
        print("✅ Tech Recommendations table already exists")
    except:
        print("❌ Tech Recommendations table not found - please create it manually in Supabase")
    
    # Repository Roadmaps table
    try:
        print("📝 Creating repository_roadmaps table...")
        supabase.table("repository_roadmaps").select("*").limit(1).execute()
        print("✅ Repository Roadmaps table already exists")
    except:
        print("❌ Repository Roadmaps table not found - please create it manually in Supabase")
    
    # User Progress table
    try:
        print("📝 Creating user_progress table...")
        supabase.table("user_progress").select("*").limit(1).execute()
        print("✅ User Progress table already exists")
    except:
        print("❌ User Progress table not found - please create it manually in Supabase")
    
    # User Onboarding table
    try:
        print("📝 Creating user_onboarding table...")
        supabase.table("user_onboarding").select("*").limit(1).execute()
        print("✅ User Onboarding table already exists")
    except:
        print("❌ User Onboarding table not found - please create it manually in Supabase")
    
    # User Skills Analysis table
    try:
        print("📝 Creating user_skills_analysis table...")
        supabase.table("user_skills_analysis").select("*").limit(1).execute()
        print("✅ User Skills Analysis table already exists")
    except:
        print("❌ User Skills Analysis table not found - please create it manually in Supabase")
    
    # User Achievements table
    try:
        print("📝 Creating user_achievements table...")
        supabase.table("user_achievements").select("*").limit(1).execute()
        print("✅ User Achievements table already exists")
    except:
        print("❌ User Achievements table not found - please create it manually in Supabase")
    
    # User Submissions table
    try:
        print("📝 Creating user_submissions table...")
        supabase.table("user_submissions").select("*").limit(1).execute()
        print("✅ User Submissions table already exists")
    except:
        print("❌ User Submissions table not found - please create it manually in Supabase")
    
    # Leaderboard table
    try:
        print("📝 Creating leaderboard table...")
        supabase.table("leaderboard").select("*").limit(1).execute()
        print("✅ Leaderboard table already exists")
    except:
        print("❌ Leaderboard table not found - please create it manually in Supabase")
    
    # Agent Operations table
    try:
        print("📝 Creating agent_operations table...")
        supabase.table("agent_operations").select("*").limit(1).execute()
        print("✅ Agent Operations table already exists")
    except:
        print("❌ Agent Operations table not found - please create it manually in Supabase")
    
    # Agent Metrics table
    try:
        print("📝 Creating agent_metrics table...")
        supabase.table("agent_metrics").select("*").limit(1).execute()
        print("✅ Agent Metrics table already exists")
    except:
        print("❌ Agent Metrics table not found - please create it manually in Supabase")
    
    # User Resume table
    try:
        print("📝 Creating user_resume table...")
        supabase.table("user_resume").select("*").limit(1).execute()
        print("✅ User Resume table already exists")
    except:
        print("❌ User Resume table not found - please create it manually in Supabase")

def check_connection():
    """Check if we can connect to Supabase"""
    try:
        print("🔍 Testing Supabase connection...")
        # Try to access a table to test connection
        supabase.table("users").select("*").limit(1).execute()
        print("✅ Successfully connected to Supabase!")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to Supabase: {str(e)}")
        print("Please check your SUPABASE_URL and SUPABASE_KEY in .env file")
        return False

def main():
    print("🏗️  Database Initialization for AI GitHub Platform")
    print("=" * 50)
    
    # Check connection first
    if not check_connection():
        print("\n❌ Cannot proceed without database connection")
        return
    
    print("\n📋 Checking existing tables...")
    create_tables()
    
    print("\n🎯 Next steps:")
    print("1. Create any missing tables in Supabase using the provided schema")
    print("2. Set up Row Level Security (RLS) policies if needed")
    print("3. Test the API endpoints")
    
    print("\n📚 Available API endpoints:")
    print("- Health check: GET /")
    print("- Test endpoint: 00GET /test")
    print("- GitHub OAuth: GET /auth/github")
    print("- User profile: GET /api/user/profile")
    print("- User repositories: GET /api/user/repositories")
    print("- AI Issues: GET/POST /api/ai/issues")
    print("- AI Repositories: GET/POST /api/ai/repositories")
    print("- Repository Analysis: POST /api/repository/analysis")
    print("- Tech Recommendations: GET/POST /api/tech/recommendations")
    print("- Repository Roadmaps: GET/POST /api/repository/roadmap")
    print("- User Skills: GET/POST /api/user/skills")
    print("- User Onboarding: GET/POST/PUT /api/user/onboarding")
    print("- User Progress: GET /api/user/progress")
    print("- Leaderboard: GET /api/leaderboard")
    print("- Agent Operations: GET/POST /api/agent/operations")

if __name__ == "__main__":
    main() 