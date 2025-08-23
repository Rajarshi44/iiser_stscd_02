# IISER StatusCode 02 – Backend + Agent Suite

A Flask backend with Supabase and GitHub OAuth, integrated with two AI agents:

- Agent-1: CV parsing and skill analysis (Gemini), Supabase storage
- Agent2: Learning roadmap + project/issue generation (LangChain + Groq)

## Monorepo layout

```
iiser_stscd_02/
├─ backend/                 # Flask API, Supabase integration, OAuth, AI routes
├─ agents/
│  ├─ agent-1/              # CV Analysis Agent (Gemini + Supabase)
│  └─ agent2/               # Roadmap + Project Generation (LangChain + Groq)
└─ client/ or frontend/     # Your frontend (not covered here)
```

## Prerequisites

- Python 3.8+
- Supabase project (URL + anon key)
- GitHub OAuth app (Client ID + Secret)
- Optional
  - Gemini API key (for Agent-1)
  - Groq API key (for Agent2, free tier available)

## Quickstart

### 1) Backend

Install dependencies:

```bash
cd backend
pip install -r requirements.txt
```

Create and fill `.env`:

```bash
python setup.py
```

Update the generated `.env` with real values:

```
SUPABASE_URL=...
SUPABASE_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback
JWT_SECRET=your_secure_secret
```

Check DB connectivity and table presence (creates nothing, verifies/prints status):

```bash
python init_database.py
```

Run server:

```bash
python run.py
```

- Base URL: `http://localhost:5000`
- OAuth start: `GET /auth/github`
- Callback: `GET /auth/github/callback`
- Health: `GET /` and `GET /test`

### 2) Agent-1 (CV Analysis Agent)

Install:

```bash
cd agents/agent-1
pip install -r requirements.txt
```

Create `.env` in `agents/agent-1/`:

```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

CLI examples:

```bash
# Basic CV analysis
python main.py deba_resume_1.pdf --target-job software_engineer

# With DB integration and test user
python main.py deba_resume_1.pdf --target-job data_scientist --create-test-user --test-username your_user

# Help
python main.py --help
```

Example script:

```bash
python example_usage.py
```

Ensure `GEMINI_API_KEY` is set and the test PDF exists.

### 3) Agent2 (Roadmap + Repository Agents)

Install:

```bash
cd agents/agent2
pip install -r requirements.txt
```

Create `.env` in `agents/agent2/`:

```
GROQ_API_KEY=...
# Optional
GITHUB_TOKEN=...
```

Run examples:

```bash
python example_usage.py
```

Saves `agent2_example_results.json`.

Programmatic usage: import `Agent2Integration`, `RoadmapGenerationAgent`, `RepositoryCreationAgent`.

## Backend API Overview

Auth and core

- `GET /` — health
- `GET /test` — platform status, endpoints, config flags
- `GET /auth/github` — begin OAuth
- `GET /auth/github/callback` — stores user in Supabase, returns JWT

User

- `GET /api/user/profile` — requires JWT
- `GET /api/user/repositories` — requires JWT, GitHub repos via stored token
- `GET /api/user/progress` — requires JWT (creates default if missing)
- `GET/POST/PUT /api/user/onboarding` — requires JWT
- `GET/POST /api/user/skills` — requires JWT
- `GET /api/user/achievements` — requires JWT

AI services

- `GET/POST /api/ai/issues` — requires JWT
- `GET/POST /api/ai/repositories` — requires JWT
- `POST /api/repository/analysis` — requires JWT
- `GET/POST /api/tech/recommendations` — requires JWT
- `GET/POST /api/repository/roadmap` — requires JWT

Career onboarding and Agent2 integration

- `POST /api/onboarding/cv-analysis` — upload CV, analyze, store results
- `POST /api/cv/analyze` — comprehensive CV analysis via Agent-1
- `POST /api/onboarding/github-analysis` — analyze skills via GitHub profile
- `POST /api/projects/generate` — AI repo/issues generation
- `POST /api/submissions/analyze` — analyze PR, update XP/level with stricter criteria
- `GET /api/dashboard/summary` — aggregates user data
- `GET /api/profile/resume` — AI resume from data
- `GET /api/progress/level-requirements` — level requirements and status
- Agent2 powered:
  - `POST /api/learning/roadmap`
  - `POST /api/learning/portfolio-project`
  - `POST /api/learning/progress-update`

Notes

- JWT secret: `JWT_SECRET`
- Supabase client uses `SUPABASE_URL`, `SUPABASE_KEY`
- Protected endpoints require `Authorization: Bearer <jwt>`

## Environment Variables

Backend (`backend/.env`)

```
SUPABASE_URL=...
SUPABASE_KEY=...
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=http://localhost:5000/auth/github/callback
JWT_SECRET=...
```

Agent-1 (`agents/agent-1/.env`)

```
GEMINI_API_KEY=...
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
```

Agent2 (`agents/agent2/.env`)

```
GROQ_API_KEY=...
# Optional
GITHUB_TOKEN=...
```

## Data Model (key tables)

Ensure these exist in Supabase:

- `users`, `ai_issues`, `ai_repositories`, `repository_analyses`, `tech_recommendations`, `repository_roadmaps`
- `user_progress`, `user_onboarding`, `user_skills_analysis`, `user_resume`, `user_achievements`
- `user_submissions`, `leaderboard`, `agent_operations`, `agent_metrics`

## Testing and Debug

- Backend
  - `GET /test` — live doc of endpoints and config status
  - OAuth debug — `GET /debug/oauth`
- Backend tests are in `backend/` (e.g., `test_cv_parser.py`, `test_oauth.py`, etc.)
- Agent-1 — `python test_supabase_integration.py`
- Agent2 — `python example_usage.py` (saves JSON)

## Common Issues

- OAuth
  - Callback must match `GITHUB_REDIRECT_URI`
  - Start flow from `/auth/github`
- Missing env vars — run `python setup.py` in `backend/` then update values
- Supabase — verify `SUPABASE_URL` and keys; confirm required tables exist
- Agent-1 — set `GEMINI_API_KEY`; ensure the input PDF exists
- Agent2 — set `GROQ_API_KEY`; agents fallback to mock logic if AI unavailable

## Runbook

- Start backend

```bash
cd backend
python run.py
```

- Generate JWT: go to `/auth/github` and sign in; token is returned in the callback JSON.
- Call protected endpoints with header: `Authorization: Bearer <token>`

- Agents

```bash
cd agents/agent-1 && python example_usage.py
cd agents/agent2 && python example_usage.py
```
