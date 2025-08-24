from flask import Blueprint, request, jsonify, current_app
from ..utils.decorators import auth_required
from ..services.supabase_client import supabase
from ..services.ai_agent_service import AIAgentService
from datetime import datetime, timezone, timedelta
import json
import requests
from pathlib import Path
import base64

bp = Blueprint("projects", __name__)

# Initialize services
ai_service = AIAgentService()

class GitHubService:
    """GitHub API service for repository operations"""
    
    def create_repository(self, token, name, description="", private=True):
        """Create a new GitHub repository"""
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        data = {
            "name": name,
            "description": description,
            "private": private,
            "auto_init": True
        }
        
        response = requests.post("https://api.github.com/user/repos", headers=headers, json=data)
        
        if response.status_code == 201:
            return response.json()
        else:
            print(f"❌ Failed to create repository: {response.status_code} - {response.text}")
            return None
    
    def create_file(self, token, owner, repo_name, path, message, content):
        """Create a file in the repository"""
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        # Encode content to base64
        content_encoded = base64.b64encode(content.encode('utf-8')).decode('utf-8')
        
        data = {
            "message": message,
            "content": content_encoded
        }
        
        url = f"https://api.github.com/repos/{owner}/{repo_name}/contents/{path}"
        response = requests.put(url, headers=headers, json=data)
        
        if response.status_code in [200, 201]:
            return response.json()
        else:
            print(f"❌ Failed to create file {path}: {response.status_code} - {response.text}")
            return None
    
    def create_issue(self, token, owner, repo_name, title, body="", labels=None):
        """Create an issue in the repository"""
        headers = {
            "Authorization": f"token {token}",
            "Accept": "application/vnd.github.v3+json"
        }
        
        data = {
            "title": title,
            "body": body,
            "labels": labels or []
        }
        
        url = f"https://api.github.com/repos/{owner}/{repo_name}/issues"
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 201:
            return response.json()
        else:
            print(f"❌ Failed to create issue: {response.status_code} - {response.text}")
            return None

github_service = GitHubService()

@bp.route("/api/roadmap/generate", methods=["POST"])
@auth_required
def generate_roadmap(current_user_id):
    """Generate a personalized learning roadmap for the user"""
    try:
        data = request.get_json()
        target_role = data.get('target_role', 'software_engineer')
        user_skills = data.get('user_skills', [])
        current_level = data.get('current_level', 1)
        preferences = data.get('preferences', {})
        
        if not user_skills:
            return jsonify({"error": "User skills required"}), 400
        
        # Get user's current level from database if not provided
        if not current_level or current_level == 1:
            try:
                progress_result = supabase.table("user_progress").select("current_level").eq("user_id", current_user_id).execute()
                current_level = progress_result.data[0]["current_level"] if progress_result.data else 1
            except Exception:
                current_level = 1
        
        # Generate comprehensive learning roadmap using AI service
        print(f"📚 Generating roadmap for level {current_level} -> {target_role}")
        roadmap_data = ai_service.generate_roadmap(current_level, target_role, user_skills)
        
        # If AI service doesn't work, create a fallback roadmap
        if not roadmap_data:
            print("⚠️ AI service unavailable, generating fallback roadmap")
            roadmap_data = create_fallback_roadmap(target_role, user_skills, current_level)
        
        if not roadmap_data:
            return jsonify({"error": "Failed to generate roadmap"}), 500
        
        # Store roadmap in database
        roadmap_record = {
            "user_id": current_user_id,
            "target_role": target_role,
            "current_level": current_level,
            "roadmap_data": roadmap_data,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        
        try:
            result = supabase.table("repository_roadmaps").upsert(roadmap_record).execute()
            print("✅ Roadmap stored in database")
        except Exception as e:
            print(f"⚠️ Failed to store roadmap: {e}")
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "roadmap_generation",
            "target_repository": None,
            "input_data": {
                "target_role": target_role, 
                "user_skills": user_skills,
                "current_level": current_level
            },
            "output_data": {
                "milestones_count": len(roadmap_data.get("milestones", [])),
                "estimated_duration": roadmap_data.get("estimated_duration", "N/A")
            },
            "success": True,
            "ai_model_used": "Agent2 + OpenAI GPT-4o-mini",
            "execution_time_ms": 5000
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"⚠️ Failed to log operation: {e}")
        
        return jsonify({
            "success": True,
            "message": "Roadmap generated successfully",
            "roadmap": roadmap_data,
            "roadmap_id": result.data[0]["id"] if result.data else None
        })
        
    except Exception as e:
        print(f"❌ Roadmap generation failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Roadmap generation failed: {str(e)}"
        }), 500


