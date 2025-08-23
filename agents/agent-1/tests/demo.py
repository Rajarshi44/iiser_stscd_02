#!/usr/bin/env python3
"""
Demo script for CV Analysis Agent with PDF support
"""

import sys
import os

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from iiser_stscd_02.agents.main import CVAnalysisAgent

def demo_agent():
    """Demonstrate the CV Analysis Agent functionality with PDF and text support"""
    print("🤖 CV Analysis Agent Demo - IISER StatusCode 02")
    print("="*70)
    print("Features: PDF parsing with Gemini Vision API + Enhanced skill analysis")
    print("="*70)
    
    # Initialize agent with API key from environment
    agent = CVAnalysisAgent()  # Will automatically use GEMINI_API_KEY from .env
    
    # Test with different CV formats
    test_files = [
        ("sample_cv_detailed.txt", "Detailed text CV"),
        ("sample_cv.txt", "Basic text CV"),
        ("sample_cv.pdf", "PDF CV (if available)")
    ]
    
    # Find available CV files
    available_files = []
    for file_name, description in test_files:
        if os.path.exists(file_name):
            available_files.append((file_name, description))
    
    if not available_files:
        print("❌ No CV files found. Creating sample CV...")
        # Create the sample CV for testing
        from create_pdf_cv import create_pdf_cv
        create_pdf_cv()
        
        # Use the detailed text CV
        cv_file = "sample_cv_detailed.txt"
        if not os.path.exists(cv_file):
            cv_file = "sample_cv_for_pdf.txt"
    else:
        cv_file = available_files[0][0]  # Use the first available file
        print(f"📁 Found CV files: {', '.join([f[0] for f in available_files])}")
    
    print(f"\n📄 Analyzing CV: {cv_file}")
    print("-" * 50)
    
    # Step 1: Parse CV (enhanced with Gemini for PDFs)
    print("🔍 Step 1: Parsing CV...")
    cv_text = agent.parse_cv(cv_file)
    if cv_text:
        print("✅ CV parsed successfully")
        print(f"   📊 Text length: {len(cv_text):,} characters")
        print(f"   📝 Preview: {cv_text[:200]}...")
    else:
        print("❌ Failed to parse CV")
        return
    
    # Step 2: Enhanced skill extraction with Gemini
    print(f"\n🧠 Step 2: Enhanced skill extraction and analysis...")
    skills, goals = agent.extract_skills_and_goals(cv_text)
    if skills:
        print(f"✅ Advanced analysis completed")
        print(f"   🎯 Extracted {len(skills)} skills with detailed assessment")
        if goals:
            print(f"   💼 Career target: {goals.title}")
    else:
        print("❌ Failed to extract skills")
        return
    
    # Step 3: Test different target job analyses
    target_jobs = ["data_scientist", "software_engineer", "product_manager"]
    
    best_match = None
    best_score = 0
    
    print(f"\n📊 Step 3: Multi-job analysis...")
    for job in target_jobs:
        print(f"\n   🎯 Analyzing fit for: {job.replace('_', ' ').title()}")
        skill_analysis = agent.analyze_skill_gaps(job)
        if skill_analysis:
            match_score = skill_analysis['match_percentage']
            print(f"      📈 Match score: {match_score:.1f}%")
            print(f"      ✅ Strengths: {len(skill_analysis['strengths'])} skills")
            print(f"      ⚠️  Gaps: {len(skill_analysis['skill_gaps'])} skills")
            
            if match_score > best_score:
                best_score = match_score
                best_match = job
    
    if best_match:
        print(f"\n🏆 Best job match: {best_match.replace('_', ' ').title()} ({best_score:.1f}%)")
        
        # Generate roadmap for best match
        print(f"\n🗺️  Step 4: Generating roadmap for {best_match}...")
        agent.analyze_skill_gaps(best_match)  # Re-analyze for best match
        roadmap = agent.generate_roadmap()
        if roadmap:
            print(f"✅ Generated comprehensive roadmap with {len(roadmap)} items")
            
            # Show roadmap priorities
            high_priority = len([r for r in roadmap if r.priority == "high"])
            medium_priority = len([r for r in roadmap if r.priority == "medium"])
            low_priority = len([r for r in roadmap if r.priority == "low"])
            
            print(f"   🔥 High priority: {high_priority} skills")
            print(f"   🔶 Medium priority: {medium_priority} skills")
            print(f"   🔹 Low priority: {low_priority} skills")
        else:
            print("❌ Failed to generate roadmap")
            return
    
    # Step 5: Display comprehensive results
    print(f"\n" + "="*70)
    print("📋 COMPREHENSIVE ANALYSIS RESULTS")
    print("="*70)
    agent.display_results()
    
    # Step 6: Save detailed cache
    print(f"\n💾 Step 5: Saving detailed analysis...")
    cache_filename = f"cv_analysis_{best_match}_{cv_file.replace('.', '_')}.json"
    agent.save_cache_to_file(cache_filename)
    
    # Additional insights
    print(f"\n🎯 PERSONALIZED INSIGHTS:")
    print("-" * 40)
    
    current_profile = agent.cache.get("current_profile", {})
    if current_profile:
        print(f"📊 Experience Level: {current_profile.get('seniority_level', 'N/A')}")
        print(f"⏱️  Total Experience: {current_profile.get('total_experience_years', 'N/A')} years")
        strongest_skills = current_profile.get('strongest_skills', [])
        if strongest_skills:
            print(f"💪 Strongest Skills: {', '.join(strongest_skills[:3])}")
    
    skill_gaps = agent.cache.get("skill_gaps_identified", [])
    if skill_gaps:
        for gap_info in skill_gaps[:1]:  # Show first gap analysis
            missing = gap_info.get("missing_skills", [])
            if missing:
                print(f"🎯 Priority Skills to Learn: {', '.join(missing[:3])}")
    
    print(f"\n🎉 Enhanced CV analysis completed successfully!")
    print(f"📁 Detailed results saved in: {cache_filename}")
    print(f"💡 Next steps: Follow the generated roadmap to achieve your career goals!")

def test_pdf_parsing():
    """Test PDF parsing specifically"""
    print("\n🧪 Testing PDF Parsing with Gemini...")
    
    # Create a PDF if reportlab is available
    try:
        from create_pdf_cv import create_pdf_cv
        pdf_created = create_pdf_cv()
        
        if pdf_created and os.path.exists("sample_cv.pdf"):
            print("📄 Testing PDF analysis...")
            agent = CVAnalysisAgent()  # Will use environment variable
            
            pdf_text = agent.parse_cv("sample_cv.pdf")
            if pdf_text:
                print("✅ PDF parsing successful with Gemini Vision API")
                print(f"📝 Extracted {len(pdf_text)} characters")
            else:
                print("❌ PDF parsing failed")
        else:
            print("📝 PDF not available, using text fallback")
    except Exception as e:
        print(f"⚠️  PDF test error: {e}")

if __name__ == "__main__":
    # Run main demo
    demo_agent()
    
    # Optionally test PDF parsing
    print("\n" + "="*50)
    test_pdf_parsing()
