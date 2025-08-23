#!/usr/bin/env python3
"""
Setup script to help set the Gemini API key environment variable
"""

import os
import sys

def setup_api_key():
    """Interactive setup for Gemini API key"""
    
    print("🔑 Gemini API Key Setup")
    print("=" * 40)
    
    # Check if API key is already set
    current_key = os.getenv('GEMINI_API_KEY')
    if current_key and current_key != "your_gemini_api_key_here":
        print(f"✅ API key already set: {'*' * 20}...{current_key[-4:]}")
        return True
    
    print("❌ No valid Gemini API key found in environment")
    print("\n📝 To get a Gemini API key:")
    print("1. Go to: https://makersuite.google.com/app/apikey")
    print("2. Click 'Create API Key'")
    print("3. Copy your API key")
    print()
    
    # Get API key from user
    api_key = input("Enter your Gemini API key (starts with 'AIza'): ").strip()
    
    if not api_key:
        print("❌ No API key provided")
        return False
    
    if not api_key.startswith('AIza'):
        print("❌ API key should start with 'AIza'")
        return False
    
    # Set environment variable for current session
    os.environ['GEMINI_API_KEY'] = api_key
    
    print("✅ API key set for current session")
    print("\n💡 To make this permanent, add this to your system environment variables:")
    print(f"   GEMINI_API_KEY={api_key}")
    
    print("\n🔧 Or create a .env file in this directory with:")
    print(f"   GEMINI_API_KEY={api_key}")
    
    # Offer to create .env file
    create_env = input("\nCreate .env file now? (y/n): ").strip().lower()
    if create_env in ['y', 'yes']:
        try:
            with open('.env', 'w') as f:
                f.write("# Environment variables for CV Analysis Agent\n\n")
                f.write("# Gemini API Configuration\n")
                f.write(f"GEMINI_API_KEY={api_key}\n\n")
                f.write("# Supabase Configuration\n")
                f.write("SUPABASE_URL=https://ceuwldnnjixwsbofajxm.supabase.co\n")
                f.write("SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldXdsZG5uaml4d3Nib2ZhanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQ0NjYsImV4cCI6MjA3MTUxMDQ2Nn0.fBWSKJ75LtX9BM4bYxiUuBSzyxZfMw-4JCxiF-D0Srw\n")
            print("✅ .env file created successfully!")
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
    
    return True

def test_api_key():
    """Test if the API key works"""
    try:
        import google.generativeai as genai
        
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            print("❌ No API key found")
            return False
        
        # Configure and test
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        print("🧪 Testing API key...")
        response = model.generate_content("Hello, this is a test. Please respond with 'API key works!'")
        
        if response.text and "API key works" in response.text:
            print("✅ API key is working correctly!")
            return True
        else:
            print("✅ API key works (got response from Gemini)")
            return True
            
    except Exception as e:
        print(f"❌ API key test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Setting up Gemini API key for CV Analysis Agent")
    print()
    
    if setup_api_key():
        print("\n🧪 Testing API key...")
        if test_api_key():
            print("\n🎉 Setup complete! You can now run:")
            print("   python example_usage.py")
            print("   python main.py deba_resume_1.pdf --create-test-user")
        else:
            print("\n⚠️  API key set but test failed. Please check your key.")
    else:
        print("\n❌ Setup failed. Please try again.")
