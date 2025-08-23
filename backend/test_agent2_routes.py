#!/usr/bin/env python3
"""
Test Script for Agent2 Routes
Tests the new learning roadmap and portfolio project generation endpoints
"""

import requests
import json
import os
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_ID = 1  # Mock user ID for testing

# Mock JWT token (you'll need to get a real one from GitHub OAuth)
MOCK_TOKEN = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxNzM1NzI4MDAwfQ.mock_signature"

def test_learning_roadmap_generation():
    """Test the learning roadmap generation endpoint"""
    print("🚀 Testing Learning Roadmap Generation")
    print("=" * 50)
    
    url = f"{BASE_URL}/api/learning/roadmap"
    headers = {
        "Authorization": f"Bearer {MOCK_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Mock user skills data
    payload = {
        "target_role": "software_engineer",
        "user_skills": [
            {"name": "Python", "level": 2, "category": "programming"},
            {"name": "JavaScript", "level": 1, "category": "programming"},
            {"name": "Git", "level": 2, "category": "tools"},
            {"name": "HTML", "level": 3, "category": "frontend"},
            {"name": "CSS", "level": 2, "category": "frontend"}
        ]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Learning roadmap generated successfully!")
            print(f"📚 Milestones: {data['learning_path']['summary']['total_milestones']}")
            print(f"🐛 Issues: {data['learning_path']['summary']['total_issues']}")
            print(f"📅 Duration: {data['learning_path']['summary']['estimated_duration']}")
            print(f"🏗️ Project: {data['learning_path']['project']['name']}")
            
            # Save response to file
            with open("learning_roadmap_response.json", "w") as f:
                json.dump(data, f, indent=2)
            print("💾 Response saved to 'learning_roadmap_response.json'")
            
            return data
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_portfolio_project_generation():
    """Test the portfolio project generation endpoint"""
    print("\n🎨 Testing Portfolio Project Generation")
    print("=" * 50)
    
    url = f"{BASE_URL}/api/learning/portfolio-project"
    headers = {
        "Authorization": f"Bearer {MOCK_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Mock focus areas
    payload = {
        "focus_areas": ["Python", "Web Development", "API Design"]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Portfolio project generated successfully!")
            print(f"🏗️ Project: {data['portfolio']['project']['name']}")
            print(f"📊 Portfolio Value: {data['portfolio']['portfolio_value']}")
            print(f"⏱️ Completion Time: {data['portfolio']['estimated_completion']}")
            print(f"🐛 Issues: {len(data['portfolio']['issues'])}")
            
            # Save response to file
            with open("portfolio_project_response.json", "w") as f:
                json.dump(data, f, indent=2)
            print("💾 Response saved to 'portfolio_project_response.json'")
            
            return data
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_progress_update():
    """Test the learning progress update endpoint"""
    print("\n📈 Testing Learning Progress Update")
    print("=" * 50)
    
    url = f"{BASE_URL}/api/learning/progress-update"
    headers = {
        "Authorization": f"Bearer {MOCK_TOKEN}",
        "Content-Type": "application/json"
    }
    
    # Mock completed projects and current roadmap
    payload = {
        "completed_projects": [
            {
                "name": "Todo App",
                "score": 85,
                "skills_used": ["JavaScript", "React"],
                "completion_date": "2025-01-23"
            },
            {
                "name": "Weather Dashboard",
                "score": 92,
                "skills_used": ["API Integration", "CSS"],
                "completion_date": "2025-01-22"
            }
        ],
        "current_roadmap": {
            "current_level": 2,
            "milestones": [
                {"title": "Basic Setup", "completed": True},
                {"title": "Core Skills", "completed": True},
                {"title": "Advanced Features", "completed": False},
                {"title": "Deployment", "completed": False}
            ]
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Learning progress updated successfully!")
            print(f"📊 Completion: {data['progress_update']['progress_summary']['roadmap_completion']}%")
            print(f"🎯 Ready for next level: {data['progress_update']['progress_summary']['ready_for_next_level']}")
            
            if data['progress_update'].get('next_project'):
                print(f"🏗️ Next project: {data['progress_update']['next_project']['name']}")
            
            # Save response to file
            with open("progress_update_response.json", "w") as f:
                json.dump(data, f, indent=2)
            print("💾 Response saved to 'progress_update_response.json'")
            
            return data
        else:
            print(f"❌ Request failed with status {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_server_health():
    """Test if the server is running"""
    print("🏥 Testing Server Health")
    print("=" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/test")
        if response.status_code == 200:
            print("✅ Server is running and healthy")
            return True
        else:
            print(f"⚠️ Server responded with status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Server is not accessible: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Agent2 Routes Testing Suite")
    print("=" * 60)
    
    # Check server health first
    if not test_server_health():
        print("\n❌ Server is not running. Please start the backend server first.")
        print("Run: cd backend && python run.py")
        return
    
    print("\n🚀 Starting Agent2 route tests...")
    
    # Test 1: Learning Roadmap Generation
    roadmap_result = test_learning_roadmap_generation()
    
    # Test 2: Portfolio Project Generation
    portfolio_result = test_portfolio_project_generation()
    
    # Test 3: Progress Update
    progress_result = test_progress_update()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 30)
    print(f"✅ Learning Roadmap: {'PASS' if roadmap_result else 'FAIL'}")
    print(f"✅ Portfolio Project: {'PASS' if portfolio_result else 'FAIL'}")
    print(f"✅ Progress Update: {'PASS' if progress_result else 'FAIL'}")
    
    # Overall result
    if all([roadmap_result, portfolio_result, progress_result]):
        print("\n🎉 All Agent2 route tests passed!")
        print("💾 Check the generated JSON files for detailed responses")
    else:
        print("\n⚠️ Some tests failed. Check the error messages above.")
    
    # Instructions for real testing
    print("\n📝 For Real Testing:")
    print("1. Get a real JWT token from GitHub OAuth")
    print("2. Update MOCK_TOKEN in this script")
    print("3. Ensure Agent2 dependencies are installed")
    print("4. Set GROQ_API_KEY in environment variables")
    print("5. Get free API key from https://console.groq.com/")

if __name__ == "__main__":
    main() 