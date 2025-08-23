#!/usr/bin/env python3
"""
Roadmap Generation Agent - IISER StatusCode 02
Generates personalized learning roadmaps using LangChain and agentic AI
"""

import os
import json
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

# Fallback Groq imports
try:
    import groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False
    print("Warning: Groq not available. Install with: pip install groq")

@dataclass
class Milestone:
    """Represents a learning milestone"""
    id: str
    title: str
    description: str
    skills_covered: List[str]
    difficulty: str  # beginner, intermediate, advanced
    estimated_time: str
    resources: List[str]
    prerequisites: List[str]
    completion_criteria: List[str]

@dataclass
class LearningRoadmap:
    """Complete learning roadmap"""
    user_id: str
    current_level: int
    target_role: str
    milestones: List[Milestone]
    total_duration: str
    difficulty_curve: str
    success_metrics: List[str]
    created_at: datetime
    updated_at: datetime

class RoadmapGenerationAgent:
    """Agent for generating personalized learning roadmaps"""
    
    def __init__(self, groq_api_key: str = None):
        """Initialize the agent"""
        self.groq_api_key = groq_api_key or os.getenv('GROQ_API_KEY')
        self.llm = None
        self.agent = None
        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
        
        if self.groq_api_key and LANGCHAIN_AVAILABLE:
            self._setup_langchain_agent()
        elif self.groq_api_key and GROQ_AVAILABLE:
            self._setup_groq_fallback()
        else:
            print("⚠️ No Groq API key or LangChain available. Using mock responses.")
    
    def _setup_langchain_agent(self):
        """Setup LangChain agent with tools"""
        try:
            # Initialize LLM
            self.llm = ChatGroq(
                model="llama3-8b-8192",  # Groq's free model
                temperature=0.7,
                groq_api_key=self.groq_api_key
            )
            
            # Define tools
            tools = [
                Tool(
                    name="analyze_skill_gaps",
                    func=self._analyze_skill_gaps_tool,
                    description="Analyze gaps between current skills and target role requirements"
                ),
                Tool(
                    name="generate_milestones",
                    func=self._generate_milestones_tool,
                    description="Generate learning milestones for a specific skill area"
                ),
                Tool(
                    name="validate_roadmap",
                    func=self._validate_roadmap_tool,
                    description="Validate and optimize learning roadmap"
                ),
                Tool(
                    name="suggest_resources",
                    func=self._suggest_resources_tool,
                    description="Suggest learning resources for specific skills"
                )
            ]
            
            # Create prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", """You are an expert career counselor and learning path designer. 
                Your goal is to create personalized, achievable learning roadmaps that help users 
                progress from their current skill level to their target role.
                
                Always consider:
                - User's current skill level and experience
                - Target role requirements and industry standards
                - Logical skill progression and dependencies
                - Realistic time estimates and difficulty curves
                - Practical, hands-on learning opportunities
                
                Be encouraging but realistic. Focus on actionable steps and measurable progress."""),
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
            groq.api_key = self.groq_api_key
            print("✅ Groq fallback initialized")
        except Exception as e:
            print(f"❌ Failed to setup Groq fallback: {e}")
    
    @tool
    def _analyze_skill_gaps_tool(self, current_skills: str, target_role: str) -> str:
        """Analyze skill gaps between current skills and target role"""
        try:
            if self.llm:
                prompt = f"""
                Analyze the skill gaps between the user's current skills and the requirements for {target_role}.
                
                Current Skills: {current_skills}
                Target Role: {target_role}
                
                Provide a JSON response with:
                {{
                    "critical_gaps": ["skills that are essential but missing"],
                    "important_gaps": ["skills that would be beneficial"],
                    "nice_to_have": ["skills that are optional"],
                    "priority_order": ["ordered list of skills to learn first"],
                    "estimated_time": "total time to fill critical gaps"
                }}
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_skill_gaps_analysis(current_skills, target_role)
                
        except Exception as e:
            return f"Error analyzing skill gaps: {str(e)}"
    
    @tool
    def _generate_milestones_tool(self, skill_area: str, difficulty: str, time_frame: str) -> str:
        """Generate learning milestones for a specific skill area"""
        try:
            if self.llm:
                prompt = f"""
                Generate learning milestones for {skill_area} at {difficulty} level within {time_frame}.
                
                Provide a JSON response with:
                {{
                    "milestones": [
                        {{
                            "title": "milestone title",
                            "description": "what to learn",
                            "skills_covered": ["specific skills"],
                            "difficulty": "{difficulty}",
                            "estimated_time": "time estimate",
                            "resources": ["learning resources"],
                            "prerequisites": ["required skills"],
                            "completion_criteria": ["how to know it's done"]
                        }}
                    ]
                }}
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_milestone_generation(skill_area, difficulty, time_frame)
                
        except Exception as e:
            return f"Error generating milestones: {str(e)}"
    
    @tool
    def _validate_roadmap_tool(self, roadmap_json: str) -> str:
        """Validate and optimize learning roadmap"""
        try:
            if self.llm:
                prompt = f"""
                Validate and optimize this learning roadmap:
                {roadmap_json}
                
                Check for:
                - Logical skill progression
                - Realistic time estimates
                - Missing prerequisites
                - Optimal learning order
                - Resource availability
                
                Return optimized roadmap in JSON format with improvements noted.
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_roadmap_validation(roadmap_json)
                
        except Exception as e:
            return f"Error validating roadmap: {str(e)}"
    
    @tool
    def _suggest_resources_tool(self, skill: str, level: str) -> str:
        """Suggest learning resources for specific skills"""
        try:
            if self.llm:
                prompt = f"""
                Suggest learning resources for {skill} at {level} level.
                
                Include:
                - Online courses
                - Documentation
                - Practice projects
                - Books
                - Communities
                
                Return as JSON with categories and specific recommendations.
                """
                
                response = self.llm.invoke(prompt)
                return response.content
            else:
                return self._mock_resource_suggestions(skill, level)
                
        except Exception as e:
            return f"Error suggesting resources: {str(e)}"
    
    def create_learning_roadmap(self, current_level: int, target_role: str, user_skills: List[Dict]) -> Dict:
        """Create a comprehensive learning roadmap"""
        try:
            if self.agent_executor:
                # Use LangChain agent
                current_skills_text = json.dumps(user_skills, indent=2)
                
                prompt = f"""
                Create a comprehensive learning roadmap for a user at level {current_level} 
                targeting the role of {target_role}.
                
                Current Skills: {current_skills_text}
                
                Generate a complete roadmap with:
                1. Skill gap analysis
                2. Learning milestones
                3. Time estimates
                4. Resource recommendations
                5. Success metrics
                
                Return the roadmap in a structured JSON format.
                """
                
                result = self.agent_executor.invoke({"input": prompt})
                return self._parse_roadmap_response(result["output"], current_level, target_role)
                
            elif self.llm:
                # Use Groq directly
                return self._create_roadmap_with_groq(current_level, target_role, user_skills)
            else:
                # Use mock implementation
                return self._create_mock_roadmap(current_level, target_role, user_skills)
                
        except Exception as e:
            print(f"Error creating roadmap: {e}")
            return self._create_mock_roadmap(current_level, target_role, user_skills)
    
    def generate_milestones(self, roadmap: Dict) -> List[Milestone]:
        """Generate detailed milestones from roadmap"""
        try:
            milestones = []
            for milestone_data in roadmap.get("milestones", []):
                milestone = Milestone(
                    id=f"milestone_{len(milestones) + 1}",
                    title=milestone_data.get("title", "Untitled"),
                    description=milestone_data.get("description", ""),
                    skills_covered=milestone_data.get("skills_covered", []),
                    difficulty=milestone_data.get("difficulty", "intermediate"),
                    estimated_time=milestone_data.get("estimated_time", "2-4 weeks"),
                    resources=milestone_data.get("resources", []),
                    prerequisites=milestone_data.get("prerequisites", []),
                    completion_criteria=milestone_data.get("completion_criteria", [])
                )
                milestones.append(milestone)
            
            return milestones
            
        except Exception as e:
            print(f"Error generating milestones: {e}")
            return self._generate_mock_milestones()
    
    def suggest_next_skills(self, current_progress: Dict) -> List[Dict]:
        """Suggest next skills to focus on based on current progress"""
        try:
            if self.llm:
                prompt = f"""
                Based on this learning progress, suggest the next 3-5 skills to focus on:
                {json.dumps(current_progress, indent=2)}
                
                Consider:
                - What's most logical to learn next
                - Skills that build on current knowledge
                - High-impact skills for career advancement
                - Skills that can be learned together
                
                Return as JSON with skill recommendations and reasoning.
                """
                
                response = self.llm.invoke(prompt)
                return json.loads(response.content)
            else:
                return self._mock_skill_suggestions(current_progress)
                
        except Exception as e:
            print(f"Error suggesting next skills: {e}")
            return self._mock_skill_suggestions(current_progress)
    
    def update_roadmap_progress(self, completed_projects: List[Dict], current_roadmap: Dict) -> Dict:
        """Update roadmap based on completed projects"""
        try:
            if self.llm:
                prompt = f"""
                Update this learning roadmap based on completed projects:
                
                Completed Projects: {json.dumps(completed_projects, indent=2)}
                Current Roadmap: {json.dumps(current_roadmap, indent=2)}
                
                Update:
                - Mark completed milestones
                - Adjust remaining time estimates
                - Suggest new milestones if needed
                - Update skill progress
                
                Return updated roadmap in JSON format.
                """
                
                response = self.llm.invoke(prompt)
                return json.loads(response.content)
            else:
                return self._mock_roadmap_update(completed_projects, current_roadmap)
                
        except Exception as e:
            print(f"Error updating roadmap: {e}")
            return self._mock_roadmap_update(completed_projects, current_roadmap)
    
    # Mock implementations for when AI is not available
    def _create_mock_roadmap(self, current_level: int, target_role: str, user_skills: List[Dict]) -> Dict:
        """Create a mock roadmap when AI is not available"""
        return {
            "user_id": "mock_user",
            "current_level": current_level,
            "target_role": target_role,
            "milestones": [
                {
                    "title": "Foundation Skills",
                    "description": "Build core programming fundamentals",
                    "skills_covered": ["Python", "Git", "Basic Algorithms"],
                    "difficulty": "beginner",
                    "estimated_time": "4-6 weeks",
                    "resources": ["Python.org", "GitHub Learning Lab", "LeetCode"],
                    "prerequisites": [],
                    "completion_criteria": ["Complete 10 coding challenges", "Build a simple project"]
                },
                {
                    "title": "Web Development Basics",
                    "description": "Learn HTML, CSS, and JavaScript",
                    "skills_covered": ["HTML", "CSS", "JavaScript"],
                    "difficulty": "beginner",
                    "estimated_time": "6-8 weeks",
                    "resources": ["MDN Web Docs", "freeCodeCamp", "Codecademy"],
                    "prerequisites": ["Basic Programming"],
                    "completion_criteria": ["Build a responsive website", "Complete a JavaScript project"]
                }
            ],
            "total_duration": "10-14 weeks",
            "difficulty_curve": "gradual",
            "success_metrics": ["Complete all milestones", "Build portfolio projects", "Pass skill assessments"]
        }
    
    def _generate_mock_milestones(self) -> List[Milestone]:
        """Generate mock milestones"""
        return [
            Milestone(
                id="mock_1",
                title="Mock Milestone",
                description="This is a placeholder milestone",
                skills_covered=["Mock Skill"],
                difficulty="beginner",
                estimated_time="2 weeks",
                resources=["Mock Resource"],
                prerequisites=[],
                completion_criteria=["Complete mock task"]
            )
        ]
    
    def _mock_skill_suggestions(self, current_progress: Dict) -> List[Dict]:
        """Mock skill suggestions"""
        return [
            {"skill": "Next Skill", "priority": "high", "reasoning": "Builds on current knowledge"},
            {"skill": "Advanced Skill", "priority": "medium", "reasoning": "Career advancement"}
        ]
    
    def _mock_roadmap_update(self, completed_projects: List[Dict], current_roadmap: Dict) -> Dict:
        """Mock roadmap update"""
        updated_roadmap = current_roadmap.copy()
        updated_roadmap["completed_projects"] = len(completed_projects)
        updated_roadmap["last_updated"] = datetime.now().isoformat()
        return updated_roadmap
    
    def _parse_roadmap_response(self, response: str, current_level: int, target_role: str) -> Dict:
        """Parse AI response into structured roadmap"""
        try:
            # Try to extract JSON from response
            if "```json" in response:
                json_str = response.split("```json")[1].split("```")[0]
            elif "```" in response:
                json_str = response.split("```")[1].split("```")[0]
            else:
                json_str = response
            
            roadmap_data = json.loads(json_str)
            
            # Ensure required fields
            roadmap_data["user_id"] = "ai_generated"
            roadmap_data["current_level"] = current_level
            roadmap_data["target_role"] = target_role
            roadmap_data["created_at"] = datetime.now().isoformat()
            roadmap_data["updated_at"] = datetime.now().isoformat()
            
            return roadmap_data
            
        except Exception as e:
            print(f"Error parsing roadmap response: {e}")
            return self._create_mock_roadmap(current_level, target_role, [])
    
    def _create_roadmap_with_groq(self, current_level: int, target_role: str, user_skills: List[Dict]) -> Dict:
        """Create roadmap using Groq directly"""
        try:
            prompt = f"""
            Create a comprehensive learning roadmap for a user at level {current_level} 
            targeting the role of {target_role}.
            
            Current Skills: {json.dumps(user_skills, indent=2)}
            
            Generate a complete roadmap with:
            1. Skill gap analysis
            2. Learning milestones
            3. Time estimates
            4. Resource recommendations
            5. Success metrics
            
            Return the roadmap in a structured JSON format.
            """
            
            response = groq.chat.completions.create(
                model="llama3-8b-8192",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7
            )
            
            return self._parse_roadmap_response(response.choices[0].message.content, current_level, target_role)
            
        except Exception as e:
            print(f"Error with Groq: {e}")
            return self._create_mock_roadmap(current_level, target_role, user_skills)

# Example usage
if __name__ == "__main__":
    # Test the agent
    agent = RoadmapGenerationAgent()
    
    # Mock user data
    user_skills = [
        {"name": "Python", "level": 3, "category": "programming"},
        {"name": "Git", "level": 2, "category": "tools"}
    ]
    
    # Create roadmap
    roadmap = agent.create_learning_roadmap(2, "software_engineer", user_skills)
    print("Generated Roadmap:")
    print(json.dumps(roadmap, indent=2))
    
    # Generate milestones
    milestones = agent.generate_milestones(roadmap)
    print(f"\nGenerated {len(milestones)} milestones")
    
    # Suggest next skills
    suggestions = agent.suggest_next_skills({"completed_milestones": 2, "current_skills": user_skills})
    print(f"\nSkill suggestions: {suggestions}") 