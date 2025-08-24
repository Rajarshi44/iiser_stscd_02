// API utility functions for profile page
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create headers for API requests
const createHeaders = () => ({
    'Content-Type': 'application/json'
});

// Fetch complete user profile with database ID
export const fetchUserProfileWithId = async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        headers: createHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user profile: ${response.statusText}`);
    }

    const data = await response.json();
    return data; // Returns { user: {...}, profile_complete: boolean, ... }
};

// Fetch dashboard summary data
export const fetchDashboardData = async () => {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/summary`, {
        headers: createHeaders(),
        credentials: 'include' // Include cookies for authentication
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`);
    }

    const data = await response.json();
    return data.dashboard;
};

// Fetch user projects
export const fetchUserProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/api/projects/list`, {
        headers: createHeaders(),
        credentials: 'include' // Include cookies for authentication
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data.projects || [];
};

// Generate user resume
export const generateResume = async () => {
    const response = await fetch(`${API_BASE_URL}/api/profile/resume`, {
        method: 'GET',
        headers: createHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Failed to generate resume: ${response.statusText}`);
    }

    const data = await response.json();
    return data.resume;
};

// Get level requirements and progress details
export const fetchLevelRequirements = async () => {
    const response = await fetch(`${API_BASE_URL}/api/progress/level-requirements`, {
        headers: createHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch level requirements: ${response.statusText}`);
    }

    const data = await response.json();
    return data.level_requirements;
};

// Fetch skills analysis
export const fetchSkillsAnalysis = async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/skills`, {
        headers: createHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch skills analysis: ${response.statusText}`);
    }

    const data = await response.json();
    return data.skills_analysis;
};

// Create a learning roadmap
export const createRoadmap = async (targetRole: string, userSkills: any[]) => {
    const response = await fetch(`${API_BASE_URL}/api/roadmap/generate`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include',
        body: JSON.stringify({
            target_role: targetRole,
            user_skills: userSkills,
            current_level: 2
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create roadmap: ${response.statusText}`);
    }

    const data = await response.json();
    return data.roadmap;
};

// Create a project from roadmap (updated for demo routes)
export const createProject = async (projectData: any) => {
    const response = await fetch(`${API_BASE_URL}/demo/api/projects/create`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include',
        body: JSON.stringify(projectData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create project: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

// Demo API Functions for test page
export const createDemoRoadmapSimple = async (targetRole: string) => {
    const response = await fetch(`${API_BASE_URL}/demo/api/roadmap/generate`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include',
        body: JSON.stringify({
            target_role: targetRole
        })
    });

    if (!response.ok) {
        throw new Error(`Failed to create roadmap: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

export const createDemoRoadmap = async (roadmapData: any) => {
    const response = await fetch(`${API_BASE_URL}/demo/api/roadmap/generate`, {
        method: 'POST',
        headers: createHeaders(),
        credentials: 'include',
        body: JSON.stringify(roadmapData)
    });

    if (!response.ok) {
        throw new Error(`Failed to create roadmap: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

export const fetchDemoProjects = async () => {
    const response = await fetch(`${API_BASE_URL}/demo/api/projects/list`, {
        headers: createHeaders(),
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};
