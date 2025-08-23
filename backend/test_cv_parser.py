#!/usr/bin/env python3
"""
Test script for CV parser functionality
"""

import os
import sys
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

def test_cv_parser():
    """Test the CV parser with different file types"""
    print("🧪 Testing CV Parser")
    print("=" * 50)
    
    try:
        from services.ai_agent_service import AIAgentService
        
        # Initialize the service
        service = AIAgentService()
        print("✅ AI Agent Service initialized")
        
        # Test with the sample CV from agents folder
        cv_file_path = "../agents/agent-1/deba_resume_1.pdf"
        
        if os.path.exists(cv_file_path):
            print(f"📄 Testing with CV file: {cv_file_path}")
            
            # Test CV parsing
            cv_text = service.parse_cv_file(cv_file_path)
            
            if cv_text:
                print(f"✅ CV parsed successfully!")
                print(f"   📊 Text length: {len(cv_text):,} characters")
                print(f"   📝 Preview: {cv_text[:200]}...")
                
                # Test CV analysis
                print(f"\n🔍 Testing CV analysis...")
                analysis_result = service.analyze_cv_and_skills(
                    cv_file_path, 
                    "software_engineer", 
                    1
                )
                
                if analysis_result["success"]:
                    print(f"✅ CV analysis completed!")
                    print(f"   🎯 Analysis method: {analysis_result.get('analysis_method', 'Unknown')}")
                    print(f"   🧠 Skills found: {len(analysis_result['skills'])}")
                    print(f"   📊 Current level: {analysis_result['analysis']['current_level']}")
                    print(f"   🎯 Match percentage: {analysis_result['analysis']['match_percentage']:.1f}%")
                    print(f"   🗺️ Roadmap items: {len(analysis_result['roadmap'])}")
                    
                    # Show some extracted skills
                    print(f"\n💪 Sample skills extracted:")
                    for skill in analysis_result['skills'][:5]:
                        print(f"   • {skill['name']} (Level {skill['level']}, {skill['category']})")
                    
                    # Show skill gaps
                    gaps = analysis_result['analysis']['skill_gaps']
                    if gaps:
                        print(f"\n⚠️ Skills to learn:")
                        for gap in gaps[:3]:
                            print(f"   • {gap}")
                    
                    return True
                else:
                    print(f"❌ CV analysis failed: {analysis_result.get('error', 'Unknown error')}")
                    return False
            else:
                print(f"❌ CV parsing failed")
                return False
        else:
            print(f"❌ CV file not found: {cv_file_path}")
            print(f"   Current directory: {os.getcwd()}")
            print(f"   Looking for: {os.path.abspath(cv_file_path)}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_text_parsing():
    """Test text-based CV parsing"""
    print(f"\n📝 Testing text-based CV parsing...")
    
    try:
        from services.ai_agent_service import AIAgentService
        
        service = AIAgentService()
        
        # Create a sample CV text
        sample_cv = """
        John Doe - Software Developer
        
        Skills: Python, JavaScript, React, Node.js, MySQL
        Experience: 3 years web development
        Goal: Transition to data science role
        Education: Computer Science degree
        
        Projects:
        - Built e-commerce platform using React and Node.js
        - Developed REST API with Python Flask
        - Database design and optimization with MySQL
        """
        
        # Test enhanced analysis
        analysis_result = service._enhanced_cv_analysis(
            sample_cv, 
            "software_engineer", 
            1
        )
        
        if analysis_result["success"]:
            print(f"✅ Text analysis completed!")
            print(f"   🧠 Skills found: {len(analysis_result['skills'])}")
            print(f"   📊 Current level: {analysis_result['analysis']['current_level']}")
            print(f"   🎯 Match percentage: {analysis_result['analysis']['match_percentage']:.1f}%")
            
            return True
        else:
            print(f"❌ Text analysis failed")
            return False
            
    except Exception as e:
        print(f"❌ Text parsing test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting CV Parser Tests")
    print("=" * 50)
    
    # Test 1: PDF parsing
    pdf_success = test_cv_parser()
    
    # Test 2: Text parsing
    text_success = test_text_parsing()
    
    print(f"\n" + "=" * 50)
    print("📊 Test Results Summary")
    print("=" * 50)
    print(f"PDF Parsing: {'✅ PASSED' if pdf_success else '❌ FAILED'}")
    print(f"Text Parsing: {'✅ PASSED' if text_success else '❌ FAILED'}")
    
    if pdf_success and text_success:
        print(f"\n🎉 All tests passed! CV parser is working correctly.")
        print(f"💡 You can now test the API endpoints with real CV files.")
    else:
        print(f"\n❌ Some tests failed. Check the implementation.")
        sys.exit(1) 