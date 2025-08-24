#!/usr/bin/env python3
"""
Repository & Issue Creation Agent - IISER StatusCode 02
Creates AI-powered GitHub repositories and issues using LangChain and agentic AI
"""

import os
import json
import random
from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime, timedelta
from pathlib import Path


# LangChain imports
try:
    from langchain.agents import Tool, AgentExecutor, create_openai_functions_agent
    from langchain_groq import ChatGroq
    from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
    from langchain.schema import HumanMessage, AIMessage
    from langchain.tools import tool
    from langchain.memory import ConversationBufferMemory
    from langchain.chains import LLMChain
    from langchain.prompts import PromptTemplate
    LANGCHAIN_AVAILABLE = True
except ImportError:
    LANGCHAIN_AVAILABLE = False
    print("Warning: LangChain not available. Install with: pip install langchain langchain-groq")

# GitHub API imports
try:
    from github import Github
    GITHUB_AVAILABLE = True
except ImportError:
    GITHUB_AVAILABLE = False
    print("Warning: PyGithub not available. Install with: pip install PyGithub")

@dataclass
class ProjectRepository:
    """Represents a project repository"""
    name: str
    description: str
    tech_stack: List[str]
    difficulty_level: str
    estimated_time: str
    learning_objectives: List[str]
    target_audience: str
    setup_instructions: str

@dataclass
class CodingIssue:
    """Represents a coding issue/task"""
    title: str
    description: str
    difficulty: str
    estimated_time: str
    skills_required: List[str]
    acceptance_criteria: List[str]
    hints: List[str]
    resources: List[str]

