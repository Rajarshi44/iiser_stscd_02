# CV Analysis Agent with Supabase Integration

A comprehensive CV analysis tool that uses Gemini AI to parse resumes, extract skills, analyze career goals, and store results in a Supabase PostgreSQL database.

## Features

- 📄 **PDF Resume Parsing**: Uses Gemini Vision API to extract text from PDF resumes
- 🧠 **AI-Powered Analysis**: Comprehensive skill extraction and career goal analysis
- 📊 **Skill Gap Analysis**: Compare skills against target job requirements
- 🗺️ **Learning Roadmaps**: Generate personalized learning paths
- 🗄️ **Database Integration**: Store all results in Supabase PostgreSQL
- 📋 **Progress Tracking**: Track user progress and generate insights

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the `agents/agent-1/` directory:

```env
# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Configuration
SUPABASE_URL=https://ceuwldnnjixwsbofajxm.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldXdsZG5uaml4d3Nib2ZhanhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5MzQ0NjYsImV4cCI6MjA3MTUxMDQ2Nn0.fBWSKJ75LtX9BM4bYxiUuBSzyxZfMw-4JCxiF-D0Srw
```

### 3. Database Schema

The Supabase database should already be initialized with the schema from `db.sql`. Key tables include:
- `users`: User management
- `user_resume`: Resume data storage
- `user_skills_analysis`: Skills analysis results
- `user_onboarding`: Onboarding tracking
- `agent_operations`: Operation logging

## Usage

### Basic CV Analysis

```bash
python main.py deba_resume_1.pdf --target-job software_engineer
```

### With Database Integration

```bash
python main.py deba_resume_1.pdf --target-job data_scientist --create-test-user --test-username deba_user
```

### Command Line Options

```bash
python main.py --help
```

**Available options:**
- `cv_file`: Path to CV file (PDF, TXT, or MD)
- `--target-job`: Target job role (software_engineer, data_scientist, product_manager)
- `--save-cache`: Save analysis cache to JSON file
- `--api-key`: Gemini API key (if not using environment variable)
- `--supabase-url`: Supabase URL (if not using environment variable)
- `--supabase-key`: Supabase anon key (if not using environment variable)
- `--create-test-user`: Create test user and store analysis in database
- `--test-username`: Username for test user
- `--verbose`: Enable verbose output

### Test Integration

Run the complete integration test:

```bash
python test_supabase_integration.py
```

This will:
1. Parse the provided PDF resume (`deba_resume_1.pdf`)
2. Extract skills and career goals using Gemini AI
3. Analyze skill gaps for different job roles
4. Generate learning roadmaps
5. Create a test user in Supabase
6. Store all analysis results in the database

## Database Schema Integration

The agent integrates with the following database tables:

### Users Table
Stores user information and GitHub integration data.

### User Resume Table
Stores structured resume data extracted from PDFs.

### User Skills Analysis Table
Stores comprehensive skills analysis including:
- Extracted skills with proficiency levels
- Career goals and aspirations
- Strengths and growth areas
- Recommended learning paths

### User Onboarding Table
Tracks user onboarding process and preferences.

### Agent Operations Table
Logs all agent operations for analytics and debugging.

## Example Output

```
🤖 CV Analysis Agent - IISER StatusCode 02
============================================================
📄 Input: deba_resume_1.pdf (PDF)
🎯 Target Role: Data Scientist
============================================================

🔍 Step 1: Parsing CV...
🔍 Using Gemini Vision API for PDF text extraction...
✅ CV parsed successfully

🧠 Step 2: Analyzing skills and career goals...
🔬 Using advanced Gemini analysis for comprehensive skill extraction...
✅ Analysis complete - extracted 15 skills

📊 Step 3: Analyzing skill gaps for 'data_scientist'...
✅ Gap analysis complete - 78.5% job match

🗺️ Step 4: Generating personalized roadmap...
✅ Roadmap generated with 8 learning items

🗄️ Step 6: Creating test user and storing in database...
✅ Test user created successfully: deba_user (ID: 123)
✅ Complete analysis stored in Supabase database!

📋 ANALYSIS RESULTS
============================================================
📊 EXTRACTED SKILLS:
----------------------------------------
  Python               ★★★★☆ (programming)
  Machine Learning      ★★★☆☆ (ai_ml)
  SQL                   ★★★★☆ (database)
  ...

🎯 CAREER GOALS:
----------------------------------------
  Target Role: Data Scientist
  Industry: technology
  Experience Level: intermediate
  Timeline: medium_term

🎉 CV analysis completed successfully!
📊 Database: User ID 123 created with complete analysis
```

## Architecture

The system consists of:

1. **CVAnalysisAgent**: Main analysis engine
2. **SupabaseManager**: Database operations manager
3. **Gemini Integration**: AI-powered text extraction and analysis
4. **CLI Interface**: Command-line interface for easy usage

## Dependencies

- `google-generativeai`: For Gemini AI integration
- `supabase`: For database operations
- `python-dotenv`: For environment variable management
- `langchain`: For advanced document processing (optional)
- `requests`, `beautifulsoup4`: For web features (optional)
- `psycopg2-binary`: For PostgreSQL connections

## Error Handling

The system includes comprehensive error handling:
- Graceful fallbacks when AI services are unavailable
- Database connection resilience
- Detailed error logging and operation tracking
- Mock data generation for testing without external dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with the provided test script
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
