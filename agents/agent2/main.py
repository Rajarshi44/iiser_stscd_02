#!/usr/bin/env python3
"""
Agent2 Main Integration - IISER StatusCode 02
Combines Roadmap Generation and Repository Creation agents
"""

import os
import json
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path

# Import our agents
from roadmap_agent import RoadmapGenerationAgent, LearningRoadmap, Milestone
from repository_agent import RepositoryCreationAgent, ProjectRepository, CodingIssue

class Agent2Integration:
    """Main integration class for Agent2 functionality"""
    
    def __init__(self, groq_api_key: str = None, github_token: str = None):
        """Initialize both agents"""
        self.groq_api_key = groq_api_key or os.getenv('GROQ_API_KEY')
        self.github_token = github_token or os.getenv('GITHUB_TOKEN')
        
        # Initialize agents
        self.roadmap_agent = RoadmapGenerationAgent(self.groq_api_key)
        self.repository_agent = RepositoryCreationAgent(self.groq_api_key, self.github_token)
        
        print("✅ Agent2 Integration initialized")
    
    def create_complete_learning_path(self, user_id: str, current_level: int, target_role: str, user_skills: List[Dict]) -> Dict:
        """Create a complete learning path with roadmap and projects"""
        try:
            print(f"🚀 Creating complete learning path for user {user_id}")
            
            # Step 1: Generate learning roadmap
            print("📚 Generating learning roadmap...")
            roadmap = self.roadmap_agent.create_learning_roadmap(current_level, target_role, user_skills)
            
            # Step 2: Generate milestones
            print("🎯 Generating learning milestones...")
            milestones = self.roadmap_agent.generate_milestones(roadmap)
            
            # Step 3: Create project repository
            print("🏗️ Creating project repository...")
            skill_focus = [skill["name"] for skill in user_skills[:3]]  # Focus on top 3 skills
            project = self.repository_agent.create_project_repository(current_level, skill_focus)
            
            # Step 4: Generate coding issues
            print("🐛 Generating coding issues...")
            issues = self.repository_agent.generate_coding_issues(
                project["difficulty_level"], 
                project["tech_stack"]
            )
            
            # Step 5: Validate everything
            print("✅ Validating learning path...")
            validation = self.repository_agent.validate_project_requirements(user_skills, project["name"])
            
            # Compile complete response
            complete_path = {
                "user_id": user_id,
                "created_at": datetime.now().isoformat(),
                "roadmap": roadmap,
                "milestones": [self._milestone_to_dict(m) for m in milestones],
                "project": project,
                "issues": [self._issue_to_dict(i) for i in issues],
                "validation": validation,
                "summary": {
                    "total_milestones": len(milestones),
                    "total_issues": len(issues),
                    "estimated_duration": roadmap.get("total_duration", "Unknown"),
                    "difficulty_level": project["difficulty_level"],
                    "tech_stack_size": len(project["tech_stack"])
                }
            }
            
            print(f"🎉 Complete learning path created with {len(milestones)} milestones and {len(issues)} issues")
            return complete_path
            
        except Exception as e:
            print(f"❌ Error creating complete learning path: {e}")
            return self._create_fallback_path(user_id, current_level, target_role, user_skills)
    
    def update_learning_progress(self, user_id: str, completed_projects: List[Dict], current_roadmap: Dict) -> Dict:
        """Update learning progress and suggest next steps"""
        try:
            print(f"📈 Updating learning progress for user {user_id}")
            
            # Update roadmap progress
            updated_roadmap = self.roadmap_agent.update_roadmap_progress(completed_projects, current_roadmap)
            
            # Suggest next skills
            next_skills = self.roadmap_agent.suggest_next_skills({
                "completed_projects": len(completed_projects),
                "current_roadmap": current_roadmap
            })
            
            # Create next project if needed
            next_project = None
            if len(completed_projects) >= 2:  # Create new project after 2 completions
                user_level = current_roadmap.get("current_level", 1) + 1
                skill_focus = ["Advanced Programming", "System Design"]
                next_project = self.repository_agent.create_project_repository(user_level, skill_focus)
            
            return {
                "user_id": user_id,
                "updated_at": datetime.now().isoformat(),
                "updated_roadmap": updated_roadmap,
                "next_skills": next_skills,
                "next_project": next_project,
                "progress_summary": {
                    "completed_projects": len(completed_projects),
                    "roadmap_completion": self._calculate_completion_percentage(current_roadmap, completed_projects),
                    "ready_for_next_level": len(completed_projects) >= 3
                }
            }
            
        except Exception as e:
            print(f"❌ Error updating learning progress: {e}")
            return {"error": str(e)}
    
    def generate_portfolio_project(self, user_id: str, skill_level: int, focus_areas: List[str]) -> Dict:
        """Generate a portfolio-worthy project"""
        try:
            print(f"🎨 Generating portfolio project for user {user_id}")
            
            # Create advanced project
            project = self.repository_agent.create_project_repository(skill_level + 1, focus_areas)
            
            # Generate comprehensive issues
            issues = self.repository_agent.generate_coding_issues("advanced", project["tech_stack"])
            
            # Add portfolio-specific features
            portfolio_features = [
                "Responsive design",
                "Performance optimization",
                "Testing coverage",
                "Documentation",
                "Deployment setup"
            ]
            
            # Create portfolio issue
            portfolio_issue = CodingIssue(
                title="Portfolio Enhancement",
                description="Add portfolio-worthy features to showcase skills",
                difficulty="advanced",
                estimated_time="1-2 weeks",
                skills_required=portfolio_features,
                acceptance_criteria=[
                    "Project is production-ready",
                    "Includes comprehensive testing",
                    "Has professional documentation",
                    "Deployed to live environment"
                ],
                hints=[
                    "Focus on code quality",
                    "Add performance metrics",
                    "Include user stories",
                    "Showcase best practices"
                ],
                resources=[
                    "Clean Code principles",
                    "Testing best practices",
                    "Deployment guides",
                    "Portfolio examples"
                ]
            )
            
            issues.append(portfolio_issue)
            
            return {
                "user_id": user_id,
                "project": project,
                "issues": [self._issue_to_dict(i) for i in issues],
                "portfolio_features": portfolio_features,
                "estimated_completion": f"{skill_level * 2}-{skill_level * 3} weeks",
                "portfolio_value": "High - showcases advanced skills and best practices"
            }
            
        except Exception as e:
            print(f"❌ Error generating portfolio project: {e}")
            return {"error": str(e)}
    
    def _milestone_to_dict(self, milestone: Milestone) -> Dict:
        """Convert Milestone object to dictionary"""
        return {
            "id": milestone.id,
            "title": milestone.title,
            "description": milestone.description,
            "skills_covered": milestone.skills_covered,
            "difficulty": milestone.difficulty,
            "estimated_time": milestone.estimated_time,
            "resources": milestone.resources,
            "prerequisites": milestone.prerequisites,
            "completion_criteria": milestone.completion_criteria
        }
    
    def _issue_to_dict(self, issue: CodingIssue) -> Dict:
        """Convert CodingIssue object to dictionary"""
        return {
            "title": issue.title,
            "description": issue.description,
            "difficulty": issue.difficulty,
            "estimated_time": issue.estimated_time,
            "skills_required": issue.skills_required,
            "acceptance_criteria": issue.acceptance_criteria,
            "hints": issue.hints,
            "resources": issue.resources
        }
    
    def _calculate_completion_percentage(self, roadmap: Dict, completed_projects: List[Dict]) -> float:
        """Calculate roadmap completion percentage"""
        try:
            total_milestones = len(roadmap.get("milestones", []))
            if total_milestones == 0:
                return 0.0
            
            # Simple calculation based on completed projects
            completion_ratio = min(len(completed_projects) / 3, 1.0)  # Assume 3 projects = 100%
            return round(completion_ratio * 100, 1)
            
        except Exception:
            return 0.0
    
    def _create_fallback_path(self, user_id: str, current_level: int, target_role: str, user_skills: List[Dict]) -> Dict:
        """Create a fallback learning path when AI fails"""
        return {
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "status": "fallback",
            "roadmap": {
                "current_level": current_level,
                "target_role": target_role,
                "milestones": [
                    {
                        "title": "Basic Setup",
                        "description": "Set up development environment",
                        "estimated_time": "1 week"
                    },
                    {
                        "title": "Core Skills",
                        "description": "Practice fundamental programming",
                        "estimated_time": "2-3 weeks"
                    }
                ]
            },
            "project": {
                "name": f"fallback-project-{current_level}",
                "description": "Basic project to get started",
                "tech_stack": ["HTML", "CSS", "JavaScript"],
                "difficulty_level": "beginner"
            },
            "issues": [
                {
                    "title": "Get Started",
                    "description": "Begin with basic setup and learning",
                    "difficulty": "beginner",
                    "estimated_time": "1 week"
                }
            ],
            "validation": {
                "compatibility": "Good",
                "recommendations": ["Start simple", "Build gradually"]
            }
        }

# Example usage
if __name__ == "__main__":
    # Test the integration
    integration = Agent2Integration()
    
    # Mock user data
    user_skills = [
        {"name": "Python", "level": 2, "category": "programming"},
        {"name": "JavaScript", "level": 1, "category": "programming"},
        {"name": "Git", "level": 2, "category": "tools"}
    ]
    
    # Create complete learning path
    learning_path = integration.create_complete_learning_path("user123", 2, "software_engineer", user_skills)
    print("Learning Path Created:")
    print(json.dumps(learning_path, indent=2))
    
    # Generate portfolio project
    portfolio = integration.generate_portfolio_project("user123", 2, ["Python", "Web Development"])
    print(f"\nPortfolio Project: {portfolio}") 