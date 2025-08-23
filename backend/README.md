# AI-Powered GitHub Development Platform

A comprehensive Flask-based backend API that integrates with GitHub OAuth and Supabase to provide AI-powered development tools, repository analysis, and user progress tracking.

## 🚀 Features

### Core Features
- **GitHub OAuth Integration** - Secure user authentication via GitHub
- **Repository Management** - Fetch and manage user repositories
- **JWT Authentication** - Secure API endpoints with token validation
- **Supabase Integration** - User data storage and management

### AI-Powered Services
- **AI Issue Generation** - Intelligent issue creation with reasoning
- **Repository Analysis** - Automated code quality scoring and insights
- **Tech Stack Recommendations** - AI-driven technology suggestions
- **Development Roadmaps** - Intelligent project planning and milestones
- **Skills Analysis** - Personalized learning path recommendations

### User Experience
- **Progress Tracking** - XP points, levels, and badges system
- **Achievement System** - Gamified learning and development
- **Leaderboard Rankings** - Competitive development community
- **Onboarding Flow** - Personalized user journey setup

### Analytics & Monitoring
- **Agent Operations Logging** - Track AI operations and performance
- **User Satisfaction Metrics** - Monitor platform effectiveness
- **Performance Analytics** - Execution time and success rate tracking

## 📋 Prerequisites

- Python 3.8+
- GitHub account
- Supabase account
- Git

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Run the setup script to create your `.env` file:

```bash
python setup.py
```

This will create a `.env` file with placeholder values. Update it with your actual credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_anon_key

# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
```

### 3. GitHub OAuth Setup

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in the details:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000`
   - **Authorization callback URL**: `http://localhost:5000/auth/github/callback`
4. Copy the Client ID and Client Secret to your `.env` file

### 4. Supabase Setup

1. Go to [Supabase](https://supabase.com) and create a new project
2. Get your project URL and anon key from Settings > API
3. Add them to your `.env` file
4. Run the database initialization script:

```bash
python init_database.py
```

### 5. Run the Server

```bash
python run.py
```

The server will start at `http://localhost:5000`

## 🔗 API Endpoints

### Core Endpoints
- `GET /` - Health check
- `GET /test` - Comprehensive platform status and endpoints
- `GET /auth/github` - Initiate GitHub OAuth flow

### User Management
- `GET /api/user/profile` - Get user profile
- `GET /api/user/repositories` - Get user repositories
- `GET /api/user/progress` - Get user progress and XP
- `GET/POST/PUT /api/user/onboarding` - User onboarding management
- `GET/POST /api/user/skills` - Skills analysis and recommendations
- `GET /api/user/achievements` - User achievements

### AI Services
- `GET/POST /api/ai/issues` - AI-powered issue generation
- `GET/POST /api/ai/repositories` - AI repository management
- `POST /api/repository/analysis` - Repository analysis and scoring
- `GET/POST /api/tech/recommendations` - Tech stack recommendations
- `GET/POST /api/repository/roadmap` - Development roadmaps

### Analytics & Community
- `GET /api/leaderboard` - User rankings and points
- `GET/POST /api/agent/operations` - AI operation logging

### OAuth Callback
- `GET /auth/github/callback` - GitHub OAuth callback (handles token exchange)

## 🔐 Authentication Flow

1. User visits `/auth/github`
2. Redirected to GitHub for authorization
3. GitHub redirects back to `/auth/github/callback`
4. Backend exchanges code for access token
5. User info is stored in Supabase using the new schema
6. JWT token is generated and sent to frontend
7. Frontend uses JWT token for authenticated requests

## 🧪 Testing

Visit `http://localhost:5000/test` to see:
- Server status
- All available endpoints organized by category
- Platform features overview
- Configuration status
- Missing environment variables

## 📁 Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── config.py                # Configuration settings
│   ├── models.py                # Data models matching schema
│   ├── routes/
│   │   ├── github.py            # GitHub OAuth and core routes
│   │   └── ai_services.py       # AI-powered service routes
│   ├── services/
│   │   ├── github_service.py    # GitHub API integration
│   │   └── supabase_client.py   # Supabase client
│   └── utils/
│       └── decorators.py        # JWT authentication decorator
├── requirements.txt              # Python dependencies
├── run.py                       # Server startup script
├── setup.py                     # Setup and configuration script
├── init_database.py             # Database initialization script
└── README.md                    # This file
```

## 🗄️ Database Schema

The platform uses a comprehensive database schema with tables for:
- **Users** - GitHub integration and profile data
- **AI Issues** - Generated issues with reasoning and metadata
- **AI Repositories** - AI-managed repository projects
- **Repository Analysis** - Code quality scores and insights
- **Tech Recommendations** - Technology stack suggestions
- **User Progress** - XP, levels, badges, and achievements
- **Agent Operations** - AI operation logging and metrics
- **Leaderboard** - Competitive rankings and points

## 🚨 Troubleshooting

### Common Issues

1. **Missing environment variables**: Run `python setup.py` and update `.env`
2. **GitHub OAuth errors**: Check callback URL matches exactly
3. **Supabase connection errors**: Verify URL and key in `.env`
4. **Import errors**: Ensure all dependencies are installed
5. **Database errors**: Run `python init_database.py` to check table status

### Debug Mode

The server runs in debug mode by default. Check the console for detailed error messages.

## 🔒 Security Notes

- Never commit your `.env` file
- Use strong JWT secrets
- GitHub tokens are stored securely in Supabase
- All sensitive endpoints require JWT validation
- Row Level Security (RLS) policies recommended for production

## 📞 Support

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure GitHub OAuth app is configured correctly
4. Check Supabase project settings and table structure
5. Run `python init_database.py` to verify database connectivity

## 🎯 Next Steps

1. **Set up GitHub OAuth** and test authentication flow
2. **Configure Supabase** and create database tables
3. **Test AI endpoints** with sample data
4. **Implement frontend** to consume the API
5. **Add AI models** for intelligent analysis and recommendations 