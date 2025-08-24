from flask import Blueprint, request, jsonify, redirect, session, make_response
import jwt
import json
from datetime import datetime, timedelta, timezone
from ..config import Config
from ..services.github_service import GitHubIntegration
from ..services.supabase_client import supabase
from ..utils.decorators import token_required
from ..models import User, AIIssue, AIRepository, RepositoryAnalysis, TechRecommendation
import os
import requests
from urllib.parse import urlencode

bp = Blueprint("github", __name__)
github_integration = GitHubIntegration(
    Config.GITHUB_CLIENT_ID,
    Config.GITHUB_CLIENT_SECRET,
    Config.GITHUB_REDIRECT_URI
)

@bp.route("/test")
def test_endpoint():
    """Test endpoint to verify server is running"""
    return jsonify({
        "status": "success",
        "message": "AI-powered GitHub development platform is running! 🚀",
        "endpoints": {
            "core": {
                "health_check": "/",
                "test_endpoint": "/test",
                "github_login": "/auth/github",
                "github_callback": "/auth/github/callback"
            },
            "user_management": {
                "user_profile": "/api/user/profile",
                "user_repositories": "/api/user/repositories",
                "user_progress": "/api/user/progress",
                "user_onboarding": "/api/user/onboarding",
                "user_skills": "/api/user/skills",
                "user_achievements": "/api/user/achievements"
            },
            "ai_services": {
                "ai_issues": "/api/ai/issues",
                "ai_repositories": "/api/ai/repositories",
                "repository_analysis": "/api/repository/analysis",
                "tech_recommendations": "/api/tech/recommendations",
                "repository_roadmap": "/api/repository/roadmap"
            },
            "ai_career_development": {
                "cv_analysis_onboarding": "/api/onboarding/cv-analysis",
                "comprehensive_cv_analysis": "/api/cv/analyze",
                "github_skill_analysis": "/api/onboarding/github-analysis",
                "generate_ai_project": "/api/projects/generate",
                "analyze_code_submission": "/api/submissions/analyze",
                "dashboard_summary": "/api/dashboard/summary",
                "generate_user_resume": "/api/profile/resume",
                "level_requirements": "/api/progress/level-requirements"
            },
            "agent2_ai_agents": {
                "learning_roadmap": "/api/learning/roadmap",
                "portfolio_project": "/api/learning/portfolio-project",
                "progress_update": "/api/learning/progress-update",
                "description": "LangChain + Groq powered learning path generation (Free tier available)"
            },
            "auto_career_paths": {
                "description": "AI automatically generates career paths based on skills analysis",
                "supported_paths": [
                    "Full Stack Developer", "Frontend Specialist", "Backend Engineer",
                    "Data Scientist", "DevOps Engineer", "Mobile Developer"
                ],
                "features": [
                    "Skill-based path matching", "Personalized learning priorities",
                    "Alternative path suggestions", "Realistic career timelines"
                ]
            },
            "cv_parsing": {
                "supported_formats": ["PDF", "DOCX", "TXT"],
                "features": ["Real CV parsing", "Skill extraction", "Gap analysis", "Learning roadmap"],
                "test_cv_parser": "/test_cv_parser.py"
            },
            "analytics": {
                "leaderboard": "/api/leaderboard",
                "agent_operations": "/api/agent/operations"
            },
            "demo_oauth": {
                "description": "Cookie-based GitHub OAuth for frontend integration",
                "start_auth": "/demo/auth",
                "callback": "/demo/callback",
                "get_user": "/demo/api/user",
                "get_profile": "/demo/api/profile", 
                "get_repos": "/demo/api/repos",
                "get_contributions": "/demo/api/contributions/<username> (GraphQL)",
                "get_user_stats": "/demo/api/stats/<username>",
                "get_user_activity": "/demo/api/activity/<username>",
                "list_users": "/demo/api/users",
                "logout": "/demo/logout"
            }
        },
        "features": [
            "GitHub OAuth Integration",
            "AI-powered Issue Generation",
            "Repository Analysis & Scoring",
            "Tech Stack Recommendations",
            "Development Roadmaps",
            "User Progress Tracking",
            "Skills Analysis",
            "Achievement System",
            "Leaderboard Rankings",
            "Agent Operation Logging",
            "CV Analysis & Skills Assessment",
            "AI Project Generation",
            "Code Quality Analysis",
            "Personalized Learning Paths",
            "Auto-Resume Generation",
            "Agent2: LangChain + Groq Integration (Free AI)",
            "AI Learning Roadmap Generation",
            "Portfolio Project Creation",
            "Intelligent Progress Tracking"
        ],
        "user_flow": {
            "step_1": "GitHub OAuth Signup",
            "step_2": "CV Upload & AI Analysis",
            "step_3": "Skills Assessment & Roadmap",
            "step_4": "AI Project Generation",
            "step_5": "Code Implementation & Submission",
            "step_6": "AI Code Analysis & Scoring",
            "step_7": "Progress Tracking & Leveling",
            "step_8": "Auto-Resume Generation"
        },
        "config": {
            "github_client_id": "✅ Set" if Config.GITHUB_CLIENT_ID else "❌ Missing",
            "github_client_secret": "✅ Set" if Config.GITHUB_CLIENT_SECRET else "❌ Missing",
            "supabase_url": "✅ Set" if Config.SUPABASE_URL else "❌ Missing",
            "supabase_key": "✅ Set" if Config.SUPABASE_KEY else "❌ Missing"
        }
    })

