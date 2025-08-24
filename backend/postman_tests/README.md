# Postman API Tests for AI-Powered Roadmap & GitHub Repository Creation

This directory contains Postman test collections for testing the **intelligent roadmap generation** and **GitHub repository creation** APIs with cookie-based authentication.

## 🎯 System Overview

Our API provides:
- **Intelligent Roadmap Generation**: AI-powered learning paths that only require a target role
- **GitHub Repository Creation**: Automatic project structure with milestones, issues, and learning materials
- **Cookie-Based Authentication**: Seamless integration with GitHub OAuth frontend
- **Smart Data Gathering**: Automatically analyzes user skills from GitHub activity

## Files Included

1. **Roadmap_Repository_API_Tests.postman_collection.json** - Complete test collection with demo routes
2. **Roadmap_API_Environment.postman_environment.json** - Environment variables
3. **README.md** - This documentation

## Test Collection Overview

The test collection covers the new **demo routes** with cookie authentication:

### 1. Authentication Tests
- **Demo User Authentication** - Validates GitHub cookie-based auth
- **User Profile Validation** - Retrieves user database information

### 2. Intelligent Roadmap Generation Tests
- **Simple Roadmap Generation** - Only requires target role (recommended)
- **Advanced Roadmap Generation** - Custom skills and preferences override
- **Multiple Career Paths** - Tests different target roles
- **Error Handling** - Invalid requests and missing data

### 3. GitHub Repository Creation Tests
- **Create Repository from Roadmap** - Full project structure generation
- **Custom Project Names** - User-defined repository names
- **Public/Private Repositories** - Visibility controls
- **Milestone Focus** - Specific learning milestone emphasis
- **Project Structure Validation** - Folders, files, and issues creation

### 4. Project Management Tests
- **List All Projects** - Both roadmaps and repositories
- **Project Status Tracking** - Planning vs Active states
- **Repository Integration** - GitHub URL and project metadata

### 5. End-to-End Workflow Tests
- **Complete Learning Journey** - Roadmap → Repository → Project tracking
- **Career Path Variations** - Different roles and skill levels

## Setup Instructions

### 1. Import Collection and Environment
1. Open Postman
2. Import `Roadmap_Repository_API_Tests.postman_collection.json`
3. Import `Roadmap_API_Environment.postman_environment.json`
4. Select the "Roadmap API Environment" in Postman

### 2. Cookie-Based Authentication Setup
The API uses **cookie-based authentication** with GitHub OAuth integration:

1. **Frontend Authentication (Required)**
   - Open your browser and navigate to `http://localhost:3000`
   - Complete the GitHub OAuth flow in the frontend
   - The system automatically sets `github_token` cookie
   
2. **Copy Cookies to Postman**
   - Open browser Developer Tools (F12) → Application/Storage → Cookies
   - Copy the `github_token` cookie value from `localhost:3000`
   - In Postman, go to Cookies → Manage Cookies → Add Cookie:
     ```
     Domain: localhost
     Path: /
     Name: github_token
     Value: [your-github-token]
     ```

### 3. Environment Variables Setup
Update these variables in your Postman environment:
- `backend_url`: `http://localhost:5000` (Flask backend)
- `frontend_url`: `http://localhost:3000` (Next.js frontend)
- `demo_target_role`: `full_stack_developer` (for simple tests)

### 4. Running Tests

#### 🚀 Quick Start (Recommended)
1. **Authentication** → Run demo user authentication
2. **Simple Roadmap** → Generate roadmap with just target role
3. **Create Repository** → Build GitHub project from roadmap
4. **List Projects** → View all generated content

#### Test Execution Order
For comprehensive testing, run in this sequence:
1. **Authentication Tests** → Validate cookie-based auth
2. **Simple Roadmap Generation** → Test intelligent AI system
3. **Repository Creation** → Test GitHub integration
4. **Project Management** → Verify data persistence

#### Individual Test Categories
Each test category can run independently thanks to intelligent data gathering.

## 🔗 API Endpoints Documentation

### Demo Routes (Cookie Authentication)

#### 1. Intelligent Roadmap Generation
```http
POST /demo/roadmap/generate
Content-Type: application/json
Cookie: github_token=[your-token]
```