@bp.route("/api/projects/create", methods=["POST"])
@auth_required
def create_project_from_roadmap(current_user_id):
    """Create a project repository based on user's roadmap"""
    try:
        data = request.get_json()
        roadmap_id = data.get('roadmap_id')
        project_name = data.get('project_name')
        milestone_focus = data.get('milestone_focus')  # Which milestone to focus on
        make_public = data.get('make_public', False)
        
        if not roadmap_id:
            return jsonify({"error": "Roadmap ID required"}), 400
        
        # Get the roadmap data
        roadmap_result = supabase.table("repository_roadmaps").select("*").eq("id", roadmap_id).eq("user_id", current_user_id).execute()
        
        if not roadmap_result.data:
            return jsonify({"error": "Roadmap not found"}), 404
        
        roadmap = roadmap_result.data[0]
        roadmap_data = roadmap["roadmap_data"]
        
        # Get user's GitHub token
        user_result = supabase.table("users").select("github_access_token, github_username").eq("id", current_user_id).execute()
        
        if not user_result.data or not user_result.data[0].get("github_access_token"):
            return jsonify({"error": "GitHub access token not found. Please authenticate with GitHub first."}), 400
        
        github_token = user_result.data[0]["github_access_token"]
        github_username = user_result.data[0]["github_username"]
        
        # Generate project name if not provided
        if not project_name:
            target_role = roadmap["target_role"].replace('_', '-')
            project_name = f"{target_role}-learning-project-{current_user_id}"
        
        # Create GitHub repository
        repo_description = f"Learning project for {roadmap['target_role'].replace('_', ' ').title()} - Generated from AI roadmap"
        
        repo_data = github_service.create_repository(
            token=github_token,
            name=project_name,
            description=repo_description,
            private=not make_public
        )
        
        if not repo_data:
            return jsonify({"error": "Failed to create GitHub repository"}), 500
        
        # Create folder structure based on roadmap milestones
        folders_created = create_project_structure(
            github_service, 
            github_token, 
            repo_data, 
            roadmap_data,
            milestone_focus
        )
        
        # Create issues for the project
        issues_created = create_project_issues(
            github_service,
            github_token,
            repo_data,
            roadmap_data,
            milestone_focus
        )
        
        # Store project in database
        project_record = {
            "user_id": current_user_id,
            "repository_name": repo_data["name"],
            "repository_url": repo_data["html_url"],
            "github_repo_id": repo_data["id"],
            "description": repo_description,
            "tech_stack": roadmap_data.get("tech_stack", []),
            "difficulty_level": roadmap_data.get("difficulty_level", "intermediate"),
            "estimated_time": roadmap_data.get("estimated_duration", "4-6 weeks"),
            "learning_objectives": roadmap_data.get("learning_objectives", []),
            "roadmap_id": roadmap_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        
        try:
            project_result = supabase.table("ai_repositories").insert(project_record).execute()
            print("✅ Project stored in database")
        except Exception as e:
            print(f"⚠️ Failed to store project: {e}")
        
        # Update user progress
        try:
            progress_data = {
                "user_id": current_user_id,
                "current_level": roadmap["current_level"],
                "xp_points": 50,  # Award XP for creating project
                "badges": ["Project Creator"],
                "next_goal": f"Complete {project_name} milestones",
                "last_updated": datetime.now(timezone.utc).isoformat()
            }
            supabase.table("user_progress").upsert(progress_data).execute()
        except Exception as e:
            print(f"⚠️ Failed to update progress: {e}")
        
        # Log operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "project_creation",
            "target_repository": repo_data["name"],
            "input_data": {
                "roadmap_id": roadmap_id,
                "project_name": project_name,
                "milestone_focus": milestone_focus
            },
            "output_data": {
                "repository_url": repo_data["html_url"],
                "folders_created": len(folders_created),
                "issues_created": len(issues_created)
            },
            "success": True,
            "ai_model_used": "Agent2 + GitHub API",
            "execution_time_ms": 8000
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"⚠️ Failed to log operation: {e}")
        
        return jsonify({
            "success": True,
            "message": "Project created successfully!",
            "project": {
                "repository": repo_data,
                "folders": folders_created,
                "issues": issues_created,
                "project_id": project_result.data[0]["id"] if project_result.data else None
            },
            "next_steps": [
                "Clone the repository to start working",
                "Review the project structure and issues",
                "Start with the first milestone tasks"
            ]
        })
        
    except Exception as e:
        print(f"❌ Project creation failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Project creation failed: {str(e)}"
        }), 500


