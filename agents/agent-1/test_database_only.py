#!/usr/bin/env python3
"""
Test database integration without requiring Gemini API
Uses mock data to test Supabase connection and storage
"""

import os
import sys
from main import CVAnalysisAgent, CareerGoal

def test_database_integration():
    """Test Supabase integration with mock data"""
    
    print("🗄️ Testing Supabase Database Integration")
    print("=" * 50)
    
    # Use Supabase credentials (no Gemini API key needed for this test)
    supabase_url = "https://ceuwldnnjixwsbofajxm.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldXdsZG5uaml4d3Nib2ZhanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQ0NjYsImV4cCI6MjA3MTUxMDQ2Nn0.fBWSKJ75LtX9BM4bYxiUuBSzyxZfMw-4JCxiF-D0Srw"
    
    # Initialize agent (will use mock mode without Gemini API key)
    agent = CVAnalysisAgent(
        gemini_api_key=None,  # This will trigger mock mode
        supabase_url=supabase_url,
        supabase_key=supabase_key
    )
    
    # Check Supabase connection
    if not agent.db or not agent.db.client:
        print("❌ Failed to connect to Supabase")
        return False
    
    print("✅ Supabase connection successful")
    
    # Create mock CV data (simulating what Gemini would extract)
    mock_cv_text = """
    DEBA RESUME
    
    SKILLS:
    - Python (Advanced - 3 years experience)
    - Machine Learning (Intermediate - 2 years experience)
    - SQL (Advanced - 4 years experience)
    - JavaScript (Intermediate - 2 years experience)
    - React (Beginner - 1 year experience)
    - Git (Advanced - 3 years experience)
    
    EXPERIENCE:
    Software Developer at Tech Company (2 years)
    Data Analyst Intern (1 year)
    
    EDUCATION:
    B.Tech Computer Science
    
    CAREER GOALS:
    Aspiring to become a Data Scientist
    Interested in AI/ML applications
    """
    
    # Set mock data in cache
    agent.cache["cv_text"] = mock_cv_text
    
    # Create mock skills data
    mock_skills = [
        {"name": "Python", "level": 4, "category": "programming", "evidence": "3 years experience mentioned", "years_experience": "3", "context": "professional"},
        {"name": "Machine Learning", "level": 3, "category": "ai_ml", "evidence": "2 years experience mentioned", "years_experience": "2", "context": "professional"},
        {"name": "SQL", "level": 4, "category": "database", "evidence": "4 years experience mentioned", "years_experience": "4", "context": "professional"},
        {"name": "JavaScript", "level": 3, "category": "programming", "evidence": "2 years experience mentioned", "years_experience": "2", "context": "professional"},
        {"name": "React", "level": 2, "category": "frontend", "evidence": "1 year experience mentioned", "years_experience": "1", "context": "professional"},
        {"name": "Git", "level": 4, "category": "tools", "evidence": "3 years experience mentioned", "years_experience": "3", "context": "professional"}
    ]
    
    agent.cache["extracted_skills"] = mock_skills
    
    # Create mock career goals
    mock_career_goals = CareerGoal(
        title="Data Scientist",
        industry="technology",
        experience_level="intermediate",
        timeline="medium_term"
    )
    
    agent.cache["career_goals"] = mock_career_goals
    
    print("✅ Mock CV data prepared")
    print(f"   📊 Skills: {len(mock_skills)}")
    print(f"   🎯 Career Goal: {mock_career_goals.title}")
    
    # Test skill gap analysis
    print("\n📊 Testing skill gap analysis...")
    target_job = "data_scientist"
    analysis = agent.analyze_skill_gaps(target_job)
    
    if analysis:
        match_percentage = analysis.get('match_percentage', 0)
        print(f"✅ Skill gap analysis complete: {match_percentage:.1f}% match")
        print(f"   ✅ Strengths: {len(analysis.get('strengths', []))}")
        print(f"   ⚠️  Gaps: {len(analysis.get('skill_gaps', []))}")
    else:
        print("❌ Skill gap analysis failed")
        return False
    
    # Test roadmap generation
    print("\n🗺️ Testing roadmap generation...")
    roadmap = agent.generate_roadmap()
    
    if roadmap:
        print(f"✅ Roadmap generated: {len(roadmap)} items")
        high_priority = [r for r in roadmap if r.priority == "high"]
        print(f"   🔥 High priority items: {len(high_priority)}")
    else:
        print("❌ Roadmap generation failed")
        return False
    
    # Test database operations
    print("\n🗄️ Testing database operations...")
    
    # Create test user
    user_id = agent.create_test_user("deba_database_test", "deba.test@iiser.ac.in")
    
    if not user_id:
        print("❌ Failed to create test user")
        return False
    
    print(f"✅ Test user created: ID {user_id}")
    
    # Store analysis in database
    success = agent.store_analysis_to_database(target_job)
    
    if not success:
        print("❌ Failed to store analysis in database")
        return False
    
    print("✅ Analysis data stored in Supabase successfully!")
    
    # Display results
    print("\n📋 Results Summary:")
    print("-" * 40)
    print(f"📊 Skills extracted: {len(mock_skills)}")
    print(f"🎯 Career target: {mock_career_goals.title}")
    print(f"📈 Job match: {match_percentage:.1f}%")
    print(f"🗺️ Roadmap items: {len(roadmap)}")
    print(f"👤 User ID: {user_id}")
    print(f"🗄️ Database: All data stored successfully")
    
    print("\n🎉 Database integration test completed successfully!")
    print("✅ Supabase connection and data storage working correctly")
    
    return True

if __name__ == "__main__":
    print("🧪 Testing database integration without Gemini API")
    print("This test uses mock data to verify Supabase connectivity")
    print()
    
    success = test_database_integration()
    
    if success:
        print("\n💡 Next steps:")
        print("1. Set up your Gemini API key using: python setup_api_key.py")
        print("2. Run full integration test: python test_supabase_integration.py")
        print("3. Process actual resume: python main.py deba_resume_1.pdf --create-test-user")
    else:
        print("\n❌ Database test failed. Please check your Supabase connection.")
    
    sys.exit(0 if success else 1)