**Simple Request (Recommended):**
```json
{
  "target_role": "full_stack_developer"
}
```

**Advanced Request (Optional Overrides):**
```json
{
  "target_role": "ai_engineer",
  "user_skills": [
    {"name": "Python", "level": 8},
    {"name": "Machine Learning", "level": 6}
  ],
  "current_level": 3,
  "preferences": {
    "learning_style": "project_based",
    "difficulty": "advanced",
    "focus_areas": ["deep_learning", "nlp"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "roadmap_id": 123,
  "roadmap": {
    "milestones": [
      {
        "title": "Foundation Setup",
        "description": "Master development environment and basics",
        "skills": ["Git", "JavaScript", "HTML/CSS"],
        "projects": ["Portfolio Website", "Todo App"],
        "timeline": "2-4 weeks"
      }
    ],
    "tech_stack": ["React", "Node.js", "PostgreSQL"],
    "learning_objectives": ["Build full-stack applications", "API development"],
    "estimated_duration": "3-6 months",
    "difficulty_level": "Intermediate"
  },
  "intelligence": {
    "skills_analyzed": 15,
    "github_repos_reviewed": 8,
    "personalization_score": 0.87
  }
}
```

#### 2. GitHub Repository Creation
```http
POST /demo/projects/create
Content-Type: application/json
Cookie: github_token=[your-token]
```

**Request:**
```json
{
  "roadmap_id": 123,
  "project_name": "my-fullstack-journey",
  "milestone_focus": 1,
  "make_public": true
}
```

**Response:**
```json
{
  "success": true,
  "project": {
    "project_id": 456,
    "repository": {
      "html_url": "https://github.com/username/my-fullstack-journey",
      "clone_url": "https://github.com/username/my-fullstack-journey.git",
      "name": "my-fullstack-journey",
      "private": false
    },
    "project_structure": {
      "folders": [
        "01-foundation/portfolio-website/",
        "02-backend/todo-api/",
        "03-database/user-management/",
        "resources/guides/",
        "resources/templates/"
      ],
      "files": [
        "README.md",
        "ROADMAP.md",
        "GETTING_STARTED.md"
      ]
    },
    "learning_issues": [
      {
        "title": "🎯 Milestone 1: Foundation Setup",
        "number": 1,
        "labels": ["learning", "milestone", "foundation"],
        "body": "Complete portfolio website with HTML/CSS/JavaScript..."
      }
    ]
  },
  "next_steps": [
    "Clone your repository locally",
    "Review the generated roadmap",
    "Start with Milestone 1 issues",
    "Track progress in GitHub Projects"
  ]
}
```

#### 3. Project Management
```http
GET /demo/projects/list
Cookie: github_token=[your-token]
```

**Response:**
```json
{
  "success": true,
  "projects": [
    {
      "id": 456,
      "name": "my-fullstack-journey",
      "status": "active",
      "type": "repository",
      "target_role": "full_stack_developer",
      "repository_url": "https://github.com/username/my-fullstack-journey",
      "created_at": "2025-08-24T10:30:00Z",
      "progress": {
        "completed_milestones": 0,
        "total_milestones": 4,
        "completion_percentage": 0
      }
    },
    {
      "id": 123,
      "name": "AI Engineer Roadmap",
      "status": "planning",
      "type": "roadmap",
      "target_role": "ai_engineer",
      "created_at": "2025-08-24T09:15:00Z",
      "milestones_count": 5
    }
  ]
}
```

## 🧪 Test Assertions & Validation

Each test includes comprehensive validation:

### Intelligence Verification
- **AI Content Quality** - Validates meaningful roadmap generation
- **Personalization Score** - Ensures user-specific recommendations
- **GitHub Analysis** - Verifies skill detection from repositories
- **Smart Fallbacks** - Tests graceful degradation when data is limited

### Data Flow Testing
- **Cookie Authentication** - Validates GitHub token usage
- **Database Integration** - Tests Supabase data persistence
- **GitHub API Integration** - Repository and issue creation validation
- **Cross-Service Communication** - Frontend-backend data consistency

### Business Logic Validation
- **Roadmap Quality** - Ensures logical skill progression
- **Project Structure** - Validates meaningful folder organization
- **Learning Issues** - Tests educational issue generation
- **Progress Tracking** - Milestone completion validation

