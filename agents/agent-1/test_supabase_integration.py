#!/usr/bin/env python3
"""
Test script for Supabase integration with CV Analysis Agent
Demonstrates parsing the provided PDF resume and storing results in Supabase
"""

import os
import sys
from pathlib import Path

# Add the current directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from main import CVAnalysisAgent

def test_supabase_integration():
    """Test the complete CV analysis pipeline with Supabase integration"""
    
    print("🧪 Testing Supabase Integration with CV Analysis Agent")
    print("=" * 70)
    
    # Environment setup
    print("\n📋 Step 1: Environment Setup")
    
    # Check for required environment variables
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    supabase_url = os.getenv('SUPABASE_URL') or 'https://ceuwldnnjixwsbofajxm.supabase.co'
    supabase_key = os.getenv('SUPABASE_ANON_KEY') or 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldXdsZG5uaml4d3Nib2ZhanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQ0NjYsImV4cCI6MjA3MTUxMDQ2Nn0.fBWSKJ75LtX9BM4bYxiUuBSzyxZfMw-4JCxiF-D0Srw'
    
    if not gemini_api_key:
        print("❌ GEMINI_API_KEY not found in environment")
        print("Please set your Gemini API key in the environment or .env file")
        return False
    
    print(f"✅ Gemini API Key: {'*' * 20}...{gemini_api_key[-4:]}")
    print(f"✅ Supabase URL: {supabase_url}")
    print(f"✅ Supabase Key: {'*' * 20}...{supabase_key[-4:]}")
    
    # Initialize agent
    print("\n🤖 Step 2: Initialize CV Analysis Agent")
    agent = CVAnalysisAgent(
        gemini_api_key=gemini_api_key,
        supabase_url=supabase_url,
        supabase_key=supabase_key
    )
    
    if not agent.model:
        print("❌ Failed to initialize Gemini model")
        return False
    
    if not agent.db or not agent.db.client:
        print("❌ Failed to initialize Supabase client")
        return False
    
    # Test with the provided PDF resume
    pdf_path = "deba_resume_1.pdf"
    
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        print("Please ensure deba_resume_1.pdf is in the current directory")
        return False
    
    print(f"✅ Found PDF resume: {pdf_path}")
    
    # Parse CV
    print("\n📄 Step 3: Parse PDF Resume")
    cv_text = agent.parse_cv(pdf_path)
    
    if not cv_text:
        print("❌ Failed to parse PDF resume")
        return False
    
    print(f"✅ PDF parsed successfully ({len(cv_text):,} characters extracted)")
    print(f"📝 Preview: {cv_text[:200]}...")
    
    # Extract skills and career goals
    print("\n🧠 Step 4: Extract Skills and Career Goals")
    skills, goals = agent.extract_skills_and_goals(cv_text)
    
    if not skills:
        print("❌ Failed to extract skills")
        return False
    
    print(f"✅ Extracted {len(skills)} skills")
    if goals:
        print(f"🎯 Career Target: {goals.title}")
    
    # Analyze skill gaps for different target jobs
    target_jobs = ["software_engineer", "data_scientist", "product_manager"]
    
    print("\n📊 Step 5: Analyze Skill Gaps")
    best_match = None
    best_score = 0
    
    for job in target_jobs:
        analysis = agent.analyze_skill_gaps(job)
        if analysis:
            match_percentage = analysis.get('match_percentage', 0)
            print(f"  📈 {job.replace('_', ' ').title()}: {match_percentage:.1f}% match")
            
            if match_percentage > best_score:
                best_score = match_percentage
                best_match = job
    
    if best_match:
        print(f"🏆 Best match: {best_match.replace('_', ' ').title()} ({best_score:.1f}%)")
        
        # Generate roadmap for best match
        print(f"\n🗺️  Step 6: Generate Learning Roadmap for {best_match.replace('_', ' ').title()}")
        roadmap = agent.generate_roadmap()
        
        if roadmap:
            print(f"✅ Generated roadmap with {len(roadmap)} learning items")
        else:
            print("❌ Failed to generate roadmap")
            return False
    
    # Create test user and store in database
    print("\n🗄️  Step 7: Create Test User and Store in Database")
    
    # Create test user
    user_id = agent.create_test_user("deba_test_user", "deba@iiser.ac.in")
    
    if not user_id:
        print("❌ Failed to create test user")
        return False
    
    # Store complete analysis
    success = agent.store_analysis_to_database(best_match)
    
    if not success:
        print("❌ Failed to store analysis in database")
        return False
    
    # Display results
    print("\n📋 Step 8: Display Results")
    agent.display_results()
    
    # Success summary
    print("\n🎉 TEST COMPLETED SUCCESSFULLY!")
    print("=" * 70)
    print(f"✅ PDF Resume parsed and analyzed")
    print(f"✅ Test user created: ID {user_id}")
    print(f"✅ Complete analysis stored in Supabase")
    print(f"✅ Best job match: {best_match.replace('_', ' ').title()} ({best_score:.1f}%)")
    print(f"✅ Skills extracted: {len(skills)}")
    print(f"✅ Roadmap items: {len(roadmap) if 'roadmap' in locals() else 0}")
    
    return True

if __name__ == "__main__":
    success = test_supabase_integration()
    sys.exit(0 if success else 1)
