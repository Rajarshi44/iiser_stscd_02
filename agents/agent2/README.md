# Agent2 - Roadmap Generation & Repository Creation

## 🎯 Overview

Agent2 combines two powerful AI agents to create comprehensive learning experiences:

1. **Roadmap Generation Agent** - Creates personalized learning roadmaps
2. **Repository Creation Agent** - Generates AI-powered coding projects and issues

## 🚀 Features

### Roadmap Generation Agent
- **Personalized Learning Paths**: Creates custom roadmaps based on user skills and goals
- **Milestone Generation**: Breaks down learning into achievable milestones
- **Skill Gap Analysis**: Identifies areas for improvement
- **Progress Tracking**: Updates roadmaps based on completed projects
- **Next Skill Suggestions**: Recommends what to learn next

### Repository Creation Agent
- **AI-Generated Projects**: Creates engaging coding projects based on skill level
- **Coding Issues**: Generates realistic coding challenges and tasks
- **Project Validation**: Ensures projects match user capabilities
- **GitHub Integration**: Ready for GitHub issue creation
- **Portfolio Projects**: Generates showcase-worthy projects

## 🛠️ Installation

```bash
cd agents/agent2
pip install -r requirements.txt
```

## 🔑 Environment Variables

Create a `.env` file in the `agents/agent2` directory:

```env
# Groq API Key (required for AI features - free tier available)
GROQ_API_KEY=your_groq_api_key_here

# GitHub Token (optional, for GitHub integration)
GITHUB_TOKEN=your_github_token_here
```

## 📖 Usage

### Basic Usage

```python
from main import Agent2Integration

# Initialize the integration
integration = Agent2Integration()

# Create a complete learning path
learning_path = integration.create_complete_learning_path(
    user_id="user123",
    current_level=2,
    target_role="software_engineer",
    user_skills=[
        {"name": "Python", "level": 2, "category": "programming"},
        {"name": "JavaScript", "level": 1, "category": "programming"}
    ]
)

# Generate a portfolio project
portfolio = integration.generate_portfolio_project(
    user_id="user123",
    skill_level=2,
    focus_areas=["Python", "Web Development"]
)
```

### Individual Agents

#### Roadmap Generation Agent

```python
from roadmap_agent import RoadmapGenerationAgent

agent = RoadmapGenerationAgent()

# Create learning roadmap
roadmap = agent.create_learning_roadmap(2, "software_engineer", user_skills)

# Generate milestones
milestones = agent.generate_milestones(roadmap)

# Suggest next skills
next_skills = agent.suggest_next_skills(current_progress)

# Update roadmap progress
updated_roadmap = agent.update_roadmap_progress(completed_projects, current_roadmap)
```

#### Repository Creation Agent

```python
from repository_agent import RepositoryCreationAgent

agent = RepositoryCreationAgent()

# Create project repository
project = agent.create_project_repository(2, ["JavaScript", "React"])

# Generate coding issues
issues = agent.generate_coding_issues("intermediate", ["React", "Node.js"])

# Validate project requirements
validation = agent.validate_project_requirements(user_skills, "Web Application")
```

## 🎯 Core Functions Implemented

### Roadmap Generation Agent ✅
- ✅ `create_learning_roadmap(current_level, target_role) -> roadmap`
- ✅ `generate_milestones(roadmap) -> milestone_list`
- ✅ `suggest_next_skills(current_progress) -> skill_recommendations`
- ✅ `update_roadmap_progress(completed_projects) -> updated_roadmap`

### Repository & Issue Creation Agent ✅
- ✅ `create_project_repository(user_level, skill_focus) -> repo_data`
- ✅ `generate_coding_issues(difficulty_level, tech_stack) -> issue_list`
- ✅ `create_github_issues(repo, issues) -> created_issues`
- ✅ `validate_project_requirements(user_skills, project_type) -> validation`

## 🔧 Architecture

### LangChain Integration
- Uses LangChain agents with OpenAI functions
- Tool-based architecture for modular functionality
- Memory management for conversation context
- Fallback mechanisms when AI is unavailable

### AI Models
- **Primary**: Groq Llama3-8b-8192 (via LangChain) - Free tier available
- **Fallback**: Groq API direct calls
- **Mock**: Rule-based fallback when AI unavailable

### Data Structures
- **Milestone**: Learning milestones with completion criteria
- **LearningRoadmap**: Complete learning path structure
- **ProjectRepository**: Project specifications and tech stack
- **CodingIssue**: Individual coding challenges and tasks

## 🧪 Testing

Run the example usage:

```bash
cd agents/agent2
python example_usage.py
```

This will:
1. Test roadmap generation
2. Test repository creation
3. Test integrated workflow
4. Test progress updates
5. Save results to `agent2_example_results.json`

## 📊 Example Output

### Learning Roadmap
```json
{
  "user_id": "user123",
  "current_level": 2,
  "target_role": "software_engineer",
  "milestones": [
    {
      "title": "Foundation Skills",
      "description": "Build core programming fundamentals",
      "skills_covered": ["Python", "Git", "Basic Algorithms"],
      "difficulty": "beginner",
      "estimated_time": "4-6 weeks"
    }
  ],
  "total_duration": "10-14 weeks",
  "difficulty_curve": "gradual"
}
```

### Project Repository
```json
{
  "name": "weather-dashboard-2",
  "description": "A weather dashboard project to practice JavaScript and React",
  "tech_stack": ["React", "Node.js", "OpenWeather API"],
  "difficulty_level": "intermediate",
  "estimated_time": "4-6 weeks",
  "learning_objectives": ["Master React", "API Integration", "State Management"]
}
```

### Coding Issues
```json
{
  "title": "Setup Project Environment",
  "description": "Set up the development environment and project structure",
  "difficulty": "intermediate",
  "estimated_time": "1-2 hours",
  "skills_required": ["Git", "Package Management"],
  "acceptance_criteria": ["Project runs locally", "All dependencies installed"]
}
```

## 🚀 Integration with Backend

The agents are designed to integrate with the main backend:

1. **CV Analysis Route**: Uses roadmap generation for skill-based learning paths
2. **Project Generation**: Creates AI-powered projects for users
3. **Progress Tracking**: Updates user progress and suggests next steps
4. **Portfolio Building**: Generates showcase projects for career advancement

## 🔮 Future Enhancements

- **Multi-language Support**: Support for different programming languages
- **Advanced AI Models**: Integration with Claude, Gemini, or local models
- **GitHub Actions**: Automated project setup and CI/CD
- **Learning Analytics**: Track learning patterns and optimize paths
- **Community Features**: Share and rate learning paths

## 🐛 Troubleshooting

### Common Issues

1. **Groq API Key Missing**
   - Set `GROQ_API_KEY` in `.env` file
   - Get free API key from [Groq Console](https://console.groq.com/)
   - Agents will fall back to mock responses

2. **LangChain Import Errors**
   - Install dependencies: `pip install -r requirements.txt`
   - Check Python version compatibility

3. **GitHub Integration Issues**
   - Set `GITHUB_TOKEN` in `.env` file
   - Ensure token has appropriate permissions

### Fallback Mode

When AI services are unavailable, agents automatically switch to:
- Rule-based skill analysis
- Pre-defined project templates
- Mock milestone generation
- Basic validation logic

## 📝 License

This project is part of IISER StatusCode 02 Hackathon Project.

## 🤝 Contributing

For hackathon purposes, this is a demonstration of:
- LangChain agentic AI implementation
- OpenAI API integration
- Modular agent architecture
- Fallback mechanisms
- Comprehensive learning path generation

---

**Built with ❤️ for IISER StatusCode 02 Hackathon** 