#!/usr/bin/env python3
"""
Test script for comprehensive CV analysis route
Tests the integration with CVAnalysisAgent from main.py
"""

import requests
import json
import os
from pathlib import Path

def test_comprehensive_cv_analysis():
    """Test the comprehensive CV analysis endpoint"""
    
    # Configuration
    base_url = "http://localhost:5000"
    endpoint = "/api/cv/analyze"
    
    # Test CV file path (using the existing PDF from agents directory)
    cv_file_path = Path(__file__).parent.parent / "agents" / "agent-1" / "deba_resume_1.pdf"
    
    if not cv_file_path.exists():
        print(f"❌ CV file not found: {cv_file_path}")
        print("Please ensure deba_resume_1.pdf exists in the agents/agent-1 directory")
        return False
    
    print("🧪 Testing Comprehensive CV Analysis Route")
    print("=" * 60)
    print(f"📄 CV File: {cv_file_path}")
    print(f"🌐 Endpoint: {base_url}{endpoint}")
    print("=" * 60)
    
    # First, we need to get a JWT token
    # For testing, you'll need to either:
    # 1. Use an existing valid token
    # 2. Go through the GitHub OAuth flow
    # 3. Create a test token
    
    print("\n🔑 Authentication Required")
    print("You need a valid JWT token to test this endpoint.")
    print("\nOptions to get a token:")
    print("1. Use existing token from GitHub OAuth")
    print("2. Go through GitHub OAuth flow")
    print("3. Create a test token (if you have admin access)")
    
    # Get token from user
    token = input("\nEnter your JWT token (or 'skip' to see the request format): ").strip()
    
    if token.lower() == 'skip':
        print("\n📋 Request Format:")
        print(f"POST {base_url}{endpoint}")
        print("Headers:")
        print("  Authorization: Bearer YOUR_JWT_TOKEN")
        print("  Content-Type: multipart/form-data")
        print("\nBody (form-data):")
        print("  cv_file: [PDF/DOCX/TXT file]")
        print("  target_role: software_engineer (optional)")
        
        print("\n📊 Expected Response Structure:")
        print(json.dumps({
            "success": True,
            "message": "Comprehensive CV analysis completed successfully!",
            "analysis": {
                "cv_file": "filename.pdf",
                "target_role": "software_engineer",
                "cv_text_length": 1500,
                "extraction_method": "CVAnalysisAgent + Gemini LLM"
            },
            "skills_assessment": {
                "total_skills": 15,
                "skill_categories": {
                    "programming_languages": ["Python", "JavaScript"],
                    "frameworks": ["React", "Django"],
                    "databases": ["MySQL", "MongoDB"],
                    "cloud_platforms": ["AWS"],
                    "devops_tools": ["Git", "Docker"],
                    "ai_ml_tools": ["Machine Learning"],
                    "data_analysis": ["Pandas", "NumPy"],
                    "soft_skills": ["Communication", "Teamwork"],
                    "other": []
                },
                "skill_levels": {
                    "average_level": 3.5,
                    "highest_level": 5,
                    "lowest_level": 2
                }
            },
            "development_level": {
                "level": "Advanced",
                "description": "Experienced developer with strong skills",
                "score": 3.5,
                "confidence": "High"
            },
            "career_goals": {
                "primary_target": "Senior Software Engineer",
                "industry": "Technology",
                "experience_level": "Senior",
                "timeline": "Long-term"
            },
            "skill_gaps": {
                "target_role": "software_engineer",
                "match_percentage": 85.5,
                "skill_gaps": ["Kubernetes", "Microservices"],
                "strengths": ["Python", "React", "Git"],
                "recommendations": [
                    "Focus on high-priority skill gaps",
                    "Build projects using target technologies"
                ]
            },
            "learning_roadmap": {
                "total_items": 8,
                "high_priority": 3,
                "medium_priority": 3,
                "low_priority": 2,
                "roadmap_items": [
                    {
                        "skill": "Kubernetes",
                        "current_level": 1,
                        "target_level": 4,
                        "priority": "high",
                        "estimated_time": "3-4 months",
                        "resources": ["Kubernetes Official Tutorial", "Docker Mastery Course"]
                    }
                ]
            }
        }, indent=2))
        
        return True
    
    if not token:
        print("❌ No token provided. Cannot test protected endpoint.")
        return False
    
    # Prepare the request
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    files = {
        "cv_file": ("deba_resume_1.pdf", open(cv_file_path, "rb"), "application/pdf")
    }
    
    data = {
        "target_role": "software_engineer"
    }
    
    print(f"\n🚀 Sending request to {endpoint}...")
    print(f"📁 File: {cv_file_path.name}")
    print(f"🎯 Target Role: {data['target_role']}")
    
    try:
        # Send the request
        response = requests.post(
            f"{base_url}{endpoint}",
            headers=headers,
            files=files,
            data=data,
            timeout=60  # Increased timeout for AI processing
        )
        
        print(f"\n📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! Comprehensive CV Analysis Completed")
            print("=" * 60)
            
            # Display key results
            if "skills_assessment" in result:
                skills = result["skills_assessment"]
                print(f"📊 Total Skills Extracted: {skills.get('total_skills', 0)}")
                
                categories = skills.get("skill_categories", {})
                for category, items in categories.items():
                    if items:
                        skill_names = [item["name"] for item in items[:5]]  # Show first 5
                        print(f"  • {category.replace('_', ' ').title()}: {', '.join(skill_names)}")
                        if len(items) > 5:
                            print(f"    ... and {len(items) - 5} more")
            
            if "development_level" in result:
                level = result["development_level"]
                print(f"\n🏆 Development Level: {level.get('level', 'N/A')}")
                print(f"   Score: {level.get('score', 'N/A')}/5")
                print(f"   Description: {level.get('description', 'N/A')}")
                print(f"   Confidence: {level.get('confidence', 'N/A')}")
            
            if "skill_gaps" in result:
                gaps = result["skill_gaps"]
                print(f"\n🎯 Job Match: {gaps.get('match_percentage', 0)}%")
                print(f"   Target Role: {gaps.get('target_role', 'N/A')}")
                
                skill_gaps = gaps.get("skill_gaps", [])
                if skill_gaps:
                    print(f"   ⚠️  Skill Gaps ({len(skill_gaps)}):")
                    for gap in skill_gaps[:3]:  # Show first 3
                        if isinstance(gap, dict):
                            print(f"     • {gap.get('skill', 'Unknown')}: Level {gap.get('user_level', 0)} → {gap.get('required_level', 0)}")
                        else:
                            print(f"     • {gap}")
            
            if "learning_roadmap" in result:
                roadmap = result["learning_roadmap"]
                print(f"\n🗺️  Learning Roadmap: {roadmap.get('total_items', 0)} items")
                print(f"   🔥 High Priority: {roadmap.get('high_priority', 0)}")
                print(f"   ⚡ Medium Priority: {roadmap.get('medium_priority', 0)}")
                print(f"   💡 Low Priority: {roadmap.get('low_priority', 0)}")
            
            if "database_storage" in result:
                storage = result["database_storage"]
                print(f"\n💾 Database Storage:")
                print(f"   User ID: {storage.get('user_id', 'N/A')}")
                print(f"   Onboarding: {'✅' if storage.get('onboarding_stored') else '❌'}")
                print(f"   Skills Analysis: {'✅' if storage.get('skills_analysis_stored') else '❌'}")
                print(f"   Resume Data: {'✅' if storage.get('resume_data_stored') else '❌'}")
                print(f"   Operation Logged: {'✅' if storage.get('operation_logged') else '❌'}")
            
            # Save full response to file
            output_file = "comprehensive_cv_analysis_result.json"
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"\n💾 Full response saved to: {output_file}")
            
            return True
            
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            try:
                error_result = response.json()
                print(f"Error: {error_result.get('error', 'Unknown error')}")
                if 'details' in error_result:
                    print(f"Details: {error_result['details']}")
            except:
                print(f"Response text: {response.text[:200]}...")
            
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timed out. The AI analysis is taking longer than expected.")
        print("This is normal for the first run as it processes the CV with Gemini LLM.")
        return False
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error. Make sure the backend server is running on localhost:5000")
        return False
        
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False
        
    finally:
        # Clean up
        if 'cv_file' in locals():
            files['cv_file'][1].close()

def main():
    """Main function"""
    print("🤖 Comprehensive CV Analysis Route Tester")
    print("=" * 60)
    print("This script tests the new /api/cv/analyze endpoint")
    print("which integrates with CVAnalysisAgent from main.py")
    print("=" * 60)
    
    # Check if backend is running
    try:
        response = requests.get("http://localhost:5000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend server is running")
        else:
            print("⚠️  Backend server responded with unexpected status")
    except:
        print("❌ Backend server is not running")
        print("Please start the backend server first:")
        print("  cd backend")
        print("  python run.py")
        return
    
    # Run the test
    success = test_comprehensive_cv_analysis()
    
    if success:
        print("\n🎉 Test completed successfully!")
        print("The comprehensive CV analysis route is working correctly.")
    else:
        print("\n❌ Test failed. Check the error messages above.")
    
    print("\n📚 Next Steps:")
    print("1. Review the analysis results")
    print("2. Check the database for stored data")
    print("3. Test with different CV files")
    print("4. Integrate with your frontend application")

if __name__ == "__main__":
    main() 