### Error Handling
- **Authentication Failures** - Missing or invalid cookies
- **AI Service Errors** - OpenAI API failures and fallbacks
- **GitHub API Limits** - Rate limiting and error responses
- **Data Validation** - Invalid input handling

## 📊 Environment Variables

The environment includes these dynamic variables:

### Authentication
- `github_token` - GitHub OAuth token from cookie
- `user_id` - Database user ID (auto-populated)

### API Configuration
- `backend_url` - Flask backend URL (http://localhost:5000)
- `frontend_url` - Next.js frontend URL (http://localhost:3000)

### Test Data
- `roadmap_id` - Generated roadmap ID (auto-set)
- `project_id` - Created project ID (auto-set)
- `repo_url` - GitHub repository URL (auto-set)
- `timestamp` - Unique test identifiers

### Career Paths
- `target_roles` - Supported roles: `full_stack_developer`, `ai_engineer`, `data_scientist`, `devops_engineer`, `mobile_developer`

## 🎯 Intelligence Features Tested

### Skill Analysis
- **GitHub Repository Scanning** - Language detection and project complexity
- **Commit Pattern Analysis** - Activity levels and coding habits
- **Technology Stack Detection** - Frameworks and tools usage

### Personalization
- **Experience Level Inference** - Based on repository quality and complexity
- **Learning Style Adaptation** - Project-based vs theoretical approaches
- **Progress Tracking** - Milestone completion and skill advancement

### AI Integration
- **OpenAI GPT-4o-mini** - Advanced roadmap generation
- **Fallback Systems** - Template-based generation when AI fails
- **Content Quality Assurance** - Validation of educational content

## 📈 Sample Test Results

### Intelligent Roadmap Generation
```json
{
  "success": true,
  "roadmap_id": 123,
  "intelligence": {
    "skills_analyzed": 15,
    "github_repos_reviewed": 8,
    "personalization_score": 0.87,
    "ai_generated": true,
    "fallback_used": false
  },
  "roadmap": {
    "personalized_for": "intermediate_developer",
    "focus_areas": ["backend_apis", "frontend_frameworks", "databases"],
    "estimated_duration": "4-6 months",
    "milestones": 5,
    "projects": 12
  }
}
```

### GitHub Repository Creation
```json
{
  "success": true,
  "project": {
    "repository": {
      "name": "fullstack-learning-journey-20250824",
      "private": false,
      "size": 156
    },
    "structure": {
      "folders_created": 8,
      "files_generated": 15,
      "issues_created": 5,
      "milestones_set": 4
    },
    "automation": {
      "readme_generated": true,
      "roadmap_embedded": true,
      "learning_issues": true,
      "project_board": true
    }
  }
}
```

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

#### 1. 🔐 Authentication Problems
```
❌ 401 Unauthorized - Missing or invalid cookies
```
**Solution:**
- Complete GitHub OAuth in frontend first (`http://localhost:3000`)
- Copy `github_token` cookie from browser to Postman
- Verify cookie domain is set to `localhost` (not `localhost:5000`)

#### 2. 🤖 AI Service Issues
```
❌ 503 Service Unavailable - OpenAI API failure
```
**Solution:**
- Check `OPENAI_API_KEY` environment variable in backend
- Verify API key has sufficient credits
- System automatically falls back to template generation

#### 3. 🐙 GitHub API Problems
```
❌ 422 Repository already exists
❌ 403 API rate limit exceeded
```
**Solution:**
- Use unique project names with timestamps
- Check GitHub personal access token permissions
- Wait for rate limit reset (usually 1 hour)

#### 4. 🗄️ Database Connection Issues
```
❌ 500 Internal Server Error - Supabase connection failed
```
**Solution:**
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in backend environment
- Check database connection in backend logs
- Ensure user exists in database (run frontend OAuth first)

#### 5. ⚡ Network Timeouts
```
❌ Request timeout after 30 seconds
```
**Solution:**
- AI roadmap generation: 15-45 seconds (normal)
- Repository creation: 10-30 seconds (normal)
- Increase Postman timeout to 60 seconds for these operations

### Backend Server Requirements

Ensure your backend server (`http://localhost:5000`) is running with:

#### Environment Variables
```bash
# AI Service
OPENAI_API_KEY=your_openai_api_key

# Database
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# GitHub Integration
GITHUB_CLIENT_ID=your_github_oauth_app_id
GITHUB_CLIENT_SECRET=your_github_oauth_app_secret

# CORS
FRONTEND_URL=http://localhost:3000
```

#### Python Dependencies
```bash
pip install -r requirements.txt
```

#### Services Status Check
```python
# Test in Python terminal
from app.services.supabase_client import get_supabase_client
from openai import OpenAI

# Test Supabase
supabase = get_supabase_client()
print("Supabase:", "✓ Connected" if supabase else "✗ Failed")

# Test OpenAI
client = OpenAI()
print("OpenAI:", "✓ Connected" if client else "✗ Failed")
```

## 🧹 Test Data Management

### Repository Cleanup
Tests create real GitHub repositories. To manage them:

1. **Identify Test Repositories**
   - Look for repos with timestamp suffixes: `project-name-20250824103045`
   - Check for repos with "learning" or "roadmap" in the name

2. **Automated Cleanup Script**
   ```bash
   # Delete test repositories (be careful!)
   curl -X DELETE \
     -H "Authorization: token your_github_token" \
     "https://api.github.com/repos/username/repo-name"
   ```

3. **Manual Cleanup**
   - Visit your GitHub repositories page
   - Delete any test repositories you don't need

### Database Cleanup
```sql
-- Clean test data (run in Supabase SQL editor)
DELETE FROM roadmaps WHERE title LIKE '%Test%';
DELETE FROM projects WHERE name LIKE '%test%';
```

## 🔄 Advanced Testing Scenarios

### 1. Career Path Variations
Test different target roles and skill combinations:
```json
{
  "target_role": "ai_engineer",
  "preferences": {
    "focus_areas": ["computer_vision", "nlp", "deep_learning"]
  }
}
```

### 2. Experience Level Testing
```json
{
  "target_role": "data_scientist", 
  "current_level": 4,  // Advanced level
  "preferences": {
    "difficulty": "expert"
  }
}
```

### 3. Milestone-Focused Projects
```json
{
  "roadmap_id": 123,
  "milestone_focus": 2,  // Focus on specific milestone
  "project_name": "milestone-2-deep-dive"
}
```

## 🔧 Continuous Integration

### Newman CLI Integration
Run tests in CI/CD pipelines:
```bash
# Install Newman
npm install -g newman

# Run collection
newman run Roadmap_Repository_API_Tests.postman_collection.json \
  -e Roadmap_API_Environment.postman_environment.json \
  --timeout 60000 \
  --reporter cli,json

# With custom backend URL
newman run collection.json \
  -e environment.json \
  --env-var "backend_url=https://api.yourapp.com"
```

### GitHub Actions Example
```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run Postman Tests
        run: |
          newman run backend/postman_tests/collection.json \
            -e backend/postman_tests/environment.json \
            --reporters cli
```

## 📞 Support & Debugging

### Log Locations
- **Backend Logs**: Check Flask console output
- **Frontend Logs**: Browser console and Network tab
- **Database Logs**: Supabase dashboard → Logs
- **GitHub API**: Rate limit headers in response

### Debug Mode
Enable detailed logging in backend:
```python
# In app/__init__.py
app.config['DEBUG'] = True

# In routes
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Performance Monitoring
- **Roadmap Generation**: 15-45 seconds (AI processing)
- **Repository Creation**: 10-30 seconds (GitHub API calls)
- **Project Listing**: < 2 seconds (database query)

### Contact Points
1. Check backend server logs for detailed error information
2. Verify all environment variables are set correctly
3. Test authentication flow in frontend first
4. Validate GitHub OAuth app configuration
5. Monitor API rate limits and usage

---

## 🏆 Success Metrics

A successful test run should demonstrate:
- ✅ Cookie-based authentication working seamlessly
- ✅ Intelligent roadmap generation from minimal input
- ✅ GitHub repository creation with proper structure
- ✅ Project tracking and management functionality
- ✅ Error handling and graceful degradation
- ✅ End-to-end learning journey automation
