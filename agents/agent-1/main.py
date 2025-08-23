#!/usr/bin/env python3
"""
CV Analysis Agent - IISER StatusCode 02
Parses CV, analyzes skills, and generates personalized roadmaps using Gemini LLM
"""

import os
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
import argparse
from dataclasses import dataclass
from datetime import datetime

# Import required libraries
try:
    from dotenv import load_dotenv
    load_dotenv()  # Load environment variables from .env file
    DOTENV_AVAILABLE = True
except ImportError:
    DOTENV_AVAILABLE = False
    print("Warning: python-dotenv not available. Please install with: pip install python-dotenv")

try:
    import google.generativeai as genai
    GENAI_AVAILABLE = True
except ImportError:
    GENAI_AVAILABLE = False
    print("Warning: google-generativeai not available. Using mock responses.")

try:
    from langchain_community.document_loaders import PyPDFLoader, TextLoader
    from langchain.text_splitter import RecursiveCharacterTextSplitter
    LANGCHAIN_AVAILABLE = True
except ImportError:
    try:
        # Fallback to older import path
        from langchain.document_loaders import PyPDFLoader, TextLoader
        from langchain.text_splitter import RecursiveCharacterTextSplitter
        LANGCHAIN_AVAILABLE = True
    except ImportError:
        LANGCHAIN_AVAILABLE = False
        print("Warning: langchain not available. Using basic text processing.")

try:
    import requests
    from bs4 import BeautifulSoup
    WEB_AVAILABLE = True
except ImportError:
    WEB_AVAILABLE = False
    print("Warning: requests/beautifulsoup4 not available. Web features disabled.")

try:
    from supabase import create_client, Client
    import psycopg2
    from psycopg2.extras import RealDictCursor
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    print("Warning: supabase-py not available. Please install with: pip install supabase psycopg2-binary")

@dataclass
class SkillLevel:
    """Represents a skill with its proficiency level"""
    name: str
    level: int  # 1-5 scale
    category: str
    description: str = ""

@dataclass
class CareerGoal:
    """Represents user's career aspirations"""
    title: str
    industry: str
    experience_level: str
    timeline: str

@dataclass
class RoadmapItem:
    """Individual item in the learning roadmap"""
    skill: str
    current_level: int
    target_level: int
    priority: str  # high, medium, low
    resources: List[str]
    estimated_time: str

class SupabaseManager:
    """Manages Supabase database operations"""
    
    def __init__(self, url: str = None, key: str = None):
        """Initialize Supabase client"""
        self.url = url or os.getenv('SUPABASE_URL')
        self.key = key or os.getenv('SUPABASE_ANON_KEY')
        
        if not self.url or not self.key:
            print("❌ Supabase credentials not found!")
            print("Please set SUPABASE_URL and SUPABASE_ANON_KEY environment variables")
            self.client = None
            return
            
        if not SUPABASE_AVAILABLE:
            print("❌ Supabase library not available!")
            self.client = None
            return
            
        try:
            self.client: Client = create_client(self.url, self.key)
            print("✅ Supabase client initialized successfully")
        except Exception as e:
            print(f"❌ Failed to initialize Supabase client: {e}")
            self.client = None
    
    def create_user(self, github_username: str, github_user_id: int, email: str = None, avatar_url: str = None) -> Optional[int]:
        """Create or get user in database"""
        if not self.client:
            return None
            
        try:
            # Check if user exists
            result = self.client.table('users').select('id').eq('github_username', github_username).execute()
            
            if result.data:
                print(f"✅ User {github_username} already exists")
                return result.data[0]['id']
            
            # Create new user
            user_data = {
                'github_username': github_username,
                'github_user_id': github_user_id,
                'email': email,
                'avatar_url': avatar_url
            }
            
            result = self.client.table('users').insert(user_data).execute()
            user_id = result.data[0]['id']
            print(f"✅ Created new user: {github_username} (ID: {user_id})")
            return user_id
            
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    def store_skills_analysis(self, user_id: int, analysis_data: Dict, skill_level: str, 
                            strengths: List[str], growth_areas: List[str], 
                            recommended_learning_path: Dict) -> bool:
        """Store user skills analysis"""
        if not self.client:
            return False
            
        try:
            data = {
                'user_id': user_id,
                'analysis_data': analysis_data,
                'skill_level': skill_level,
                'strengths': strengths,
                'growth_areas': growth_areas,
                'recommended_learning_path': recommended_learning_path
            }
            
            result = self.client.table('user_skills_analysis').insert(data).execute()
            print("✅ Skills analysis stored successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error storing skills analysis: {e}")
            return False
    
    def store_resume_data(self, user_id: int, resume_data: Dict) -> bool:
        """Store user resume data"""
        if not self.client:
            return False
            
        try:
            # Check if resume data exists for user
            existing = self.client.table('user_resume').select('id').eq('user_id', user_id).execute()
            
            data = {
                'user_id': user_id,
                'resume_data': resume_data
            }
            
            if existing.data:
                # Update existing
                result = self.client.table('user_resume').update(data).eq('user_id', user_id).execute()
                print("✅ Resume data updated successfully")
            else:
                # Insert new
                result = self.client.table('user_resume').insert(data).execute()
                print("✅ Resume data stored successfully")
            
            return True
            
        except Exception as e:
            print(f"❌ Error storing resume data: {e}")
            return False
    
    def store_agent_operation(self, user_id: int, operation_type: str, target_repository: str,
                            input_data: Dict, output_data: Dict, success: bool,
                            error_message: str = None, execution_time_ms: int = None,
                            ai_model_used: str = "gemini-2.5-flash") -> bool:
        """Log agent operation"""
        if not self.client:
            return False
            
        try:
            data = {
                'user_id': user_id,
                'operation_type': operation_type,
                'target_repository': target_repository,
                'input_data': input_data,
                'output_data': output_data,
                'success': success,
                'error_message': error_message,
                'execution_time_ms': execution_time_ms,
                'ai_model_used': ai_model_used
            }
            
            result = self.client.table('agent_operations').insert(data).execute()
            return True
            
        except Exception as e:
            print(f"❌ Error logging operation: {e}")
            return False
    
    def create_onboarding_record(self, user_id: int, uploaded_cv_url: str = None, 
                               target_role: str = None, chosen_path: str = None) -> bool:
        """Create user onboarding record"""
        if not self.client:
            return False
            
        try:
            data = {
                'user_id': user_id,
                'uploaded_cv_url': uploaded_cv_url,
                'target_role': target_role,
                'chosen_path': chosen_path,
                'onboarding_complete': True
            }
            
            result = self.client.table('user_onboarding').insert(data).execute()
            print("✅ Onboarding record created successfully")
            return True
            
        except Exception as e:
            print(f"❌ Error creating onboarding record: {e}")
            return False

