#!/usr/bin/env python3
"""
Simple test script for CV Analysis Agent
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_agent():
    """Simple test of the CV analysis agent"""
    print("🧪 Testing CV Analysis Agent")
    print("="*40)
    
    try:
        from iiser_stscd_02.agents.main import CVAnalysisAgent
        
        # Test initialization
        print("1. Testing agent initialization...")
        agent = CVAnalysisAgent()  # Will use environment variable
        print("   ✅ Agent initialized successfully")
        
        # Test CV parsing with text file
        print("\n2. Testing CV parsing...")
        
        # Check if sample CV exists
        cv_files = ["sample_cv_detailed.txt", "sample_cv.txt"]
        test_cv = None
        
        for cv_file in cv_files:
            if os.path.exists(cv_file):
                test_cv = cv_file
                break
        
        if not test_cv:
            print("   ❌ No sample CV found. Creating one...")
            test_cv = "test_cv.txt"
            with open(test_cv, "w", encoding="utf-8") as f:
                f.write("""John Doe - Software Developer

Skills: Python, JavaScript, React, Node.js, MySQL
Experience: 3 years web development
Goal: Transition to data science role
Education: Computer Science degree""")
            print(f"   📝 Created {test_cv}")
        
        cv_text = agent.parse_cv(test_cv)
        if cv_text:
            print(f"   ✅ CV parsed: {len(cv_text)} characters")
        else:
            print("   ❌ CV parsing failed")
            return False
        
        # Test skill extraction
        print("\n3. Testing skill extraction...")
        skills, goals = agent.extract_skills_and_goals(cv_text)
        if skills:
            print(f"   ✅ Extracted {len(skills)} skills")
            print(f"   📋 Sample skills: {[s['name'] for s in skills[:3]]}")
        else:
            print("   ❌ Skill extraction failed")
            return False
        
        # Test skill gap analysis
        print("\n4. Testing skill gap analysis...")
        analysis = agent.analyze_skill_gaps("data_scientist")
        if analysis:
            print(f"   ✅ Analysis complete: {analysis['match_percentage']:.1f}% match")
        else:
            print("   ❌ Analysis failed")
            return False
        
        # Test roadmap generation
        print("\n5. Testing roadmap generation...")
        roadmap = agent.generate_roadmap()
        if roadmap:
            print(f"   ✅ Generated {len(roadmap)} roadmap items")
        else:
            print("   ❌ Roadmap generation failed")
            return False
        
        print("\n🎉 All tests passed!")
        return True
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_job_database():
    """Test the job skill database"""
    print("\n🗃️  Testing job skill database...")
    
    try:
        from iiser_stscd_02.agents.main import CVAnalysisAgent
        agent = CVAnalysisAgent()  # Will use environment variable
        
        print("Available job roles:")
        for job_title, job_data in agent.job_skill_db.items():
            skills_count = len(job_data.get("required_skills", []))
            print(f"  • {job_title}: {skills_count} required skills")
        
        print("✅ Job database test passed")
        return True
        
    except Exception as e:
        print(f"❌ Job database test failed: {e}")
        return False

if __name__ == "__main__":
    success = test_agent()
    test_job_database()
    
    if success:
        print(f"\n💡 Ready to test! Try:")
        print(f"   python main.py sample_cv_detailed.txt --target-job data_scientist")
        print(f"   python demo.py")
    else:
        print(f"\n❌ Tests failed. Check the implementation.")
        sys.exit(1)
