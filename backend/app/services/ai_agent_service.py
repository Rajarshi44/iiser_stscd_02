import os
import sys
from typing import Dict, List, Any, Optional
from pathlib import Path

# Add the agent directory to Python path
AGENT_PATH = Path(__file__).parent.parent.parent / "agents" / "agent-1"
sys.path.append(str(AGENT_PATH))

try:
    from ai_career_service import AICareerService
    AGENT_AVAILABLE = True
except ImportError as e:
    print(f"Warning: AI Agent not available: {e}")
    AGENT_AVAILABLE = False

class AIAgentService:
    """Service layer for AI agent operations - delegates to agents directory"""
    
    def __init__(self, gemini_api_key: str = None, supabase_url: str = None, supabase_key: str = None):
        self.gemini_api_key = gemini_api_key or os.getenv("GEMINI_API_KEY")
        self.supabase_url = supabase_url or os.getenv("SUPABASE_URL")
        self.supabase_key = supabase_key or os.getenv("SUPABASE_ANON_KEY")
        
        if AGENT_AVAILABLE:
            try:
                self.agent_service = AICareerService(
                    gemini_api_key=self.gemini_api_key,
                    supabase_url=self.supabase_url,
                    supabase_key=self.supabase_key
                )
                print("✅ AI Career Service initialized from agents directory")
            except Exception as e:
                print(f"❌ Failed to initialize AI Career Service: {e}")
                self.agent_service = None
        else:
            self.agent_service = None
            print("⚠️ AI Career Service not available - using mock responses")
    
    def analyze_cv_and_skills(self, cv_file_path: str, target_role: str, user_id: int) -> Dict[str, Any]:
        """Analyze CV and extract skills using AI agent service"""
        if self.agent_service:
            return self.agent_service.analyze_cv_and_skills(cv_file_path, target_role, user_id)
        else:
            return self._mock_cv_analysis(target_role, user_id)
    
    def analyze_github_profile(self, github_username: str, github_token: str, target_role: str) -> Dict[str, Any]:
        """Analyze GitHub profile using actual GitHub API"""
        try:
            # Import GitHubSkillAnalyzer here to avoid circular imports
            from ..services.github_skill_analyzer import GitHubSkillAnalyzer
            
            # Use the GitHubSkillAnalyzer with the provided token
            analyzer = GitHubSkillAnalyzer(github_token)
            analysis_result = analyzer.analyze_user_profile(github_username)
            
            if analysis_result["success"]:
                # Add target role context to the analysis
                analysis_result["target_role"] = target_role
                return analysis_result
            else:
                return analysis_result
                
        except Exception as e:
            print(f"GitHub analysis error: {e}")
            # Fallback to mock if actual analysis fails
            return self._mock_github_analysis(github_username, target_role)
    
    def create_github_repository(self, user_level: int, skill_focus: str, user_id: int) -> Dict[str, Any]:
        """Create AI-generated GitHub repository with issues"""
        if self.agent_service:
            return self.agent_service.create_github_repository(user_level, skill_focus, user_id)
        else:
            return self._mock_repository_creation(user_level, skill_focus, user_id)
    
    def analyze_code_submission(self, github_pr_url: str, user_id: int) -> Dict[str, Any]:
        """Analyze code submission and generate score"""
        if self.agent_service:
            return self.agent_service.analyze_code_submission(github_pr_url, user_id)
        else:
            return self._mock_code_analysis(github_pr_url, user_id)
    
    def generate_tech_recommendations(self, current_skills: List[str], target_role: str, user_id: int) -> Dict[str, Any]:
        """Generate technology stack recommendations"""
        if self.agent_service:
            return self.agent_service.generate_tech_recommendations(current_skills, target_role, user_id)
        else:
            return self._mock_tech_recommendations(current_skills, target_role, user_id)
    
    def generate_learning_roadmap(self, current_level: int, target_role: str, user_id: int) -> Dict[str, Any]:
        """Generate personalized learning roadmap"""
        if self.agent_service:
            return self.agent_service.generate_learning_roadmap(current_level, target_role, user_id)
        else:
            return self._mock_learning_roadmap(current_level, target_role, user_id)
    
    def generate_resume(self, user_projects: List[Dict], user_skills: List[str], user_id: int) -> Dict[str, Any]:
        """Generate AI-powered resume from user data"""
        if self.agent_service:
            return self.agent_service.generate_resume(user_projects, user_skills, user_id)
        else:
            return self._mock_resume_generation(user_projects, user_skills, user_id)
    
    # Mock methods for when AI agent service is not available
    def _mock_cv_analysis(self, target_role: str, user_id: int) -> Dict[str, Any]:
        """Mock CV analysis for testing"""
        return {
            "success": True,
            "cv_text": "Mock CV text extracted",
            "skills": [
                {"name": "Python", "level": 3, "category": "Programming"},
                {"name": "Machine Learning", "level": 2, "category": "AI/ML"},
                {"name": "Data Analysis", "level": 4, "category": "Analytics"}
            ],
            "goals": [
                {"title": "Senior Data Scientist", "industry": "Tech", "experience_level": "Mid-level"}
            ],
            "analysis": {
                "current_level": "Intermediate",
                "target_level": "Advanced",
                "skill_gaps": ["Deep Learning", "MLOps", "Big Data"],
                "overall_score": 7
            },
            "roadmap": {
                "milestones": [
                    {"skill": "Deep Learning", "priority": "High", "estimated_time": "3 months"},
                    {"skill": "MLOps", "priority": "Medium", "estimated_time": "2 months"}
                ]
            },
            "stored_in_db": True
        }
    
    def _mock_github_analysis(self, github_username: str, target_role: str) -> Dict[str, Any]:
        """Mock GitHub analysis for testing"""
        return {
            "success": True,
            "user_info": {"login": github_username, "public_repos": 15},
            "skills_analysis": {
                "programming_languages": [
                    {"name": "JavaScript", "level": 4, "category": "Programming Language"}
                ],
                "frameworks": [
                    {"name": "React", "level": 4, "category": "Frontend Framework"}
                ]
            },
            "overall_assessment": {
                "current_level": "Intermediate",
                "overall_score": 65.0,
                "strongest_skills": ["JavaScript", "React"],
                "improvement_areas": ["Python", "Backend Development"]
            },
            "analysis_method": "GitHub Profile Analysis"
        }
    
    def _mock_repository_creation(self, user_level: int, skill_focus: str, user_id: int) -> Dict[str, Any]:
        """Mock repository creation for testing"""
        return {
            "success": True,
            "repository": {
                "name": f"skill-{skill_focus}-project",
                "description": f"AI-generated project for {skill_focus}",
                "difficulty": "Intermediate" if user_level > 2 else "Beginner",
                "tech_stack": ["Python", "Flask", "SQLite"],
                "issues": [
                    {"title": "Implement basic CRUD operations", "difficulty": "Easy"},
                    {"title": "Add authentication system", "difficulty": "Medium"},
                    {"title": "Implement testing framework", "difficulty": "Hard"}
                ]
            }
        }
    
    def _mock_code_analysis(self, github_pr_url: str, user_id: int) -> Dict[str, Any]:
        """Mock code analysis for testing"""
        return {
            "success": True,
            "analysis": {
                "code_quality_score": 85,
                "code_complexity": "Medium",
                "best_practices": 8,
                "documentation": 7,
                "testing": 6,
                "overall_score": 78
            },
            "feedback": [
                "Good code structure and organization",
                "Consider adding more comprehensive tests",
                "Documentation could be improved"
            ],
            "xp_points": 150,
            "improvements": [
                "Add unit tests for edge cases",
                "Include docstrings for all functions",
                "Consider using type hints"
            ]
        }
    
    def _mock_tech_recommendations(self, current_skills: List[str], target_role: str, user_id: int) -> Dict[str, Any]:
        """Mock tech recommendations for testing"""
        return {
            "success": True,
            "current_stack": current_skills,
            "recommendations": [
                {"technology": "React", "priority": "High", "reason": "Essential for frontend development"},
                {"technology": "Node.js", "priority": "High", "reason": "Backend JavaScript runtime"},
                {"technology": "MongoDB", "priority": "Medium", "reason": "NoSQL database for scalability"}
            ],
            "implementation_priority": "High",
            "estimated_time": "4-6 months"
        }
    
    def _mock_learning_roadmap(self, current_level: int, target_role: str, user_id: int) -> Dict[str, Any]:
        """Mock learning roadmap for testing"""
        return {
            "success": True,
            "current_level": current_level,
            "target_role": target_role,
            "roadmap": [
                {"phase": "Foundation", "skills": ["Basic Programming", "Data Structures"], "duration": "2 months"},
                {"phase": "Intermediate", "skills": ["Algorithms", "System Design"], "duration": "3 months"},
                {"phase": "Advanced", "skills": ["Architecture", "Performance"], "duration": "4 months"}
            ],
            "milestones": [
                {"milestone": "Complete basic projects", "target_date": "2 months"},
                {"milestone": "Build portfolio", "target_date": "5 months"},
                {"milestone": "Interview ready", "target_date": "9 months"}
            ]
        }
    
    def _mock_resume_generation(self, user_projects: List[Dict], user_skills: List[str], user_id: int) -> Dict[str, Any]:
        """Mock resume generation for testing"""
        return {
            "success": True,
            "resume": {
                "summary": "Experienced developer with strong skills in Python and web development",
                "skills": user_skills,
                "projects": user_projects,
                "achievements": [
                    "Completed 15+ coding challenges",
                    "Built 5 full-stack applications",
                    "Achieved 85%+ code quality score"
                ],
                "formatted": {
                    "pdf_url": "/resumes/user_123_resume.pdf",
                    "json_data": {"sections": ["summary", "skills", "projects", "achievements"]}
                }
            }
        } 