@bp.route("/api/projects/list", methods=["GET"])
@auth_required
def list_user_projects(current_user_id):
    """Get all projects for the current user"""
    try:
        # Get projects from database
        projects_result = supabase.table("ai_repositories").select("*").eq("user_id", current_user_id).order("created_at", desc=True).execute()
        
        projects = []
        for project in projects_result.data:
            # Get related roadmap info
            roadmap_result = supabase.table("repository_roadmaps").select("target_role, current_level").eq("id", project.get("roadmap_id", 0)).execute()
            roadmap_info = roadmap_result.data[0] if roadmap_result.data else {}
            
            # Get project issues count
            issues_result = supabase.table("ai_issues").select("id, status").eq("user_id", current_user_id).eq("repository_name", project["repository_name"]).execute()
            
            total_issues = len(issues_result.data) if issues_result.data else 0
            completed_issues = len([i for i in issues_result.data if i.get("status") == "completed"]) if issues_result.data else 0
            
            projects.append({
                "id": project["id"],
                "name": project["repository_name"],
                "description": project["description"],
                "repository_url": project["repository_url"],
                "tech_stack": project["tech_stack"],
                "difficulty_level": project["difficulty_level"],
                "estimated_time": project["estimated_time"],
                "status": project["status"],
                "created_at": project["created_at"],
                "target_role": roadmap_info.get("target_role", "Unknown"),
                "current_level": roadmap_info.get("current_level", 1),
                "progress": {
                    "total_issues": total_issues,
                    "completed_issues": completed_issues,
                    "completion_percentage": round((completed_issues / total_issues * 100) if total_issues > 0 else 0, 1)
                }
            })
        
        return jsonify({
            "success": True,
            "projects": projects,
            "total_projects": len(projects)
        })
        
    except Exception as e:
        print(f"❌ Failed to list projects: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch projects: {str(e)}"
        }), 500


@bp.route("/api/projects/<int:project_id>", methods=["GET"])
@auth_required
def get_project_details(current_user_id, project_id):
    """Get detailed information about a specific project"""
    try:
        # Get project from database
        project_result = supabase.table("ai_repositories").select("*").eq("id", project_id).eq("user_id", current_user_id).execute()
        
        if not project_result.data:
            return jsonify({"error": "Project not found"}), 404
        
        project = project_result.data[0]
        
        # Get related roadmap
        roadmap_result = supabase.table("repository_roadmaps").select("*").eq("id", project.get("roadmap_id", 0)).execute()
        roadmap = roadmap_result.data[0] if roadmap_result.data else None
        
        # Get project issues
        issues_result = supabase.table("ai_issues").select("*").eq("user_id", current_user_id).eq("repository_name", project["repository_name"]).execute()
        
        return jsonify({
            "success": True,
            "project": project,
            "roadmap": roadmap,
            "issues": issues_result.data or []
        })
        
    except Exception as e:
        print(f"❌ Failed to get project details: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Failed to fetch project details: {str(e)}"
        }), 500


def create_project_structure(github_service, token, repo_data, roadmap_data, milestone_focus=None):
    """Create project folder structure based on roadmap"""
    folders_created = []
    
    # Create main README
    readme_content = f"""# {repo_data['name']}

{repo_data['description']}

## Learning Objectives
{chr(10).join([f"- {obj}" for obj in roadmap_data.get("learning_objectives", [])])}

## Tech Stack
{chr(10).join([f"- {tech}" for tech in roadmap_data.get("tech_stack", [])])}

## Project Structure

This repository is organized by learning milestones. Each folder contains:
- Project files and code
- README with learning objectives
- Practice exercises
- Resources and references

## Getting Started

1. Clone this repository
2. Navigate to the first milestone folder
3. Read the README and requirements
4. Start coding and learning!

## Progress Tracking

Check the Issues tab to see your learning tasks and track progress.

---

Generated with AI-powered learning system 🤖
"""
    
    try:
        github_service.create_file(
            token=token,
            owner=repo_data["owner"]["login"],
            repo_name=repo_data["name"],
            path="README.md",
            message="Initialize project with AI-generated structure",
            content=readme_content
        )
        folders_created.append({"name": "README.md", "type": "file"})
    except Exception as e:
        print(f"⚠️ Failed to create main README: {e}")
    
    # Create milestone folders
    milestones = roadmap_data.get("milestones", [])
    if milestone_focus:
        # Focus on specific milestone
        milestones = [m for m in milestones if m.get("name") == milestone_focus]
    
    for i, milestone in enumerate(milestones[:3]):  # Limit to first 3 milestones
        folder_name = f"milestone-{i+1}-{milestone.get('name', 'learning').lower().replace(' ', '-')}"
        
        milestone_readme = f"""# Milestone {i+1}: {milestone.get('name', 'Learning Milestone')}

{milestone.get('description', 'Complete this learning milestone')}

## Learning Objectives
{chr(10).join([f"- {obj}" for obj in milestone.get("learning_objectives", [])])}

## Skills to Practice
{chr(10).join([f"- {skill}" for skill in milestone.get("skills_covered", [])])}

## Estimated Time
{milestone.get("duration", "1-2 weeks")}

## Tasks
{chr(10).join([f"- [ ] {task.get('title', 'Task')}" for task in milestone.get("tasks", [])])}

## Resources
{chr(10).join([f"- {resource}" for resource in milestone.get("resources", [])])}

---
Start working on the tasks above and check them off as you complete them!
"""
        
        try:
            github_service.create_file(
                token=token,
                owner=repo_data["owner"]["login"],
                repo_name=repo_data["name"],
                path=f"{folder_name}/README.md",
                message=f"Add {milestone.get('name', 'milestone')} structure",
                content=milestone_readme
            )
            folders_created.append({
                "name": folder_name,
                "type": "folder",
                "milestone": milestone.get('name', 'Unknown')
            })
        except Exception as e:
            print(f"⚠️ Failed to create milestone folder {folder_name}: {e}")
    
    return folders_created