class RepositoryCreationAgent:
    """Agent for creating AI-powered GitHub repositories and issues"""
    
    def __init__(self, groq_api_key: str = None, github_token: str = None):
        """Initialize the agent"""
        self.groq_api_key = groq_api_key or os.getenv('GROQ_API_KEY')
        self.github_token = github_token or os.getenv('GITHUB_TOKEN')
        self.llm = None
        self.agent = None
        self.github_client = None
        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        
        if self.groq_api_key and LANGCHAIN_AVAILABLE:
            self._setup_langchain_agent()
        elif self.groq_api_key:
            self._setup_groq_fallback()
        
        if self.github_token and GITHUB_AVAILABLE:
            self._setup_github_client()
    
    def _setup_langchain_agent(self):
        """Setup LangChain agent with tools"""
        try:
            # Initialize LLM
            self.llm = ChatGroq(
                model="llama3-8b-8192",  # Groq's free model
                temperature=0.8,
                groq_api_key=self.groq_api_key
            )
            
            # Define tools
            tools = [
                Tool(
                    name="analyze_user_skills",
                    func=self._analyze_user_skills_tool,
                    description="Analyze user skills to determine appropriate project complexity"
                ),
                Tool(
                    name="design_project_structure",
                    func=self._design_project_structure_tool,
                    description="Design project structure and architecture"
                ),
                Tool(
                    name="generate_coding_challenges",
                    func=self._generate_coding_challenges_tool,
                    description="Generate coding challenges and issues"
                ),
                Tool(
                    name="validate_project_requirements",
                    func=self._validate_project_requirements_tool,
                    description="Validate project requirements against user skills"
                )
            ]
            
            # Create prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert software architect and project designer. 
                Your goal is to create engaging, educational coding projects that help users 
                learn and practice new skills.
                
                Always consider:
                - User's current skill level and experience
                - Learning objectives and skill gaps
                - Project complexity and time constraints
                - Real-world applicability and portfolio value
                - Progressive difficulty and skill building
                
                Create projects that are challenging but achievable, with clear learning outcomes."""),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad")
            ])
            
            # Create agent
            self.agent = create_openai_functions_agent(self.llm, tools, prompt)
            self.agent_executor = AgentExecutor(
                agent=self.agent,
                tools=tools,
                memory=self.memory,
                verbose=True,
                max_iterations=5
            )
            
            print("✅ LangChain agent initialized successfully")
            
        except Exception as e:
            print(f"❌ Failed to setup LangChain agent: {e}")
            self.agent = None
    
    def _setup_groq_fallback(self):
        """Setup Groq fallback without LangChain"""
        try:
            import groq
            groq.api_key = self.groq_api_key
            print("✅ Groq fallback initialized")
        except Exception as e:
            print(f"❌ Failed to setup Groq fallback: {e}")
    
    def _setup_github_client(self):
        """Setup GitHub client"""
        try:
            self.github_client = Github(self.github_token)
            print("✅ GitHub client initialized")
        except Exception as e:
            print(f"❌ Failed to setup GitHub client: {e}")
    
    @tool
    def _analyze_user_skills_tool(self, user_skills: str, target_role: str) -> str:
        """Analyze user skills to determine appropriate project complexity"""
        try:
            if self.llm:
                prompt = f"""
                Analyze these user skills to determine appropriate project complexity:
                
                User Skills: {user_skills}
                Target Role: {target_role}
                
                Provide a JSON response with:
                {{
                    "skill_level": "beginner/intermediate/advanced",
                    "strengths": ["strong skill areas"],
                    "weaknesses": ["areas to improve"],
                    "recommended_complexity": "simple/medium/complex",
                    "focus_areas": ["skills to practice"],
                    "project_types": ["suitable project categories"]
                }}
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_skill_analysis(user_skills, target_role)
                
        except Exception as e:
            return f"Error analyzing skills: {str(e)}"
    
    @tool
    def _design_project_structure_tool(self, project_type: str, tech_stack: str, complexity: str) -> str:
        """Design project structure and architecture"""
        try:
            if self.llm:
                prompt = f"""
                Design a project structure for a {complexity} {project_type} project using {tech_stack}.
                
                Provide a JSON response with:
                {{
                    "project_structure": {{
                        "directories": ["folder structure"],
                        "files": ["key files to create"],
                        "dependencies": ["required packages/libraries"]
                    }},
                    "architecture_pattern": "design pattern to follow",
                    "database_schema": "if applicable",
                    "api_endpoints": "if applicable",
                    "frontend_components": "if applicable"
                }}
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_project_structure(project_type, tech_stack, complexity)
                
        except Exception as e:
            return f"Error designing project structure: {str(e)}"
    
    @tool
    def _generate_coding_challenges_tool(self, skill_focus: str, difficulty: str, project_scope: str) -> str:
        """Generate coding challenges and issues"""
        try:
            if self.llm:
                prompt = f"""
                Generate coding challenges for {skill_focus} at {difficulty} level within {project_scope}.
                
                Provide a JSON response with:
                {{
                    "issues": [
                        {{
                            "title": "issue title",
                            "description": "detailed description",
                            "difficulty": "{difficulty}",
                            "estimated_time": "time estimate",
                            "skills_required": ["required skills"],
                            "acceptance_criteria": ["completion criteria"],
                            "hints": ["helpful hints"],
                            "resources": ["learning resources"]
                        }}
                    ]
                }}
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_coding_challenges(skill_focus, difficulty, project_scope)
                
        except Exception as e:
            return f"Error generating challenges: {str(e)}"
    
    @tool
    def _validate_project_requirements_tool(self, project_plan: str, user_skills: str) -> str:
        """Validate project requirements against user skills"""
        try:
            if self.llm:
                prompt = f"""
                Validate this project plan against user skills:
                
                Project Plan: {project_plan}
                User Skills: {user_skills}
                
                Check for:
                - Skill level compatibility
                - Missing prerequisites
                - Realistic time estimates
                - Appropriate complexity
                - Learning value
                
                Return validation results in JSON format with recommendations.
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_validation(project_plan, user_skills)
                
        except Exception as e:
            return f"Error validating requirements: {str(e)}"
    
    def create_project_repository(self, user_level: int, skill_focus: List[str]) -> Dict:
        """Create a project repository based on user level and skills"""
        try:
            if self.agent_executor:
                # Use LangChain agent
                skill_focus_text = ", ".join(skill_focus)
                
                prompt = f"""
                Create a project repository for a user at level {user_level} 
                focusing on these skills: {skill_focus_text}
                
                Design:
                1. Project concept and purpose
                2. Technology stack
                3. Project structure
                4. Learning objectives
                5. Difficulty level
                
                Return the project design in a structured JSON format.
                """
                
                result = self.agent_executor.invoke({"input": prompt})
                return self._parse_project_response(result["output"], user_level, skill_focus)
                
            elif self.llm:
                # Use Groq directly
                return self._create_project_with_groq(user_level, skill_focus)
            else:
                # Use mock implementation
                return self._create_mock_project(user_level, skill_focus)
                
        except Exception as e:
            print(f"Error creating project: {e}")
            return self._create_mock_project(user_level, skill_focus)
    
    def generate_coding_issues(self, difficulty_level: str, tech_stack: List[str]) -> List[CodingIssue]:
        """Generate coding issues for the project"""
        try:
            if self.agent_executor:
                tech_stack_text = ", ".join(tech_stack)
                
                prompt = f"""
                Generate coding issues for a {difficulty_level} project using {tech_stack_text}.
                
                Create issues that:
                1. Build skills progressively
                2. Are challenging but achievable
                3. Have clear acceptance criteria
                4. Include helpful hints and resources
                5. Cover different aspects of the tech stack
                
                Return the issues in a structured JSON format.
                """
                
                result = self.agent_executor.invoke({"input": prompt})
                return self._parse_issues_response(result["output"])
                
            elif self.llm:
                return self._generate_issues_with_groq(difficulty_level, tech_stack)
            else:
                return self._generate_mock_issues(difficulty_level, tech_stack)
                
        except Exception as e:
            print(f"Error generating issues: {e}")
            return self._generate_mock_issues(difficulty_level, tech_stack)
    
    def create_github_issues(self, repo_name: str, issues: List[CodingIssue]) -> List[Dict]:
        """Create GitHub issues in the repository"""
        try:
            if not self.github_client:
                print("⚠️ GitHub client not available, returning mock issues")
                return self._mock_github_issues(repo_name, issues)
            
            # This would create actual GitHub issues
            # For now, return mock data
            created_issues = []
            for issue in issues:
                created_issues.append({
                    "title": issue.title,
                    "body": self._format_issue_body(issue),
                    "labels": [issue.difficulty, "hackathon-project"],
                    "assignees": [],
                    "milestone": None
                })
            
            return created_issues
            
        except Exception as e:
            print(f"Error creating GitHub issues: {e}")
            return self._mock_github_issues(repo_name, issues)
    
    def validate_project_requirements(self, user_skills: List[Dict], project_type: str) -> Dict:
        """Validate project requirements against user skills"""
        try:
            if self.agent_executor:
                user_skills_text = json.dumps(user_skills, indent=2)
                
                prompt = f"""
                Validate this {project_type} project against user skills:
                
                User Skills: {user_skills_text}
                Project Type: {project_type}
                
                Check compatibility and provide recommendations.
                """
                
                result = self.agent_executor.invoke({"input": prompt})
                return self._parse_validation_response(result["output"])
                
            elif self.llm:
                return self._validate_with_openai(user_skills, project_type)
            else:
                return self._mock_validation(user_skills, project_type)
                
        except Exception as e:
            print(f"Error validating requirements: {e}")
            return self._mock_validation(user_skills, project_type)
    
    def _format_issue_body(self, issue: CodingIssue) -> str:
        """Format issue for GitHub"""
        body = f"""