@bp.route("/debug/oauth")
def oauth_debug():
    """Debug endpoint to show OAuth configuration"""
    return jsonify({
        "status": "success",
        "oauth_config": {
            "client_id": Config.GITHUB_CLIENT_ID,
            "client_secret": "***hidden***" if Config.GITHUB_CLIENT_SECRET else None,
            "redirect_uri": Config.GITHUB_REDIRECT_URI,
            "scopes": "repo,user:email,read:user"
        },
        "oauth_flow": {
            "step_1": "Visit /auth/github to start OAuth",
            "step_2": "GitHub redirects to /auth/github/callback with code",
            "step_3": "Backend exchanges code for access token",
            "step_4": "User info stored in database",
            "step_5": "JWT token generated and sent to frontend"
        },
        "test_urls": {
            "start_oauth": "http://localhost:5000/auth/github",
            "callback": "http://localhost:5000/auth/github/callback",
            "test_endpoint": "http://localhost:5000/test"
        },
        "common_issues": [
            "Callback URL must match exactly in GitHub OAuth app settings",
            "Client ID and Secret must be correct",
            "Redirect URI should be: http://localhost:5000/auth/github/callback",
            "OAuth flow must start from /auth/github, not directly calling callback"
        ]
    })

@bp.route("/auth/github")
def github_login():
    return redirect(github_integration.get_oauth_url("default"))

@bp.route("/auth/github/callback")
def github_callback():
    try:
        # Get the authorization code from GitHub
        code = request.args.get('code')
        state = request.args.get('state')
        error = request.args.get('error')
        
        # Log all parameters for debugging
        print(f"🔍 GitHub Callback Debug:")
        print(f"   Code: {code}")
        print(f"   State: {state}")
        print(f"   Error: {error}")
        print(f"   All args: {dict(request.args)}")
        
        # Check for OAuth errors
        if error:
            return jsonify({
                "error": f"GitHub OAuth error: {error}",
                "description": request.args.get('error_description', 'No description provided')
            }), 400
        
        # Check if code is present
        if not code:
            return jsonify({
                "error": "Authorization code not received",
                "debug_info": {
                    "received_args": dict(request.args),
                    "expected_args": ["code", "state"],
                    "oauth_flow": "You must initiate OAuth from /auth/github first"
                },
                "solution": "Visit /auth/github to start the OAuth flow"
            }), 400
        
        # Exchange code for access token
        print(f"🔄 Exchanging code for access token...")
        token_response = github_integration.exchange_code_for_token(code)
        print(f"   Token response: {token_response}")
        
        access_token = token_response.get('access_token')
        
        if not access_token:
            error_msg = token_response.get('error_description', 'Unknown error')
            return jsonify({
                "error": "Failed to get access token",
                "github_error": error_msg,
                "full_response": token_response
            }), 400
        
        # Get user info from GitHub
        print(f"👤 Getting user info from GitHub...")
        github_user = github_integration.get_user_info(access_token)
        if not github_user:
            return jsonify({"error": "Failed to get user info from GitHub"}), 400
        
        print(f"   User: {github_user.get('login')} (ID: {github_user.get('id')})")
        
        # Store or update user in Supabase using new schema
        user_data = {
            "github_username": github_user["login"],
            "github_user_id": github_user["id"],
            "github_access_token": access_token,
            "email": github_user.get("email", ""),
            "avatar_url": github_user.get("avatar_url", ""),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        # Try to find existing user first, then upsert
        try:
            # Check if user already exists by github_user_id (primary identifier)
            existing_user = supabase.table("users").select("*").eq("github_user_id", github_user["id"]).execute()
            
            if existing_user.data:
                # User exists, update their information
                print(f"   User already exists, updating...")
                user_id = existing_user.data[0]["id"]
                result = supabase.table("users").update(user_data).eq("id", user_id).execute()
                print(f"   User updated in database with ID: {user_id}")
            else:
                # Check if username exists (might be a different user)
                username_check = supabase.table("users").select("*").eq("github_username", github_user["login"]).execute()
                
                if username_check.data:
                    print(f"   Username '{github_user['login']}' exists but with different ID, updating...")
                    user_id = username_check.data[0]["id"]
                    result = supabase.table("users").update(user_data).eq("id", user_id).execute()
                    print(f"   User updated in database with ID: {user_id}")
                else:
                    # User doesn't exist, create new
                    print(f"   Creating new user...")
                    result = supabase.table("users").insert(user_data).execute()
                    user_id = result.data[0]["id"] if result.data else None
                    print(f"   User created in database with ID: {user_id}")
                
        except Exception as e:
            print(f"   Database error: {str(e)}")
            # Fallback: try direct upsert
            try:
                print(f"   Trying fallback upsert...")
                result = supabase.table("users").upsert(user_data).execute()
                user_id = result.data[0]["id"] if result.data else None
                print(f"   User upserted with ID: {user_id}")
            except Exception as e2:
                print(f"   Fallback failed: {str(e2)}")
                return jsonify({
                    "error": "Failed to save user to database",
                    "details": str(e2),
                    "user_data": {
                        "github_username": user_data["github_username"],
                        "github_user_id": user_data["github_user_id"],
                        "email": user_data["email"]
                    }
                }), 500
        
        # Generate JWT token
        token_payload = {
            "user_id": user_id,
            "github_user_id": github_user["id"],
            "github_username": github_user["login"],
            "exp": datetime.now(timezone.utc) + timedelta(days=7)
        }
        
        jwt_token = jwt.encode(token_payload, Config.JWT_SECRET, algorithm="HS256")
        print(f"   JWT token generated successfully")
        
        # Redirect to frontend with token (you can modify this URL)
        frontend_url = f"http://localhost:3000/auth/callback?token={jwt_token}"
        print(f"   Redirecting to: {frontend_url}")
        
        # Return success response with user info
        return jsonify({
            "success": True,
            "message": "GitHub authentication successful!",
            "user": {
                "id": user_id,
                "github_username": github_user["login"],
                "github_user_id": github_user["id"],
                "email": github_user.get("email", ""),
                "avatar_url": github_user.get("avatar_url", "")
            },
            "token": jwt_token,
            "redirect_url": frontend_url
        })
        
    except Exception as e:
        print(f"❌ Callback error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Callback error: {str(e)}",
            "debug_info": {
                "received_args": dict(request.args),
                "exception_type": type(e).__name__
            }
        }), 500
    
