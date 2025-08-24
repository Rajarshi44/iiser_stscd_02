import { GoogleGenerativeAI } from '@google/generative-ai';

// Use environment variable for API key in production
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyA1l8AUjAnWX-6ujOuPIZ1DfDlCWkPIS1c';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(API_KEY);

export interface DeveloperData {
  profile: {
    login: string;
    name?: string;
    bio?: string;
    location?: string;
    company?: string;
    public_repos: number;
    followers: number;
    following: number;
    created_at: string;
  };
  repositories: Array<{
    name: string;
    description?: string;
    language?: string;
    stargazers_count: number;
    forks_count: number;
    created_at: string;
    updated_at: string;
    private: boolean;
    topics?: string[];
  }>;
  contributions: {
    total_contributions: number;
    current_streak: number;
    longest_streak: number;
    languages?: Record<string, number>;
  };
  stats?: {
    total_commits: number;
    total_prs: number;
    total_issues: number;
  };
}

export interface AIInsights {
  overview: string;
  strengths: string[];
  areasForImprovement: string[];
  recommendedProjects: Array<{
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    technologies: string[];
    estimatedTime: string;
  }>;
  learningPath: Array<{
    skill: string;
    reason: string;
    resources: string[];
  }>;
  careerAdvice: string;
  score: {
    technical: number;
    collaboration: number;
    consistency: number;
    overall: number;
  };
}

