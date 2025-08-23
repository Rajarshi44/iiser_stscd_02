from flask import Blueprint, request, jsonify
from ..utils.decorators import token_required
from ..services.supabase_client import supabase
from datetime import datetime, timedelta, timezone

bp = Blueprint("ai_services", __name__)

@bp.route("/api/tech/recommendations", methods=["GET", "POST"])
@token_required
def tech_recommendations(current_user_id):
    if request.method == "GET":
        try:
            result = supabase.table("tech_recommendations").select("*").eq("user_id", current_user_id).execute()
            return jsonify({
                "success": True,
                "recommendations": result.data
            })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch tech recommendations: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            recommendation_data = {
                "user_id": current_user_id,
                "owner": data["owner"],
                "repo_name": data["repo_name"],
                "current_stack": data.get("current_stack"),
                "recommendations": data["recommendations"],
                "implementation_priority": data.get("implementation_priority"),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()
            }
            
            result = supabase.table("tech_recommendations").insert(recommendation_data).execute()
            return jsonify({
                "success": True,
                "recommendation": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create tech recommendation: {str(e)}"}), 500

@bp.route("/api/repository/roadmap", methods=["GET", "POST"])
@token_required
def repository_roadmap(current_user_id):
    if request.method == "GET":
        try:
            result = supabase.table("repository_roadmaps").select("*").eq("user_id", current_user_id).execute()
            return jsonify({
                "success": True,
                "roadmaps": result.data
            })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch roadmaps: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            roadmap_data = {
                "user_id": current_user_id,
                "owner": data["owner"],
                "repo_name": data["repo_name"],
                "goals": data["goals"],
                "roadmap_data": data["roadmap_data"],
                "milestones_count": data.get("milestones_count", 0),
                "risks_identified": data.get("risks_identified", 0)
            }
            
            result = supabase.table("repository_roadmaps").insert(roadmap_data).execute()
            return jsonify({
                "success": True,
                "roadmap": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create roadmap: {str(e)}"}), 500

@bp.route("/api/user/skills", methods=["GET", "POST"])
@token_required
def user_skills_analysis(current_user_id):
    if request.method == "GET":
        try:
            result = supabase.table("user_skills_analysis").select("*").eq("user_id", current_user_id).execute()
            return jsonify({
                "success": True,
                "skills_analysis": result.data
            })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch skills analysis: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            skills_data = {
                "user_id": current_user_id,
                "analysis_data": data["analysis_data"],
                "skill_level": data.get("skill_level"),
                "strengths": data.get("strengths", []),
                "growth_areas": data.get("growth_areas", []),
                "recommended_learning_path": data.get("recommended_learning_path"),
                "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
            }
            
            result = supabase.table("user_skills_analysis").insert(skills_data).execute()
            return jsonify({
                "success": True,
                "skills_analysis": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create skills analysis: {str(e)}"}), 500

@bp.route("/api/user/onboarding", methods=["GET", "POST", "PUT"])
@token_required
def user_onboarding(current_user_id):
    if request.method == "GET":
        try:
            result = supabase.table("user_onboarding").select("*").eq("user_id", current_user_id).execute()
            if result.data:
                return jsonify({
                    "success": True,
                    "onboarding": result.data[0]
                })
            else:
                return jsonify({
                    "success": True,
                    "onboarding": None
                })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch onboarding: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            onboarding_data = {
                "user_id": current_user_id,
                "uploaded_cv_url": data.get("uploaded_cv_url"),
                "target_role": data.get("target_role"),
                "chosen_path": data.get("chosen_path"),
                "onboarding_complete": data.get("onboarding_complete", False)
            }
            
            result = supabase.table("user_onboarding").insert(onboarding_data).execute()
            return jsonify({
                "success": True,
                "onboarding": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create onboarding: {str(e)}"}), 500
    
    elif request.method == "PUT":
        try:
            data = request.get_json()
            result = supabase.table("user_onboarding").update(data).eq("user_id", current_user_id).execute()
            return jsonify({
                "success": True,
                "onboarding": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to update onboarding: {str(e)}"}), 500

@bp.route("/api/user/achievements")
@token_required
def user_achievements(current_user_id):
    try:
        result = supabase.table("user_achievements").select("*").eq("user_id", current_user_id).execute()
        return jsonify({
            "success": True,
            "achievements": result.data
        })
    except Exception as e:
        return jsonify({"error": f"Failed to fetch achievements: {str(e)}"}), 500

@bp.route("/api/leaderboard")
def leaderboard():
    try:
        result = supabase.table("leaderboard").select("*").order("total_points", desc=True).limit(50).execute()
        return jsonify({
            "success": True,
            "leaderboard": result.data
        })
    except Exception as e:
        return jsonify({"error": f"Failed to fetch leaderboard: {str(e)}"}), 500

@bp.route("/api/agent/operations", methods=["GET", "POST"])
@token_required
def agent_operations(current_user_id):
    if request.method == "GET":
        try:
            result = supabase.table("agent_operations").select("*").eq("user_id", current_user_id).order("created_at", desc=True).limit(100).execute()
            return jsonify({
                "success": True,
                "operations": result.data
            })
        except Exception as e:
            return jsonify({"error": f"Failed to fetch agent operations: {str(e)}"}), 500
    
    elif request.method == "POST":
        try:
            data = request.get_json()
            operation_data = {
                "user_id": current_user_id,
                "operation_type": data["operation_type"],
                "target_repository": data.get("target_repository"),
                "input_data": data.get("input_data", {}),
                "output_data": data.get("output_data", {}),
                "success": data.get("success", True),
                "error_message": data.get("error_message"),
                "execution_time_ms": data.get("execution_time_ms"),
                "ai_model_used": data.get("ai_model_used")
            }
            
            result = supabase.table("agent_operations").insert(operation_data).execute()
            return jsonify({
                "success": True,
                "operation": result.data[0] if result.data else None
            })
        except Exception as e:
            return jsonify({"error": f"Failed to create agent operation: {str(e)}"}), 500 