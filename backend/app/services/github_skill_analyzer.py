import os
import requests
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
import json

class GitHubSkillAnalyzer:
    """Analyze GitHub profile to extract skills and assess coding abilities"""
    
    def __init__(self, github_token: str = None):
        self.github_token = github_token or os.getenv("GITHUB_ACCESS_TOKEN")
        self.api_base = "https://api.github.com"
        self.headers = {
            "Authorization": f"token {self.github_token}",
            "Accept": "application/vnd.github.v3+json"
        } if self.github_token else {}
    
    def analyze_user_profile(self, username: str) -> Dict[str, Any]:
        """Comprehensive GitHub profile analysis"""
        try:
            # Get user profile
            user_info = self._get_user_info(username)
            if not user_info:
                return {"success": False, "error": "Failed to fetch user info"}
            
            # Get repositories
            repos = self._get_user_repositories(username)
            
            # Get contribution data
            contributions = self._get_contribution_data(username)
            
            # Analyze skills from repositories
            skills_analysis = self._analyze_repository_skills(repos)
            
            # Calculate overall score
            overall_score = self._calculate_overall_score(user_info, repos, contributions)
            
            # Generate skill assessment
            skill_assessment = self._generate_skill_assessment(skills_analysis, overall_score)
            
            return {
                "success": True,
                "user_info": user_info,
                "skills_analysis": skills_analysis,
                "contribution_metrics": contributions,
                "overall_assessment": skill_assessment,
                "analysis_method": "GitHub Profile Analysis"
            }
            
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def _get_user_info(self, username: str) -> Optional[Dict]:
        """Get basic user information"""
        try:
            response = requests.get(f"{self.api_base}/users/{username}", headers=self.headers)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Error fetching user info: {e}")
            return None
    
    def _get_user_repositories(self, username: str) -> List[Dict]:
        """Get user repositories with detailed information"""
        try:
            repos = []
            page = 1
            per_page = 100
            
            while True:
                response = requests.get(
                    f"{self.api_base}/users/{username}/repos",
                    params={"page": page, "per_page": per_page, "sort": "updated"},
                    headers=self.headers
                )
                
                if response.status_code != 200:
                    break
                
                page_repos = response.json()
                if not page_repos:
                    break
                
                # Get detailed repo info
                for repo in page_repos:
                    detailed_repo = self._get_repository_details(username, repo["name"])
                    if detailed_repo:
                        repos.append(detailed_repo)
                
                page += 1
                if len(page_repos) < per_page:
                    break
            
            return repos[:20]  # Limit to top 20 repos
            
        except Exception as e:
            print(f"Error fetching repositories: {e}")
            return []
    
    def _get_repository_details(self, username: str, repo_name: str) -> Optional[Dict]:
        """Get detailed repository information"""
        try:
            response = requests.get(
                f"{self.api_base}/repos/{username}/{repo_name}",
                headers=self.headers
            )
            
            if response.status_code == 200:
                repo_data = response.json()
                
                # Get languages used
                languages_response = requests.get(
                    f"{self.api_base}/repos/{username}/{repo_name}/languages",
                    headers=self.headers
                )
                
                if languages_response.status_code == 200:
                    repo_data["languages"] = languages_response.json()
                
                # Get README content
                readme_response = requests.get(
                    f"{self.api_base}/repos/{username}/{repo_name}/readme",
                    headers=self.headers
                )
                
                if readme_response.status_code == 200:
                    readme_data = readme_response.json()
                    repo_data["readme_content"] = readme_data.get("content", "")
                
                return repo_data
                
        except Exception as e:
            print(f"Error fetching repo details: {e}")
        
        return None
    
    def _get_contribution_data(self, username: str) -> Dict[str, Any]:
        """Get user contribution metrics"""
        try:
            # Get recent commits
            commits_response = requests.get(
                f"{self.api_base}/search/commits",
                params={"q": f"author:{username}", "sort": "committer-date", "order": "desc"},
                headers=self.headers
            )
            
            commits_count = 0
            if commits_response.status_code == 200:
                commits_data = commits_response.json()
                commits_count = commits_data.get("total_count", 0)
            
            # Get pull requests
            prs_response = requests.get(
                f"{self.api_base}/search/issues",
                params={"q": f"author:{username} is:pr", "sort": "created", "order": "desc"},
                headers=self.headers
            )
            
            prs_count = 0
            if prs_response.status_code == 200:
                prs_data = prs_response.json()
                prs_count = prs_data.get("total_count", 0)
            
            # Get issues
            issues_response = requests.get(
                f"{self.api_base}/search/issues",
                params={"q": f"author:{username} is:issue", "sort": "created", "order": "desc"},
                headers=self.headers
            )
            
            issues_count = 0
            if issues_response.status_code == 200:
                issues_data = issues_response.json()
                issues_count = issues_data.get("total_count", 0)
            
            return {
                "total_commits": commits_count,
                "total_pull_requests": prs_count,
                "total_issues": issues_count,
                "activity_score": min(100, (commits_count + prs_count + issues_count) / 10)
            }
            
        except Exception as e:
            print(f"Error fetching contribution data: {e}")
            return {"total_commits": 0, "total_pull_requests": 0, "total_issues": 0, "activity_score": 0}
    
    def _analyze_repository_skills(self, repos: List[Dict]) -> Dict[str, Any]:
        """Analyze skills from repository data"""
        skills = {}
        tech_stack = {}
        project_complexity = {}
        
        for repo in repos:
            # Analyze languages
            if "languages" in repo:
                for language, bytes_count in repo["languages"].items():
                    if language not in skills:
                        skills[language] = {"count": 0, "total_bytes": 0, "projects": []}
                    
                    skills[language]["count"] += 1
                    skills[language]["total_bytes"] += bytes_count
                    skills[language]["projects"].append(repo["name"])
            
            # Analyze tech stack from description and topics
            description = repo.get("description") or ""
            topics = repo.get("topics") or []
            repo_description = (description + " " + " ".join(topics)).lower()
            
            # Framework detection
            frameworks = {
                "react": "Frontend Framework",
                "angular": "Frontend Framework", 
                "vue": "Frontend Framework",
                "django": "Backend Framework",
                "flask": "Backend Framework",
                "express": "Backend Framework",
                "spring": "Backend Framework",
                "laravel": "Backend Framework",
                "fastapi": "Backend Framework",
                "gin": "Backend Framework"
            }
            
            for framework, category in frameworks.items():
                if framework in repo_description:
                    if framework not in tech_stack:
                        tech_stack[framework] = {"category": category, "projects": []}
                    tech_stack[framework]["projects"].append(repo["name"])
            
            # Database detection
            databases = ["mysql", "postgresql", "mongodb", "redis", "sqlite", "dynamodb"]
            for db in databases:
                if db in repo_description:
                    if db not in tech_stack:
                        tech_stack[db] = {"category": "Database", "projects": []}
                    tech_stack[db]["projects"].append(repo["name"])
            
            # Cloud platforms
            cloud_platforms = ["aws", "azure", "gcp", "heroku", "vercel", "netlify", "firebase"]
            for platform in cloud_platforms:
                if platform in repo_description:
                    if platform not in tech_stack:
                        tech_stack[platform] = {"category": "Cloud Platform", "projects": []}
                    tech_stack[platform]["projects"].append(repo["name"])
            
            # Project complexity assessment
            complexity_score = self._assess_project_complexity(repo)
            project_complexity[repo["name"]] = complexity_score
        
        # Calculate skill levels
        skill_levels = self._calculate_skill_levels(skills, tech_stack)
        
        return {
            "programming_languages": skill_levels["languages"],
            "frameworks": skill_levels["frameworks"],
            "databases": skill_levels["databases"],
            "cloud_platforms": skill_levels["cloud"],
            "project_complexity": project_complexity,
            "tech_stack_summary": tech_stack
        }
    
    def _assess_project_complexity(self, repo: Dict) -> Dict[str, Any]:
        """Assess the complexity of a repository"""
        complexity_score = 0
        
        # Size indicators
        if repo.get("size", 0) > 1000:
            complexity_score += 20
        elif repo.get("size", 0) > 100:
            complexity_score += 10
        
        # Star indicators
        if repo.get("stargazers_count", 0) > 100:
            complexity_score += 20
        elif repo.get("stargazers_count", 0) > 10:
            complexity_score += 10
        
        # Fork indicators
        if repo.get("forks_count", 0) > 50:
            complexity_score += 15
        elif repo.get("forks_count", 0) > 5:
            complexity_score += 5
        
        # Language complexity
        languages = repo.get("languages", {})
        if len(languages) > 3:
            complexity_score += 15
        elif len(languages) > 1:
            complexity_score += 10
        
        # README quality
        if repo.get("readme_content"):
            complexity_score += 10
        
        # Topics
        if len(repo.get("topics", [])) > 5:
            complexity_score += 10
        
        # Determine complexity level
        if complexity_score >= 80:
            level = "Advanced"
        elif complexity_score >= 50:
            level = "Intermediate"
        else:
            level = "Beginner"
        
        return {
            "score": complexity_score,
            "level": level,
            "indicators": {
                "size": repo.get("size", 0),
                "stars": repo.get("stargazers_count", 0),
                "forks": repo.get("forks_count", 0),
                "languages_count": len(repo.get("languages", {})),
                "has_readme": bool(repo.get("readme_content")),
                "topics_count": len(repo.get("topics", []))
            }
        }
    
    def _calculate_skill_levels(self, skills: Dict, tech_stack: Dict) -> Dict[str, List[Dict]]:
        """Calculate skill levels based on usage and project count"""
        skill_levels = {
            "languages": [],
            "frameworks": [],
            "databases": [],
            "cloud": []
        }
        
        # Language skills
        for language, data in skills.items():
            level = self._determine_skill_level(data["count"], data["total_bytes"])
            skill_levels["languages"].append({
                "name": language,
                "level": level,
                "category": "Programming Language",
                "projects_count": data["count"],
                "usage_bytes": data["total_bytes"],
                "projects": data["projects"][:3]  # Top 3 projects
            })
        
        # Tech stack skills
        for tech, data in tech_stack.items():
            level = self._determine_skill_level(len(data["projects"]), 0)
            skill_levels["frameworks"].append({
                "name": tech,
                "level": level,
                "category": data["category"],
                "projects_count": len(data["projects"]),
                "projects": data["projects"][:3]
            })
        
        return skill_levels
    
    def _determine_skill_level(self, project_count: int, usage_bytes: int) -> int:
        """Determine skill level based on project count and usage"""
        if project_count >= 5 or usage_bytes > 1000000:
            return 5  # Expert
        elif project_count >= 3 or usage_bytes > 100000:
            return 4  # Advanced
        elif project_count >= 2 or usage_bytes > 10000:
            return 3  # Intermediate
        elif project_count >= 1:
            return 2  # Beginner
        else:
            return 1  # Novice
    
    def _calculate_overall_score(self, user_info: Dict, repos: List[Dict], contributions: Dict) -> Dict[str, Any]:
        """Calculate overall coding assessment score"""
        # Repository quality score
        repo_score = 0
        if repos:
            total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
            total_forks = sum(repo.get("forks_count", 0) for repo in repos)
            avg_size = sum(repo.get("size", 0) for repo in repos) / len(repos)
            
            repo_score = min(100, (total_stars * 2 + total_forks * 3 + avg_size / 10))
        
        # Activity score
        activity_score = contributions.get("activity_score", 0)
        
        # Profile completeness score
        profile_score = 0
        if user_info.get("bio"):
            profile_score += 20
        if user_info.get("blog"):
            profile_score += 15
        if user_info.get("location"):
            profile_score += 10
        if user_info.get("company"):
            profile_score += 15
        
        # Overall score
        overall_score = (repo_score * 0.4 + activity_score * 0.4 + profile_score * 0.2)
        
        # Determine level
        if overall_score >= 80:
            level = "Advanced"
        elif overall_score >= 60:
            level = "Intermediate"
        elif overall_score >= 40:
            level = "Beginner"
        else:
            level = "Novice"
        
        return {
            "overall_score": round(overall_score, 1),
            "level": level,
            "breakdown": {
                "repository_quality": round(repo_score, 1),
                "activity_level": round(activity_score, 1),
                "profile_completeness": round(profile_score, 1)
            }
        }
    
    def _generate_skill_assessment(self, skills_analysis: Dict, overall_score: Dict) -> Dict[str, Any]:
        """Generate comprehensive skill assessment"""
        # Identify strongest skills
        strongest_skills = []
        for category, skills in skills_analysis.items():
            if isinstance(skills, list):
                for skill in skills:
                    if skill.get("level", 0) >= 4:
                        strongest_skills.append({
                            "name": skill["name"],
                            "level": skill["level"],
                            "category": skill["category"]
                        })
        
        # Identify areas for improvement
        improvement_areas = []
        for category, skills in skills_analysis.items():
            if isinstance(skills, list):
                for skill in skills:
                    if skill.get("level", 0) <= 2:
                        improvement_areas.append({
                            "name": skill["name"],
                            "category": skill["category"],
                            "current_level": skill["level"],
                            "target_level": 4
                        })
        
        # Generate recommendations
        recommendations = []
        if improvement_areas:
            for area in improvement_areas[:3]:
                recommendations.append({
                    "skill": area["name"],
                    "priority": "High" if area["current_level"] == 1 else "Medium",
                    "action": f"Focus on {area['name']} projects to improve from level {area['current_level']} to {area['target_level']}",
                    "estimated_time": "2-3 months"
                })
        
        return {
            "current_level": overall_score["level"],
            "overall_score": overall_score["overall_score"],
            "strongest_skills": strongest_skills[:5],
            "improvement_areas": improvement_areas[:5],
            "recommendations": recommendations,
            "skill_summary": {
                "total_skills": sum(len(skills) if isinstance(skills, list) else 0 for skills in skills_analysis.values()),
                "expert_skills": len([s for s in strongest_skills if s["level"] == 5]),
                "advanced_skills": len([s for s in strongest_skills if s["level"] == 4])
            }
        } 

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