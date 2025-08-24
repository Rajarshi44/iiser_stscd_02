#!/usr/bin/env python3

"""
Test script for demo routes - roadmap generation and repository creation
"""

import requests
import json
import sys

BASE_URL = "http://localhost:5000"

def test_demo_routes():
    """Test the demo routes"""
    
    print("🧪 Testing Demo Routes")
    print("=" * 50)
    
    # Test 1: Check if demo/api/user works (requires authentication)
    print("\n1. Testing demo/api/user endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/demo/api/user")
        if response.status_code == 401:
            print("✅ Demo user endpoint requires authentication (expected)")
        else:
            print(f"❓ Unexpected response: {response.status_code}")
            if response.status_code == 200:
                user_data = response.json()
                print(f"   User: {user_data.get('login', 'Unknown')}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Test demo roadmap generation (without auth - should fail)
    print("\n2. Testing demo/api/roadmap/generate endpoint...")
    try:
        roadmap_payload = {
            "target_role": "full_stack_developer",
            "user_skills": [
                {"name": "JavaScript", "level": 7},
                {"name": "React", "level": 6},
                {"name": "Python", "level": 5}
            ],
            "current_level": 2,
            "preferences": {
                "learning_style": "hands_on",
                "project_based": True
            }
        }
        
        response = requests.post(
            f"{BASE_URL}/demo/api/roadmap/generate",
            json=roadmap_payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 401:
            print("✅ Demo roadmap generation requires authentication (expected)")
        else:
            print(f"❓ Unexpected response: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"   Generated roadmap with {len(data.get('roadmap', {}).get('milestones', []))} milestones")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 3: Test demo project creation (without auth - should fail)
    print("\n3. Testing demo/api/projects/create endpoint...")
    try:
        project_payload = {
            "roadmap_id": 1,
            "project_name": "test-project",
            "milestone_focus": 1,
            "make_public": False
        }
        
        response = requests.post(
            f"{BASE_URL}/demo/api/projects/create",
            json=project_payload,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 401:
            print("✅ Demo project creation requires authentication (expected)")
        else:
            print(f"❓ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 4: Test demo project listing
    print("\n4. Testing demo/api/projects/list endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/demo/api/projects/list")
        
        if response.status_code == 401:
            print("✅ Demo project listing requires authentication (expected)")
        else:
            print(f"❓ Unexpected response: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 5: Check if main API routes still work
    print("\n5. Testing main API routes...")
    try:
        response = requests.post(
            f"{BASE_URL}/api/roadmap/generate",
            json={
                "target_role": "data_scientist",
                "user_skills": [{"name": "Python", "level": 5}],
                "current_level": 1
            },
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 401:
            print("✅ Main API routes require authentication (expected)")
        else:
            print(f"❓ Main API response: {response.status_code}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Demo route testing complete!")
    print("\n💡 To test with authentication:")
    print("1. Go to http://localhost:3000")
    print("2. Login with GitHub")
    print("3. Use the authenticated session to test demo routes")
    
    return True

if __name__ == "__main__":
    try:
        test_demo_routes()
    except KeyboardInterrupt:
        print("\n\n⚠️ Testing interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Testing failed: {e}")
        sys.exit(1)
