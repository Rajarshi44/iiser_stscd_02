#!/usr/bin/env python3
"""
Test Direct Repository Creation
==============================

This script tests the ability to create a repository directly without a roadmap.
"""

import requests
import json

# Configuration
BASE_URL = "http://localhost:5000"
TEST_USER_ROLE = "full_stack_developer"

def print_header(title):
    """Print a formatted header"""
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def test_direct_repository_creation():
    """Test creating a repository directly without a roadmap"""
    print_header("Testing Direct Repository Creation")
    
    # Test data for direct repository creation
    test_data = {
        "target_role": TEST_USER_ROLE,
        "project_name": f"test-direct-repo-{int(time.time())}",
        "make_public": False,
        "create_without_roadmap": True
    }
    
    print(f"📝 Test Data:")
    print(f"   Target Role: {test_data['target_role']}")
    print(f"   Project Name: {test_data['project_name']}")
    print(f"   Make Public: {test_data['make_public']}")
    print(f"   Create Without Roadmap: {test_data['create_without_roadmap']}")
    
    try:
        # Make the request
        print(f"\n🚀 Making request to /demo/api/projects/create...")
        response = requests.post(
            f"{BASE_URL}/demo/api/projects/create",
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📊 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success! Repository created:")
            print(f"   Project ID: {result.get('project', {}).get('id')}")
            print(f"   Repository URL: {result.get('project', {}).get('repository_url')}")
            print(f"   Target Role: {result.get('project', {}).get('target_role')}")
            print(f"   Created Files: {result.get('project', {}).get('created_files')}")
            return True
        else:
            print(f"❌ Failed with status {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_with_roadmap_creation():
    """Test creating a repository with a roadmap first"""
    print_header("Testing Roadmap-Based Repository Creation")
    
    # First create a roadmap
    roadmap_data = {
        "target_role": TEST_USER_ROLE
    }
    
    print(f"📝 Creating roadmap for {TEST_USER_ROLE}...")
    
    try:
        roadmap_response = requests.post(
            f"{BASE_URL}/demo/api/roadmap/generate",
            json=roadmap_data,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if roadmap_response.status_code == 200:
            roadmap_result = roadmap_response.json()
            roadmap_id = roadmap_result.get('roadmap_id')
            print(f"✅ Roadmap created with ID: {roadmap_id}")
            
            # Now create repository from roadmap
            project_data = {
                "roadmap_id": roadmap_id,
                "project_name": f"test-roadmap-repo-{int(time.time())}",
                "make_public": False
            }
            
            print(f"📝 Creating repository from roadmap...")
            repo_response = requests.post(
                f"{BASE_URL}/demo/api/projects/create",
                json=project_data,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if repo_response.status_code == 200:
                repo_result = repo_response.json()
                print(f"✅ Repository created from roadmap:")
                print(f"   Project ID: {repo_result.get('project', {}).get('id')}")
                print(f"   Repository URL: {repo_result.get('project', {}).get('repository_url')}")
                return True
            else:
                print(f"❌ Failed to create repository from roadmap: {repo_response.status_code}")
                print(f"Response: {repo_response.text}")
                return False
        else:
            print(f"❌ Failed to create roadmap: {roadmap_response.status_code}")
            print(f"Response: {roadmap_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

if __name__ == "__main__":
    import time
    
    print("🧪 Testing Direct Repository Creation Feature")
    print("=" * 60)
    
    # Test 1: Direct repository creation
    success1 = test_direct_repository_creation()
    
    # Test 2: Roadmap-based repository creation
    success2 = test_with_roadmap_creation()
    
    # Summary
    print_header("Test Results Summary")
    print(f"✅ Direct Repository Creation: {'PASSED' if success1 else 'FAILED'}")
    print(f"✅ Roadmap-Based Creation: {'PASSED' if success2 else 'FAILED'}")
    
    if success1 and success2:
        print(f"\n🎉 All tests passed! The feature is working correctly.")
    else:
        print(f"\n⚠️ Some tests failed. Check the backend logs for details.")
    
    print(f"\n📝 Note: This test requires:")
    print(f"   1. Backend server running on {BASE_URL}")
    print(f"   2. Valid GitHub OAuth authentication")
    print(f"   3. Supabase database connection")