export class GeminiService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async analyzeDeveloperProfile(data: DeveloperData, targetRole?: string): Promise<AIInsights> {
    try {
      const prompt = this.buildAnalysisPrompt(data, targetRole);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseAIResponse(text);
    } catch (error) {
      console.error('Error analyzing developer profile:', error);
      throw new Error('Failed to analyze developer profile');
    }
  }

  private buildAnalysisPrompt(data: DeveloperData, targetRole?: string): string {
    const {
      profile,
      repositories,
      contributions,
      stats
    } = data;

    // Calculate additional metrics
    const languages = this.extractLanguages(repositories);
    const recentActivity = this.calculateRecentActivity(repositories);
    const projectComplexity = this.assessProjectComplexity(repositories);

    const roleSpecificContext = targetRole 
      ? `\n\nTARGET ROLE ANALYSIS:
The developer is specifically targeting the role of: ${targetRole}

Please tailor your analysis, recommendations, and learning path specifically for this role. Consider:
1. What specific skills are most important for a ${targetRole}
2. How their current experience aligns with ${targetRole} requirements
3. What gaps need to be filled to succeed as a ${targetRole}
4. Industry-specific technologies and practices for ${targetRole}
5. Career progression pathways within ${targetRole}

Focus heavily on role-specific recommendations and ensure the learning path directly supports their goal of becoming a ${targetRole}.`
      : '';

    return `
As an expert developer mentor and career advisor, analyze this GitHub developer profile and provide comprehensive insights in JSON format.

DEVELOPER PROFILE:
- Username: ${profile.login}
- Name: ${profile.name || 'Not provided'}
- Bio: ${profile.bio || 'Not provided'}
- Location: ${profile.location || 'Not provided'}
- Company: ${profile.company || 'Not provided'}
- Account created: ${profile.created_at}
- Public repositories: ${profile.public_repos}
- Followers: ${profile.followers}
- Following: ${profile.following}

REPOSITORIES (${repositories.length} total):
${repositories.slice(0, 20).map(repo => `
- ${repo.name}: ${repo.description || 'No description'} (${repo.language || 'Unknown'}) - ⭐${repo.stargazers_count} 🍴${repo.forks_count} - Updated: ${repo.updated_at}
`).join('')}

CONTRIBUTION DATA:
- Total contributions: ${contributions.total_contributions}
- Current streak: ${contributions.current_streak} days
- Longest streak: ${contributions.longest_streak} days
- Languages: ${JSON.stringify(contributions.languages || {})}

ADDITIONAL STATS:
- Total commits: ${stats?.total_commits || 'Unknown'}
- Total PRs: ${stats?.total_prs || 'Unknown'}
- Total issues: ${stats?.total_issues || 'Unknown'}

CALCULATED METRICS:
- Primary languages: ${languages.slice(0, 5).join(', ')}
- Recent activity: ${recentActivity.recentRepos} repos updated in last 6 months
- Project complexity: ${projectComplexity.averageStars} avg stars, ${projectComplexity.averageForks} avg forks${roleSpecificContext}

Please provide analysis in this EXACT JSON format:
{
  "overview": "A comprehensive 2-3 sentence overview of the developer's profile and coding journey${targetRole ? `, specifically in context of their ${targetRole} aspirations` : ''}",
  "strengths": ["List 3-5 key strengths based on the data${targetRole ? ` and relevance to ${targetRole}` : ''}"],
  "areasForImprovement": ["List 3-5 specific areas where they can improve${targetRole ? ` to excel as a ${targetRole}` : ''}"],
  "recommendedProjects": [
    {
      "title": "Project Name${targetRole ? ` (${targetRole}-focused)` : ''}",
      "description": "Brief description of the project${targetRole ? ` and how it helps with ${targetRole} skills` : ''}",
      "difficulty": "Beginner|Intermediate|Advanced",
      "technologies": ["tech1", "tech2"],
      "estimatedTime": "X weeks/months"
    }
  ],
  "learningPath": [
    {
      "skill": "Skill name${targetRole ? ` (${targetRole}-relevant)` : ''}",
      "reason": "Why this skill is important for them${targetRole ? ` as a ${targetRole}` : ''}",
      "resources": ["resource1", "resource2"]
    }
  ],
  "careerAdvice": "Personalized career advice based on their profile and goals${targetRole ? `, specifically for becoming a successful ${targetRole}` : ''}",
  "score": {
    "technical": 85,
    "collaboration": 70,
    "consistency": 90,
    "overall": 82
  }
}

Focus on:
1. Technical skills based on languages and project complexity${targetRole ? ` relevant to ${targetRole}` : ''}
2. Collaboration skills based on followers, following, and community engagement
3. Consistency based on contribution patterns
4. Practical project recommendations that build on their existing skills${targetRole ? ` toward ${targetRole}` : ''}
5. Learning paths that address gaps and advance their career${targetRole ? ` in ${targetRole}` : ''}
6. Realistic scores out of 100 for each category

Make recommendations specific and actionable${targetRole ? `, with clear connections to ${targetRole} success` : ''}.
`;
  }

  private extractLanguages(repositories: DeveloperData['repositories']): string[] {
    const languageCounts: Record<string, number> = {};
    
    repositories.forEach(repo => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    });

    return Object.entries(languageCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([language]) => language);
  }

  private calculateRecentActivity(repositories: DeveloperData['repositories']) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentRepos = repositories.filter(repo => 
      new Date(repo.updated_at) > sixMonthsAgo
    ).length;

    return { recentRepos };
  }

  private assessProjectComplexity(repositories: DeveloperData['repositories']) {
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalForks = repositories.reduce((sum, repo) => sum + repo.forks_count, 0);
    
    return {
      averageStars: repositories.length > 0 ? Math.round(totalStars / repositories.length) : 0,
      averageForks: repositories.length > 0 ? Math.round(totalForks / repositories.length) : 0,
    };
  }

  private parseAIResponse(text: string): AIInsights {
    try {
      // Remove any markdown formatting and extract JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const cleanedText = jsonMatch[0];
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Return a fallback response
      return {
        overview: "Analysis temporarily unavailable. Please try again later.",
        strengths: ["Active developer", "Multiple programming languages", "Regular contributions"],
        areasForImprovement: ["Enhance project documentation", "Increase community engagement", "Focus on code quality"],
        recommendedProjects: [
          {
            title: "Personal Portfolio Website",
            description: "Create a professional portfolio showcasing your projects",
            difficulty: "Intermediate",
            technologies: ["React", "TypeScript", "Tailwind CSS"],
            estimatedTime: "2-3 weeks"
          }
        ],
        learningPath: [
          {
            skill: "Advanced Git",
            reason: "Better collaboration and code management",
            resources: ["Pro Git book", "GitHub documentation"]
          }
        ],
        careerAdvice: "Continue building diverse projects and contributing to open source to showcase your skills.",
        score: {
          technical: 75,
          collaboration: 65,
          consistency: 80,
          overall: 73
        }
      };
    }
  }
}

export const geminiService = new GeminiService();
