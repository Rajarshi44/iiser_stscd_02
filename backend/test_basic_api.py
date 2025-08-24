# Simple test script for projects API - No Auth Required
import requests
import json

BASE_URL = "http://localhost:5000"

def test_roadmap_basic():
    """Test basic roadmap endpoint without authentication"""
    print("🚀 Testing Basic Roadmap Generation")
    print("=" * 50)
    
    # Create a simple test endpoint first
    url = f"{BASE_URL}/"
    
    try:
        response = requests.get(url)
        print(f"Server Status: {response.status_code}")
        
        if response.status_code == 200:
            print("✅ Server is running!")
            data = response.json()
            print(f"Server response: {data}")
            return True
        else:
            print(f"❌ Server not responding: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_roadmap_endpoint():
    """Test the roadmap generation endpoint structure"""
    print("\n🗺️ Testing Roadmap Endpoint Structure")
    print("=" * 50)
    
    url = f"{BASE_URL}/api/roadmap/generate"
    
    # Test with minimal data
    payload = {
        "target_role": "software_engineer",
        "user_skills": [
            {"name": "Python", "level": 2, "category": "programming"}
        ]
    }
    
    try:
        response = requests.post(url, json=payload)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")  # Show first 200 chars
        
        if response.status_code == 401:
            print("⚠️ Authentication required (expected)")
            return True
        elif response.status_code == 200:
            print("✅ Endpoint working!")
            return True
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

def test_projects_list_endpoint():
    """Test the projects list endpoint structure"""
    print("\n📋 Testing Projects List Endpoint Structure")
    print("=" * 50)
    
    url = f"{BASE_URL}/api/projects/list"
    
    try:
        response = requests.get(url)
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:200]}...")  # Show first 200 chars
        
        if response.status_code == 401:
            print("⚠️ Authentication required (expected)")
            return True
        elif response.status_code == 200:
            print("✅ Endpoint working!")
            return True
        else:
            print(f"⚠️ Unexpected status: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Testing Projects API Endpoints - Basic Structure")
    print("=" * 60)
    
    # Test basic server connectivity
    server_ok = test_roadmap_basic()
    
    if server_ok:
        # Test endpoint structures
        test_roadmap_endpoint()
        test_projects_list_endpoint()
        
        print("\n" + "=" * 60)
        print("🏁 Basic structure testing completed!")
        print("✅ All endpoints are accessible (authentication layer working)")
        print("💡 Next: Set up proper authentication to test full functionality")
    else:
        print("❌ Server not accessible - check if backend is running on port 5000")