@bp.route("/api/user/repositories")
@token_required
def get_user_repositories(current_user_id):
    try:
        # Get user's GitHub access token from database
        user_result = supabase.table("users").select("github_access_token").eq("id", current_user_id).execute()
        
        if not user_result.data:
            return jsonify({"error": "User not found"}), 404
        
        github_token = user_result.data[0]["github_access_token"]
        
        # Get repositories from GitHub
        repositories = github_integration.get_user_repositories(github_token)
        
        return jsonify({
            "success": True,
            "repositories": repositories
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch repositories: {str(e)}"}), 500

@bp.route("/api/user/profile")
@token_required
def get_user_profile(current_user_id):
    try:
        # Get user profile from database
        user_result = supabase.table("users").select("*").eq("id", current_user_id).execute()
        
        if not user_result.data:
            return jsonify({"error": "User not found"}), 404
        
        user_data = user_result.data[0]
        # Remove sensitive data
        user_data.pop("github_access_token", None)
        
        return jsonify({
            "success": True,
            "user": user_data
        })
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch profile: {str(e)}"}), 500

@bp.route("/api/ai/issues", methods=["GET", "POST"])
@token_required
def ai_issues(current_user_id):
    if request.method == "GET":
        try:
            # Get AI issues for the user
            result = supabase.table("ai_issues").select("*").eq("user_id", current_user_id).execute()
            return jsonify({
                "success": True,
                "issues": result.data
            })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch AI issues: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            issue_data = {
                "user_id": current_user_id,
                "owner": data["owner"],
                "repo_name": data["repo_name"],
                "issue_title": data["issue_title"],
                "issue_body": data.get("issue_body"),
                "ai_reasoning": data.get("ai_reasoning"),
                "labels": data.get("labels", []),
                "priority": data.get("priority"),
                "complexity": data.get("complexity"),
                "estimated_hours": data.get("estimated_hours"),
                "status": data.get("status", "suggested")
            }
            
            result = supabase.table("ai_issues").insert(issue_data).execute()
            return jsonify({
                "success": True,
                "issue": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create AI issue: {str(e)}"}), 500

@bp.route("/api/ai/repositories", methods=["GET", "POST"])
@token_required
def ai_repositories(current_user_id):
    if request.method == "GET":
        try:
            result = supabase.table("ai_repositories").select("*").eq("user_id", current_user_id).execute()
            return jsonify({
                "success": True,
                "repositories": result.data
            })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch AI repositories: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            repo_data = {
                "user_id": current_user_id,
                "repo_name": data["repo_name"],
                "requirements": data["requirements"],
                "ai_plan": data["ai_plan"],
                "created_files": data.get("created_files", 0),
                "created_issues": data.get("created_issues", 0)
            }
            
            result = supabase.table("ai_repositories").insert(repo_data).execute()
            return jsonify({
                "success": True,
                "repository": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create AI repository: {str(e)}"}), 500

@bp.route("/api/repository/analysis", methods=["POST"])
@token_required
def repository_analysis(current_user_id):
    try:
        data = request.get_json()
        analysis_data = {
            "user_id": current_user_id,
            "owner": data["owner"],
            "repo_name": data["repo_name"],
            "analysis_type": data["analysis_type"],
            "analysis_data": data["analysis_data"],
            "overall_score": data["overall_score"],
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
        }
        
        result = supabase.table("repository_analyses").insert(analysis_data).execute()
        return jsonify({
            "success": True,
            "analysis": result.data[0] if result.data else None
        })
    except Exception as e:
        return jsonify({"error": f"Failed to create repository analysis: {str(e)}"}), 500

@bp.route("/api/user/progress")
@token_required
def get_user_progress(current_user_id):
    try:
        result = supabase.table("user_progress").select("*").eq("user_id", current_user_id).execute()
        if result.data:
            return jsonify({
                "success": True,
                "progress": result.data[0]
            })
        else:
            # Create default progress if none exists
            default_progress = {
                "user_id": current_user_id,
                "current_level": 1,
                "xp_points": 0,
                "badges": [],
                "next_goal": "Complete your first repository analysis"
            }
            result = supabase.table("user_progress").insert(default_progress).execute()
            return jsonify({
                "success": True,
                "progress": result.data[0] if result.data else default_progress
            })
    except Exception as e:
        return jsonify({"error": f"Failed to fetch user progress: {str(e)}"}), 500

# ------------------------------
# Simple demo OAuth cookie flow
# ------------------------------

# Use environment variables with sensible fallbacks for local testing
DEMO_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "your_client_id_here")
DEMO_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "your_client_secret_here")
DEMO_REDIRECT_URI = "http://localhost:5000/demo/callback"


@bp.route("/")
def demo_home():
    return jsonify({"status": "ok", "service": "github demo oauth"})


@bp.route("/demo/auth")
def demo_github_auth():
    params = {
        "client_id": DEMO_CLIENT_ID,
        "redirect_uri": DEMO_REDIRECT_URI,
        "scope": "read:user user:email repo",
        "state": "demo_state_string",
    }
    auth_url = f"https://github.com/login/oauth/authorize?{urlencode(params)}"
    return redirect(auth_url)


@bp.route("/demo/callback")
def demo_github_callback():
    try:
        code = request.args.get("code")
        state = request.args.get("state")
        error = request.args.get("error")

        print(f"🔍 Demo GitHub Callback Debug:")
        print(f"   Code: {code}")
        print(f"   State: {state}")
        print(f"   Error: {error}")

        if error:
            return jsonify({
                "error": f"GitHub OAuth error: {error}",
                "description": request.args.get('error_description', 'No description provided')
            }), 400

        if not code:
            return jsonify({"error": "Authorization code not received"}), 400

        # Exchange code for access token
        token_data = {
        "client_id": DEMO_CLIENT_ID,
        "client_secret": DEMO_CLIENT_SECRET,
        "code": code,
        "redirect_uri": DEMO_REDIRECT_URI,
    }

        headers = {
            "Accept": "application/json",
        }

        print(f"🔄 Exchanging code for access token...")
        token_response = requests.post(
        "https://github.com/login/oauth/access_token",
        data=token_data,
        headers=headers,
        timeout=10,
    )

        if token_response.status_code != 200:
            return jsonify({"error": "Failed to exchange code for token"}), 400

        token_info = token_response.json()
        access_token = token_info.get("access_token")

        if not access_token:
            error_msg = token_info.get('error_description', 'Unknown error')
            return jsonify({
                "error": "Failed to get access token",
                "github_error": error_msg
            }), 400

        # Fetch user info from GitHub
        print(f"👤 Getting user info from GitHub...")
        user_response = requests.get(
            "https://api.github.com/user",
            headers={"Authorization": f"token {access_token}", "Accept": "application/vnd.github+json"},
            timeout=10,
        )

        if user_response.status_code != 200:
            return jsonify({"error": "Failed to fetch user data from GitHub"}), 400

        github_user = user_response.json()
        print(f"   User: {github_user.get('login')} (ID: {github_user.get('id')})")

        # Store or update user in Supabase using the User model schema
        user_data = {
            "github_username": github_user["login"],
            "github_user_id": github_user["id"],
            "github_access_token": access_token,
            "email": github_user.get("email", ""),
            "avatar_url": github_user.get("avatar_url", ""),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        # Try to find existing user first, then upsert
        try:
            print(f"🔍 Checking if user exists in database...")
            # Check if user already exists by github_user_id (primary identifier)
            existing_user = supabase.table("users").select("*").eq("github_user_id", github_user["id"]).execute()
            
            if existing_user.data:
                # User exists, update their information
                print(f"   User exists, updating...")
                user_id = existing_user.data[0]["id"]
                result = supabase.table("users").update(user_data).eq("id", user_id).execute()
                user_record = result.data[0] if result.data else existing_user.data[0]
                print(f"   User updated in database with ID: {user_id}")
            else:
                # Check if username exists (might be a different user)
                username_check = supabase.table("users").select("*").eq("github_username", github_user["login"]).execute()
                
                if username_check.data:
                    print(f"   Username '{github_user['login']}' exists but with different ID, updating...")
                    user_id = username_check.data[0]["id"]
                    result = supabase.table("users").update(user_data).eq("id", user_id).execute()
                    user_record = result.data[0] if result.data else username_check.data[0]
                    print(f"   User updated in database with ID: {user_id}")
                else:
                    # User doesn't exist, create new
                    print(f"   Creating new user...")
                    user_data["created_at"] = datetime.now(timezone.utc).isoformat()
                    result = supabase.table("users").insert(user_data).execute()
                    user_record = result.data[0] if result.data else None
                    user_id = user_record["id"] if user_record else None
                    print(f"   User created in database with ID: {user_id}")
                
        except Exception as e:
            print(f"   Database error: {str(e)}")
            # Fallback: try direct upsert
            try:
                print(f"   Trying fallback upsert...")
                user_data["created_at"] = datetime.now(timezone.utc).isoformat()
                result = supabase.table("users").upsert(user_data).execute()
                user_record = result.data[0] if result.data else None
                user_id = user_record["id"] if user_record else None
                print(f"   User upserted with ID: {user_id}")
            except Exception as e2:
                print(f"   Fallback failed: {str(e2)}")
                return jsonify({
                    "error": "Failed to save user to database",
                    "details": str(e2),
                    "user_data": {
                        "github_username": user_data["github_username"],
                        "github_user_id": user_data["github_user_id"],
                        "email": user_data["email"]
                    }
                }), 500

        # Set httpOnly cookie and redirect to frontend
        response = make_response(redirect("http://localhost:3000/onboarding"))
        response.set_cookie(
            "github_token",
            access_token,
            max_age=60 * 60 * 24 * 7,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite="Lax",
        )

        
        
        # Set user_id cookie for authentication
        response.set_cookie(
            "user_id",
            str(user_id),
            max_age=60 * 60 * 24 * 7,  # 7 days
            httponly=True,
            secure=False,
            samesite="Lax",
        )
        
        # Also set user info cookie for frontend access (without sensitive data)
        user_info = {
            "id": user_id,
            "github_username": github_user["login"],
            "github_user_id": github_user["id"],
            "email": github_user.get("email", ""),
            "avatar_url": github_user.get("avatar_url", "")
        }
        response.set_cookie(
            "user_info",
            json.dumps(user_info),
            max_age=60 * 60 * 24 * 7,  # 7 days
            httponly=False,  # Allow JS access for frontend
        secure=False,
        samesite="Lax",
    )

        print(f"   Successfully stored user and redirecting to dashboard")
        return response

    except Exception as e:
        print(f"❌ Demo callback error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Demo callback error: {str(e)}",
            "debug_info": {
                "received_args": dict(request.args),
                "exception_type": type(e).__name__
            }
        }), 500


@bp.route("/demo/api/user")
def demo_get_user():
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        # First try to get user from database using the token
        user_result = supabase.table("users").select("*").eq("github_access_token", token).execute()
        
        if user_result.data:
            user_data = user_result.data[0]
            user_id = user_data["id"]
            github_user_id = user_data["github_user_id"]
            
            # Remove sensitive data before returning
            user_data.pop("github_access_token", None)
            
            # Fetch fresh GitHub data if token is available
            fresh_github_data = {}
            try:
                headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
                github_response = requests.get("https://api.github.com/user", headers=headers, timeout=10)
                if github_response.status_code == 200:
                    fresh_github_data = github_response.json()
            except Exception as e:
                print(f"Warning: Could not fetch fresh GitHub data: {e}")
            
            # Fetch comprehensive user data from all related tables
            comprehensive_data = {}
            
            # 1. User Skills Analysis
            try:
                skills_result = supabase.table("user_skills_analysis").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
                if skills_result.data:
                    comprehensive_data["skills_analysis"] = skills_result.data[0]
                    # Remove user_id from nested data to avoid duplication
                    comprehensive_data["skills_analysis"].pop("user_id", None)
            except Exception as e:
                print(f"Warning: Could not fetch skills analysis: {e}")
                comprehensive_data["skills_analysis"] = None
            
            # 2. User Progress
            try:
                progress_result = supabase.table("user_progress").select("*").eq("user_id", user_id).execute()
                if progress_result.data:
                    comprehensive_data["progress"] = progress_result.data[0]
                    comprehensive_data["progress"].pop("user_id", None)
                else:
                    # Create default progress if none exists
                    default_progress = {
                        "current_level": 1,
                        "xp_points": 0,
                        "badges": [],
                        "next_goal": "Complete your first repository analysis"
                    }
                    comprehensive_data["progress"] = default_progress
            except Exception as e:
                print(f"Warning: Could not fetch user progress: {e}")
                comprehensive_data["progress"] = None
            
            # 3. User Achievements
            try:
                achievements_result = supabase.table("user_achievements").select("*").eq("user_id", user_id).order("earned_at", desc=True).execute()
                comprehensive_data["achievements"] = [
                    {
                        "achievement_name": ach["achievement_name"],
                        "description": ach.get("description"),
                        "earned_at": ach["earned_at"]
                    }
                    for ach in achievements_result.data
                ]
            except Exception as e:
                print(f"Warning: Could not fetch achievements: {e}")
                comprehensive_data["achievements"] = []
            
            # 4. User Onboarding
            try:
                onboarding_result = supabase.table("user_onboarding").select("*").eq("user_id", user_id).execute()
                if onboarding_result.data:
                    comprehensive_data["onboarding"] = onboarding_result.data[0]
                    comprehensive_data["onboarding"].pop("user_id", None)
            except Exception as e:
                print(f"Warning: Could not fetch onboarding data: {e}")
                comprehensive_data["onboarding"] = None
            
            # 5. User Resume
            try:
                resume_result = supabase.table("user_resume").select("*").eq("user_id", user_id).order("last_synced", desc=True).limit(1).execute()
                if resume_result.data:
                    comprehensive_data["resume"] = resume_result.data[0]
                    comprehensive_data["resume"].pop("user_id", None)
            except Exception as e:
                print(f"Warning: Could not fetch resume data: {e}")
                comprehensive_data["resume"] = None
            
            # 6. Repository Analyses
            try:
                analyses_result = supabase.table("repository_analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
                comprehensive_data["repository_analyses"] = [
                    {
                        "id": analysis["id"],
                        "owner": analysis["owner"],
                        "repo_name": analysis["repo_name"],
                        "analysis_type": analysis["analysis_type"],
                        "analysis_data": analysis["analysis_data"],
                        "overall_score": analysis["overall_score"],
                        "created_at": analysis["created_at"],
                        "expires_at": analysis["expires_at"]
                    }
                    for analysis in analyses_result.data
                ]
            except Exception as e:
                print(f"Warning: Could not fetch repository analyses: {e}")
                comprehensive_data["repository_analyses"] = []
            
            # 7. Tech Recommendations
            try:
                tech_result = supabase.table("tech_recommendations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
                comprehensive_data["tech_recommendations"] = [
                    {
                        "id": rec["id"],
                        "owner": rec["owner"],
                        "repo_name": rec["repo_name"],
                        "current_stack": rec.get("current_stack"),
                        "recommendations": rec["recommendations"],
                        "implementation_priority": rec.get("implementation_priority"),
                        "created_at": rec["created_at"],
                        "expires_at": rec["expires_at"]
                    }
                    for rec in tech_result.data
                ]
            except Exception as e:
                print(f"Warning: Could not fetch tech recommendations: {e}")
                comprehensive_data["tech_recommendations"] = []
            
            # 8. Leaderboard Position
            try:
                leaderboard_result = supabase.table("leaderboard").select("*").eq("user_id", user_id).execute()
                if leaderboard_result.data:
                    comprehensive_data["leaderboard"] = {
                        "total_points": leaderboard_result.data[0]["total_points"],
                        "current_rank": leaderboard_result.data[0].get("current_rank"),
                        "last_updated": leaderboard_result.data[0]["last_updated"]
                    }
            except Exception as e:
                print(f"Warning: Could not fetch leaderboard data: {e}")
                comprehensive_data["leaderboard"] = None
            
            # 9. AI Issues (Recent)
            try:
                ai_issues_result = supabase.table("ai_issues").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
                comprehensive_data["recent_ai_issues"] = [
                    {
                        "id": issue["id"],
                        "owner": issue["owner"],
                        "repo_name": issue["repo_name"],
                        "issue_title": issue["issue_title"],
                        "priority": issue.get("priority"),
                        "complexity": issue.get("complexity"),
                        "status": issue["status"],
                        "estimated_hours": issue.get("estimated_hours"),
                        "created_at": issue["created_at"]
                    }
                    for issue in ai_issues_result.data
                ]
            except Exception as e:
                print(f"Warning: Could not fetch AI issues: {e}")
                comprehensive_data["recent_ai_issues"] = []
            
            # 10. AI Repositories
            try:
                ai_repos_result = supabase.table("ai_repositories").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(5).execute()
                comprehensive_data["ai_repositories"] = [
                    {
                        "id": repo["id"],
                        "repo_name": repo["repo_name"],
                        "requirements": repo["requirements"],
                        "created_files": repo["created_files"],
                        "created_issues": repo["created_issues"],
                        "created_at": repo["created_at"]
                    }
                    for repo in ai_repos_result.data
                ]
            except Exception as e:
                print(f"Warning: Could not fetch AI repositories: {e}")
                comprehensive_data["ai_repositories"] = []
            
            # Calculate some summary statistics
            summary_stats = {
                "total_analyses": len(comprehensive_data["repository_analyses"]),
                "total_ai_issues": len(comprehensive_data["recent_ai_issues"]),
                "total_ai_repos": len(comprehensive_data["ai_repositories"]),
                "total_achievements": len(comprehensive_data["achievements"]),
                "has_skills_analysis": comprehensive_data["skills_analysis"] is not None,
                "has_resume": comprehensive_data["resume"] is not None,
                "onboarding_complete": comprehensive_data["onboarding"]["onboarding_complete"] if comprehensive_data["onboarding"] else False
            }
            
            # Return comprehensive user data
            return jsonify({
                # Basic GitHub user info (maintained for compatibility)
                "id": user_data["github_user_id"],
                "login": user_data["github_username"],
                "name": fresh_github_data.get("name") or user_data.get("github_username"),
                "email": user_data.get("email", ""),
                "avatar_url": user_data.get("avatar_url", ""),
                "public_repos": fresh_github_data.get("public_repos", 0),
                "followers": fresh_github_data.get("followers", 0),
                "following": fresh_github_data.get("following", 0),
                "bio": fresh_github_data.get("bio", ""),
                "location": fresh_github_data.get("location", ""),
                "blog": fresh_github_data.get("blog", ""),
                "company": fresh_github_data.get("company", ""),
                "created_at": user_data.get("created_at"),
                "updated_at": user_data.get("updated_at"),
                
                # Database and platform-specific data
                "database_id": user_data["id"],
                "is_stored_user": True,
                "platform_data": comprehensive_data,
                "summary_stats": summary_stats,
                
                # Additional metadata
                "data_freshness": {
                    "fetched_at": datetime.now().isoformat(),
                    "github_data_fresh": bool(fresh_github_data),
                    "tables_queried": [
                        "users", "user_skills_analysis", "user_progress", "user_achievements", 
                        "user_onboarding", "user_resume", "repository_analyses", 
                        "tech_recommendations", "leaderboard", "ai_issues", "ai_repositories"
                    ]
                }
            })
        else:
            # Fallback: get user data from GitHub API if not in database
            headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
            user_response = requests.get("https://api.github.com/user", headers=headers, timeout=10)

            if user_response.status_code != 200:
                return jsonify({"error": "Failed to fetch user data"}), 400

            github_user = user_response.json()
            github_user["is_stored_user"] = False
            github_user["platform_data"] = {}
            github_user["summary_stats"] = {}
            return jsonify(github_user)
            
    except Exception as e:
        print(f"❌ Error fetching comprehensive user data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch user data: {str(e)}"}), 500


@bp.route("/demo/api/repos")
def demo_get_repos():
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        # Get query parameters for pagination and sorting
        per_page = min(int(request.args.get("per_page", 30)), 100)  # Max 100
        sort = request.args.get("sort", "updated")  # updated, created, pushed, full_name
        direction = request.args.get("direction", "desc")  # asc, desc

        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
        params = {
            "per_page": per_page,
            "sort": sort,
            "direction": direction,
            "type": "owner"  # Only owned repositories
        }
        
        repos_response = requests.get(
            "https://api.github.com/user/repos", 
            headers=headers, 
            params=params,
            timeout=10
        )

        if repos_response.status_code != 200:
            return jsonify({"error": "Failed to fetch repositories"}), 400

        repos = repos_response.json()
        
        # Enhance repository data with computed fields
        enhanced_repos = []
        for repo in repos:
            enhanced_repo = {
                "id": repo["id"],
                "name": repo["name"],
                "full_name": repo["full_name"],
                "description": repo.get("description", ""),
                "html_url": repo["html_url"],
                "clone_url": repo["clone_url"],
                "ssh_url": repo["ssh_url"],
                "language": repo.get("language"),
                "stargazers_count": repo["stargazers_count"],
                "watchers_count": repo["watchers_count"],
                "forks_count": repo["forks_count"],
                "open_issues_count": repo["open_issues_count"],
                "size": repo["size"],
                "default_branch": repo["default_branch"],
                "private": repo["private"],
                "fork": repo["fork"],
                "archived": repo["archived"],
                "disabled": repo["disabled"],
                "created_at": repo["created_at"],
                "updated_at": repo["updated_at"],
                "pushed_at": repo["pushed_at"],
                "topics": repo.get("topics", []),
                "visibility": repo["visibility"],
                "owner": {
                    "login": repo["owner"]["login"],
                    "avatar_url": repo["owner"]["avatar_url"]
                }
            }
            enhanced_repos.append(enhanced_repo)

        return jsonify(enhanced_repos)
        
    except Exception as e:
        print(f"❌ Error fetching repositories: {str(e)}")
        return jsonify({"error": f"Failed to fetch repositories: {str(e)}"}), 500


@bp.route("/demo/api/profile")
def demo_get_profile():
    """Get user profile from database"""
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        # Get user from database using the token
        user_result = supabase.table("users").select("*").eq("github_access_token", token).execute()
        
        if not user_result.data:
            return jsonify({"error": "User not found in database"}), 404
        
        user_data = user_result.data[0]
        # Remove sensitive data
        user_data.pop("github_access_token", None)
        
        return jsonify({
            "success": True,
            "user": user_data
        })
        
    except Exception as e:
        print(f"❌ Error fetching profile: {str(e)}")
        return jsonify({"error": f"Failed to fetch profile: {str(e)}"}), 500

@bp.route("/demo/api/users")
def demo_list_users():
    """List all users in database (for testing/admin purposes)"""
    try:
        users_result = supabase.table("users").select("id, github_username, github_user_id, email, avatar_url, created_at, updated_at").execute()
        
        return jsonify({
            "success": True,
            "users": users_result.data,
            "count": len(users_result.data)
        })
        
    except Exception as e:
        print(f"❌ Error listing users: {str(e)}")
        return jsonify({"error": f"Failed to list users: {str(e)}"}), 500

@bp.route("/demo/api/contributions/<username>")
def demo_get_contributions(username):
    """Get user contribution data using GitHub GraphQL API"""
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    # Get time period from query parameters
    period = request.args.get('period', 'year')  # year, 6months, 3months
    
    try:
        # GitHub GraphQL API for contribution data
        graphql_query = """
        query($userName: String!) { 
          user(login: $userName){
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    color
                  }
                }
              }
            }
            repositories(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}, ownerAffiliations: OWNER) {
              nodes {
                primaryLanguage {
                  name
                }
              }
            }
          }
        }
        """
        
        variables = {"userName": username}
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "query": graphql_query,
            "variables": variables
        }
        
        print(f"🔍 Fetching GitHub GraphQL contribution data for: {username}")
        
        response = requests.post(
            "https://api.github.com/graphql",
            json=payload,
            headers=headers,
            timeout=10
        )
        
        if response.status_code != 200:
            print(f"❌ GraphQL request failed with status: {response.status_code}")
            print(f"Response: {response.text}")
            return jsonify({"error": f"GraphQL request failed: {response.status_code}"}), 400
        
        data = response.json()
        
        if "errors" in data:
            print(f"❌ GraphQL errors: {data['errors']}")
            return jsonify({"error": f"GraphQL errors: {data['errors']}"}), 400
        
        # Extract contribution data
        contribution_calendar = data["data"]["user"]["contributionsCollection"]["contributionCalendar"]
        total_contributions = contribution_calendar["totalContributions"]
        weeks_data = contribution_calendar["weeks"]
        
        # Process contribution data into flat array
        contribution_data = []
        for week in weeks_data:
            for day in week["contributionDays"]:
                # Convert GitHub's contribution count to our 0-4 level system
                count = day["contributionCount"]
                if count == 0:
                    level = 0
                elif count <= 2:
                    level = 1
                elif count <= 4:
                    level = 2
                elif count <= 6:
                    level = 3
                else:
                    level = 4
                
                contribution_data.append({
                    'date': day["date"],
                    'count': count,
                    'level': level,
                    'color': day.get("color", "#0d1117")  # GitHub's actual color
                })
        
        # Filter by period if not year
        if period != 'year':
            from datetime import datetime, timedelta
            
            days_map = {
                '6months': 180,
                '3months': 90
            }
            days_back = days_map.get(period, 365)
            
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            # Filter contributions to the specified period
            filtered_data = []
            filtered_total = 0
            
            for day in contribution_data:
                day_date = datetime.strptime(day['date'], '%Y-%m-%d')
                if start_date <= day_date <= end_date:
                    filtered_data.append(day)
                    filtered_total += day['count']
            
            contribution_data = filtered_data
            total_contributions = filtered_total
        
        # Extract language statistics
        languages = {}
        repositories = data["data"]["user"]["repositories"]["nodes"]
        for repo in repositories:
            if repo["primaryLanguage"]:
                lang = repo["primaryLanguage"]["name"]
                languages[lang] = languages.get(lang, 0) + 1
        
        # Calculate contribution streaks
        current_streak = 0
        longest_streak = 0
        temp_streak = 0
        
        # Sort by date to ensure proper order
        sorted_contributions = sorted(contribution_data, key=lambda x: x['date'])
        
        # Calculate current streak (from most recent day backwards)
        for day in reversed(sorted_contributions):
            if day['count'] > 0:
                temp_streak += 1
                if current_streak == 0:  # Start counting current streak from the end
                    current_streak = temp_streak
            else:
                if current_streak == 0:  # Still looking for current streak
                    continue
                else:  # Current streak ended
                    break
        
        # Calculate longest streak
        temp_streak = 0
        for day in sorted_contributions:
            if day['count'] > 0:
                temp_streak += 1
                longest_streak = max(longest_streak, temp_streak)
            else:
                temp_streak = 0
        
        print(f"✅ Successfully fetched {len(contribution_data)} days of contribution data")
        print(f"   Total contributions: {total_contributions}")
        print(f"   Current streak: {current_streak}")
        print(f"   Longest streak: {longest_streak}")
        
        return jsonify({
            "success": True,
            "total_contributions": total_contributions,
            "contribution_data": contribution_data,
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "languages": languages,
            "username": username,
            "source": "graphql"
        })
        
    except Exception as e:
        print(f"❌ Error fetching contributions: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch contributions: {str(e)}"}), 500

@bp.route("/demo/api/stats/<username>")
def demo_get_user_stats(username):
    """Get comprehensive user statistics from GitHub"""
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
        
        print(f"🔍 Fetching comprehensive stats for: {username}")
        
        # Fetch user data
        user_response = requests.get(f"https://api.github.com/users/{username}", headers=headers, timeout=10)
        if user_response.status_code != 200:
            return jsonify({"error": "Failed to fetch user data"}), 400
        
        user_data = user_response.json()
        
        # Fetch repositories with detailed information
        repos_response = requests.get(
            f"https://api.github.com/users/{username}/repos",
            headers=headers,
            params={"per_page": 100, "sort": "updated", "type": "owner"},
            timeout=10
        )
        
        if repos_response.status_code != 200:
            return jsonify({"error": "Failed to fetch repositories"}), 400
        
        repos = repos_response.json()
        
        # Calculate repository statistics
        total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
        total_forks = sum(repo.get("forks_count", 0) for repo in repos)
        total_watchers = sum(repo.get("watchers_count", 0) for repo in repos)
        total_issues = sum(repo.get("open_issues_count", 0) for repo in repos)
        
        # Language statistics
        languages = {}
        for repo in repos:
            if repo.get("language"):
                languages[repo["language"]] = languages.get(repo["language"], 0) + 1
        
        # Repository type breakdown
        public_repos = len([r for r in repos if not r.get("private", False)])
        private_repos = len([r for r in repos if r.get("private", False)])
        forked_repos = len([r for r in repos if r.get("fork", False)])
        original_repos = len([r for r in repos if not r.get("fork", False)])
        
        # Recent activity (last 30 days)
        from datetime import datetime, timedelta
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_repos = [
            r for r in repos 
            if datetime.strptime(r["updated_at"][:19], "%Y-%m-%dT%H:%M:%S") > thirty_days_ago
        ]
        
        stats = {
            "user_info": {
                "login": user_data["login"],
                "name": user_data.get("name", ""),
                "bio": user_data.get("bio", ""),
                "location": user_data.get("location", ""),
                "company": user_data.get("company", ""),
                "blog": user_data.get("blog", ""),
                "email": user_data.get("email", ""),
                "avatar_url": user_data["avatar_url"],
                "public_repos": user_data["public_repos"],
                "followers": user_data["followers"],
                "following": user_data["following"],
                "created_at": user_data["created_at"],
            },
            "repository_stats": {
                "total_repositories": len(repos),
                "public_repositories": public_repos,
                "private_repositories": private_repos,
                "forked_repositories": forked_repos,
                "original_repositories": original_repos,
                "total_stars": total_stars,
                "total_forks": total_forks,
                "total_watchers": total_watchers,
                "total_open_issues": total_issues,
                "recent_activity_count": len(recent_repos)
            },
            "languages": dict(sorted(languages.items(), key=lambda x: x[1], reverse=True)),
            "recent_repositories": recent_repos[:10],  # Top 10 recent
            "top_starred_repositories": sorted(
                repos, key=lambda r: r.get("stargazers_count", 0), reverse=True
            )[:10]
        }
        
        print(f"✅ Successfully compiled stats for {username}")
        
        return jsonify({
            "success": True,
            "username": username,
            "stats": stats,
            "generated_at": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"❌ Error fetching user stats: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to fetch user stats: {str(e)}"}), 500

@bp.route("/demo/api/activity/<username>")
def demo_get_user_activity(username):
    """Get user's recent GitHub activity"""
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    try:
        headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
        
        # Fetch recent events
        events_response = requests.get(
            f"https://api.github.com/users/{username}/events/public",
            headers=headers,
            params={"per_page": 30},
            timeout=10
        )
        
        if events_response.status_code != 200:
            return jsonify({"error": "Failed to fetch user activity"}), 400
        
        events = events_response.json()
        
        # Process and categorize events
        activity_summary = {
            "total_events": len(events),
            "push_events": 0,
            "create_events": 0,
            "watch_events": 0,
            "fork_events": 0,
            "issue_events": 0,
            "pull_request_events": 0,
            "recent_activity": []
        }
        
        for event in events:
            event_type = event.get("type", "")
            
            # Count event types
            if event_type == "PushEvent":
                activity_summary["push_events"] += 1
            elif event_type == "CreateEvent":
                activity_summary["create_events"] += 1
            elif event_type == "WatchEvent":
                activity_summary["watch_events"] += 1
            elif event_type == "ForkEvent":
                activity_summary["fork_events"] += 1
            elif event_type in ["IssuesEvent", "IssueCommentEvent"]:
                activity_summary["issue_events"] += 1
            elif event_type in ["PullRequestEvent", "PullRequestReviewEvent"]:
                activity_summary["pull_request_events"] += 1
            
            # Store recent activity details
            activity_summary["recent_activity"].append({
                "type": event_type,
                "repo": event.get("repo", {}).get("name", ""),
                "created_at": event.get("created_at", ""),
                "public": event.get("public", True)
            })
        
        return jsonify({
            "success": True,
            "username": username,
            "activity": activity_summary
        })
        
    except Exception as e:
        print(f"❌ Error fetching user activity: {str(e)}")
        return jsonify({"error": f"Failed to fetch user activity: {str(e)}"}), 500

@bp.route("/demo/logout")
def demo_logout():
    response = make_response(redirect("http://localhost:3000/login"))
    response.set_cookie("github_token", "", expires=0)
    response.set_cookie("user_info", "", expires=0)
    response.set_cookie("user_id", "", expires=0)
    return response
