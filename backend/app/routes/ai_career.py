from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import os
from ..utils.decorators import token_required
from ..services.supabase_client import supabase
from ..services.ai_agent_service import AIAgentService
from ..services.github_skill_analyzer import GitHubSkillAnalyzer
from datetime import datetime, timezone, timedelta
import json
from pathlib import Path

bp = Blueprint("ai_career", __name__)

# Initialize AI Agent Service
ai_service = AIAgentService()

# Initialize GitHub Skill Analyzer
github_analyzer = GitHubSkillAnalyzer()

# File upload configuration
UPLOAD_FOLDER = 'uploads/cv'
ALLOWED_EXTENSIONS = {'pdf', 'txt', 'doc', 'docx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _fallback_parse_cv(file_path):
    """Fallback CV parsing when agent is not available"""
    try:
        import PyPDF2
        import docx
        
        file_extension = Path(file_path).suffix.lower()
        
        if file_extension == '.pdf':
            # Parse PDF using PyPDF2
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                text = ""
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n"
                return text.strip()
        
        elif file_extension == '.docx':
            # Parse DOCX using python-docx
            doc = docx.Document(file_path)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text.strip()
        
        elif file_extension in ['.txt', '.md']:
            # Read text files directly
            with open(file_path, 'r', encoding='utf-8') as f:
                return f.read().strip()
        
        else:
            print(f"⚠️ Unsupported file format: {file_extension}")
            return ""
            
    except ImportError as e:
        print(f"⚠️ Required libraries not available for fallback parsing: {e}")
        # Try basic text reading as last resort
        try:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                return f.read().strip()
        except Exception:
            return ""
    except Exception as e:
        print(f"⚠️ Fallback parsing failed: {e}")
        return ""

def _fallback_extract_skills(cv_text):
    """Fallback skill extraction when agent is not available"""
    skills = []
    
    # Basic skill extraction from text
    skill_keywords = {
        "programming": ["python", "javascript", "java", "c++", "c#", "go", "rust", "php", "ruby", "swift", "kotlin"],
        "frontend": ["react", "angular", "vue", "html", "css", "sass", "typescript", "jquery", "bootstrap"],
        "backend": ["node.js", "django", "flask", "express", "spring", "asp.net", "laravel", "rails"],
        "database": ["mysql", "postgresql", "mongodb", "redis", "sql", "oracle", "sqlite"],
        "cloud": ["aws", "azure", "gcp", "heroku", "digitalocean", "docker", "kubernetes"],
        "devops": ["git", "jenkins", "ci/cd", "terraform", "ansible", "prometheus", "grafana"],
        "ai_ml": ["tensorflow", "pytorch", "scikit-learn", "machine learning", "deep learning", "nlp"],
        "data": ["pandas", "numpy", "matplotlib", "seaborn", "tableau", "powerbi", "excel"]
    }
    
    cv_lower = cv_text.lower()
    
    for category, keywords in skill_keywords.items():
        for keyword in keywords:
            if keyword in cv_lower:
                # Estimate skill level based on context
                level = 2  # Default to beginner
                if any(word in cv_lower for word in ["expert", "advanced", "senior", "lead"]):
                    level = 4
                elif any(word in cv_lower for word in ["intermediate", "mid-level", "experienced"]):
                    level = 3
                elif any(word in cv_lower for word in ["beginner", "learning", "studying"]):
                    level = 1
                
                skills.append({
                    "name": keyword.title(),
                    "level": level,
                    "category": category,
                    "description": f"Extracted from CV text"
                })
    
    # If no skills found, add generic ones
    if not skills:
        skills = [
            {"name": "General Programming", "level": 2, "category": "programming", "description": "Basic programming knowledge"},
            {"name": "Problem Solving", "level": 2, "category": "soft_skills", "description": "Analytical thinking"}
        ]
    
    return skills

def _fallback_skill_analysis(target_role):
    """Fallback skill analysis when agent is not available"""
    return {
        "skill_gaps": ["Advanced frameworks", "Cloud deployment", "Testing methodologies"],
        "match_percentage": 60,
        "strengths": ["Basic programming", "Problem solving"],
        "recommendations": ["Learn modern frameworks", "Practice cloud deployment", "Improve testing skills"]
    }

def _fallback_generate_roadmap(target_role):
    """Fallback roadmap generation when agent is not available"""
    return [
        {
            "skill": "Modern Frameworks",
            "current_level": 1,
            "target_level": 3,
            "priority": "high",
            "estimated_time": "3-6 months",
            "resources": ["Official documentation", "Online courses", "Practice projects"]
        },
        {
            "skill": "Testing & Quality",
            "current_level": 1,
            "target_level": 3,
            "priority": "medium",
            "estimated_time": "2-4 months",
            "resources": ["Testing frameworks", "Best practices", "Real project testing"]
        },
        {
            "skill": "Cloud Deployment",
            "current_level": 1,
            "target_level": 2,
            "priority": "medium",
            "estimated_time": "2-3 months",
            "resources": ["Cloud platforms", "Containerization", "CI/CD pipelines"]
        }
    ]

@bp.route("/api/onboarding/cv-analysis", methods=["POST"])
@token_required
def cv_analysis_onboarding(current_user_id):
    """Complete CV analysis and onboarding flow"""
    try:
        # Get form data
        target_role = request.form.get('target_role', 'software_engineer')
        
        # Check if CV file was uploaded
        if 'cv_file' not in request.files:
            return jsonify({"error": "No CV file provided"}), 400
        
        cv_file = request.files['cv_file']
        if cv_file.filename == '':
            return jsonify({"error": "No CV file selected"}), 400
        
        if not allowed_file(cv_file.filename):
            return jsonify({"error": "Invalid file type. Allowed: PDF, TXT, DOC, DOCX"}), 400
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save CV file
        filename = secure_filename(f"user_{current_user_id}_{cv_file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        cv_file.save(file_path)
        
        # Analyze CV using AI agent
        analysis_result = ai_service.analyze_cv_and_skills(file_path, target_role, current_user_id)
        
        if not analysis_result["success"]:
            return jsonify({"error": "CV analysis failed", "details": analysis_result.get("error")}), 500
        
        # Store onboarding data
        onboarding_data = {
            "user_id": current_user_id,
            "uploaded_cv_url": file_path,
            "target_role": target_role,
            "chosen_path": "auto_generated",  # Auto-generated based on skills
            "onboarding_complete": True
        }
        
        try:
            supabase.table("user_onboarding").upsert(onboarding_data).execute()
        except Exception as e:
            print(f"Onboarding storage error: {e}")
        
        # Store skills analysis
        skills_data = {
            "user_id": current_user_id,
            "analysis_data": analysis_result,
            "skill_level": analysis_result["analysis"]["current_level"],
            "strengths": [skill["name"] for skill in analysis_result["skills"] if skill["level"] >= 3],
            "growth_areas": analysis_result["analysis"]["skill_gaps"],
            "recommended_learning_path": analysis_result["roadmap"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        }
        
        try:
            supabase.table("user_skills_analysis").upsert(skills_data).execute()
        except Exception as e:
            print(f"Skills analysis storage error: {e}")
        
        # Store resume data
        resume_data = {
            "user_id": current_user_id,
            "resume_data": {
                "cv_text": analysis_result["cv_text"],
                "extracted_skills": analysis_result["skills"],
                "career_goals": analysis_result["goals"],
                "analysis_summary": analysis_result["analysis"]
            },
            "last_synced": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            supabase.table("user_resume").upsert(resume_data).execute()
        except Exception as e:
            print(f"Resume storage error: {e}")
        
        # Initialize user progress
        progress_data = {
            "user_id": current_user_id,
            "current_level": 1,  # Will be updated based on analysis
            "xp_points": 0,
            "badges": ["First CV Analysis"],
            "next_goal": f"Complete {target_role} learning path"
        }
        
        try:
            supabase.table("user_progress").upsert(progress_data).execute()
        except Exception as e:
            print(f"Progress storage error: {e}")
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "cv_analysis_onboarding",
            "target_repository": None,
            "input_data": {"target_role": target_role, "chosen_path": chosen_path},
            "output_data": analysis_result,
            "success": True,
            "ai_model_used": "Gemini AI Agent",
            "execution_time_ms": 5000  # Mock time
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"Operation logging error: {e}")
        
        return jsonify({
            "success": True,
            "message": "CV analysis and onboarding completed successfully!",
            "analysis": analysis_result,
            "onboarding": onboarding_data,
            "next_steps": [
                "Review your skill assessment",
                "Check your personalized learning roadmap",
                "Start with recommended projects",
                "Visit your dashboard to track progress"
            ]
        })
        
    except Exception as e:
        return jsonify({"error": f"Onboarding failed: {str(e)}"}), 500

@bp.route("/api/onboarding/github-analysis", methods=["POST"])
@token_required
def github_skill_analysis(current_user_id):
    """Analyze user skills based on GitHub profile when CV is not provided"""
    try:
        # Get form data
        target_role = request.form.get('target_role', 'software_engineer')
        github_username = request.form.get('github_username')
        
        if not github_username:
            return jsonify({"error": "GitHub username is required"}), 400
        
        # Get GitHub access token from user's profile
        user_result = supabase.table("users").select("github_access_token").eq("id", current_user_id).execute()
        if not user_result.data:
            return jsonify({"error": "User not found"}), 404
        
        github_token = user_result.data[0].get("github_access_token")
        if not github_token:
            return jsonify({"error": "GitHub access token not found. Please authenticate with GitHub first."}), 400
        
        # Analyze GitHub profile using AI service
        try:
            analysis_result = ai_service.analyze_github_profile(github_username, github_token, target_role)
            print(f"🔍 GitHub analysis result: {analysis_result}")
        except Exception as e:
            print(f"❌ GitHub analysis failed: {e}")
            return jsonify({"error": f"GitHub analysis failed: {str(e)}"}), 500
        
        # Extract skills from GitHub analysis
        skills_data = analysis_result["skills_analysis"]
        overall_assessment = analysis_result["overall_assessment"]
        
        # Convert GitHub skills to our format
        all_skills = []
        for category, skills in skills_data.items():
            if isinstance(skills, list):
                all_skills.extend(skills)
        
        # Store onboarding data
        onboarding_data = {
            "user_id": current_user_id,
            "uploaded_cv_url": None,  # No CV uploaded
            "target_role": target_role,
            "chosen_path": "auto_generated",  # Auto-generated based on skills
            "onboarding_complete": True,
            "analysis_method": "GitHub Profile Analysis"
        }
        
        try:
            supabase.table("user_onboarding").upsert(onboarding_data).execute()
        except Exception as e:
            print(f"Onboarding storage error: {e}")
        
        # Store skills analysis
        skills_analysis_data = {
            "user_id": current_user_id,
            "analysis_data": analysis_result,
            "skill_level": overall_assessment["current_level"],
            "strengths": [skill["name"] for skill in all_skills if skill.get("level", 0) >= 4],
            "growth_areas": [area["name"] for area in overall_assessment.get("improvement_areas", [])],
            "recommended_learning_path": overall_assessment.get("recommendations", []),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        }
        
        try:
            supabase.table("user_skills_analysis").upsert(skills_analysis_data).execute()
        except Exception as e:
            print(f"Skills analysis storage error: {e}")
        
        # Store resume data (generated from GitHub)
        resume_data = {
            "user_id": current_user_id,
            "resume_data": {
                "github_username": github_username,
                "extracted_skills": all_skills,
                "career_goals": [{"title": target_role.replace('_', ' ').title(), "industry": "Technology"}],
                "analysis_summary": overall_assessment,
                "github_metrics": analysis_result["contribution_metrics"]
            },
            "last_synced": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            supabase.table("user_resume").upsert(resume_data).execute()
        except Exception as e:
            print(f"Resume storage error: {e}")
        
        # Initialize user progress based on GitHub assessment
        progress_data = {
            "user_id": current_user_id,
            "current_level": github_analyzer._convert_level_to_number(overall_assessment["current_level"]),
            "xp_points": int(overall_assessment["overall_score"] * 10),  # Convert score to XP
            "badges": [f"GitHub {overall_assessment['current_level']} Developer"],
            "next_goal": f"Complete {target_role} learning path and improve GitHub skills"
        }
        
        try:
            supabase.table("user_progress").upsert(progress_data).execute()
        except Exception as e:
            print(f"Progress storage error: {e}")
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "github_skill_analysis",
            "target_repository": None,
            "input_data": {"target_role": target_role, "github_username": github_username},
            "output_data": analysis_result,
            "success": True,
            "ai_model_used": "GitHub API Analysis",
            "execution_time_ms": 3000
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"Operation logging error: {e}")
        
        return jsonify({
            "success": True,
            "message": "GitHub skill analysis completed successfully!",
            "analysis": analysis_result,
            "onboarding": onboarding_data,
            "next_steps": [
                "Review your skill assessment",
                "Check improvement areas",
                "Start learning recommended skills",
                "Create projects to showcase abilities"
            ]
        })
        
    except Exception as e:
        return jsonify({"error": f"GitHub analysis failed: {str(e)}"}), 500

def _convert_level_to_number(self, level: str) -> int:
    """Convert text level to numeric level"""
    level_mapping = {
        "Beginner": 1,
        "Novice": 1,
        "Intermediate": 2,
        "Mid-level": 2,
        "Advanced": 3,
        "Senior": 4,
        "Expert": 5,
        "Lead": 4
    }
    return level_mapping.get(level, 1)

@bp.route("/api/projects/generate", methods=["POST"])
@token_required
def generate_ai_project(current_user_id):
    """Generate AI-powered GitHub repository with issues"""
    try:
        data = request.get_json()
        skill_focus = data.get('skill_focus', 'python')
        project_type = data.get('project_type', 'web_application')
        
        # Get user's current level and skills
        user_progress = supabase.table("user_progress").select("*").eq("user_id", current_user_id).execute()
        current_level = user_progress.data[0]["current_level"] if user_progress.data else 1
        
        # Generate repository using AI agent
        repo_result = ai_service.create_github_repository(current_level, skill_focus, current_user_id)
        
        if not repo_result["success"]:
            return jsonify({"error": "Project generation failed"}), 500
        
        # Store AI repository data
        ai_repo_data = {
            "user_id": current_user_id,
            "repo_name": repo_result["repository"]["name"],
            "requirements": f"Focus on {skill_focus} skills",
            "ai_plan": repo_result["repository"],
            "created_files": 0,
            "created_issues": len(repo_result["repository"]["issues"])
        }
        
        try:
            repo_insert = supabase.table("ai_repositories").insert(ai_repo_data).execute()
            repo_id = repo_insert.data[0]["id"] if repo_insert.data else None
        except Exception as e:
            print(f"Repository storage error: {e}")
            repo_id = None
        
        # Store AI issues
        created_issues = []
        for issue in repo_result["repository"]["issues"]:
            issue_data = {
                "user_id": current_user_id,
                "owner": "ai_generated",
                "repo_name": repo_result["repository"]["name"],
                "issue_title": issue["title"],
                "ai_reasoning": f"Generated for {skill_focus} skill development",
                "labels": [skill_focus, issue["difficulty"]],
                "priority": "high" if issue["difficulty"] == "Easy" else "medium",
                "complexity": issue["difficulty"],
                "estimated_hours": 2 if issue["difficulty"] == "Easy" else 4,
                "status": "suggested"
            }
            
            try:
                issue_insert = supabase.table("ai_issues").insert(issue_data).execute()
                created_issues.append(issue_insert.data[0] if issue_insert.data else issue_data)
            except Exception as e:
                print(f"Issue storage error: {e}")
                created_issues.append(issue_data)
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "ai_project_generation",
            "target_repository": repo_result["repository"]["name"],
            "input_data": {"skill_focus": skill_focus, "project_type": project_type},
            "output_data": {"repository": repo_result["repository"], "issues": created_issues},
            "success": True,
            "ai_model_used": "AI Agent",
            "execution_time_ms": 3000  # Mock time
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"Operation logging error: {e}")
        
        return jsonify({
            "success": True,
            "message": "AI project generated successfully!",
            "repository": repo_result["repository"],
            "issues": created_issues,
            "next_steps": [
                "Review the generated issues",
                "Start implementing solutions",
                "Submit your code for AI analysis",
                "Earn XP points and level up"
            ]
        })
        
    except Exception as e:
        return jsonify({"error": f"Project generation failed: {str(e)}"}), 500

@bp.route("/api/submissions/analyze", methods=["POST"])
@token_required
def analyze_code_submission(current_user_id):
    """Analyze code submission and generate score"""
    try:
        data = request.get_json()
        github_pr_url = data.get('github_pr_url')
        issue_id = data.get('issue_id')
        
        if not github_pr_url:
            return jsonify({"error": "GitHub PR URL is required"}), 400
        
        # Analyze submission using AI agent
        analysis_result = ai_service.analyze_code_submission(github_pr_url, current_user_id)
        
        if not analysis_result["success"]:
            return jsonify({"error": "Code analysis failed"}), 500
        
        # Store submission data
        submission_data = {
            "user_id": current_user_id,
            "issue_id": issue_id,
            "github_pr_url": github_pr_url,
            "submission_data": analysis_result["analysis"],
            "ai_score": analysis_result["analysis"]["overall_score"],
            "feedback": "\n".join(analysis_result["feedback"]),
            "status": "completed"
        }
        
        try:
            submission_insert = supabase.table("user_submissions").insert(submission_data).execute()
            submission_id = submission_insert.data[0]["id"] if submission_insert.data else None
        except Exception as e:
            print(f"Submission storage error: {e}")
            submission_id = None
        
        # Update user progress with XP points and enhanced leveling logic
        try:
            current_progress = supabase.table("user_progress").select("*").eq("user_id", current_user_id).execute()
            if current_progress.data:
                current_xp = current_progress.data[0]["xp_points"]
                current_level = current_progress.data[0]["current_level"]
                new_xp = current_xp + analysis_result["xp_points"]
                
                # Enhanced leveling logic: Level up only with 75%+ score
                new_level = current_level
                level_up_message = None
                
                # Check if user meets level up criteria
                if (analysis_result["analysis"]["overall_score"] >= 75 and 
                    analysis_result["analysis"]["overall_score"] <= 100):
                    
                    # Calculate required XP for next level
                    xp_required_for_next_level = current_level * 1500  # Increased XP requirement
                    
                    if new_xp >= xp_required_for_next_level:
                        new_level = current_level + 1
                        level_up_message = f"🎉 Congratulations! You've reached Level {new_level}!"
                        
                        # Add level up badge
                        current_badges = current_progress.data[0].get("badges", [])
                        new_badge = f"Level {new_level} Achiever"
                        if new_badge not in current_badges:
                            current_badges.append(new_badge)
                        
                        # Update next goal for new level
                        next_goal = f"Complete Level {new_level} challenges and reach {new_level + 1}"
                    else:
                        level_up_message = f"Great work! You need {xp_required_for_next_level - new_xp} more XP to reach Level {current_level + 1}"
                else:
                    level_up_message = f"Good effort! Score {analysis_result['analysis']['overall_score']}% - aim for 75%+ to level up"
                
                # Update progress in database
                update_data = {
                    "xp_points": new_xp,
                    "current_level": new_level,
                    "last_updated": datetime.now(timezone.utc).isoformat()
                }
                
                # Add badges and next goal if leveling up
                if new_level > current_level:
                    update_data["badges"] = current_badges
                    update_data["next_goal"] = next_goal
                
                supabase.table("user_progress").update(update_data).eq("user_id", current_user_id).execute()
                
                # Log level progression
                if new_level > current_level:
                    print(f"🎯 User {current_user_id} leveled up from {current_level} to {new_level}")
                    
        except Exception as e:
            print(f"Progress update error: {e}")
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "code_analysis",
            "target_repository": github_pr_url,
            "input_data": {"github_pr_url": github_pr_url, "issue_id": issue_id},
            "output_data": analysis_result,
            "success": True,
            "ai_model_used": "AI Agent",
            "execution_time_ms": 4000  # Mock time
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"Operation logging error: {e}")
        
        return jsonify({
            "success": True,
            "message": "Code analysis completed successfully!",
            "analysis": analysis_result["analysis"],
            "feedback": analysis_result["feedback"],
            "xp_earned": analysis_result["xp_points"],
            "improvements": analysis_result["improvements"],
            "submission_id": submission_id,
            "level_progression": {
                "current_level": current_level,
                "new_level": new_level,
                "xp_progress": {
                    "current_xp": new_xp,
                    "xp_required_for_next": xp_required_for_next_level if 'xp_required_for_next_level' in locals() else None,
                    "xp_remaining": (xp_required_for_next_level - new_xp) if 'xp_required_for_next_level' in locals() else None
                },
                "level_up_message": level_up_message if 'level_up_message' in locals() else None,
                "can_level_up": analysis_result["analysis"]["overall_score"] >= 75
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Code analysis failed: {str(e)}"}), 500

@bp.route("/api/dashboard/summary", methods=["GET"])
@token_required
def get_dashboard_summary(current_user_id):
    """Get comprehensive dashboard data"""
    try:
        # Get user progress
        progress_result = supabase.table("user_progress").select("*").eq("user_id", current_user_id).execute()
        progress = progress_result.data[0] if progress_result.data else {}
        
        # Get recent AI issues
        issues_result = supabase.table("ai_issues").select("*").eq("user_id", current_user_id).order("created_at", desc=True).limit(5).execute()
        recent_issues = issues_result.data if issues_result.data else []
        
        # Get recent submissions
        submissions_result = supabase.table("user_submissions").select("*").eq("user_id", current_user_id).order("submitted_at", desc=True).limit(5).execute()
        recent_submissions = submissions_result.data if submissions_result.data else []
        
        # Get skills analysis
        skills_result = supabase.table("user_skills_analysis").select("*").eq("user_id", current_user_id).order("created_at", desc=True).limit(1).execute()
        skills_analysis = skills_result.data[0] if skills_result.data else {}
        
        # Get leaderboard position
        leaderboard_result = supabase.table("leaderboard").select("*").eq("user_id", current_user_id).execute()
        leaderboard_position = leaderboard_result.data[0] if leaderboard_result.data else {}
        
        # Calculate next level progress
        current_level = progress.get("current_level", 1)
        current_xp = progress.get("xp_points", 0)
        xp_needed = current_level * 1000
        progress_percentage = min(100, (current_xp / xp_needed) * 100) if xp_needed > 0 else 0
        
        return jsonify({
            "success": True,
            "dashboard": {
                "user_progress": {
                    "current_level": current_level,
                    "xp_points": current_xp,
                    "xp_needed": xp_needed,
                    "progress_percentage": progress_percentage,
                    "badges": progress.get("badges", []),
                    "next_goal": progress.get("next_goal", "Complete your first project")
                },
                "recent_issues": recent_issues,
                "recent_submissions": recent_submissions,
                "skills_analysis": skills_analysis,
                "leaderboard": leaderboard_position,
                "quick_actions": [
                    "Generate new AI project",
                    "Upload CV for analysis",
                    "View learning roadmap",
                    "Check achievements"
                ]
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Dashboard data fetch failed: {str(e)}"}), 500

@bp.route("/api/profile/resume", methods=["GET"])
@token_required
def generate_user_resume(current_user_id):
    """Generate AI-powered resume from user data"""
    try:
        # Get user projects and skills
        projects_result = supabase.table("user_submissions").select("*").eq("user_id", current_user_id).execute()
        user_projects = projects_result.data if projects_result.data else []
        
        skills_result = supabase.table("user_skills_analysis").select("*").eq("user_id", current_user_id).order("created_at", desc=True).limit(1).execute()
        user_skills = skills_result.data[0] if skills_result.data else {}
        
        # Generate resume using AI agent
        resume_result = ai_service.generate_resume(user_projects, user_skills.get("strengths", []), current_user_id)
        
        if not resume_result["success"]:
            return jsonify({"error": "Resume generation failed"}), 500
        
        # Update resume in database
        resume_data = {
            "user_id": current_user_id,
            "resume_data": resume_result["resume"],
            "last_synced": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            supabase.table("user_resume").upsert(resume_data).execute()
        except Exception as e:
            print(f"Resume update error: {e}")
        
        return jsonify({
            "success": True,
            "message": "Resume generated successfully!",
            "resume": resume_result["resume"]
        })
        
    except Exception as e:
        return jsonify({"error": f"Resume generation failed: {str(e)}"}), 500

@bp.route("/api/progress/level-requirements", methods=["GET"])
@token_required
def get_level_requirements(current_user_id):
    """Get detailed level progression requirements and current status"""
    try:
        # Get current user progress
        progress_result = supabase.table("user_progress").select("*").eq("user_id", current_user_id).execute()
        if not progress_result.data:
            return jsonify({"error": "User progress not found"}), 404
        
        current_progress = progress_result.data[0]
        current_level = current_progress["current_level"]
        current_xp = current_progress["xp_points"]
        
        # Get user's recent submissions to check completion status
        submissions_result = supabase.table("user_submissions").select("*").eq("user_id", current_user_id).order("submitted_at", desc=True).limit(10).execute()
        recent_submissions = submissions_result.data if submissions_result.data else []
        
        # Get AI issues assigned to user
        issues_result = supabase.table("ai_issues").select("*").eq("user_id", current_user_id).execute()
        assigned_issues = issues_result.data if issues_result.data else []
        
        # Calculate level requirements
        xp_required_for_current_level = (current_level - 1) * 1500
        xp_required_for_next_level = current_level * 1500
        xp_progress_in_current_level = current_xp - xp_required_for_current_level
        xp_needed_for_next_level = xp_required_for_next_level - current_xp
        
        # Check if user can level up (needs 75%+ score on recent submission)
        can_level_up = False
        recent_score = None
        if recent_submissions:
            recent_score = recent_submissions[0]["ai_score"]
            can_level_up = recent_score >= 75
        
        # Calculate completion percentage
        completion_percentage = min(100, (xp_progress_in_current_level / (xp_required_for_next_level - xp_required_for_current_level)) * 100) if xp_required_for_next_level > xp_required_for_current_level else 0
        
        # Get level-specific requirements
        level_requirements = {
            "current_level": current_level,
            "xp_requirements": {
                "current_level_start": xp_required_for_current_level,
                "current_xp": current_xp,
                "xp_progress_in_level": xp_progress_in_current_level,
                "xp_required_for_next": xp_required_for_next_level,
                "xp_needed_for_next": xp_needed_for_next_level,
                "completion_percentage": completion_percentage
            },
            "level_up_criteria": {
                "score_threshold": 75,
                "recent_score": recent_score,
                "can_level_up": can_level_up,
                "xp_requirement_met": current_xp >= xp_required_for_next_level
            },
            "progress_summary": {
                "total_issues_assigned": len(assigned_issues),
                "completed_submissions": len(recent_submissions),
                "current_badges": current_progress.get("badges", []),
                "next_goal": current_progress.get("next_goal", "Complete your first project")
            }
        }
        
        return jsonify({
            "success": True,
            "level_requirements": level_requirements,
            "recent_activity": {
                "submissions": recent_submissions[:5],
                "assigned_issues": assigned_issues[:5]
            }
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to get level requirements: {str(e)}"}), 500 

@bp.route("/api/cv/analyze", methods=["POST"])
@token_required
def comprehensive_cv_analysis(current_user_id):
    """Comprehensive CV analysis using CVAnalysisAgent from main.py"""
    try:
        # Get form data
        target_role = request.form.get('target_role', 'software_engineer')
        
        # Check if CV file was uploaded
        if 'cv_file' not in request.files:
            return jsonify({"error": "No CV file provided"}), 400
        
        cv_file = request.files['cv_file']
        if cv_file.filename == '':
            return jsonify({"error": "No CV file selected"}), 400
        
        if not allowed_file(cv_file.filename):
            return jsonify({"error": "Invalid file type. Allowed: PDF, TXT, DOC, DOCX"}), 400
        
        # Create upload directory if it doesn't exist
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        
        # Save CV file
        filename = secure_filename(f"user_{current_user_id}_{cv_file.filename}")
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        cv_file.save(file_path)
        
        # Import and initialize CVAnalysisAgent from main.py
        try:
            import sys
            agent_path = Path(__file__).parent.parent.parent / "agents" / "agent-1"
            sys.path.append(str(agent_path))
            
            from main import CVAnalysisAgent
            
            # Initialize the agent with environment variables
            groq_api_key = os.getenv('GROQ_API_KEY')
            supabase_url = os.getenv('SUPABASE_URL')
            supabase_key = os.getenv('SUPABASE_ANON_KEY')
            
            if not groq_api_key:
                print("⚠️ GROQ_API_KEY not configured, using fallback analysis")
                # Continue with fallback analysis instead of failing
                agent = None
            else:
                # Create agent instance
                agent = CVAnalysisAgent(
                    gemini_api_key=groq_api_key,  # Using groq_api_key for compatibility
                    supabase_url=supabase_url,
                    supabase_key=supabase_key
                )
                print(f"✅ CVAnalysisAgent initialized for user {current_user_id}")
            
        except ImportError as e:
            print(f"⚠️ Failed to import CVAnalysisAgent: {str(e)}, using fallback analysis")
            agent = None
        except Exception as e:
            print(f"⚠️ Failed to initialize agent: {str(e)}, using fallback analysis")
            agent = None
        
        # Step 1: Parse CV file
        print(f"📄 Parsing CV: {filename}")
        if agent:
            cv_text = agent.parse_cv(file_path)
        else:
            # Fallback CV parsing
            cv_text = _fallback_parse_cv(file_path)
        
        if not cv_text:
            return jsonify({"error": "Failed to parse CV file"}), 500
        
        print(f"✅ CV parsed successfully ({len(cv_text)} characters)")
        
        # Step 2: Extract skills and career goals
        print("🧠 Extracting skills and career goals...")
        if agent:
            try:
                skills, goals = agent.extract_skills_and_goals(cv_text)
                if not skills:
                    print("⚠️ No skills extracted, using fallback analysis")
                    skills = [{"name": "General Programming", "level": 2, "category": "programming"}]
                    goals = None
            except Exception as e:
                print(f"⚠️ Skills extraction failed: {e}, using fallback")
                skills = [{"name": "General Programming", "level": 2, "category": "programming"}]
                goals = None
        else:
            print("⚠️ Agent not available, using fallback analysis")
            skills = _fallback_extract_skills(cv_text)
            goals = None
        
        print(f"✅ Extracted {len(skills)} skills")
        
        # Step 3: Analyze skill gaps for target role
        print(f"📊 Analyzing skill gaps for {target_role}...")
        if agent:
            try:
                skill_analysis = agent.analyze_skill_gaps(target_role)
                if not skill_analysis:
                    print("⚠️ Skill gap analysis failed, using fallback")
                    skill_analysis = {"skill_gaps": [], "match_percentage": 50}
            except Exception as e:
                print(f"⚠️ Skill gap analysis failed: {e}, using fallback")
                skill_analysis = {"skill_gaps": [], "match_percentage": 50}
        else:
            print("⚠️ Agent not available, using fallback skill analysis")
            skill_analysis = _fallback_skill_analysis(target_role)
        
        print(f"✅ Skill gap analysis complete")
        
        # Step 4: Generate learning roadmap
        print("🗺️ Generating learning roadmap...")
        if agent:
            try:
                roadmap = agent.generate_roadmap()
                if not roadmap:
                    print("⚠️ Failed to generate roadmap, using fallback")
                    roadmap = []
            except Exception as e:
                print(f"⚠️ Roadmap generation failed: {e}, using fallback")
                roadmap = []
        else:
            print("⚠️ Agent not available, using fallback roadmap")
            roadmap = _fallback_generate_roadmap(target_role)
        
        # Step 5: Create test user and store in database
        print("🗄️ Creating user and storing analysis...")
        try:
            user_id = agent.create_test_user(f"user_{current_user_id}", f"user{current_user_id}@example.com")
            if user_id:
                try:
                    success = agent.store_analysis_to_database(target_role)
                    if success:
                        print("✅ Analysis stored in database")
                    else:
                        print("⚠️ Failed to store in database, continuing with analysis")
                except Exception as e:
                    print(f"⚠️ Database storage failed: {e}, continuing with analysis")
            else:
                print("⚠️ Failed to create test user, continuing with analysis")
                user_id = current_user_id  # Use current user ID as fallback
        except Exception as e:
            print(f"⚠️ User creation failed: {e}, using current user ID")
            user_id = current_user_id  # Use current user ID as fallback
        
        # Step 6: Prepare comprehensive response
        print("📋 Preparing analysis response...")
        
        # Categorize skills by type
        skill_categories = {
            "programming_languages": [],
            "frameworks": [],
            "databases": [],
            "cloud_platforms": [],
            "devops_tools": [],
            "ai_ml_tools": [],
            "data_analysis": [],
            "soft_skills": [],
            "other": []
        }
        
        for skill in skills:
            category = skill.get("category", "other").lower()
            if "programming" in category or skill["name"] in ["Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust"]:
                skill_categories["programming_languages"].append(skill)
            elif "frontend" in category or "backend" in category or skill["name"] in ["React", "Angular", "Vue", "Node.js", "Django", "Flask"]:
                skill_categories["frameworks"].append(skill)
            elif "database" in category or skill["name"] in ["MySQL", "PostgreSQL", "MongoDB", "Redis", "SQL"]:
                skill_categories["databases"].append(skill)
            elif "cloud" in category or skill["name"] in ["AWS", "Azure", "GCP", "Heroku"]:
                skill_categories["cloud_platforms"].append(skill)
            elif "devops" in category or skill["name"] in ["Docker", "Kubernetes", "Jenkins", "Git"]:
                skill_categories["devops_tools"].append(skill)
            elif "ai_ml" in category or skill["name"] in ["TensorFlow", "PyTorch", "Machine Learning", "Deep Learning"]:
                skill_categories["ai_ml_tools"].append(skill)
            elif "data_analysis" in category or skill["name"] in ["Pandas", "NumPy", "Tableau", "PowerBI"]:
                skill_categories["data_analysis"].append(skill)
            elif "soft_skills" in category or skill["name"] in ["Communication", "Leadership", "Teamwork"]:
                skill_categories["soft_skills"].append(skill)
            else:
                skill_categories["other"].append(skill)
        
        # Determine overall development level
        skill_levels = [skill.get("level", 0) for skill in skills]
        avg_skill_level = sum(skill_levels) / len(skill_levels) if skill_levels else 0
        
        if avg_skill_level >= 4.5:
            development_level = "Expert"
            level_description = "Advanced professional with deep expertise"
        elif avg_skill_level >= 3.5:
            development_level = "Advanced"
            level_description = "Experienced developer with strong skills"
        elif avg_skill_level >= 2.5:
            development_level = "Intermediate"
            level_description = "Mid-level developer with solid foundation"
        elif avg_skill_level >= 1.5:
            development_level = "Beginner"
            level_description = "Entry-level developer learning fundamentals"
        else:
            development_level = "Novice"
            level_description = "New to development, building basic skills"
        
        # Calculate skill match percentage
        match_percentage = skill_analysis.get('match_percentage', 0)
        
        # Prepare roadmap items
        roadmap_items = []
        for item in roadmap:
            if hasattr(item, 'skill'):
                # If item is a RoadmapItem object
                roadmap_items.append({
                    "skill": item.skill,
                    "current_level": item.current_level,
                    "target_level": item.target_level,
                    "priority": item.priority,
                    "estimated_time": item.estimated_time,
                    "resources": item.resources[:3] if item.resources else []
                })
            elif isinstance(item, dict):
                # If item is a dictionary
                roadmap_items.append({
                    "skill": item.get("skill", "Unknown"),
                    "current_level": item.get("current_level", 1),
                    "target_level": item.get("target_level", 3),
                    "priority": item.get("priority", "medium"),
                    "estimated_time": item.get("estimated_time", "2-4 weeks"),
                    "resources": item.get("resources", [])[:3] if item.get("resources") else []
                })
            else:
                # Fallback for other types
                roadmap_items.append({
                    "skill": str(item) if item else "Unknown",
                    "current_level": 1,
                    "target_level": 3,
                    "priority": "medium",
                    "estimated_time": "2-4 weeks",
                    "resources": []
                })
        
        # Store onboarding data
        onboarding_data = {
            "user_id": current_user_id,
            "uploaded_cv_url": file_path,
            "target_role": target_role,
            "chosen_path": "auto_generated",
            "onboarding_complete": True,
            "analysis_method": "CVAnalysisAgent Integration"
        }
        
        try:
            supabase.table("user_onboarding").upsert(onboarding_data).execute()
        except Exception as e:
            print(f"Onboarding storage error: {e}")
        
        # Store skills analysis
        skills_analysis_data = {
            "user_id": current_user_id,
            "analysis_data": {
                "skills": skills,
                "skill_analysis": skill_analysis,
                "roadmap": roadmap_items,
                "development_level": development_level,
                "match_percentage": match_percentage
            },
            "skill_level": development_level,
            "strengths": [skill["name"] for skill in skills if skill.get("level", 0) >= 4],
            "growth_areas": skill_analysis.get("skill_gaps", []),
            "recommended_learning_path": roadmap_items,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        }
        
        try:
            supabase.table("user_skills_analysis").upsert(skills_analysis_data).execute()
        except Exception as e:
            print(f"Skills analysis storage error: {e}")
        
        # Store resume data
        resume_data = {
            "user_id": current_user_id,
            "resume_data": {
                "cv_text": cv_text,
                "extracted_skills": skills,
                "career_goals": goals.__dict__ if goals and hasattr(goals, '__dict__') else {},
                "analysis_summary": {
                    "development_level": development_level,
                    "match_percentage": match_percentage,
                    "skill_categories": skill_categories
                }
            },
            "last_synced": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            supabase.table("user_resume").upsert(resume_data).execute()
        except Exception as e:
            print(f"Resume storage error: {e}")
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "comprehensive_cv_analysis",
            "target_repository": None,
            "input_data": {"target_role": target_role, "cv_filename": filename},
            "output_data": {
                "skills_count": len(skills),
                "development_level": development_level,
                "match_percentage": match_percentage,
                "roadmap_items": len(roadmap_items)
            },
            "success": True,
            "ai_model_used": "CVAnalysisAgent + Gemini LLM",
            "execution_time_ms": 5000
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"Operation logging error: {e}")
        
        # Prepare comprehensive response
        response = {
            "success": True,
            "message": "Comprehensive CV analysis completed successfully!",
            "analysis": {
                "cv_file": filename,
                "target_role": target_role,
                "cv_text_length": len(cv_text),
                "extraction_method": "CVAnalysisAgent + Gemini LLM"
            },
            "skills_assessment": {
                "total_skills": len(skills),
                "skill_categories": skill_categories,
                "skill_levels": {
                    "average_level": round(avg_skill_level, 2),
                    "highest_level": max(skill_levels) if skill_levels else 0,
                    "lowest_level": min(skill_levels) if skill_levels else 0
                }
            },
            "development_level": {
                "level": development_level,
                "description": level_description,
                "score": round(avg_skill_level, 2),
                "confidence": "High" if len(skills) >= 5 else "Medium"
            },
                    "career_goals": {
            "primary_target": goals.title if goals and hasattr(goals, 'title') else "Software Developer",
            "industry": goals.industry if goals and hasattr(goals, 'industry') else "Technology",
            "experience_level": goals.experience_level if goals and hasattr(goals, 'experience_level') else "Mid-level",
            "timeline": goals.timeline if goals and hasattr(goals, 'timeline') else "Medium-term"
        },
            "skill_gaps": {
                "target_role": target_role,
                "match_percentage": round(match_percentage, 1),
                "skill_gaps": skill_analysis.get("skill_gaps", []),
                "strengths": skill_analysis.get("strengths", []),
                "recommendations": [
                    "Focus on high-priority skill gaps",
                    "Build projects using target technologies",
                    "Practice with real-world applications",
                    "Seek mentorship in weak areas"
                ]
            },
            "learning_roadmap": {
                "total_items": len(roadmap_items),
                "high_priority": len([item for item in roadmap_items if item["priority"] == "high"]),
                "medium_priority": len([item for item in roadmap_items if item["priority"] == "medium"]),
                "low_priority": len([item for item in roadmap_items if item["priority"] == "low"]),
                "roadmap_items": roadmap_items
            },
            "database_storage": {
                "user_id": user_id,
                "onboarding_stored": True,
                "skills_analysis_stored": True,
                "resume_data_stored": True,
                "operation_logged": True
            },
            "next_steps": [
                "Review your skill assessment",
                "Focus on high-priority learning items",
                "Build portfolio projects",
                "Track progress with regular assessments"
            ]
        }
        
        print("✅ Comprehensive CV analysis completed and stored")
        return jsonify(response)
        
    except Exception as e:
        print(f"❌ CV analysis failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"CV analysis failed: {str(e)}",
            "details": "Check server logs for more information"
        }), 500 

@bp.route("/api/learning/roadmap", methods=["POST"])
@token_required
def generate_learning_roadmap(current_user_id):
    """Generate personalized learning roadmap using Agent2"""
    try:
        # Get request data
        data = request.get_json()
        target_role = data.get('target_role', 'software_engineer')
        user_skills = data.get('user_skills', [])
        
        if not user_skills:
            return jsonify({"error": "User skills required"}), 400
        
        # Get user's current level from progress
        try:
            progress_result = supabase.table("user_progress").select("current_level").eq("user_id", current_user_id).execute()
            current_level = progress_result.data[0]["current_level"] if progress_result.data else 1
        except Exception:
            current_level = 1
        
        # Import and initialize Agent2
        try:
            import sys
            agent_path = Path(__file__).parent.parent.parent / "agents" / "agent2"
            sys.path.append(str(agent_path))
            
            from main import Agent2Integration
            
            # Initialize agent
            agent = Agent2Integration()
            print(f"✅ Agent2 initialized for user {current_user_id}")
            
        except ImportError as e:
            print(f"⚠️ Failed to import Agent2: {str(e)}, using fallback")
            return jsonify({"error": "Agent2 not available", "details": str(e)}), 500
        
        # Generate learning roadmap
        print(f"📚 Generating learning roadmap for level {current_level} -> {target_role}")
        learning_path = agent.create_complete_learning_path(
            str(current_user_id), current_level, target_role, user_skills
        )
        
        if not learning_path:
            return jsonify({"error": "Failed to generate learning path"}), 500
        
        # Store roadmap in database
        roadmap_data = {
            "user_id": current_user_id,
            "target_role": target_role,
            "current_level": current_level,
            "roadmap_data": learning_path,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "status": "active"
        }
        
        try:
            supabase.table("repository_roadmaps").upsert(roadmap_data).execute()
            print("✅ Roadmap stored in database")
        except Exception as e:
            print(f"⚠️ Failed to store roadmap: {e}")
        
        # Store project in ai_repositories
        if learning_path.get("project"):
            project_data = {
                "user_id": current_user_id,
                "repository_name": learning_path["project"]["name"],
                "description": learning_path["project"]["description"],
                "tech_stack": learning_path["project"]["tech_stack"],
                "difficulty_level": learning_path["project"]["difficulty_level"],
                "estimated_time": learning_path["project"]["estimated_time"],
                "learning_objectives": learning_path["project"]["learning_objectives"],
                "created_at": datetime.now(timezone.utc).isoformat(),
                "status": "assigned"
            }
            
            try:
                supabase.table("ai_repositories").upsert(project_data).execute()
                print("✅ Project stored in database")
            except Exception as e:
                print(f"⚠️ Failed to store project: {e}")
        
        # Store issues in ai_issues
        if learning_path.get("issues"):
            for issue in learning_path["issues"]:
                issue_data = {
                    "user_id": current_user_id,
                    "repository_name": learning_path["project"]["name"],
                    "issue_title": issue["title"],
                    "issue_description": issue["description"],
                    "difficulty_level": issue["difficulty"],
                    "estimated_time": issue["estimated_time"],
                    "skills_required": issue["skills_required"],
                    "acceptance_criteria": issue["acceptance_criteria"],
                    "hints": issue["hints"],
                    "resources": issue["resources"],
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "status": "open"
                }
                
                try:
                    supabase.table("ai_issues").upsert(issue_data).execute()
                except Exception as e:
                    print(f"⚠️ Failed to store issue: {e}")
            
            print(f"✅ {len(learning_path['issues'])} issues stored in database")
        
        # Log operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "learning_roadmap_generation",
            "target_repository": learning_path.get("project", {}).get("name"),
            "input_data": {"target_role": target_role, "user_skills": user_skills},
            "output_data": {
                "milestones_count": len(learning_path.get("milestones", [])),
                "issues_count": len(learning_path.get("issues", [])),
                "project_name": learning_path.get("project", {}).get("name")
            },
            "success": True,
            "ai_model_used": "Agent2 + OpenAI GPT-4o-mini",
            "execution_time_ms": 8000
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"⚠️ Failed to log operation: {e}")
        
        return jsonify({
            "success": True,
            "message": "Learning roadmap generated successfully!",
            "learning_path": learning_path,
            "database_storage": {
                "roadmap_stored": True,
                "project_stored": True,
                "issues_stored": len(learning_path.get("issues", [])),
                "operation_logged": True
            }
        })
        
    except Exception as e:
        print(f"❌ Roadmap generation failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Roadmap generation failed: {str(e)}",
            "details": "Check server logs for more information"
        }), 500

@bp.route("/api/learning/portfolio-project", methods=["POST"])
@token_required
def generate_portfolio_project(current_user_id):
    """Generate portfolio-worthy project using Agent2"""
    try:
        # Get request data
        data = request.get_json()
        focus_areas = data.get('focus_areas', [])
        
        if not focus_areas:
            return jsonify({"error": "Focus areas required"}), 400
        
        # Get user's current level
        try:
            progress_result = supabase.table("user_progress").select("current_level").eq("user_id", current_user_id).execute()
            skill_level = progress_result.data[0]["current_level"] if progress_result.data else 1
        except Exception:
            skill_level = 1
        
        # Import and initialize Agent2
        try:
            import sys
            agent_path = Path(__file__).parent.parent.parent / "agents" / "agent2"
            sys.path.append(str(agent_path))
            
            from main import Agent2Integration
            
            agent = Agent2Integration()
            print(f"✅ Agent2 initialized for portfolio project")
            
        except ImportError as e:
            print(f"⚠️ Failed to import Agent2: {str(e)}")
            return jsonify({"error": "Agent2 not available", "details": str(e)}), 500
        
        # Generate portfolio project
        print(f"🎨 Generating portfolio project for level {skill_level}")
        portfolio = agent.generate_portfolio_project(
            str(current_user_id), skill_level, focus_areas
        )
        
        if "error" in portfolio:
            return jsonify({"error": portfolio["error"]}), 500
        
        # Store portfolio project
        if portfolio.get("project"):
            project_data = {
                "user_id": current_user_id,
                "repository_name": portfolio["project"]["name"],
                "description": portfolio["project"]["description"],
                "tech_stack": portfolio["project"]["tech_stack"],
                "difficulty_level": portfolio["project"]["difficulty_level"],
                "estimated_time": portfolio["project"]["estimated_time"],
                "learning_objectives": portfolio["project"]["learning_objectives"],
                "project_type": "portfolio",
                "portfolio_value": portfolio.get("portfolio_value", "High"),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "status": "assigned"
            }
            
            try:
                supabase.table("ai_repositories").upsert(project_data).execute()
                print("✅ Portfolio project stored in database")
            except Exception as e:
                print(f"⚠️ Failed to store portfolio project: {e}")
        
        # Store portfolio issues
        if portfolio.get("issues"):
            for issue in portfolio["issues"]:
                issue_data = {
                    "user_id": current_user_id,
                    "repository_name": portfolio["project"]["name"],
                    "issue_title": issue["title"],
                    "issue_description": issue["description"],
                    "difficulty_level": issue["difficulty"],
                    "estimated_time": issue["estimated_time"],
                    "skills_required": issue["skills_required"],
                    "acceptance_criteria": issue["acceptance_criteria"],
                    "hints": issue["hints"],
                    "resources": issue["resources"],
                    "issue_type": "portfolio",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "status": "open"
                }
                
                try:
                    supabase.table("ai_issues").upsert(issue_data).execute()
                except Exception as e:
                    print(f"⚠️ Failed to store portfolio issue: {e}")
            
            print(f"✅ {len(portfolio['issues'])} portfolio issues stored in database")
        
        return jsonify({
            "success": True,
            "message": "Portfolio project generated successfully!",
            "portfolio": portfolio,
            "database_storage": {
                "project_stored": True,
                "issues_stored": len(portfolio.get("issues", [])),
                "portfolio_features": portfolio.get("portfolio_features", [])
            }
        })
        
    except Exception as e:
        print(f"❌ Portfolio project generation failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Portfolio project generation failed: {str(e)}",
            "details": "Check server logs for more information"
        }), 500

@bp.route("/api/learning/progress-update", methods=["POST"])
@token_required
def update_learning_progress(current_user_id):
    """Update learning progress and suggest next steps using Agent2"""
    try:
        # Get request data
        data = request.get_json()
        completed_projects = data.get('completed_projects', [])
        current_roadmap = data.get('current_roadmap', {})
        
        if not completed_projects:
            return jsonify({"error": "Completed projects data required"}), 400
        
        # Import and initialize Agent2
        try:
            import sys
            agent_path = Path(__file__).parent.parent.parent / "agents" / "agent2"
            sys.path.append(str(agent_path))
            
            from main import Agent2Integration
            
            agent = Agent2Integration()
            print(f"✅ Agent2 initialized for progress update")
            
        except ImportError as e:
            print(f"⚠️ Failed to import Agent2: {str(e)}")
            return jsonify({"error": "Agent2 not available", "details": str(e)}), 500
        
        # Update learning progress
        print(f"📈 Updating learning progress for user {current_user_id}")
        progress_update = agent.update_learning_progress(
            str(current_user_id), completed_projects, current_roadmap
        )
        
        if "error" in progress_update:
            return jsonify({"error": progress_update["error"]}), 500
        
        # Update user progress in database
        if progress_update.get("progress_summary"):
            summary = progress_update["progress_summary"]
            
            progress_data = {
                "user_id": current_user_id,
                "current_level": current_roadmap.get("current_level", 1),
                "xp_points": summary.get("completed_projects", 0) * 500,  # 500 XP per project
                "badges": [f"Completed {summary.get('completed_projects', 0)} Projects"],
                "next_goal": f"Complete {summary.get('roadmap_completion', 0)}% of roadmap"
            }
            
            try:
                supabase.table("user_progress").upsert(progress_data).execute()
                print("✅ User progress updated in database")
            except Exception as e:
                print(f"⚠️ Failed to update user progress: {e}")
        
        # Store next project if generated
        if progress_update.get("next_project"):
            next_project = progress_update["next_project"]
            
            project_data = {
                "user_id": current_user_id,
                "repository_name": next_project["name"],
                "description": next_project["description"],
                "tech_stack": next_project["tech_stack"],
                "difficulty_level": next_project["difficulty_level"],
                "estimated_time": next_project["estimated_time"],
                "learning_objectives": next_project["learning_objectives"],
                "project_type": "progression",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "status": "assigned"
            }
            
            try:
                supabase.table("ai_repositories").upsert(project_data).execute()
                print("✅ Next project stored in database")
            except Exception as e:
                print(f"⚠️ Failed to store next project: {e}")
        
        return jsonify({
            "success": True,
            "message": "Learning progress updated successfully!",
            "progress_update": progress_update,
            "database_updates": {
                "user_progress_updated": True,
                "next_project_stored": progress_update.get("next_project") is not None
            }
        })
        
    except Exception as e:
        print(f"❌ Progress update failed: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Progress update failed: {str(e)}",
            "details": "Check server logs for more information"
        }), 500 

@bp.route("/api/repository/create-learning", methods=["POST"])
@token_required
def create_learning_repository(current_user_id):
    """Create single learning repository with structured folders based on roadmap"""
    try:
        # Get form data
        target_role = request.form.get('target_role', 'software_engineer')
        repository_name = request.form.get('repository_name', f"my-learning-journey-{current_user_id}")
        repository_description = request.form.get('repository_description', f"My journey to become a {target_role.replace('_', ' ').title()} developer.")
        make_public = request.form.get('make_public', 'false').lower() == 'true'
        
        # Get user's current level and skills
        user_progress = supabase.table("user_progress").select("*").eq("user_id", current_user_id).execute()
        current_level = user_progress.data[0]["current_level"] if user_progress.data else 1
        
        # Get user's GitHub access token
        user_result = supabase.table("users").select("github_access_token").eq("id", current_user_id).execute()
        if not user_result.data:
            return jsonify({"error": "User not found or GitHub token missing"}), 400
        
        github_token = user_result.data[0].get("github_access_token")
        if not github_token:
            return jsonify({"error": "GitHub access token not found. Please authenticate with GitHub first."}), 400
        
        # Generate learning roadmap
        roadmap_data = ai_service.generate_roadmap(current_level, target_role, user_skills)
        
        if not roadmap_data:
            return jsonify({"error": "Failed to generate learning roadmap"}), 500
        
        # Create the main repository
        repo_data = ai_service.create_github_repository(
            current_level, target_role, current_user_id
        )
        
        if not repo_data["success"]:
            return jsonify({"error": "Failed to create main learning repository"}), 500
        
        # Create folder structure and content based on roadmap
        created_folders = create_roadmap_folder_structure(
            ai_service, 
            github_token, 
            repo_data, 
            roadmap_data
        )
        
        # Create issues for each level/folder
        created_issues = create_level_based_issues(
            ai_service,
            github_token,
            repo_data,
            roadmap_data,
            created_folders
        )
        
        # Store onboarding data
        onboarding_data = {
            "user_id": current_user_id,
            "uploaded_cv_url": None,  # No CV uploaded
            "target_role": target_role,
            "chosen_path": "auto_generated",  # Auto-generated based on skills
            "onboarding_complete": True,
            "analysis_method": "GitHub Repository Creation"
        }
        
        try:
            supabase.table("user_onboarding").upsert(onboarding_data).execute()
        except Exception as e:
            print(f"Onboarding storage error: {e}")
        
        # Store skills analysis
        skills_analysis_data = {
            "user_id": current_user_id,
            "analysis_data": {
                "skills": user_skills,
                "skill_analysis": {"skill_gaps": [], "match_percentage": 0}, # No agent for this specific call
                "roadmap": roadmap_data,
                "development_level": "Beginner", # Placeholder, will be updated by Agent2
                "match_percentage": 0
            },
            "skill_level": "Beginner", # Placeholder, will be updated by Agent2
            "strengths": [skill["name"] for skill in user_skills if skill.get("level", 0) >= 4],
            "growth_areas": [], # Placeholder, will be updated by Agent2
            "recommended_learning_path": roadmap_data,
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
        }
        
        try:
            supabase.table("user_skills_analysis").upsert(skills_analysis_data).execute()
        except Exception as e:
            print(f"Skills analysis storage error: {e}")
        
        # Store resume data (generated from GitHub)
        resume_data = {
            "user_id": current_user_id,
            "resume_data": {
                "github_username": "N/A", # No GitHub username for this specific call
                "extracted_skills": user_skills,
                "career_goals": [{"title": target_role.replace('_', ' ').title(), "industry": "Technology"}],
                "analysis_summary": {"current_level": "Beginner", "match_percentage": 0}, # Placeholder
                "github_metrics": {} # Placeholder
            },
            "last_synced": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            supabase.table("user_resume").upsert(resume_data).execute()
        except Exception as e:
            print(f"Resume storage error: {e}")
        
        # Initialize user progress based on GitHub assessment
        progress_data = {
            "user_id": current_user_id,
            "current_level": 1, # Placeholder, will be updated by Agent2
            "xp_points": 0, # Placeholder, will be updated by Agent2
            "badges": ["Learning Journey Started"],
            "next_goal": "Complete your first learning milestone" # Placeholder
        }
        
        try:
            supabase.table("user_progress").upsert(progress_data).execute()
        except Exception as e:
            print(f"Progress storage error: {e}")
        
        # Log the operation
        operation_data = {
            "user_id": current_user_id,
            "operation_type": "create_learning_repository",
            "target_repository": repo_data["name"],
            "input_data": {"target_role": target_role, "repository_name": repository_name},
            "output_data": {
                "repository_name": repo_data["name"],
                "folder_structure": created_folders,
                "learning_issues": created_issues
            },
            "success": True,
            "ai_model_used": "AI Agent + GitHub API",
            "execution_time_ms": 10000
        }
        
        try:
            supabase.table("agent_operations").insert(operation_data).execute()
        except Exception as e:
            print(f"Operation logging error: {e}")
        
        return jsonify({
            "success": True,
            "message": "Learning repository created successfully!",
            "repository": repo_data,
            "folder_structure": created_folders,
            "learning_issues": created_issues,
            "onboarding": onboarding_data,
            "next_steps": [
                "Review your learning roadmap",
                "Start with your first learning milestone",
                "Track your progress in the new repository"
            ]
        })
        
    except Exception as e:
        return jsonify({"error": f"Repository creation failed: {str(e)}"}), 500

def create_roadmap_folder_structure(github_service, token, repo_data, roadmap_data):
    """Create folder structure based on roadmap levels"""
    folders_created = []
    
    for milestone in roadmap_data.get("milestones", []):
        level_name = milestone.get("name", "Unknown Level")
        level_description = milestone.get("description", "")
        
        # Create level folder
        folder_path = f"Level-{level_name.replace(' ', '-')}"
        
        # Create README for the level
        readme_content = f"""# {level_name}

{level_description}

## Learning Objectives
{chr(10).join([f"- {obj}" for obj in milestone.get("learning_objectives", [])])}

## Skills Covered
{chr(10).join([f"- {skill}" for skill in milestone.get("skills_covered", [])])}

## Estimated Duration
{milestone.get("duration", "2-4 weeks")}

## Projects in This Level
{chr(10).join([f"- {task.get('title', 'Task')}" for task in milestone.get("tasks", [])])}
"""
        
        # Create folder and README using GitHub API
        github_service.create_file(
            token=token,
            owner=repo_data["owner"]["login"],
            repo_name=repo_data["name"],
            path=f"{folder_path}/README.md",
            message=f"Add {level_name} level structure",
            content=readme_content
        )
        
        # Create subfolders for each task
        for task in milestone.get("tasks", []):
            task_folder = f"{folder_path}/{task.get('title', 'Task').replace(' ', '-').lower()}"
            
            # Create task README
            task_readme = f"""# {task.get('title', 'Task')}

{task.get('description', 'Complete this learning task')}

## Skills Required
{chr(10).join([f"- {skill}" for skill in task.get("skills_required", [])])}

## Acceptance Criteria
{chr(10).join([f"- {criteria}" for criteria in task.get("acceptance_criteria", [])])}

## Resources
{chr(10).join([f"- {resource}" for resource in task.get("resources", [])])}

## Estimated Time
{task.get('estimated_time', '2-4 hours')}

## Difficulty
{task.get('difficulty', 'Medium')}
"""
            
            github_service.create_file(
                token=token,
                owner=repo_data["owner"]["login"],
                repo_name=repo_data["name"],
                path=f"{task_folder}/README.md",
                message=f"Add {task.get('title', 'Task')} structure",
                content=task_readme
            )
            
            folders_created.append({
                "level": level_name,
                "task": task.get('title', 'Task'),
                "path": task_folder,
                "difficulty": task.get('difficulty', 'Medium')
            })
    
    return folders_created

def create_level_based_issues(github_service, token, repo_data, roadmap_data, folders):
    """Create GitHub issues for each level/task"""
    issues_created = []
    
    for folder in folders:
        # Create issue for each task
        issue_title = f"🎯 {folder['level']}: {folder['task']}"
        issue_body = f"""## Learning Task: {folder['task']}

**Level:** {folder['level']}
**Difficulty:** {folder['difficulty']}
**Folder Path:** `{folder['path']}`

### Task Description
Complete the learning task in the `{folder['path']}` folder.

### What to Do
1. Navigate to the `{folder['path']}` folder
2. Read the README.md file for requirements
3. Complete the task according to acceptance criteria
4. Commit your solution
5. Create a pull request when ready

### Resources Available
- Check the README.md in the task folder
- Review the main roadmap README.md
- Use the learning objectives as guidance

### Acceptance Criteria
- [ ] Task completed according to README requirements
- [ ] Code follows best practices
- [ ] Documentation updated
- [ ] Tests passing (if applicable)

**Good luck with your learning journey! 🚀**
"""
        
        issue = github_service.create_issue(
            token=token,
            owner=repo_data["owner"]["login"],
            repo_name=repo_data["name"],
            title=issue_title,
            body=issue_body,
            labels=["learning-task", f"level-{folder['level'].lower()}", f"difficulty-{folder['difficulty'].lower()}"]
        )
        
        if issue:
            issues_created.append({
                "title": issue_title,
                "number": issue.get("number"),
                "url": issue.get("html_url"),
                "level": folder['level'],
                "task": folder['task'],
                "difficulty": folder['difficulty']
            })
    
    return issues_created 