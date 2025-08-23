from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
import json

@dataclass
class User:
    id: Optional[int]
    github_username: str
    github_user_id: int
    github_access_token: Optional[str]
    email: Optional[str]
    avatar_url: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        # Remove sensitive data when converting to dict
        data.pop('github_access_token', None)
        return data

@dataclass
class AgentMetrics:
    id: Optional[int]
    date: datetime
    operation_type: str
    total_operations: int
    successful_operations: int
    average_execution_time_ms: int
    user_satisfaction_score: Optional[float]
    created_at: datetime

@dataclass
class AgentOperation:
    id: Optional[int]
    user_id: int
    operation_type: str
    target_repository: Optional[str]
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]
    success: bool
    error_message: Optional[str]
    execution_time_ms: Optional[int]
    ai_model_used: Optional[str]
    created_at: datetime

@dataclass
class AIIssue:
    id: Optional[int]
    user_id: int
    owner: str
    repo_name: str
    github_issue_id: Optional[int]
    issue_title: str
    issue_body: Optional[str]
    ai_reasoning: Optional[str]
    labels: List[str]
    priority: Optional[str]
    complexity: Optional[str]
    estimated_hours: Optional[int]
    status: str
    created_at: datetime

@dataclass
class AIRepository:
    id: Optional[int]
    user_id: int
    github_repo_id: Optional[int]
    repo_name: str
    repo_url: Optional[str]
    requirements: str
    ai_plan: Dict[str, Any]
    created_files: int
    created_issues: int
    created_at: datetime

@dataclass
class Leaderboard:
    id: Optional[int]
    user_id: int
    total_points: int
    current_rank: Optional[int]
    last_updated: datetime

@dataclass
class RepositoryAnalysis:
    id: Optional[int]
    user_id: int
    owner: str
    repo_name: str
    analysis_type: str
    analysis_data: Dict[str, Any]
    overall_score: int
    created_at: datetime
    expires_at: datetime

@dataclass
class RepositoryRoadmap:
    id: Optional[int]
    user_id: int
    owner: str
    repo_name: str
    goals: str
    roadmap_data: Dict[str, Any]
    milestones_count: int
    risks_identified: int
    created_at: datetime

@dataclass
class TechRecommendation:
    id: Optional[int]
    user_id: int
    owner: str
    repo_name: str
    current_stack: Optional[Dict[str, Any]]
    recommendations: Dict[str, Any]
    implementation_priority: Optional[str]
    created_at: datetime
    expires_at: datetime

@dataclass
class UserAchievement:
    id: Optional[int]
    user_id: int
    achievement_name: str
    description: Optional[str]
    earned_at: datetime

@dataclass
class UserOnboarding:
    id: Optional[int]
    user_id: int
    uploaded_cv_url: Optional[str]
    target_role: Optional[str]
    chosen_path: Optional[str]
    onboarding_complete: bool
    created_at: datetime

@dataclass
class UserProgress:
    id: Optional[int]
    user_id: int
    current_level: int
    xp_points: int
    badges: List[str]
    next_goal: Optional[str]
    last_updated: datetime

@dataclass
class UserResume:
    id: Optional[int]
    user_id: int
    resume_data: Dict[str, Any]
    last_synced: datetime

@dataclass
class UserSkillsAnalysis:
    id: Optional[int]
    user_id: int
    analysis_data: Dict[str, Any]
    skill_level: Optional[str]
    strengths: List[str]
    growth_areas: List[str]
    recommended_learning_path: Optional[Dict[str, Any]]
    created_at: datetime
    expires_at: datetime

@dataclass
class UserSubmission:
    id: Optional[int]
    user_id: int
    issue_id: int
    github_pr_url: Optional[str]
    submission_data: Dict[str, Any]
    ai_score: int
    feedback: Optional[str]
    status: str
    submitted_at: datetime 