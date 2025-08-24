# Test script for the new projects API
import requests
import json

BASE_URL = "http://localhost:5000"

def test_roadmap_generation():
    """Test the new roadmap generation endpoint"""
    print("🚀 Testing Roadmap Generation API")
    print("=" * 50)
    
    # Mock authentication token - replace with real token
    headers = {
        "Authorization": "Bearer mock-token-for-testing",
        "Content-Type": "application/json"
    }
    
    payload = {
        "target_role": "software_engineer",
        "current_level": 2,
        "user_skills": [
            {"name": "Python", "level": 3, "category": "programming"},
            {"name": "JavaScript", "level": 2, "category": "programming"},
            {"name": "HTML", "level": 4, "category": "frontend"},
            {"name": "CSS", "level": 3, "category": "frontend"}
        ],
        "preferences": {
            "learning_style": "hands_on",
            "time_commitment": "part_time"
        }
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/roadmap/generate", headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Roadmap generated successfully!")
            print(f"📚 Milestones: {len(data.get('roadmap', {}).get('milestones', []))}")
            print(f"🎯 Target Role: {data.get('roadmap', {}).get('name', 'N/A')}")
            print(f"⏰ Duration: {data.get('roadmap', {}).get('estimated_duration', 'N/A')}")
            
            # Save response
            with open("test_roadmap_response.json", "w") as f:
                json.dump(data, f, indent=2)
            print("💾 Response saved to 'test_roadmap_response.json'")
            
            return data
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_project_creation():
    """Test the project creation endpoint"""
    print("\n🏗️ Testing Project Creation API")
    print("=" * 50)
    
    headers = {
        "Authorization": "Bearer test-token",
        "Content-Type": "application/json"
    }
    
    payload = {
        "roadmap_id": 1,  # This would come from the roadmap generation step
        "project_name": "my-learning-journey-test",
        "milestone_focus": "Programming Fundamentals",
        "make_public": False
    }
    
    try:
        response = requests.post(f"{BASE_URL}/api/projects/create", headers=headers, json=payload)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Project created successfully!")
            print(f"📦 Repository: {data.get('project', {}).get('repository', {}).get('html_url', 'N/A')}")
            print(f"📁 Folders: {len(data.get('project', {}).get('folders', []))}")
            print(f"🎯 Issues: {len(data.get('project', {}).get('issues', []))}")
            
            # Save response
            with open("test_project_response.json", "w") as f:
                json.dump(data, f, indent=2)
            print("💾 Response saved to 'test_project_response.json'")
            
            return data
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

def test_projects_list():
    """Test the projects list endpoint"""
    print("\n📋 Testing Projects List API")
    print("=" * 50)
    
    headers = {
        "Authorization": "Bearer mock-token-for-testing"
    }
    
    try:
        response = requests.get(f"{BASE_URL}/api/projects/list", headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Projects retrieved successfully!")
            print(f"📊 Total Projects: {data.get('total_projects', 0)}")
            
            for project in data.get('projects', []):
                print(f"  - {project.get('name', 'N/A')} ({project.get('status', 'N/A')})")
                print(f"    Progress: {project.get('progress', {}).get('completion_percentage', 0)}%")
            
            return data
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"Error: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return None

if __name__ == "__main__":
    print("🧪 Testing New Projects API Endpoints")
    print("=" * 60)
    
    # Test roadmap generation
    roadmap_result = test_roadmap_generation()
    
    # Test project listing
    list_result = test_projects_list()
    
    # Note: Project creation test requires valid GitHub token and roadmap ID
    # Uncomment when you have proper authentication set up
    # project_result = test_project_creation()
    
    print("\n" + "=" * 60)
    print("🏁 Testing completed!")
    
    if roadmap_result and list_result:
        print("✅ All basic tests passed!")
    else:
        print("⚠️ Some tests failed - check server logs for details")
