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
        "scope": "user:email repo",
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
        response = make_response(redirect("http://localhost:3000/dashboard"))
        response.set_cookie(
            "github_token",
            access_token,
            max_age=60 * 60 * 24 * 7,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
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
            # Remove sensitive data before returning
            user_data.pop("github_access_token", None)
            
            # Return user data in GitHub API format for compatibility
            return jsonify({
                "id": user_data["github_user_id"],
                "login": user_data["github_username"],
                "name": user_data.get("github_username"),  # GitHub doesn't always provide real name
                "email": user_data.get("email", ""),
                "avatar_url": user_data.get("avatar_url", ""),
                "public_repos": 0,  # Could be fetched from GitHub API if needed
                "followers": 0,     # Could be fetched from GitHub API if needed
                "following": 0,     # Could be fetched from GitHub API if needed
                "created_at": user_data.get("created_at"),
                "updated_at": user_data.get("updated_at"),
                # Additional fields from our User model
                "database_id": user_data["id"],
                "is_stored_user": True
            })
        else:
            # Fallback: get user data from GitHub API if not in database
            headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
            user_response = requests.get("https://api.github.com/user", headers=headers, timeout=10)

            if user_response.status_code != 200:
                return jsonify({"error": "Failed to fetch user data"}), 400

            github_user = user_response.json()
            github_user["is_stored_user"] = False
            return jsonify(github_user)
            
    except Exception as e:
        print(f"❌ Error fetching user: {str(e)}")
        return jsonify({"error": f"Failed to fetch user data: {str(e)}"}), 500


@bp.route("/demo/api/repos")
def demo_get_repos():
    token = request.cookies.get("github_token")
    if not token:
        return jsonify({"error": "Not authenticated"}), 401

    headers = {"Authorization": f"token {token}", "Accept": "application/vnd.github+json"}
    repos_response = requests.get("https://api.github.com/user/repos", headers=headers, timeout=10)

    if repos_response.status_code != 200:
        return jsonify({"error": "Failed to fetch repositories"}), 400

    return jsonify(repos_response.json())


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

@bp.route("/demo/logout")
def demo_logout():
    response = make_response(redirect("http://localhost:3000/login"))
    response.set_cookie("github_token", "", expires=0)
    response.set_cookie("user_info", "", expires=0)
    return response
