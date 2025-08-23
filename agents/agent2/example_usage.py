#!/usr/bin/env python3
"""
Example Usage - Agent2 (Roadmap + Repository Agents)
Demonstrates how to use the combined agents for learning path generation
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Add the parent directory to path for imports
import sys
sys.path.append(str(Path(__file__).parent))

from main import Agent2Integration
from roadmap_agent import RoadmapGenerationAgent
from repository_agent import RepositoryCreationAgent

def example_roadmap_generation():
    """Example of using the Roadmap Generation Agent"""
    print("🚀 Example: Roadmap Generation Agent")
    print("=" * 50)
    
    # Initialize agent
    roadmap_agent = RoadmapGenerationAgent()
    
    # Mock user data
    user_skills = [
        {"name": "Python", "level": 2, "category": "programming"},
        {"name": "JavaScript", "level": 1, "category": "programming"},
        {"name": "Git", "level": 2, "category": "tools"},
        {"name": "HTML", "level": 3, "category": "frontend"},
        {"name": "CSS", "level": 2, "category": "frontend"}
    ]
    
    # Create learning roadmap
    print("📚 Creating learning roadmap...")
    roadmap = roadmap_agent.create_learning_roadmap(2, "software_engineer", user_skills)
    
    print(f"✅ Roadmap created with {len(roadmap.get('milestones', []))} milestones")
    print(f"📅 Estimated duration: {roadmap.get('total_duration', 'Unknown')}")
    
    # Generate milestones
    print("\n🎯 Generating detailed milestones...")
    milestones = roadmap_agent.generate_milestones(roadmap)
    
    for i, milestone in enumerate(milestones[:3], 1):  # Show first 3
        print(f"\n{i}. {milestone.title}")
        print(f"   Description: {milestone.description}")
        print(f"   Skills: {', '.join(milestone.skills_covered)}")
        print(f"   Time: {milestone.estimated_time}")
    
    # Suggest next skills
    print("\n💡 Suggesting next skills...")
    current_progress = {
        "completed_milestones": 1,
        "current_skills": user_skills,
        "roadmap_progress": "25%"
    }
    
    next_skills = roadmap_agent.suggest_next_skills(current_progress)
    print(f"Next skills to focus on: {next_skills}")
    
    return roadmap, milestones

def example_repository_creation():
    """Example of using the Repository Creation Agent"""
    print("\n🏗️ Example: Repository Creation Agent")
    print("=" * 50)
    
    # Initialize agent
    repo_agent = RepositoryCreationAgent()
    
    # Create project repository
    print("🏗️ Creating project repository...")
    user_level = 2
    skill_focus = ["JavaScript", "React", "Node.js"]
    
    project = repo_agent.create_project_repository(user_level, skill_focus)
    
    print(f"✅ Project created: {project['name']}")
    print(f"📝 Description: {project['description']}")
    print(f"🛠️ Tech Stack: {', '.join(project['tech_stack'])}")
    print(f"📊 Difficulty: {project['difficulty_level']}")
    print(f"⏱️ Estimated Time: {project['estimated_time']}")
    
    # Generate coding issues
    print("\n🐛 Generating coding issues...")
    issues = repo_agent.generate_coding_issues(project["difficulty_level"], project["tech_stack"])
    
    print(f"✅ Generated {len(issues)} coding issues")
    
    for i, issue in enumerate(issues[:2], 1):  # Show first 2
        print(f"\n{i}. {issue.title}")
        print(f"   Description: {issue.description}")
        print(f"   Difficulty: {issue.difficulty}")
        print(f"   Time: {issue.estimated_time}")
        print(f"   Skills: {', '.join(issue.skills_required)}")
    
    # Validate project requirements
    print("\n✅ Validating project requirements...")
    user_skills = [
        {"name": "JavaScript", "level": 2, "category": "programming"},
        {"name": "HTML", "level": 3, "category": "frontend"}
    ]
    
    validation = repo_agent.validate_project_requirements(user_skills, project["name"])
    print(f"Validation result: {validation}")
    
    return project, issues

def example_integrated_workflow():
    """Example of using both agents together"""
    print("\n🔄 Example: Integrated Workflow")
    print("=" * 50)
    
    # Initialize integration
    integration = Agent2Integration()
    
    # Mock user data
    user_id = "user123"
    current_level = 2
    target_role = "software_engineer"
    user_skills = [
        {"name": "Python", "level": 2, "category": "programming"},
        {"name": "JavaScript", "level": 1, "category": "programming"},
        {"name": "Git", "level": 2, "category": "tools"}
    ]
    
    # Create complete learning path
    print("🚀 Creating complete learning path...")
    learning_path = integration.create_complete_learning_path(
        user_id, current_level, target_role, user_skills
    )
    
    print(f"✅ Complete learning path created!")
    print(f"📚 Milestones: {learning_path['summary']['total_milestones']}")
    print(f"🐛 Issues: {learning_path['summary']['total_issues']}")
    print(f"📅 Duration: {learning_path['summary']['estimated_duration']}")
    
    # Generate portfolio project
    print("\n🎨 Generating portfolio project...")
    portfolio = integration.generate_portfolio_project(
        user_id, current_level, ["Python", "Web Development"]
    )
    
    if "error" not in portfolio:
        print(f"✅ Portfolio project: {portfolio['project']['name']}")
        print(f"📊 Portfolio value: {portfolio['portfolio_value']}")
        print(f"⏱️ Completion time: {portfolio['estimated_completion']}")
    
    return learning_path, portfolio

def example_learning_progress_update():
    """Example of updating learning progress"""
    print("\n📈 Example: Learning Progress Update")
    print("=" * 50)
    
    # Initialize integration
    integration = Agent2Integration()
    
    # Mock completed projects
    completed_projects = [
        {"name": "Todo App", "score": 85, "skills_used": ["JavaScript", "React"]},
        {"name": "Weather Dashboard", "score": 92, "skills_used": ["API Integration", "CSS"]}
    ]
    
    # Mock current roadmap
    current_roadmap = {
        "current_level": 2,
        "milestones": [
            {"title": "Basic Setup", "completed": True},
            {"title": "Core Skills", "completed": True},
            {"title": "Advanced Features", "completed": False},
            {"title": "Deployment", "completed": False}
        ]
    }
    
    # Update progress
    print("📈 Updating learning progress...")
    progress_update = integration.update_learning_progress(
        "user123", completed_projects, current_roadmap
    )
    
    if "error" not in progress_update:
        print(f"✅ Progress updated!")
        print(f"📊 Completion: {progress_update['progress_summary']['roadmap_completion']}%")
        print(f"🎯 Ready for next level: {progress_update['progress_summary']['ready_for_next_level']}")
        
        if progress_update.get('next_project'):
            print(f"🏗️ Next project: {progress_update['next_project']['name']}")
    else:
        print(f"❌ Error updating progress: {progress_update['error']}")

def main():
    """Run all examples"""
    print("🎯 Agent2 Examples - Roadmap + Repository Agents")
    print("=" * 60)
    
    try:
        # Example 1: Roadmap Generation
        roadmap, milestones = example_roadmap_generation()
        
        # Example 2: Repository Creation
        project, issues = example_repository_creation()
        
        # Example 3: Integrated Workflow
        learning_path, portfolio = example_integrated_workflow()
        
        # Example 4: Progress Update
        example_learning_progress_update()
        
        print("\n🎉 All examples completed successfully!")
        
        # Save results to file
        results = {
            "roadmap": roadmap,
            "project": project,
            "learning_path": learning_path,
            "portfolio": portfolio
        }
        
        with open("agent2_example_results.json", "w") as f:
            json.dump(results, f, indent=2, default=str)
        
        print("💾 Results saved to 'agent2_example_results.json'")
        
    except Exception as e:
        print(f"❌ Error running examples: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main() 