def create_project_issues(github_service, token, repo_data, roadmap_data, milestone_focus=None):
    """Create GitHub issues for project tasks"""
    issues_created = []
    
    milestones = roadmap_data.get("milestones", [])
    if milestone_focus:
        milestones = [m for m in milestones if m.get("name") == milestone_focus]
    
    for milestone in milestones[:3]:  # Limit to first 3 milestones
        for task in milestone.get("tasks", [])[:2]:  # Limit to 2 tasks per milestone
            issue_title = f"[{milestone.get('name', 'Milestone')}] {task.get('title', 'Learning Task')}"
            
            issue_body = f"""{task.get('description', 'Complete this learning task')}

## Skills Required
{chr(10).join([f"- {skill}" for skill in task.get("skills_required", [])])}

## Acceptance Criteria
{chr(10).join([f"- [ ] {criteria}" for criteria in task.get("acceptance_criteria", [])])}

## Resources
{chr(10).join([f"- {resource}" for resource in task.get("resources", [])])}

## Difficulty
{task.get('difficulty', 'Medium')}

## Estimated Time
{task.get('estimated_time', '2-4 hours')}

---
This is an AI-generated learning task. Complete the requirements and close the issue when done!
"""
            
            try:
                issue_response = github_service.create_issue(
                    token=token,
                    owner=repo_data["owner"]["login"],
                    repo_name=repo_data["name"],
                    title=issue_title,
                    body=issue_body,
                    labels=["learning", task.get('difficulty', 'medium').lower(), "ai-generated"]
                )
                
                if issue_response:
                    issues_created.append({
                        "github_issue_id": issue_response.get("number"),
                        "title": issue_title,
                        "difficulty": task.get('difficulty', 'Medium'),
                        "milestone": milestone.get('name', 'Unknown')
                    })
            except Exception as e:
                print(f"⚠️ Failed to create issue '{issue_title}': {e}")
    
    return issues_created