class CVAnalysisAgent:
    """Main agent for CV analysis and roadmap generation"""
    
    def __init__(self, gemini_api_key: str = None, supabase_url: str = None, supabase_key: str = None):
        """Initialize the agent with Gemini API key and Supabase credentials"""
        # Get API key from environment variable or parameter
        self.gemini_api_key = gemini_api_key or os.getenv('GEMINI_API_KEY')
        
        if not self.gemini_api_key:
            print("❌ No Gemini API key found!")
            print("Please either:")
            print("1. Set GEMINI_API_KEY in your .env file")
            print("2. Pass api_key parameter when creating the agent")
            print("3. Use --api-key command line argument")
            self.model = None
        elif GENAI_AVAILABLE:
            try:
                genai.configure(api_key=self.gemini_api_key)
                self.model = genai.GenerativeModel('gemini-2.5-flash')
                print("✅ Gemini API configured successfully")
            except Exception as e:
                print(f"❌ Failed to configure Gemini API: {e}")
                self.model = None
        else:
            self.model = None
            print("Running in mock mode - Gemini API not available")
        
        # Initialize Supabase manager
        self.db = SupabaseManager(supabase_url, supabase_key)
        
        # Cache for storing analysis results
        self.cache = {
            "cv_text": "",
            "extracted_skills": [],
            "career_goals": None,
            "skill_analysis": {},
            "job_requirements": {},
            "roadmap": [],
            "user_id": None
        }
        
        # Sample job/skill database (in-memory for CLI version)
        self.job_skill_db = self._load_job_skill_database()
    
    def _load_job_skill_database(self) -> Dict[str, Dict]:
        """Load job and skill requirements database"""
        return {
            "software_engineer": {
                "required_skills": [
                    {"name": "Python", "level": 4, "category": "programming"},
                    {"name": "JavaScript", "level": 4, "category": "programming"},
                    {"name": "React", "level": 3, "category": "frontend"},
                    {"name": "Node.js", "level": 3, "category": "backend"},
                    {"name": "SQL", "level": 3, "category": "database"},
                    {"name": "Git", "level": 4, "category": "tools"},
                    {"name": "Docker", "level": 2, "category": "devops"},
                    {"name": "AWS", "level": 2, "category": "cloud"}
                ],
                "industry": "technology",
                "salary_range": "$80k-150k",
                "growth_potential": "high"
            },
            "data_scientist": {
                "required_skills": [
                    {"name": "Python", "level": 5, "category": "programming"},
                    {"name": "R", "level": 3, "category": "programming"},
                    {"name": "Machine Learning", "level": 4, "category": "ai_ml"},
                    {"name": "Statistics", "level": 4, "category": "mathematics"},
                    {"name": "SQL", "level": 4, "category": "database"},
                    {"name": "Pandas", "level": 4, "category": "data_analysis"},
                    {"name": "TensorFlow", "level": 3, "category": "ai_ml"},
                    {"name": "Tableau", "level": 3, "category": "visualization"}
                ],
                "industry": "technology",
                "salary_range": "$90k-180k",
                "growth_potential": "very_high"
            },
            "product_manager": {
                "required_skills": [
                    {"name": "Product Strategy", "level": 4, "category": "management"},
                    {"name": "Data Analysis", "level": 3, "category": "analytics"},
                    {"name": "User Research", "level": 3, "category": "research"},
                    {"name": "Agile", "level": 4, "category": "methodology"},
                    {"name": "SQL", "level": 2, "category": "database"},
                    {"name": "Wireframing", "level": 2, "category": "design"},
                    {"name": "Communication", "level": 5, "category": "soft_skills"},
                    {"name": "Leadership", "level": 4, "category": "soft_skills"}
                ],
                "industry": "technology",
                "salary_range": "$100k-200k",
                "growth_potential": "high"
            }
        }
    
    def parse_cv(self, file_path: str) -> str:
        """Parse CV from file using Gemini Vision API for PDFs or basic file reading"""
        try:
            file_extension = Path(file_path).suffix.lower()
            
            if file_extension == '.pdf':
                # Use Gemini Vision API to extract text from PDF
                cv_text = self._parse_pdf_with_gemini(file_path)
            elif file_extension in ['.txt', '.md']:
                # Basic text file reading
                with open(file_path, 'r', encoding='utf-8') as f:
                    cv_text = f.read()
            else:
                raise ValueError(f"Unsupported file format: {file_extension}. Supported: .pdf, .txt, .md")
            
            if not cv_text:
                raise ValueError("No text extracted from CV file")
            
            self.cache["cv_text"] = cv_text
            return cv_text
            
        except Exception as e:
            print(f"Error parsing CV: {e}")
            return ""
    
    def _parse_pdf_with_gemini(self, pdf_path: str) -> str:
        """Parse PDF using Gemini Vision API"""
        try:
            if not GENAI_AVAILABLE or not self.model:
                print("Gemini API not available. Please install google-generativeai and provide valid API key.")
                return ""
            
            # Upload PDF file to Gemini
            import google.generativeai as genai
            
            # Upload the PDF file
            print(f"📤 Uploading PDF to Gemini: {pdf_path}")
            uploaded_file = genai.upload_file(pdf_path)
            
            # Wait for processing
            import time
            while uploaded_file.state.name == "PROCESSING":
                print("⏳ Processing PDF...")
                time.sleep(2)
                uploaded_file = genai.get_file(uploaded_file.name)
            
            if uploaded_file.state.name == "FAILED":
                raise ValueError("PDF processing failed")
            
            # Extract text using Gemini
            prompt = """
            Please extract all text content from this CV/Resume PDF file. 
            Maintain the structure and formatting as much as possible.
            Include all sections like:
            - Personal information
            - Professional summary
            - Skills (technical and soft skills)
            - Work experience
            - Education
            - Projects
            - Certifications
            - Career objectives/goals
            
            Return the complete text content in a clean, readable format.
            """
            
            print("🔍 Extracting text using Gemini Vision...")
            response = self.model.generate_content([prompt, uploaded_file])
            
            if not response.text:
                raise ValueError("No text extracted from PDF")
            
            print("✅ PDF text extraction successful")
            
            # Clean up uploaded file
            genai.delete_file(uploaded_file.name)
            
            return response.text.strip()
            
        except Exception as e:
            print(f"Error parsing PDF with Gemini: {e}")
            # Fallback to LangChain if available
            if LANGCHAIN_AVAILABLE:
                try:
                    print("🔄 Falling back to LangChain PDF parsing...")
                    loader = PyPDFLoader(pdf_path)
                    documents = loader.load()
                    return "\n".join([doc.page_content for doc in documents])
                except Exception as fallback_error:
                    print(f"LangChain fallback also failed: {fallback_error}")
            
            return ""
    
    def extract_skills_and_goals(self, cv_text: str) -> tuple:
        """Extract skills and career goals from CV using Gemini with enhanced prompting"""
        
        enhanced_prompt = f"""
        You are an expert HR analyst and career counselor. Analyze the following CV/Resume text comprehensively and extract detailed information.

        CV Content:
        {cv_text}

        Please analyze and extract the following information with high accuracy:

        1. **Technical Skills**: Identify all technical skills mentioned, including:
           - Programming languages
           - Frameworks and libraries
           - Databases and data technologies
           - Cloud platforms and DevOps tools
           - Development tools and methodologies

        2. **Skill Proficiency Assessment**: For each skill, determine the proficiency level (1-5) based on:
           - Years of experience mentioned
           - Project complexity
           - Professional vs academic experience
           - Self-described proficiency levels (beginner, intermediate, advanced)
           - Depth of implementation described

        3. **Career Goals Analysis**: Extract career aspirations including:
           - Target job titles or roles
           - Industry preferences
           - Short-term and long-term objectives
           - Specific technologies or domains of interest

        4. **Experience Level Assessment**: Determine overall experience level based on:
           - Total years of professional experience
           - Complexity of projects handled
           - Leadership or mentoring experience
           - Educational background

        Please provide the response in the following detailed JSON format:
        {{
            "skills": [
                {{
                    "name": "skill_name",
                    "level": 1-5,
                    "category": "programming/database/frontend/backend/devops/cloud/ai_ml/data_analysis/soft_skills/tools/other",
                    "evidence": "specific evidence from CV showing this skill level",
                    "years_experience": "estimated years of experience",
                    "context": "professional/academic/personal projects"
                }}
            ],
            "career_goals": {{
                "primary_target": "main desired job title",
                "secondary_targets": ["alternative job titles"],
                "industry": "preferred industry/domain",
                "experience_level": "entry/junior/mid/senior",
                "timeline": "short_term/medium_term/long_term",
                "specific_interests": ["specific areas of interest"],
                "motivation": "reason for career direction"
            }},
            "current_profile": {{
                "total_experience_years": "number",
                "seniority_level": "entry/junior/mid/senior",
                "primary_domains": ["main areas of expertise"],
                "education_level": "degree level and field",
                "strongest_skills": ["top 5 skills"],
                "career_progression": "trajectory analysis"
            }},
            "skill_gaps_identified": [
                {{
                    "target_role": "role name",
                    "missing_skills": ["skills needed"],
                    "weak_areas": ["skills to improve"]
                }}
            ]
        }}

        Be thorough and evidence-based in your analysis. Consider context clues like project descriptions, responsibilities, and achievements to accurately assess skill levels.
        """
        
        try:
            if GENAI_AVAILABLE and self.model:
                print("🧠 Performing deep CV analysis with Gemini...")
                response = self.model.generate_content(enhanced_prompt)
                
                # Clean and parse JSON response
                response_text = response.text.strip()
                # Remove markdown code blocks if present
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                
                result = json.loads(response_text)
                print("✅ Detailed analysis completed")
                
            else:
                # Enhanced mock analysis
                print("⚠️  Using enhanced mock analysis (Gemini not available)")
                result = self._enhanced_mock_analysis(cv_text)
            
            # Store in cache with enhanced structure
            self.cache["extracted_skills"] = result.get("skills", [])
            self.cache["current_profile"] = result.get("current_profile", {})
            self.cache["skill_gaps_identified"] = result.get("skill_gaps_identified", [])
            
            career_goal_data = result.get("career_goals", {})
            self.cache["career_goals"] = CareerGoal(
                title=career_goal_data.get("primary_target", ""),
                industry=career_goal_data.get("industry", ""),
                experience_level=career_goal_data.get("experience_level", ""),
                timeline=career_goal_data.get("timeline", "")
            )
            
            # Print extracted insights
            self._print_extraction_summary(result)
            
            return result.get("skills", []), self.cache["career_goals"]
            
        except Exception as e:
            print(f"Error extracting skills: {e}")
            print("Falling back to basic extraction...")
            return self._basic_skill_extraction(cv_text)
    
    def _enhanced_mock_analysis(self, cv_text: str) -> Dict:
        """Enhanced mock analysis with better pattern recognition"""
        cv_lower = cv_text.lower()
        
        # Enhanced skill patterns with context analysis
        skill_patterns = {
            "python": {"name": "Python", "category": "programming", "base_level": 3},
            "javascript": {"name": "JavaScript", "category": "programming", "base_level": 4},
            "java": {"name": "Java", "category": "programming", "base_level": 2},
            "react": {"name": "React", "category": "frontend", "base_level": 3},
            "node.js": {"name": "Node.js", "category": "backend", "base_level": 3},
            "mysql": {"name": "MySQL", "category": "database", "base_level": 3},
            "mongodb": {"name": "MongoDB", "category": "database", "base_level": 2},
            "git": {"name": "Git", "category": "tools", "base_level": 4},
            "docker": {"name": "Docker", "category": "devops", "base_level": 2},
            "aws": {"name": "AWS", "category": "cloud", "base_level": 2},
            "pandas": {"name": "Pandas", "category": "data_analysis", "base_level": 2},
            "numpy": {"name": "NumPy", "category": "data_analysis", "base_level": 2},
            "machine learning": {"name": "Machine Learning", "category": "ai_ml", "base_level": 2},
            "sql": {"name": "SQL", "category": "database", "base_level": 3}
        }
        
        detected_skills = []
        for skill_key, skill_info in skill_patterns.items():
            if skill_key in cv_lower:
                # Enhanced level assessment based on context
                level = skill_info["base_level"]
                evidence = "Mentioned in CV"
                years_exp = "1-2"
                context = "professional"
                
                # Adjust based on experience indicators
                if any(word in cv_lower for word in ["advanced", "expert", "senior"]) and skill_key in cv_lower:
                    level = min(5, level + 1)
                    evidence = "Advanced level mentioned"
                elif any(word in cv_lower for word in ["beginner", "basic", "learning"]) and skill_key in cv_lower:
                    level = max(1, level - 1)
                    evidence = "Beginner level mentioned"
                    
                # Assess years of experience
                if "years" in cv_lower:
                    if "3 years" in cv_lower or "three years" in cv_lower:
                        years_exp = "3"
                        level = min(5, level + 1)
                    elif "5 years" in cv_lower or "five years" in cv_lower:
                        years_exp = "5+"
                        level = min(5, level + 2)
                
                detected_skills.append({
                    "name": skill_info["name"],
                    "level": level,
                    "category": skill_info["category"],
                    "evidence": evidence,
                    "years_experience": years_exp,
                    "context": context
                })
        
        # Enhanced career goal detection
        career_title = "Software Developer"
        industry = "technology"
        experience_level = "mid"
        timeline = "medium_term"
        specific_interests = ["web development"]
        
        if any(term in cv_lower for term in ["data scientist", "data science", "machine learning"]):
            career_title = "Data Scientist"
            specific_interests = ["machine learning", "data analysis", "AI"]
        elif "product manager" in cv_lower:
            career_title = "Product Manager"
            specific_interests = ["product strategy", "user experience"]
            
        return {
            "skills": detected_skills,
            "career_goals": {
                "primary_target": career_title,
                "secondary_targets": ["Software Engineer", "Data Analyst"],
                "industry": industry,
                "experience_level": experience_level,
                "timeline": timeline,
                "specific_interests": specific_interests,
                "motivation": "Career growth and skill development"
            },
            "current_profile": {
                "total_experience_years": "3",
                "seniority_level": "mid",
                "primary_domains": ["web development", "software engineering"],
                "education_level": "Bachelor's in Computer Science",
                "strongest_skills": [s["name"] for s in detected_skills[:5]],
                "career_progression": "Steady growth from junior to mid-level"
            },
            "skill_gaps_identified": [
                {
                    "target_role": career_title,
                    "missing_skills": ["Advanced Statistics", "Deep Learning"],
                    "weak_areas": ["Data Visualization", "Big Data Tools"]
                }
            ]
        }
    
    def _print_extraction_summary(self, result: Dict):
        """Print a summary of extracted information"""
        print("\n📋 EXTRACTION SUMMARY:")
        print("-" * 50)
        
        skills = result.get("skills", [])
        career_goals = result.get("career_goals", {})
        profile = result.get("current_profile", {})
        
        print(f"✅ Extracted {len(skills)} skills")
        print(f"🎯 Primary career target: {career_goals.get('primary_target', 'N/A')}")
        print(f"📊 Experience level: {profile.get('seniority_level', 'N/A')}")
        print(f"💼 Total experience: {profile.get('total_experience_years', 'N/A')} years")
        
        if skills:
            top_skills = sorted(skills, key=lambda x: x["level"], reverse=True)[:5]
            print(f"🏆 Top skills: {', '.join([s['name'] for s in top_skills])}")
    
    def _basic_skill_extraction(self, cv_text: str) -> tuple:
        """Basic fallback extraction method"""
        result = self._mock_skill_extraction(cv_text)
        return result.get("skills", []), CareerGoal(
            title=result.get("career_goals", {}).get("title", ""),
            industry=result.get("career_goals", {}).get("industry", ""),
            experience_level=result.get("career_goals", {}).get("experience_level", ""),
            timeline=result.get("career_goals", {}).get("timeline", "")
        )
    
    def _mock_skill_extraction(self, cv_text: str) -> Dict:
        """Mock skill extraction for when Gemini is not available"""
        cv_lower = cv_text.lower()
        
        # Common skill patterns
        skill_patterns = {
            "python": {"name": "Python", "category": "programming", "level": 3},
            "javascript": {"name": "JavaScript", "category": "programming", "level": 4},
            "java": {"name": "Java", "category": "programming", "level": 2},
            "react": {"name": "React", "category": "frontend", "level": 3},
            "node.js": {"name": "Node.js", "category": "backend", "level": 3},
            "mysql": {"name": "MySQL", "category": "database", "level": 3},
            "mongodb": {"name": "MongoDB", "category": "database", "level": 2},
            "git": {"name": "Git", "category": "tools", "level": 4},
            "docker": {"name": "Docker", "category": "devops", "level": 2},
            "aws": {"name": "AWS", "category": "cloud", "level": 2},
            "pandas": {"name": "Pandas", "category": "data_analysis", "level": 2},
            "numpy": {"name": "NumPy", "category": "data_analysis", "level": 2}
        }
        
        detected_skills = []
        for skill_key, skill_info in skill_patterns.items():
            if skill_key in cv_lower:
                # Adjust level based on context
                level = skill_info["level"]
                if "advanced" in cv_lower and skill_key in cv_lower:
                    level = min(5, level + 1)
                elif "beginner" in cv_lower and skill_key in cv_lower:
                    level = max(1, level - 1)
                
                detected_skills.append({
                    "name": skill_info["name"],
                    "level": level,
                    "category": skill_info["category"],
                    "evidence": f"Mentioned in CV"
                })
        
        # Extract career goals based on keywords
        career_title = "Software Developer"
        industry = "technology"
        experience_level = "mid"
        timeline = "medium"
        
        if "data scientist" in cv_lower or "machine learning" in cv_lower:
            career_title = "Data Scientist"
        elif "product manager" in cv_lower:
            career_title = "Product Manager"
        
        if "3 years" in cv_lower or "three years" in cv_lower:
            experience_level = "mid"
        elif "1 year" in cv_lower or "entry" in cv_lower:
            experience_level = "entry"
        elif "5 years" in cv_lower or "senior" in cv_lower:
            experience_level = "senior"
        
        return {
            "skills": detected_skills,
            "career_goals": {
                "title": career_title,
                "industry": industry,
                "experience_level": experience_level,
                "timeline": timeline
            },
            "current_experience": {
                "years": "3",
                "level": experience_level,
                "domains": ["web development", "software development"]
            }
        }
    
    def analyze_skill_gaps(self, target_job: str) -> Dict[str, Any]:
        """Analyze skill gaps for target job using RAG approach"""
        if target_job not in self.job_skill_db:
            print(f"Job '{target_job}' not found in database")
            return {}
        
        required_skills = self.job_skill_db[target_job]["required_skills"]
        user_skills = {skill["name"].lower(): skill for skill in self.cache["extracted_skills"]}
        
        skill_gaps = []
        strengths = []
        
        for req_skill in required_skills:
            skill_name = req_skill["name"].lower()
            required_level = req_skill["level"]
            
            if skill_name in user_skills:
                user_level = user_skills[skill_name]["level"]
                if user_level >= required_level:
                    strengths.append({
                        "skill": req_skill["name"],
                        "user_level": user_level,
                        "required_level": required_level,
                        "status": "sufficient"
                    })
                else:
                    skill_gaps.append({
                        "skill": req_skill["name"],
                        "user_level": user_level,
                        "required_level": required_level,
                        "gap": required_level - user_level,
                        "category": req_skill["category"]
                    })
            else:
                skill_gaps.append({
                    "skill": req_skill["name"],
                    "user_level": 0,
                    "required_level": required_level,
                    "gap": required_level,
                    "category": req_skill["category"]
                })
        
        analysis = {
            "target_job": target_job,
            "skill_gaps": skill_gaps,
            "strengths": strengths,
            "match_percentage": len(strengths) / len(required_skills) * 100 if required_skills else 0
        }
        
        self.cache["skill_analysis"] = analysis
        return analysis
    
    def generate_roadmap(self) -> List[RoadmapItem]:
        """Generate personalized learning roadmap"""
        skill_analysis = self.cache.get("skill_analysis", {})
        career_goals = self.cache.get("career_goals")
        
        if not skill_analysis or not career_goals:
            print("Missing skill analysis or career goals data")
            return []
        
        roadmap_prompt = f"""
        Based on the following skill gap analysis and career goals, create a personalized learning roadmap:
        
        Skill Gaps: {json.dumps(skill_analysis.get('skill_gaps', []))}
        Career Goal: {career_goals.title} in {career_goals.industry}
        Timeline: {career_goals.timeline}
        
        Create a roadmap with the following format for each skill:
        {{
            "roadmap": [
                {{
                    "skill": "skill_name",
                    "current_level": 0-5,
                    "target_level": 0-5,
                    "priority": "high/medium/low",
                    "estimated_time": "time estimate",
                    "resources": ["resource1", "resource2", "resource3"],
                    "milestones": ["milestone1", "milestone2"]
                }}
            ]
        }}
        
        Prioritize based on:
        - Job market demand
        - Current skill gaps
        - Learning curve difficulty
        - Career timeline
        """
        
        try:
            if GENAI_AVAILABLE and self.model:
                response = self.model.generate_content(roadmap_prompt)
                response_text = response.text.strip().replace('```json', '').replace('```', '')
                if response_text:
                    result = json.loads(response_text)
                else:
                    print("Warning: Empty response from Gemini, using mock roadmap")
                    result = self._mock_roadmap_generation(skill_analysis, career_goals)
            else:
                # Mock roadmap generation
                result = self._mock_roadmap_generation(skill_analysis, career_goals)
            
            roadmap_items = []
            for item in result.get("roadmap", []):
                roadmap_item = RoadmapItem(
                    skill=item.get("skill", ""),
                    current_level=item.get("current_level", 0),
                    target_level=item.get("target_level", 0),
                    priority=item.get("priority", "medium"),
                    resources=item.get("resources", []),
                    estimated_time=item.get("estimated_time", "")
                )
                roadmap_items.append(roadmap_item)
            
            self.cache["roadmap"] = roadmap_items
            return roadmap_items
            
        except Exception as e:
            print(f"Error generating roadmap: {e}")
            print("Falling back to mock roadmap generation...")
            try:
                result = self._mock_roadmap_generation(skill_analysis, career_goals)
                roadmap_items = []
                for item in result.get("roadmap", []):
                    roadmap_item = RoadmapItem(
                        skill=item.get("skill", ""),
                        current_level=item.get("current_level", 0),
                        target_level=item.get("target_level", 0),
                        priority=item.get("priority", "medium"),
                        resources=item.get("resources", []),
                        estimated_time=item.get("estimated_time", "")
                    )
                    roadmap_items.append(roadmap_item)
                
                self.cache["roadmap"] = roadmap_items
                return roadmap_items
            except Exception as fallback_error:
                print(f"Mock roadmap generation also failed: {fallback_error}")
                return []
    
    def _mock_roadmap_generation(self, skill_analysis: Dict, career_goals: CareerGoal) -> Dict:
        """Mock roadmap generation for when Gemini is not available"""
        roadmap = []
        
        # Generate roadmap items based on skill gaps
        for gap in skill_analysis.get("skill_gaps", []):
            priority = "high" if gap["gap"] >= 3 else "medium" if gap["gap"] >= 2 else "low"
            
            # Estimate time based on skill gap
            time_mapping = {1: "2-4 weeks", 2: "1-2 months", 3: "2-3 months", 4: "3-4 months", 5: "4-6 months"}
            estimated_time = time_mapping.get(gap["gap"], "1-2 months")
            
            # Generate resources based on skill category
            resources = self._get_mock_resources(gap["skill"], gap["category"])
            
            roadmap.append({
                "skill": gap["skill"],
                "current_level": gap["user_level"],
                "target_level": gap["required_level"],
                "priority": priority,
                "estimated_time": estimated_time,
                "resources": resources,
                "milestones": [f"Basic {gap['skill']} concepts", f"Intermediate {gap['skill']} projects", f"Advanced {gap['skill']} implementation"]
            })
        
        return {"roadmap": roadmap}
    
    def _get_mock_resources(self, skill: str, category: str) -> List[str]:
        """Get mock learning resources for a skill"""
        resource_map = {
            "Python": ["Python.org Tutorial", "Automate the Boring Stuff", "Python for Data Science Handbook"],
            "Machine Learning": ["Coursera ML Course", "Hands-On Machine Learning", "Kaggle Learn"],
            "Statistics": ["Khan Academy Statistics", "Think Stats", "Statistics for Data Science"],
            "SQL": ["SQLBolt", "W3Schools SQL", "SQL Zoo"],
            "TensorFlow": ["TensorFlow.org Tutorials", "Deep Learning with Python", "TensorFlow Developer Certificate"],
            "Pandas": ["Pandas Documentation", "Python for Data Analysis", "Kaggle Pandas Course"],
            "Tableau": ["Tableau Public Training", "Tableau Desktop Specialist", "DataCamp Tableau"],
            "R": ["R for Data Science", "Swirl R Programming", "Coursera R Programming"],
            "Docker": ["Docker Official Tutorial", "Docker for Beginners", "Docker Mastery Course"],
            "AWS": ["AWS Free Tier", "AWS Cloud Practitioner", "A Cloud Guru AWS Courses"]
        }
        
        return resource_map.get(skill, [f"{skill} Official Documentation", f"{skill} Tutorial", f"{skill} Best Practices"])
    
    def display_results(self):
        """Display analysis results in CLI format"""
        print("\n" + "="*80)
        print("CV ANALYSIS RESULTS")
        print("="*80)
        
        # Display extracted skills
        if self.cache["extracted_skills"]:
            print("\n📊 EXTRACTED SKILLS:")
            print("-" * 40)
            for skill in self.cache["extracted_skills"]:
                level_stars = "★" * skill["level"] + "☆" * (5 - skill["level"])
                print(f"  {skill['name']:<20} {level_stars} ({skill['category']})")
        
        # Display career goals
        if self.cache["career_goals"]:
            goals = self.cache["career_goals"]
            print(f"\n🎯 CAREER GOALS:")
            print("-" * 40)
            print(f"  Target Role: {goals.title}")
            print(f"  Industry: {goals.industry}")
            print(f"  Experience Level: {goals.experience_level}")
            print(f"  Timeline: {goals.timeline}")
        
        # Display skill analysis
        if self.cache["skill_analysis"]:
            analysis = self.cache["skill_analysis"]
            print(f"\n📈 SKILL GAP ANALYSIS:")
            print("-" * 40)
            print(f"  Job Match: {analysis['match_percentage']:.1f}%")
            
            if analysis["strengths"]:
                print(f"\n  ✅ STRENGTHS ({len(analysis['strengths'])} skills):")
                for strength in analysis["strengths"]:
                    print(f"    • {strength['skill']} (Level {strength['user_level']}/{strength['required_level']})")
            
            if analysis["skill_gaps"]:
                print(f"\n  ⚠️  SKILL GAPS ({len(analysis['skill_gaps'])} skills):")
                for gap in analysis["skill_gaps"]:
                    print(f"    • {gap['skill']}: Level {gap['user_level']} → {gap['required_level']} (Gap: {gap['gap']})")
        
        # Display roadmap
        if self.cache["roadmap"]:
            print(f"\n🗺️  PERSONALIZED LEARNING ROADMAP:")
            print("-" * 40)
            
            high_priority = [r for r in self.cache["roadmap"] if r.priority == "high"]
            medium_priority = [r for r in self.cache["roadmap"] if r.priority == "medium"]
            low_priority = [r for r in self.cache["roadmap"] if r.priority == "low"]
            
            for priority, items in [("HIGH PRIORITY", high_priority), ("MEDIUM PRIORITY", medium_priority), ("LOW PRIORITY", low_priority)]:
                if items:
                    print(f"\n  🔥 {priority}:")
                    for item in items:
                        print(f"    📚 {item.skill}")
                        print(f"       Level: {item.current_level} → {item.target_level}")
                        print(f"       Time: {item.estimated_time}")
                        if item.resources:
                            print(f"       Resources: {', '.join(item.resources[:3])}")
                        print()
        
        print("="*80)
        print("Analysis complete! Cache stored for future reference.")
    
    def create_test_user(self, username: str = "test_user_deba", email: str = "deba@example.com") -> Optional[int]:
        """Create a test user in the database"""
        if not self.db or not self.db.client:
            print("❌ Database not available for test user creation")
            return None
            
        import random
        github_user_id = random.randint(100000, 999999)  # Generate random GitHub ID for test
        
        user_id = self.db.create_user(
            github_username=username,
            github_user_id=github_user_id,
            email=email,
            avatar_url=f"https://github.com/{username}.png"
        )
        
        if user_id:
            self.cache["user_id"] = user_id
            print(f"✅ Test user created successfully: {username} (ID: {user_id})")
        
        return user_id
    
    def store_analysis_to_database(self, target_job: str = "software_engineer") -> bool:
        """Store complete analysis results to Supabase database"""
        if not self.db or not self.db.client:
            print("❌ Database not available")
            return False
            
        if not self.cache.get("user_id"):
            print("❌ No user ID found. Create a user first.")
            return False
            
        user_id = self.cache["user_id"]
        start_time = datetime.now()
        
        try:
            # Store resume data
            resume_data = {
                "cv_text": self.cache["cv_text"],
                "extracted_skills": self.cache["extracted_skills"],
                "career_goals": self.cache["career_goals"].__dict__ if self.cache["career_goals"] else None,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
            success = self.db.store_resume_data(user_id, resume_data)
            if not success:
                return False
            
            # Determine skill level and prepare data for skills analysis
            skill_levels = [skill.get("level", 0) for skill in self.cache["extracted_skills"]]
            avg_skill_level = sum(skill_levels) / len(skill_levels) if skill_levels else 0
            
            if avg_skill_level >= 4:
                skill_level = "advanced"
            elif avg_skill_level >= 3:
                skill_level = "intermediate"
            elif avg_skill_level >= 2:
                skill_level = "beginner"
            else:
                skill_level = "entry"
            
            # Extract strengths and growth areas
            strengths = [skill["name"] for skill in self.cache["extracted_skills"] if skill.get("level", 0) >= 4]
            growth_areas = [skill["name"] for skill in self.cache["extracted_skills"] if skill.get("level", 0) < 3]
            
            # Prepare learning path from roadmap
            learning_path = {
                "target_job": target_job,
                "roadmap_items": [item.__dict__ for item in self.cache.get("roadmap", [])],
                "priority_skills": [item.skill for item in self.cache.get("roadmap", []) if item.priority == "high"]
            }
            
            # Store skills analysis
            analysis_data = {
                "skills_summary": self.cache["extracted_skills"],
                "career_goals": self.cache["career_goals"].__dict__ if self.cache["career_goals"] else None,
                "skill_analysis": self.cache.get("skill_analysis", {}),
                "analysis_type": "comprehensive_cv_analysis"
            }
            
            success = self.db.store_skills_analysis(
                user_id=user_id,
                analysis_data=analysis_data,
                skill_level=skill_level,
                strengths=strengths,
                growth_areas=growth_areas,
                recommended_learning_path=learning_path
            )
            
            if not success:
                return False
            
            # Create onboarding record
            success = self.db.create_onboarding_record(
                user_id=user_id,
                target_role=target_job,
                chosen_path=skill_level
            )
            
            # Log the operation
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            self.db.store_agent_operation(
                user_id=user_id,
                operation_type="cv_analysis_complete",
                target_repository="local_cv_analysis",
                input_data={"target_job": target_job, "cv_file_type": "pdf"},
                output_data={
                    "skills_count": len(self.cache["extracted_skills"]),
                    "roadmap_items": len(self.cache.get("roadmap", [])),
                    "match_percentage": self.cache.get("skill_analysis", {}).get("match_percentage", 0)
                },
                success=True,
                execution_time_ms=execution_time
            )
            
            print("✅ Complete analysis stored to database successfully!")
            return True
            
        except Exception as e:
            print(f"❌ Error storing analysis to database: {e}")
            
            # Log the failed operation
            execution_time = int((datetime.now() - start_time).total_seconds() * 1000)
            self.db.store_agent_operation(
                user_id=user_id,
                operation_type="cv_analysis_complete",
                target_repository="local_cv_analysis",
                input_data={"target_job": target_job},
                output_data={},
                success=False,
                error_message=str(e),
                execution_time_ms=execution_time
            )
            
            return False
    
    def save_cache_to_file(self, filename: str = "cv_analysis_cache.json"):
        """Save analysis cache to file"""
        cache_data = {
            "timestamp": datetime.now().isoformat(),
            "cv_text": self.cache["cv_text"],
            "extracted_skills": self.cache["extracted_skills"],
            "career_goals": self.cache["career_goals"].__dict__ if self.cache["career_goals"] else None,
            "skill_analysis": self.cache["skill_analysis"],
            "roadmap": [item.__dict__ for item in self.cache["roadmap"]],
            "user_id": self.cache.get("user_id")
        }
        
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(cache_data, f, indent=2, ensure_ascii=False)
            print(f"Cache saved to: {filename}")
        except Exception as e:
            print(f"Error saving cache: {e}")


def main():
    """Main CLI interface with enhanced PDF support"""
    parser = argparse.ArgumentParser(
        description="CV Analysis Agent - IISER StatusCode 02",
        epilog="""
Examples:
  python main.py resume.pdf --target-job data_scientist --save-cache
  python main.py cv.txt --target-job software_engineer
  python demo.py  # Run interactive demo
        """,
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument("cv_file", help="Path to CV file (PDF, TXT, or MD)")
    parser.add_argument("--target-job", default="software_engineer", 
                       choices=["software_engineer", "data_scientist", "product_manager"],
                       help="Target job role for analysis (default: software_engineer)")
    parser.add_argument("--save-cache", action="store_true", 
                       help="Save analysis cache to JSON file")
    parser.add_argument("--api-key", 
                       help="Gemini API key (if not using default)")
    parser.add_argument("--supabase-url",
                       help="Supabase URL (if not using environment variable)")
    parser.add_argument("--supabase-key", 
                       help="Supabase anon key (if not using environment variable)")
    parser.add_argument("--create-test-user", action="store_true",
                       help="Create a test user and store analysis in database")
    parser.add_argument("--test-username", default="test_user_deba",
                       help="Username for test user (default: test_user_deba)")
    parser.add_argument("--verbose", "-v", action="store_true",
                       help="Enable verbose output")
    
    args = parser.parse_args()
    
    # Validate file exists
    if not os.path.exists(args.cv_file):
        print(f"❌ CV file not found: {args.cv_file}")
        return 1
    
    # Get file extension
    file_ext = Path(args.cv_file).suffix.lower()
    supported_formats = ['.pdf', '.txt', '.md']
    
    if file_ext not in supported_formats:
        print(f"❌ Unsupported file format: {file_ext}")
        print(f"Supported formats: {', '.join(supported_formats)}")
        return 1
    
    # Initialize agent with API key from environment or command line
    api_key = args.api_key or os.getenv('GEMINI_API_KEY')
    
    if not api_key:
        print("❌ No Gemini API key provided!")
        print("Please either:")
        print("1. Set GEMINI_API_KEY in your .env file")
        print("2. Use --api-key command line argument")
        print("3. Set GEMINI_API_KEY environment variable")
        return 1
    
    # Get Supabase credentials
    supabase_url = args.supabase_url or os.getenv('SUPABASE_URL')
    supabase_key = args.supabase_key or os.getenv('SUPABASE_ANON_KEY')
    
    agent = CVAnalysisAgent(api_key, supabase_url, supabase_key)
    
    print("🤖 CV Analysis Agent - IISER StatusCode 02")
    print("="*60)
    print(f"📄 Input: {args.cv_file} ({file_ext.upper()})")
    print(f"🎯 Target Role: {args.target_job.replace('_', ' ').title()}")
    print("="*60)
    
    # Step 1: Parse CV with enhanced feedback
    print(f"� Step 1: Parsing CV...")
    if file_ext == '.pdf':
        print("🔍 Using Gemini Vision API for PDF text extraction...")
    else:
        print("📝 Reading text file...")
        
    cv_text = agent.parse_cv(args.cv_file)
    if not cv_text:
        print("❌ Failed to parse CV")
        return 1
        
    print("✅ CV parsed successfully")
    if args.verbose:
        print(f"   📊 Extracted {len(cv_text):,} characters")
        print(f"   📝 Preview: {cv_text[:150]}...")
    
    # Step 2: Extract skills with enhanced analysis
    print(f"\n🧠 Step 2: Analyzing skills and career goals...")
    if file_ext == '.pdf':
        print("🔬 Using advanced Gemini analysis for comprehensive skill extraction...")
    
    skills, goals = agent.extract_skills_and_goals(cv_text)
    if not skills:
        print("❌ Failed to extract skills")
        return 1
        
    print(f"✅ Analysis complete - extracted {len(skills)} skills")
    if args.verbose and goals:
        print(f"   🎯 Career Target: {goals.title}")
        print(f"   📈 Experience Level: {goals.experience_level}")
    
    # Step 3: Skill gap analysis
    print(f"\n📊 Step 3: Analyzing skill gaps for '{args.target_job}'...")
    skill_analysis = agent.analyze_skill_gaps(args.target_job)
    if not skill_analysis:
        print("❌ Failed to analyze skill gaps")
        return 1
        
    match_percentage = skill_analysis['match_percentage']
    print(f"✅ Gap analysis complete - {match_percentage:.1f}% job match")
    
    if args.verbose:
        print(f"   ✅ Strengths: {len(skill_analysis['strengths'])} skills")
        print(f"   ⚠️  Gaps: {len(skill_analysis['skill_gaps'])} skills")
    
    # Step 4: Generate roadmap
    print(f"\n🗺️  Step 4: Generating personalized roadmap...")
    roadmap = agent.generate_roadmap()
    if not roadmap:
        print("❌ Failed to generate roadmap")
        return 1
        
    print(f"✅ Roadmap generated with {len(roadmap)} learning items")
    
    # Priority breakdown
    priorities = {"high": 0, "medium": 0, "low": 0}
    for item in roadmap:
        priorities[item.priority] += 1
    
    if args.verbose:
        for priority, count in priorities.items():
            if count > 0:
                print(f"   {priority.upper()}: {count} skills")
    
    # Step 5: Display comprehensive results
    print(f"\n" + "="*60)
    print("📋 ANALYSIS RESULTS")
    print("="*60)
    agent.display_results()
    
    # Step 6: Create test user and store in database if requested
    if args.create_test_user:
        print(f"\n🗄️  Step 6: Creating test user and storing in database...")
        user_id = agent.create_test_user(args.test_username)
        if user_id:
            success = agent.store_analysis_to_database(args.target_job)
            if success:
                print(f"✅ Complete analysis stored in Supabase database!")
            else:
                print(f"❌ Failed to store analysis in database")
        else:
            print(f"❌ Failed to create test user")
    
    # Step 7: Save cache if requested
    if args.save_cache:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"cv_analysis_{args.target_job}_{timestamp}.json"
        agent.save_cache_to_file(filename)
        print(f"\n💾 Analysis saved to: {filename}")
    
    # Success summary
    print(f"\n🎉 CV analysis completed successfully!")
    
    # Database summary
    if args.create_test_user and agent.cache.get("user_id"):
        print(f"📊 Database: User ID {agent.cache['user_id']} created with complete analysis")
    
    # Recommendations
    if match_percentage < 60:
        print(f"💡 Recommendation: Focus on high-priority skills to improve job match")
    elif match_percentage < 80:
        print(f"💡 Recommendation: You're on the right track! Work on medium-priority gaps")
    else:
        print(f"💡 Recommendation: Excellent match! Focus on advanced skills for competitive edge")
    
    return 0


if __name__ == "__main__":
    main()