atabase schema for GitHub AI Agent operations

-- Users and Authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    github_username VARCHAR(255) UNIQUE NOT NULL,
    github_user_id BIGINT UNIQUE NOT NULL,
    github_access_token TEXT,
    email VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Repository Analysis Cache
CREATE TABLE repository_analyses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    analysis_type VARCHAR(50) NOT NULL, -- 'comprehensive', 'code_quality', 'tech_stack'
    analysis_data JSONB NOT NULL,
    overall_score INTEGER CHECK (overall_score >= 1 AND overall_score <= 10),
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '24 hours'),
    UNIQUE(owner, repo_name, analysis_type)
);

-- AI Generated Repositories
CREATE TABLE ai_repositories (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    github_repo_id BIGINT,
    repo_name VARCHAR(255) NOT NULL,
    repo_url TEXT,
    requirements TEXT NOT NULL, -- Original user requirements
    ai_plan JSONB NOT NULL, -- The AI's creation plan
    created_files INTEGER DEFAULT 0,
    created_issues INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- AI Generated Issues
CREATE TABLE ai_issues (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    github_issue_id BIGINT,
    issue_title VARCHAR(500) NOT NULL,
    issue_body TEXT,
    ai_reasoning TEXT, -- Why the AI suggested this issue
    labels TEXT[], -- Array of labels
    priority VARCHAR(20), -- 'high', 'medium', 'low'
    complexity VARCHAR(20), -- 'simple', 'medium', 'complex'
    estimated_hours INTEGER,
    status VARCHAR(20) DEFAULT 'suggested', -- 'suggested', 'created', 'failed'
    created_at TIMESTAMP DEFAULT NOW()
);

-- User Skills Analysis
CREATE TABLE user_skills_analysis (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    analysis_data JSONB NOT NULL,
    skill_level VARCHAR(50), -- 'beginner', 'intermediate', 'advanced', 'expert'
    strengths TEXT[],
    growth_areas TEXT[],
    recommended_learning_path JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

-- Repository Roadmaps
CREATE TABLE repository_roadmaps (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    goals TEXT NOT NULL,
    roadmap_data JSONB NOT NULL,
    milestones_count INTEGER DEFAULT 0,
    risks_identified INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, owner, repo_name)
);

-- Tech Stack Recommendations
CREATE TABLE tech_recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    owner VARCHAR(255) NOT NULL,
    repo_name VARCHAR(255) NOT NULL,
    current_stack JSONB,
    recommendations JSONB NOT NULL,
    implementation_priority VARCHAR(20), -- 'high', 'medium', 'low'
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days')
);

-- Agent Operation Logs
CREATE TABLE agent_operations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    operation_type VARCHAR(100) NOT NULL, -- 'analyze_repo', 'create_repo', 'suggest_issues', etc.
    target_repository VARCHAR(255), -- 'owner/repo'
    input_data JSONB,
    output_data JSONB,
    success BOOLEAN NOT NULL,
    error_message TEXT,
    execution_time_ms INTEGER,
    ai_model_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Agent Performance Metrics
CREATE TABLE agent_metrics (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    operation_type VARCHAR(100) NOT NULL,
    total_operations INTEGER DEFAULT 0,
    successful_operations INTEGER DEFAULT 0,
    average_execution_time_ms INTEGER DEFAULT 0,
    user_satisfaction_score DECIMAL(3,2), -- 1.00 to 5.00
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(date, operation_type)
);

-- Indexes for performance
CREATE INDEX idx_repository_analyses_repo ON repository_analyses(owner, repo_name);
CREATE INDEX idx_repository_analyses_user ON repository_analyses(user_id);
CREATE INDEX idx_repository_analyses_expires ON repository_analyses(expires_at);

CREATE INDEX idx_ai_issues_repo ON ai_issues(owner, repo_name);
CREATE INDEX idx_ai_issues_user ON ai_issues(user_id);
CREATE INDEX idx_ai_issues_status ON ai_issues(status);

CREATE INDEX idx_user_skills_user ON user_skills_analysis(user_id);
CREATE INDEX idx_user_skills_expires ON user_skills_analysis(expires_at);

CREATE INDEX idx_agent_operations_user ON agent_operations(user_id);
CREATE INDEX idx_agent_operations_type ON agent_operations(operation_type);
CREATE INDEX idx_agent_operations_created ON agent_operations(created_at);

-- Views for analytics
CREATE OR REPLACE VIEW user_agent_activity AS
SELECT 
    u.github_username,
    COUNT(DISTINCT ao.id) as total_operations,
    COUNT(DISTINCT CASE WHEN ao.success THEN ao.id END) as successful_operations,
    AVG(ao.execution_time_ms) as avg_execution_time,
    COUNT(DISTINCT ra.id) as repositories_analyzed,
    COUNT(DISTINCT air.id) as repositories_created,
    COUNT(DISTINCT ai.id) as issues_created
FROM users u
LEFT JOIN agent_operations ao ON u.id = ao.user_id
LEFT JOIN repository_analyses ra ON u.id = ra.user_id
LEFT JOIN ai_repositories air ON u.id = air.user_id
LEFT JOIN ai_issues ai ON u.id = ai.user_id
WHERE ao.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.id, u.github_username;
CREATE OR REPLACE VIEW repository_health_scores AS 
SELECT 
    ra.owner,
    ra.repo_name,
    ra.overall_score,
    ra.analysis_data->>'overall_grade' as grade,
    COALESCE(
        ARRAY_LENGTH(
            ARRAY(
                SELECT jsonb_array_elements_text(ra.analysis_data->'strengths')
            ), 
            1
        ), 
        0
    ) as strengths_count,
    COALESCE(
        ARRAY_LENGTH(
            ARRAY(
                SELECT jsonb_array_elements_text(ra.analysis_data->'recommendations')
            ), 
            1
        ), 
        0
    ) as recommendations_count,
    ra.created_at as last_analyzed
FROM repository_analyses ra
WHERE ra.analysis_type = 'comprehensive'
AND ra.expires_at > NOW();


CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    current_level INTEGER DEFAULT 1,
    xp_points INTEGER DEFAULT 0,
    badges TEXT[],
    next_goal VARCHAR(255),
    last_updated TIMESTAMP DEFAULT NOW()
);


CREATE TABLE user_resume (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    resume_data JSONB NOT NULL, -- structured resume
    last_synced TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_achievements (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    achievement_name VARCHAR(255) NOT NULL,
    description TEXT,
    earned_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, achievement_name)
);


CREATE TABLE user_onboarding (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    uploaded_cv_url TEXT,
    target_role VARCHAR(255),
    chosen_path VARCHAR(255),
    onboarding_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_submissions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    issue_id INTEGER REFERENCES ai_issues(id),
    github_pr_url TEXT,
    submission_data JSONB, -- metadata about commit/PR
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    feedback TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'scored'
    submitted_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE leaderboard (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    total_points INTEGER DEFAULT 0,
    current_rank INTEGER,
    last_updated TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id)
);