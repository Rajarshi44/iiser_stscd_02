#!/usr/bin/env python3
"""
Example usage of CV Analysis Agent with Supabase integration
"""

import os
from main import CVAnalysisAgent

def example_usage():
    """Demonstrate how to use the CV Analysis Agent with Supabase"""
    
    # Get API keys from environment variables (recommended) or set them here
    gemini_api_key = os.getenv('GEMINI_API_KEY')
    supabase_url = os.getenv('SUPABASE_URL', "https://ceuwldnnjixwsbofajxm.supabase.co")
    supabase_key = os.getenv('SUPABASE_ANON_KEY', "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldXdsZG5uaml4d3Nib2ZhanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQ0NjYsImV4cCI6MjA3MTUxMDQ2Nn0.fBWSKJ75LtX9BM4bYxiUuBSzyxZfMw-4JCxiF-D0Srw")
    
    # If no API key found, prompt user
    if not gemini_api_key or gemini_api_key == "your_gemini_api_key_here":
        print("❌ No valid Gemini API key found!")
        print("Please set GEMINI_API_KEY environment variable with your actual API key")
        print("Example: export GEMINI_API_KEY=AIza...")
        return False
    
    print("🤖 CV Analysis Agent Example Usage")
    print("=" * 50)
    
    # 1. Initialize the agent
    agent = CVAnalysisAgent(
        gemini_api_key=gemini_api_key,
        supabase_url=supabase_url,
        supabase_key=supabase_key
    )
    
    # 2. Parse a CV (PDF, TXT, or MD)
    cv_file = "deba_resume_1.pdf"
    
    if os.path.exists(cv_file):
        print(f"\n📄 Parsing CV: {cv_file}")
        cv_text = agent.parse_cv(cv_file)
        
        if cv_text:
            print(f"✅ CV parsed successfully ({len(cv_text)} characters)")
            
            # 3. Extract skills and goals
            print("\n🧠 Extracting skills and career goals...")
            skills, goals = agent.extract_skills_and_goals(cv_text)
            
            if skills:
                print(f"✅ Extracted {len(skills)} skills")
                
                # 4. Analyze skill gaps for target job
                target_job = "data_scientist"  # or "software_engineer", "product_manager"
                print(f"\n📊 Analyzing skill gaps for {target_job}...")
                analysis = agent.analyze_skill_gaps(target_job)
                
                if analysis:
                    match_percentage = analysis.get('match_percentage', 0)
                    print(f"✅ Job match: {match_percentage:.1f}%")
                    
                    # 5. Generate learning roadmap
                    print("\n🗺️ Generating learning roadmap...")
                    roadmap = agent.generate_roadmap()
                    
                    if roadmap:
                        print(f"✅ Generated roadmap with {len(roadmap)} items")
                        
                        # 6. Create test user and store in database
                        print("\n🗄️ Creating test user and storing in database...")
                        user_id = agent.create_test_user("example_user", "user@example.com")
                        
                        if user_id:
                            success = agent.store_analysis_to_database(target_job)
                            if success:
                                print("✅ Analysis stored in Supabase database!")
                                
                                # 7. Display results
                                print("\n📋 Analysis Results:")
                                agent.display_results()
                                
                                return True
    
    print("❌ Example failed - check your setup")
    return False

if __name__ == "__main__":
    # Note: You need to set your actual Gemini API key and ensure the PDF file exists
    print("📝 Note: Make sure to:")
    print("1. Set your actual Gemini API key in the script or environment")
    print("2. Ensure deba_resume_1.pdf exists in the current directory")
    print("3. Have internet connection for API calls")
    print()
    
    
    example_usage()
    
    print("✅ Example script ready - uncomment the last line to run!")
