#!/usr/bin/env python3
"""
Test script for auto-generated career paths
"""

import sys
import os
from pathlib import Path

# Add the agent directory to Python path
AGENT_PATH = Path(__file__).parent.parent / "agents" / "agent-1"
sys.path.append(str(AGENT_PATH))

def test_auto_career_path():
    """Test the auto-generated career path functionality"""
    try:
        from ai_career_service import AICareerService
        
        # Initialize the service
        service = AICareerService()
        
        # Test data - skills extracted from CV/GitHub
        test_skills = [
            {"name": "Python", "level": 4, "category": "Programming Language"},
            {"name": "JavaScript", "level": 3, "category": "Programming Language"},
            {"name": "React", "level": 3, "category": "Frontend Framework"},
            {"name": "SQL", "level": 4, "category": "Database"},
            {"name": "Git", "level": 4, "category": "Version Control"},
            {"name": "Docker", "level": 2, "category": "DevOps"}
        ]
        
        # Mock analysis data
        mock_analysis = {
            "current_level": "Intermediate",
            "skill_gaps": ["Machine Learning", "AWS"],
            "overall_score": 7
        }
        
        print("🧪 Testing Auto-Generated Career Path...")
        print("=" * 50)
        
        # Test career path generation
        career_path = service._generate_career_path(test_skills, "software_engineer", mock_analysis)
        
        print("✅ Career Path Generated Successfully!")
        print(f"Primary Path: {career_path['primary_path']['name']}")
        print(f"Match Score: {career_path['primary_path']['match_score']}%")
        print(f"Description: {career_path['primary_path']['description']}")
        print(f"Difficulty: {career_path['primary_path']['difficulty']}")
        print(f"Time to Mastery: {career_path['primary_path']['time_to_mastery']}")
        print(f"Job Market: {career_path['primary_path']['job_market']}")
        print()
        
        print("🔍 Why This Path?")
        print(career_path['primary_path']['why_this_path'])
        print()
        
        print("📚 Skill Gaps to Address:")
        for gap in career_path['skill_gaps'][:3]:
            print(f"  • {gap['skill']} ({gap['priority']}) - {gap['reason']}")
            print(f"    Estimated time: {gap['estimated_time']}")
        print()
        
        print("🎯 Learning Priorities:")
        for priority in career_path['learning_priorities'][:3]:
            print(f"  • {priority['phase']}: {priority['skill']}")
            print(f"    Focus: {priority['focus']}")
            print(f"    Projects: {priority['projects']}")
        print()
        
        print("⏰ Career Timeline:")
        timeline = career_path['career_timeline']
        print(f"  • Current Status: {timeline['current_status']}")
        print(f"  • Next Milestone: {timeline['next_milestone']}")
        print(f"  • Timeline: {timeline['timeline']}")
        print(f"  • Confidence: {timeline['confidence']}")
        print()
        
        if career_path['alternative_paths']:
            print("🔄 Alternative Paths:")
            for alt_path in career_path['alternative_paths']:
                print(f"  • {alt_path['name']} ({alt_path['match_score']}% match)")
                print(f"    {alt_path['description']}")
                print(f"    Why consider: {alt_path['why_consider']}")
                print()
        
        print("🎉 Auto-Generated Career Path Test Complete!")
        return True
        
    except ImportError as e:
        print(f"❌ Import Error: {e}")
        print("Make sure the ai_career_service.py file exists in the agents/agent-1 directory")
        return False
    except Exception as e:
        print(f"❌ Test Failed: {e}")
        return False

if __name__ == "__main__":
    success = test_auto_career_path()
    sys.exit(0 if success else 1) 