def create_fallback_roadmap(target_role, user_skills, current_level):
    """Create a fallback roadmap when AI agents are not available"""
    
    # Define common learning paths for different roles
    role_paths = {
        "software_engineer": {
            "name": "Software Engineer Learning Path",
            "description": "Comprehensive path to become a software engineer",
            "milestones": [
                {
                    "name": "Programming Fundamentals",
                    "description": "Master core programming concepts and syntax",
                    "duration": "4-6 weeks",
                    "learning_objectives": [
                        "Understand variables, data types, and control structures",
                        "Write clean, readable code",
                        "Debug and test code effectively"
                    ],
                    "skills_covered": ["Python", "JavaScript", "Git", "Problem Solving"],
                    "tasks": [
                        {
                            "title": "Complete Basic Python Exercises",
                            "description": "Practice Python fundamentals with coding exercises",
                            "difficulty": "Beginner",
                            "estimated_time": "8-10 hours",
                            "skills_required": ["Python"],
                            "acceptance_criteria": [
                                "Complete 20+ Python exercises",
                                "Understand loops, functions, and classes",
                                "Write clean, commented code"
                            ],
                            "resources": [
                                "Python.org tutorial",
                                "Codecademy Python course",
                                "HackerRank Python challenges"
                            ]
                        },
                        {
                            "title": "Build a Simple Calculator",
                            "description": "Create a command-line calculator application",
                            "difficulty": "Beginner",
                            "estimated_time": "4-6 hours",
                            "skills_required": ["Python", "Problem Solving"],
                            "acceptance_criteria": [
                                "Support basic arithmetic operations",
                                "Handle input validation",
                                "Include unit tests"
                            ],
                            "resources": [
                                "Python documentation",
                                "unittest module guide"
                            ]
                        }
                    ]
                },
                {
                    "name": "Web Development Basics",
                    "description": "Learn frontend and backend web development",
                    "duration": "6-8 weeks",
                    "learning_objectives": [
                        "Build responsive web interfaces",
                        "Understand client-server architecture",
                        "Work with APIs and databases"
                    ],
                    "skills_covered": ["HTML", "CSS", "JavaScript", "REST APIs"],
                    "tasks": [
                        {
                            "title": "Create a Personal Portfolio Website",
                            "description": "Build a responsive portfolio showcasing your projects",
                            "difficulty": "Intermediate",
                            "estimated_time": "12-15 hours",
                            "skills_required": ["HTML", "CSS", "JavaScript"],
                            "acceptance_criteria": [
                                "Responsive design that works on mobile",
                                "Professional styling and layout",
                                "Interactive JavaScript features"
                            ],
                            "resources": [
                                "MDN Web Docs",
                                "CSS Grid and Flexbox guides",
                                "JavaScript ES6+ tutorials"
                            ]
                        }
                    ]
                },
                {
                    "name": "Advanced Development",
                    "description": "Master advanced concepts and frameworks",
                    "duration": "8-10 weeks",
                    "learning_objectives": [
                        "Use modern frameworks and libraries",
                        "Implement advanced design patterns",
                        "Deploy and maintain applications"
                    ],
                    "skills_covered": ["React", "Node.js", "Docker", "AWS"],
                    "tasks": [
                        {
                            "title": "Build a Full-Stack Application",
                            "description": "Create a complete web application with frontend and backend",
                            "difficulty": "Advanced",
                            "estimated_time": "25-30 hours",
                            "skills_required": ["React", "Node.js", "Database"],
                            "acceptance_criteria": [
                                "User authentication system",
                                "CRUD operations with database",
                                "Deployed to cloud platform"
                            ],
                            "resources": [
                                "React documentation",
                                "Node.js guides",
                                "MongoDB/PostgreSQL tutorials"
                            ]
                        }
                    ]
                }
            ],
            "tech_stack": ["Python", "JavaScript", "React", "Node.js", "Git"],
            "estimated_duration": "16-24 weeks",
            "difficulty_level": "intermediate"
        },
        "data_scientist": {
            "name": "Data Science Learning Path",
            "description": "Comprehensive path to become a data scientist",
            "milestones": [
                {
                    "name": "Python for Data Science",
                    "description": "Master Python libraries for data analysis",
                    "duration": "4-6 weeks",
                    "learning_objectives": [
                        "Use pandas for data manipulation",
                        "Create visualizations with matplotlib",
                        "Perform statistical analysis"
                    ],
                    "skills_covered": ["Python", "Pandas", "NumPy", "Matplotlib"],
                    "tasks": [
                        {
                            "title": "Data Analysis Project",
                            "description": "Analyze a real dataset and create insights",
                            "difficulty": "Intermediate",
                            "estimated_time": "10-12 hours",
                            "skills_required": ["Python", "Pandas", "Statistics"],
                            "acceptance_criteria": [
                                "Clean and preprocess data",
                                "Generate meaningful insights",
                                "Create compelling visualizations"
                            ],
                            "resources": [
                                "Pandas documentation",
                                "Kaggle datasets",
                                "Matplotlib tutorials"
                            ]
                        }
                    ]
                }
            ],
            "tech_stack": ["Python", "Pandas", "NumPy", "Scikit-learn", "Jupyter"],
            "estimated_duration": "20-28 weeks",
            "difficulty_level": "intermediate"
        }
    }
    
    # Get the appropriate path or create a generic one
    roadmap = role_paths.get(target_role, role_paths["software_engineer"])
    
    # Customize based on user skills
    existing_skills = [skill["name"].lower() for skill in user_skills]
    
    # Adjust milestones based on existing skills
    for milestone in roadmap["milestones"]:
        milestone_skills = [skill.lower() for skill in milestone.get("skills_covered", [])]
        if any(skill in existing_skills for skill in milestone_skills):
            milestone["duration"] = "2-3 weeks"  # Reduce duration if user has some skills
    
    return roadmap