## Description
{issue.description}

## Skills Required
{', '.join(issue.skills_required)}

## Acceptance Criteria
{chr(10).join([f'- {criterion}' for criterion in issue.acceptance_criteria])}

## Estimated Time
{issue.estimated_time}

## Hints
{chr(10).join([f'- {hint}' for criterion in issue.hints])}

## Resources
{chr(10).join([f'- {resource}' for resource in issue.resources])}
        """
        return body.strip()
    
    # Mock implementations for when AI is not available
    def _create_mock_project(self, user_level: int, skill_focus: List[str]) -> Dict:
        """Create a mock project when AI is not available"""
        project_types = {
            1: "Todo List App",
            2: "Weather Dashboard",
            3: "E-commerce Backend",
            4: "Real-time Chat App",
            5: "Machine Learning Pipeline"
        }
        
        tech_stacks = {
            1: ["HTML", "CSS", "JavaScript"],
            2: ["React", "Node.js", "OpenWeather API"],
            3: ["Python", "Django", "PostgreSQL"],
            4: ["React", "Socket.io", "Express"],
            5: ["Python", "TensorFlow", "Flask"]
        }
        
        project_name = project_types.get(user_level, "Web Application")
        tech_stack = tech_stacks.get(user_level, ["HTML", "CSS", "JavaScript"])
        
        return {
            "name": f"{project_name.lower().replace(' ', '-')}-{user_level}",
            "description": f"A {project_name} project to practice {', '.join(skill_focus)}",
            "tech_stack": tech_stack,
            "difficulty_level": "beginner" if user_level <= 2 else "intermediate" if user_level <= 4 else "advanced",
            "estimated_time": f"{user_level * 2}-{user_level * 3} weeks",
            "learning_objectives": [
                f"Master {skill}" for skill in skill_focus[:3]
            ],
            "target_audience": f"Level {user_level} developers",
            "setup_instructions": "Follow the README.md for setup instructions"
        }
    
    def _generate_mock_issues(self, difficulty_level: str, tech_stack: List[str]) -> List[CodingIssue]:
        """Generate mock coding issues"""
        return [
            CodingIssue(
                title="Setup Project Environment",
                description="Set up the development environment and project structure",
                difficulty=difficulty_level,
                estimated_time="1-2 hours",
                skills_required=["Git", "Package Management"],
                acceptance_criteria=["Project runs locally", "All dependencies installed"],
                hints=["Check the README", "Use package manager"],
                resources=["Official documentation", "Setup guide"]
            ),
            CodingIssue(
                title="Implement Core Feature",
                description="Build the main functionality of the application",
                difficulty=difficulty_level,
                estimated_time="4-8 hours",
                skills_required=tech_stack[:2],
                acceptance_criteria=["Feature works as expected", "Code follows best practices"],
                hints=["Start with a simple implementation", "Test frequently"],
                resources=["API documentation", "Code examples"]
            )
        ]
    
    def _mock_github_issues(self, repo_name: str, issues: List[CodingIssue]) -> List[Dict]:
        """Mock GitHub issues creation"""
        return [
            {
                "title": issue.title,
                "body": self._format_issue_body(issue),
                "labels": [issue.difficulty, "hackathon-project"],
                "assignees": [],
                "milestone": None
            }
            for issue in issues
        ]
    
    def _parse_project_response(self, response: str, user_level: int, skill_focus: List[str]) -> Dict:
        """Parse AI response into structured project"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            project_data = json.loads(json_str)
            
            # Ensure required fields
            if "name" not in project_data:
                project_data["name"] = f"ai-project-{user_level}"
            if "description" not in project_data:
                project_data["description"] = f"AI-generated project for level {user_level}"
            
            return project_data
            
        except Exception as e:
            print(f"Error parsing project response: {e}")
            return self._create_mock_project(user_level, skill_focus)
    
    def _parse_issues_response(self, response: str) -> List[CodingIssue]:
        """Parse AI response into structured issues"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            issues_data = json.loads(json_str)
            issues = []
            
            for issue_data in issues_data.get("issues", []):
                issue = CodingIssue(
                    title=issue_data.get("title", "Untitled Issue"),
                    description=issue_data.get("description", ""),
                    difficulty=issue_data.get("difficulty", "intermediate"),
                    estimated_time=issue_data.get("estimated_time", "2-4 hours"),
                    skills_required=issue_data.get("skills_required", []),
                    acceptance_criteria=issue_data.get("acceptance_criteria", []),
                    hints=issue_data.get("hints", []),
                    resources=issue_data.get("resources", [])
                )
                issues.append(issue)
            
            return issues
            
        except Exception as e:
            print(f"Error parsing issues response: {e}")
            return self._generate_mock_issues("intermediate", ["JavaScript"])
    
    def _create_project_with_groq(self, user_level: int, skill_focus: List[str]) -> Dict:
        """Create project using Groq directly"""
        try:
            import groq
            
            prompt = f"""
            Create a project repository for a user at level {user_level} 
            focusing on these skills: {', '.join(skill_focus)}
            
            Design:
            1. Project concept and purpose
            2. Technology stack
            3. Project structure
            4. Learning objectives
            5. Difficulty level
            
            Return the project design in a structured JSON format.
            """
            
            response = groq.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8
            )
            
            return self._parse_project_response(response.choices[0].message.content, user_level, skill_focus)
            
        except Exception as e:
            print(f"Error with Groq: {e}")
            return self._create_mock_project(user_level, skill_focus)
    
    def _generate_issues_with_groq(self, difficulty_level: str, tech_stack: List[str]) -> List[CodingIssue]:
        """Generate issues using Groq directly"""
        try:
            import groq
            
            prompt = f"""
            Generate coding issues for a {difficulty_level} project using {', '.join(tech_stack)}.
            
            Create issues that:
            1. Build skills progressively
            2. Are challenging but achievable
            3. Have clear acceptance criteria
            4. Include helpful hints and resources
            5. Cover different aspects of the tech stack
            
            Return the issues in a structured JSON format.
            """
            
            response = groq.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.8
            )
            
            return self._parse_issues_response(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error with Groq: {e}")
            return self._generate_mock_issues(difficulty_level, tech_stack)
    
    def _mock_skill_analysis(self, user_skills: str, target_role: str) -> str:
        """Mock skill analysis"""
        return json.dumps({
            "skill_level": "intermediate",
            "strengths": ["Basic programming", "Problem solving"],
            "weaknesses": ["Advanced frameworks", "System design"],
            "recommended_complexity": "medium",
            "focus_areas": ["Modern frameworks", "Best practices"],
            "project_types": ["Web applications", "APIs"]
        })
    
    def _mock_project_structure(self, project_type: str, tech_stack: str, complexity: str) -> str:
        """Mock project structure"""
        return json.dumps({
            "project_structure": {
                "directories": ["src", "tests", "docs"],
                "files": ["README.md", "package.json", "main.py"],
                "dependencies": ["core libraries"]
            },
            "architecture_pattern": "MVC",
            "database_schema": "Simple key-value store",
            "api_endpoints": "RESTful API",
            "frontend_components": "Component-based architecture"
        })
    
    def _mock_coding_challenges(self, skill_focus: str, difficulty: str, project_scope: str) -> str:
        """Mock coding challenges"""
        return json.dumps({
            "issues": [
                {
                    "title": "Setup Project",
                    "description": "Initialize project structure",
                    "difficulty": difficulty,
                    "estimated_time": "2 hours",
                    "skills_required": ["Git", "Setup"],
                    "acceptance_criteria": ["Project runs", "Structure complete"],
                    "hints": ["Follow README", "Check examples"],
                    "resources": ["Documentation", "Tutorials"]
                }
            ]
        })
    
    def _mock_validation(self, project_plan: str, user_skills: str) -> str:
        """Mock validation"""
        return json.dumps({
            "compatibility": "Good",
            "skill_gaps": ["Advanced concepts"],
            "recommendations": ["Start simple", "Build gradually"],
            "estimated_difficulty": "Medium",
            "success_probability": "High"
        })
    
    def _parse_validation_response(self, response: str) -> Dict:
        """Parse validation response"""
        try:
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            return json.loads(json_str)
            
        except Exception as e:
            print(f"Error parsing validation response: {e}")
            return self._mock_validation("", "")
    
    def _validate_with_openai(self, user_skills: List[Dict], project_type: str) -> Dict:
        """Validate using OpenAI directly"""
        try:
            import openai
            
            user_skills_text = json.dumps(user_skills, indent=2)
            
            prompt = f"""
            Validate this {project_type} project against user skills:
            
            User Skills: {user_skills_text}
            Project Type: {project_type}
            
            Check compatibility and provide recommendations.
            """
            
            response = openai.ChatCompletion.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            return self._parse_validation_response(response.choices[0].message.content)
            
        except Exception as e:
            print(f"Error with OpenAI: {e}")
            return self._mock_validation(user_skills, project_type)

# Example usage
if __name__ == "__main__":
    # Test the agent
    agent = RepositoryCreationAgent()
    
    # Create a project
    project = agent.create_project_repository(2, ["JavaScript", "React", "Node.js"])
    print("Created Project:")
    print(json.dumps(project, indent=2))
    
    # Generate issues
    issues = agent.generate_coding_issues("intermediate", ["React", "Node.js"])
    print(f"\nGenerated {len(issues)} issues")
    
    # Validate requirements
    user_skills = [{"name": "JavaScript", "level": 2}, {"name": "HTML", "level": 3}]
    validation = agent.validate_project_requirements(user_skills, "Web Application")
    print(f"\nValidation: {validation}") 