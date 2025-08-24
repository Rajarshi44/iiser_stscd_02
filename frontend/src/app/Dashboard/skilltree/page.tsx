"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/Authcontext'
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AuroraBackground } from "@/components/ui/aurora-background"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Upload, 
  Brain, 
  Target, 
  TrendingUp, 
  BookOpen, 
  Award,
  Github,
  FileText,
  Zap,
  CheckCircle,
  Clock,
  Star,
  Users,
  Code,
  Database,
  Cloud,
  Cpu,
  BarChart3,
  Lightbulb,
  Activity,
  Shield,
  Smartphone,
  Network,
  Cog,
  Puzzle,
  Layers,
  Globe,
  Lock,
  Rocket,
  Boxes,
  GitBranch,
  Monitor,
  Server,
  Terminal,
  Settings,
  Briefcase
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend, LineChart, Line, Area, AreaChart, ComposedChart } from 'recharts'
import { geminiService, type DeveloperData, type AIInsights } from '@/lib/gemini'

// Types for API responses
interface UserData {
  id: number
  login: string
  name: string
  email: string
  avatar_url: string
  public_repos: number
  followers: number
  following: number
  bio: string
  location: string
  blog: string
  company: string
  created_at: string
  updated_at: string
  database_id: number
  is_stored_user: boolean
  platform_data: PlatformData
  summary_stats: SummaryStats
  data_freshness: {
    fetched_at: string
    github_data_fresh: boolean
    tables_queried: string[]
  }
}

interface PlatformData {
  skills_analysis?: {
    id: number
    analysis_data: any
    skill_level?: string
    strengths: string[]
    growth_areas: string[]
    recommended_learning_path?: any
    created_at: string
    expires_at: string
  }
  progress?: {
    current_level: number
    xp_points: number
    badges: string[]
    next_goal: string
    last_updated?: string
  }
  achievements: Array<{
    achievement_name: string
    description?: string
    earned_at: string
  }>
  onboarding?: {
    uploaded_cv_url?: string
    target_role?: string
    chosen_path?: string
    onboarding_complete: boolean
    created_at: string
  }
  resume?: {
    resume_data: any
    last_synced: string
  }
  repository_analyses: Array<{
    id: number
    owner: string
    repo_name: string
    analysis_type: string
    analysis_data: any
    overall_score: number
    created_at: string
    expires_at: string
  }>
  tech_recommendations: Array<{
    id: number
    owner: string
    repo_name: string
    current_stack?: any
    recommendations: any
    implementation_priority?: string
    created_at: string
    expires_at: string
  }>
  leaderboard?: {
    total_points: number
    current_rank?: number
    last_updated: string
  }
  recent_ai_issues: Array<{
    id: number
    owner: string
    repo_name: string
    issue_title: string
    priority?: string
    complexity?: string
    status: string
    estimated_hours?: number
    created_at: string
  }>
  ai_repositories: Array<{
    id: number
    repo_name: string
    requirements: string
    created_files: number
    created_issues: number
    created_at: string
  }>
}

interface SummaryStats {
  total_analyses: number
  total_ai_issues: number
  total_ai_repos: number
  total_achievements: number
  has_skills_analysis: boolean
  has_resume: boolean
  onboarding_complete: boolean
}

// Legacy interfaces for backward compatibility
interface SkillAnalysisResult {
  success: boolean
  message: string
  analysis: {
    cv_file: string
    target_role: string
    cv_text_length: number
    extraction_method: string
  }
  skills_assessment: {
    total_skills: number
    skill_categories: {
      [key: string]: Array<{
        name: string
        level: number
        category: string
        description: string
      }>
    }
    skill_levels: {
      average_level: number
      highest_level: number
      lowest_level: number
    }
  }
  development_level: {
    level: string
    description: string
    score: number
    confidence: string
  }
  career_goals: {
    primary_target: string
    industry: string
    experience_level: string
    timeline: string
  }
  skill_gaps: {
    target_role: string
    match_percentage: number
    skill_gaps: string[]
    strengths: string[]
    recommendations: string[]
  }
  learning_roadmap: {
    total_items: number
    high_priority: number
    medium_priority: number
    low_priority: number
    roadmap_items: Array<{
      skill: string
      current_level: number
      target_level: number
      priority: string
      estimated_time: string
      resources: string[]
    }>
  }
  database_storage: {
    user_id: string
    onboarding_stored: boolean
    skills_analysis_stored: boolean
    resume_data_stored: boolean
    operation_logged: boolean
  }
  next_steps: string[]
}

// Comprehensive skill domain definitions
interface SkillDomain {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  skills: string[];
  subdomains: string[];
  level?: number;
  expertiseCount?: number;
}

const SKILL_DOMAINS: SkillDomain[] = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    icon: Monitor,
    color: 'blue',
    description: 'User interface and experience development',
    skills: ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Sass', 'Tailwind', 'Next.js', 'Svelte'],
    subdomains: ['Web Components', 'Progressive Web Apps', 'Responsive Design', 'Browser APIs', 'State Management']
  },
  {
    id: 'backend',
    name: 'Backend Development',
    icon: Server,
    color: 'green',
    description: 'Server-side logic and API development',
    skills: ['Node.js', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'Ruby', 'C#', 'Express', 'FastAPI', 'Django', 'Spring'],
    subdomains: ['REST APIs', 'GraphQL', 'Microservices', 'Message Queues', 'Caching', 'Authentication']
  },
  {
    id: 'database',
    name: 'Database & Data',
    icon: Database,
    color: 'purple',
    description: 'Data storage, retrieval, and management',
    skills: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch', 'SQL', 'NoSQL', 'GraphQL', 'Supabase', 'Firebase'],
    subdomains: ['Database Design', 'Query Optimization', 'Data Modeling', 'ETL Pipelines', 'Data Warehousing']
  },
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    icon: Settings,
    color: 'orange',
    description: 'Deployment, automation, and infrastructure management',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Terraform', 'Ansible', 'Jenkins', 'GitLab CI', 'GitHub Actions'],
    subdomains: ['CI/CD', 'Infrastructure as Code', 'Container Orchestration', 'Monitoring', 'Security', 'Automation']
  },
  {
    id: 'cloud',
    name: 'Cloud Architecture',
    icon: Cloud,
    color: 'cyan',
    description: 'Cloud-native solutions and distributed systems',
    skills: ['AWS Lambda', 'Azure Functions', 'GCP Functions', 'Serverless', 'API Gateway', 'CloudFormation', 'CloudWatch'],
    subdomains: ['Serverless Architecture', 'Event-Driven Architecture', 'Cloud Security', 'Cost Optimization', 'Multi-Cloud']
  },
  {
    id: 'ai_ml',
    name: 'AI & Machine Learning',
    icon: Brain,
    color: 'pink',
    description: 'Artificial intelligence and machine learning development',
    skills: ['Python', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'OpenAI API', 'Hugging Face', 'LangChain'],
    subdomains: ['Deep Learning', 'Natural Language Processing', 'Computer Vision', 'MLOps', 'Data Science', 'GenAI']
  },
  {
    id: 'mobile',
    name: 'Mobile Development',
    icon: Smartphone,
    color: 'indigo',
    description: 'Native and cross-platform mobile applications',
    skills: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Xamarin', 'Ionic', 'Progressive Web Apps', 'Expo'],
    subdomains: ['iOS Development', 'Android Development', 'Cross-Platform', 'Mobile UI/UX', 'App Store Optimization']
  },
  {
    id: 'security',
    name: 'Cybersecurity',
    icon: Shield,
    color: 'red',
    description: 'Application and infrastructure security',
    skills: ['OAuth', 'JWT', 'SSL/TLS', 'OWASP', 'Penetration Testing', 'Encryption', 'Security Auditing', 'Zero Trust'],
    subdomains: ['Web Security', 'Network Security', 'Compliance', 'Threat Modeling', 'Incident Response', 'Vulnerability Assessment']
  },
  {
    id: 'blockchain',
    name: 'Blockchain & Web3',
    icon: Boxes,
    color: 'yellow',
    description: 'Decentralized applications and blockchain technology',
    skills: ['Solidity', 'Web3.js', 'Ethers.js', 'Smart Contracts', 'Ethereum', 'Solana', 'XMTP', 'Wagmi', 'Move', 'Aptos SDK', 'Petra Wallet', 'DeFi', 'NFTs', 'IPFS'],
    subdomains: ['Smart Contract Development', 'DApp Development', 'Solana Development', 'Cross-Chain Messaging', 'Web3 Gaming', 'DAO Governance']
  },
  {
    id: 'data_science',
    name: 'Data Science & Analytics',
    icon: BarChart3,
    color: 'emerald',
    description: 'Data analysis, visualization, and insights',
    skills: ['Python', 'R', 'Jupyter', 'Matplotlib', 'Plotly', 'D3.js', 'Tableau', 'Power BI', 'Apache Spark', 'Pandas'],
    subdomains: ['Data Visualization', 'Statistical Analysis', 'Big Data', 'Business Intelligence', 'Predictive Analytics']
  },
  {
    id: 'game_dev',
    name: 'Game Development',
    icon: Puzzle,
    color: 'violet',
    description: 'Video game design and development',
    skills: ['Unity', 'Unreal Engine', 'C#', 'C++', 'Godot', 'Blender', 'Game Design', '3D Modeling', 'Pixel Art'],
    subdomains: ['2D Games', '3D Games', 'Game Physics', 'Game AI', 'VR/AR Development', 'Game Monetization']
  },
  {
    id: 'architecture',
    name: 'Software Architecture',
    icon: Layers,
    color: 'slate',
    description: 'System design and architectural patterns',
    skills: ['Design Patterns', 'Microservices', 'Event Sourcing', 'CQRS', 'Domain-Driven Design', 'Clean Architecture', 'SOLID'],
    subdomains: ['System Design', 'Scalability', 'Performance Optimization', 'Distributed Systems', 'Load Balancing']
  },
  {
    id: 'quality_assurance',
    name: 'Quality Assurance',
    icon: CheckCircle,
    color: 'lime',
    description: 'Testing, quality control, and process improvement',
    skills: ['Jest', 'Cypress', 'Selenium', 'TestNG', 'Postman', 'K6', 'Unit Testing', 'Integration Testing', 'E2E Testing'],
    subdomains: ['Test Automation', 'Performance Testing', 'Security Testing', 'API Testing', 'Test Strategy']
  },
  {
    id: 'product_management',
    name: 'Product Management',
    icon: Briefcase,
    color: 'amber',
    description: 'Product strategy, roadmapping, and user experience',
    skills: ['Agile', 'Scrum', 'Product Strategy', 'User Research', 'Analytics', 'A/B Testing', 'Roadmapping', 'Stakeholder Management'],
    subdomains: ['Product Strategy', 'User Experience', 'Market Research', 'Feature Prioritization', 'Growth Hacking']
  }
]

// Helper functions to process comprehensive API data
const processSkillDomainsFromAPI = (enhancedUserProfile: EnhancedUserProfile | null): SkillDomain[] => {
  if (!enhancedUserProfile) return SKILL_DOMAINS;

  const processedDomains = SKILL_DOMAINS.map(domain => {
    let domainLevel = 0;
    let expertiseCount = 0;

    // Process skills from skills_analysis with enhanced matching
    if (enhancedUserProfile.platform_data?.skills_analysis?.analysis_data?.skills) {
      const userSkills = enhancedUserProfile.platform_data.skills_analysis.analysis_data.skills;
      const domainSkills = userSkills.filter((skill: any) => 
        domain.skills.some((domainSkill: string) => 
          domainSkill.toLowerCase().includes(skill.name.toLowerCase()) ||
          skill.name.toLowerCase().includes(domainSkill.toLowerCase()) ||
          // Enhanced matching for complex names
          skill.name.toLowerCase().replace(/[.\-_]/g, '').includes(domainSkill.toLowerCase().replace(/[.\-_]/g, '')) ||
          domainSkill.toLowerCase().replace(/[.\-_]/g, '').includes(skill.name.toLowerCase().replace(/[.\-_]/g, ''))
        )
      );
      
      if (domainSkills.length > 0) {
        domainLevel = Math.round(domainSkills.reduce((sum: number, skill: any) => sum + skill.level, 0) / domainSkills.length);
        expertiseCount = domainSkills.length;
      }
    }

    // Enhance with repository analysis data
    if (enhancedUserProfile.platform_data?.repository_analyses) {
      enhancedUserProfile.platform_data.repository_analyses.forEach((analysis: any) => {
        if (analysis.analysis_data && analysis.analysis_data.technologies) {
          const technologies = Array.isArray(analysis.analysis_data.technologies) 
            ? analysis.analysis_data.technologies 
            : Object.keys(analysis.analysis_data.technologies || {});
          
          const matchingTechs = technologies.filter((tech: string) => 
            domain.skills.some((skill: string) => 
              skill.toLowerCase().includes(tech.toLowerCase()) ||
              tech.toLowerCase().includes(skill.toLowerCase())
            )
          );
          
          if (matchingTechs.length > 0) {
            expertiseCount += matchingTechs.length;
            domainLevel = Math.max(domainLevel, Math.min(5, Math.ceil(analysis.overall_score / 20)));
          }
        }
      });
    }

    // Enhance with tech recommendations
    if (enhancedUserProfile.platform_data?.tech_recommendations) {
      enhancedUserProfile.platform_data.tech_recommendations.forEach((rec: any) => {
        if (rec.recommendations && typeof rec.recommendations === 'object') {
          const recommendedTechs = Object.keys(rec.recommendations);
          const matchingTechs = recommendedTechs.filter((tech: string) => 
            domain.skills.some((skill: string) => 
              skill.toLowerCase().includes(tech.toLowerCase()) ||
              tech.toLowerCase().includes(skill.toLowerCase())
            )
          );
          
          if (matchingTechs.length > 0) {
            expertiseCount += matchingTechs.length * 0.5; // Weight recommendations lower
          }
        }
      });
    }

    return {
      ...domain,
      level: Math.min(5, domainLevel),
      expertiseCount: Math.round(expertiseCount)
    };
  });

  // Sort by expertise level and count
  return processedDomains.sort((a, b) => {
    const aScore = (a.level || 0) * 10 + (a.expertiseCount || 0);
    const bScore = (b.level || 0) * 10 + (b.expertiseCount || 0);
    return bScore - aScore;
  });
};

const getTechStackFromRepositories = (enhancedUserProfile: EnhancedUserProfile | null): Array<{name: string, count: number, category: string}> => {
  if (!enhancedUserProfile?.platform_data?.repository_analyses) return [];

  const techStack: Record<string, {count: number, category: string}> = {};

  enhancedUserProfile.platform_data.repository_analyses.forEach((analysis: any) => {
    if (analysis.analysis_data?.technologies) {
      const technologies = analysis.analysis_data.technologies;
      
      if (Array.isArray(technologies)) {
        technologies.forEach((tech: string) => {
          const category = SKILL_DOMAINS.find(domain => 
            domain.skills.some((skill: string) => 
              skill.toLowerCase().includes(tech.toLowerCase()) ||
              tech.toLowerCase().includes(skill.toLowerCase())
            )
          )?.name || 'Other';
          
          if (!techStack[tech]) {
            techStack[tech] = { count: 0, category };
          }
          techStack[tech].count++;
        });
      } else if (typeof technologies === 'object') {
        Object.entries(technologies).forEach(([tech, usage]: [string, any]) => {
          const category = SKILL_DOMAINS.find(domain => 
            domain.skills.some((skill: string) => 
              skill.toLowerCase().includes(tech.toLowerCase()) ||
              tech.toLowerCase().includes(skill.toLowerCase())
            )
          )?.name || 'Other';
          
          if (!techStack[tech]) {
            techStack[tech] = { count: 0, category };
          }
          techStack[tech].count += typeof usage === 'number' ? usage : 1;
        });
      }
    }
  });

  return Object.entries(techStack)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20); // Top 20 technologies
};

const getAIExpertiseMetrics = (enhancedUserProfile: EnhancedUserProfile | null) => {
  if (!enhancedUserProfile?.platform_data) return null;

  const aiIssues = enhancedUserProfile.platform_data.recent_ai_issues || [];
  const aiRepos = enhancedUserProfile.platform_data.ai_repositories || [];
  const techRecs = enhancedUserProfile.platform_data.tech_recommendations || [];

  return {
    totalAIIssues: aiIssues.length,
    totalAIRepos: aiRepos.length,
    totalTechRecommendations: techRecs.length,
    averageComplexity: aiIssues.length > 0 
      ? aiIssues.reduce((sum: number, issue: any) => {
          const complexity = issue.complexity === 'high' ? 3 : issue.complexity === 'medium' ? 2 : 1;
          return sum + complexity;
        }, 0) / aiIssues.length 
      : 0,
    aiGeneratedFiles: aiRepos.reduce((sum: number, repo: any) => sum + (repo.created_files || 0), 0),
    recentActivity: aiIssues.filter((issue: any) => {
      const daysSinceCreation = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceCreation <= 30;
    }).length
  };
};

interface GitHubAnalysisResult {
  success: boolean
  message: string
  analysis: any
  onboarding: any
  next_steps: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c']
const RADIAL_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#d084a6', '#ffb347']

// Helper function to get color classes for Tailwind CSS
const getColorClasses = (color: string) => {
  const colorMap: Record<string, any> = {
    blue: {
      bg: 'bg-blue-50',
      bgTo: 'bg-blue-100',
      border: 'border-blue-200',
      borderHover: 'border-blue-300',
      text: 'text-blue-700',
      textLight: 'text-blue-600',
      textDark: 'text-blue-800',
      badgeBg: 'bg-blue-200',
      badgeText: 'text-blue-800',
      borderBadge: 'border-blue-300'
    },
    green: {
      bg: 'bg-green-50',
      bgTo: 'bg-green-100',
      border: 'border-green-200',
      borderHover: 'border-green-300',
      text: 'text-green-700',
      textLight: 'text-green-600',
      textDark: 'text-green-800',
      badgeBg: 'bg-green-200',
      badgeText: 'text-green-800',
      borderBadge: 'border-green-300'
    },
    purple: {
      bg: 'bg-purple-50',
      bgTo: 'bg-purple-100',
      border: 'border-purple-200',
      borderHover: 'border-purple-300',
      text: 'text-purple-700',
      textLight: 'text-purple-600',
      textDark: 'text-purple-800',
      badgeBg: 'bg-purple-200',
      badgeText: 'text-purple-800',
      borderBadge: 'border-purple-300'
    },
    orange: {
      bg: 'bg-orange-50',
      bgTo: 'bg-orange-100',
      border: 'border-orange-200',
      borderHover: 'border-orange-300',
      text: 'text-orange-700',
      textLight: 'text-orange-600',
      textDark: 'text-orange-800',
      badgeBg: 'bg-orange-200',
      badgeText: 'text-orange-800',
      borderBadge: 'border-orange-300'
    },
    cyan: {
      bg: 'bg-cyan-50',
      bgTo: 'bg-cyan-100',
      border: 'border-cyan-200',
      borderHover: 'border-cyan-300',
      text: 'text-cyan-700',
      textLight: 'text-cyan-600',
      textDark: 'text-cyan-800',
      badgeBg: 'bg-cyan-200',
      badgeText: 'text-cyan-800',
      borderBadge: 'border-cyan-300'
    },
    pink: {
      bg: 'bg-pink-50',
      bgTo: 'bg-pink-100',
      border: 'border-pink-200',
      borderHover: 'border-pink-300',
      text: 'text-pink-700',
      textLight: 'text-pink-600',
      textDark: 'text-pink-800',
      badgeBg: 'bg-pink-200',
      badgeText: 'text-pink-800',
      borderBadge: 'border-pink-300'
    },
    indigo: {
      bg: 'bg-indigo-50',
      bgTo: 'bg-indigo-100',
      border: 'border-indigo-200',
      borderHover: 'border-indigo-300',
      text: 'text-indigo-700',
      textLight: 'text-indigo-600',
      textDark: 'text-indigo-800',
      badgeBg: 'bg-indigo-200',
      badgeText: 'text-indigo-800',
      borderBadge: 'border-indigo-300'
    },
    red: {
      bg: 'bg-red-50',
      bgTo: 'bg-red-100',
      border: 'border-red-200',
      borderHover: 'border-red-300',
      text: 'text-red-700',
      textLight: 'text-red-600',
      textDark: 'text-red-800',
      badgeBg: 'bg-red-200',
      badgeText: 'text-red-800',
      borderBadge: 'border-red-300'
    },
    yellow: {
      bg: 'bg-yellow-50',
      bgTo: 'bg-yellow-100',
      border: 'border-yellow-200',
      borderHover: 'border-yellow-300',
      text: 'text-yellow-700',
      textLight: 'text-yellow-600',
      textDark: 'text-yellow-800',
      badgeBg: 'bg-yellow-200',
      badgeText: 'text-yellow-800',
      borderBadge: 'border-yellow-300'
    },
    emerald: {
      bg: 'bg-emerald-50',
      bgTo: 'bg-emerald-100',
      border: 'border-emerald-200',
      borderHover: 'border-emerald-300',
      text: 'text-emerald-700',
      textLight: 'text-emerald-600',
      textDark: 'text-emerald-800',
      badgeBg: 'bg-emerald-200',
      badgeText: 'text-emerald-800',
      borderBadge: 'border-emerald-300'
    },
    violet: {
      bg: 'bg-violet-50',
      bgTo: 'bg-violet-100',
      border: 'border-violet-200',
      borderHover: 'border-violet-300',
      text: 'text-violet-700',
      textLight: 'text-violet-600',
      textDark: 'text-violet-800',
      badgeBg: 'bg-violet-200',
      badgeText: 'text-violet-800',
      borderBadge: 'border-violet-300'
    },
    slate: {
      bg: 'bg-slate-50',
      bgTo: 'bg-slate-100',
      border: 'border-slate-200',
      borderHover: 'border-slate-300',
      text: 'text-slate-700',
      textLight: 'text-slate-600',
      textDark: 'text-slate-800',
      badgeBg: 'bg-slate-200',
      badgeText: 'text-slate-800',
      borderBadge: 'border-slate-300'
    },
    lime: {
      bg: 'bg-lime-50',
      bgTo: 'bg-lime-100',
      border: 'border-lime-200',
      borderHover: 'border-lime-300',
      text: 'text-lime-700',
      textLight: 'text-lime-600',
      textDark: 'text-lime-800',
      badgeBg: 'bg-lime-200',
      badgeText: 'text-lime-800',
      borderBadge: 'border-lime-300'
    },
    amber: {
      bg: 'bg-amber-50',
      bgTo: 'bg-amber-100',
      border: 'border-amber-200',
      borderHover: 'border-amber-300',
      text: 'text-amber-700',
      textLight: 'text-amber-600',
      textDark: 'text-amber-800',
      badgeBg: 'bg-amber-200',
      badgeText: 'text-amber-800',
      borderBadge: 'border-amber-300'
    }
  };
  
  return colorMap[color] || colorMap.slate;
};

// Enhanced user profile interface to match the comprehensive API response
interface EnhancedUserProfile {
  id: number;
  login: string;
  name: string;
  email?: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
  bio?: string;
  location?: string;
  blog?: string;
  company?: string;
  created_at: string;
  updated_at: string;
  database_id: number | null;
  github_user_id: number;
  is_stored_user: boolean;
  profile?: {
    progress?: {
      current_level: number;
      xp_points: number;
      badges: string[];
      next_goal: string;
      last_updated?: string;
    };
    skills_analysis?: {
      id: number;
      analysis_data?: {
        skills?: Array<{
          name: string;
          level: number;
          category: string;
          confidence: number;
          last_used?: string;
          projects_count?: number;
        }>;
        roadmap?: Array<{
          skill: string;
          current_level: number;
          target_level: number;
          priority: string;
          estimated_time: string;
          resources: string[];
          milestones?: string[];
        }>;
        overall_analysis?: {
          total_skills: number;
          average_level: number;
          skill_distribution: Record<string, number>;
          top_categories: string[];
          recommended_focus: string[];
        };
      };
      skill_level?: string;
      strengths: string[];
      growth_areas: string[];
      target_role?: string;
      match_percentage?: number;
      created_at: string;
      expires_at: string;
    };
    achievements?: Array<{
      achievement_name: string;
      description?: string;
      earned_at: string;
    }>;
    onboarding?: {
      uploaded_cv_url?: string;
      target_role?: string;
      chosen_path?: string;
      onboarding_complete: boolean;
      created_at: string;
    };
    recent_operations?: Array<{
      operation_type: string;
      description: string;
      result: string;
      created_at: string;
    }>;
    is_onboarded?: boolean;
    current_level?: number;
    xp_points?: number;
  };
  platform_data?: {
    skills_analysis?: {
      id: number;
      analysis_data?: {
        skills?: Array<{
          name: string;
          level: number;
          category: string;
          confidence?: number;
          context?: string;
          evidence?: string;
          years_experience?: string;
        }>;
        development_level?: string;
        match_percentage?: number;
      };
      skill_level?: string;
      strengths?: string[];
      growth_areas?: string[];
      created_at: string;
      expires_at: string;
    };
    progress?: {
      current_level: number;
      xp_points: number;
      badges: string[];
      next_goal: string;
      last_updated?: string;
    };
    achievements?: Array<{
      achievement_name: string;
      description?: string;
      earned_at: string;
    }>;
    onboarding?: {
      uploaded_cv_url?: string;
      target_role?: string;
      chosen_path?: string;
      onboarding_complete: boolean;
      created_at: string;
    };
    repository_analyses?: Array<{
      id: number;
      owner: string;
      repo_name: string;
      analysis_type: string;
      analysis_data: any;
      overall_score: number;
      created_at: string;
      expires_at: string;
    }>;
    tech_recommendations?: Array<{
      id: number;
      owner: string;
      repo_name: string;
      current_stack?: any;
      recommendations: any;
      implementation_priority?: string;
      created_at: string;
      expires_at: string;
    }>;
    recent_ai_issues?: Array<{
      id: number;
      owner: string;
      repo_name: string;
      issue_title: string;
      priority?: string;
      complexity?: string;
      status: string;
      estimated_hours?: number;
      created_at: string;
    }>;
    ai_repositories?: Array<{
      id: number;
      repo_name: string;
      requirements: string;
      created_files: number;
      created_issues: number;
      created_at: string;
    }>;
    leaderboard?: {
      total_points: number;
      current_rank?: number;
      last_updated: string;
    };
    resume?: {
      resume_data: any;
      last_synced: string;
    };
  };
  stats?: {
    github_stats: {
      public_repos: number;
      followers: number;
      following: number;
    };
    platform_stats: {
      level: number;
      xp: number;
      achievements_count: number;
      recent_operations_count: number;
    };
  };
  summary_stats?: {
    total_analyses: number;
    total_ai_issues: number;
    total_ai_repos: number;
    total_achievements: number;
    has_skills_analysis: boolean;
    has_resume: boolean;
    onboarding_complete: boolean;
  };
}

const SkillTreePage = () => {
  const { apiCall, isAuthenticated, user } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [enhancedUserProfile, setEnhancedUserProfile] = useState<EnhancedUserProfile | null>(null)
  const [analysisResult, setAnalysisResult] = useState<SkillAnalysisResult | null>(null)
  const [githubAnalysis, setGithubAnalysis] = useState<GitHubAnalysisResult | null>(null)
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(null)
  const [roadmapLoading, setRoadmapLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [targetRole, setTargetRole] = useState('Full Stack Developer')
  const [githubUsername, setGithubUsername] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Fetch comprehensive user data from expanded API
  const fetchUserData = async () => {
    if (!isAuthenticated) {
      setInitialLoading(false)
      return
    }

    setInitialLoading(true)
    try {
      const response = await apiCall('/demo/api/user')

      if (response.ok) {
        const data: UserData = await response.json()
        setUserData(data)
        setGithubUsername(data.login)
        
        // Also set enhanced user profile for the new comprehensive sections
        setEnhancedUserProfile(data as any as EnhancedUserProfile)
        
        // Auto-switch to appropriate tab based on available data
        if (data.platform_data.skills_analysis) {
          setActiveTab('skills')
        } else if (data.platform_data.repository_analyses.length > 0) {
          setActiveTab('repositories')
        } else if (data.platform_data.progress) {
          setActiveTab('progress')
        }
      } else {
        console.error('Failed to fetch user data:', response.status, response.statusText)
        // If we get a 401, it might be a stale session
        if (response.status === 401) {
          console.log('Authentication failed, user may need to re-login')
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
    setInitialLoading(false)
  }

  // Load user data when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserData()
    }
  }, [isAuthenticated])

  // Chart data preparation functions for skills analysis
  const prepareSkillCategoryData = () => {
    if (!analysisResult?.skills_assessment.skill_categories) {
      // Try to use userData skills if available
      if (userData?.platform_data.skills_analysis?.analysis_data?.skill_categories) {
        const categories = userData.platform_data.skills_analysis.analysis_data.skill_categories
        return Object.entries(categories).map(([category, skills]: [string, any]) => ({
          name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          value: Array.isArray(skills) ? skills.length : 1,
          skills: Array.isArray(skills) ? skills.length : 1
        }))
      }
      return []
    }
    
    const categories = analysisResult.skills_assessment.skill_categories
    return Object.entries(categories).map(([category, skills]) => ({
      name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: skills.length,
      skills: skills.length
    }))
  }

  // Chart data for user progress and achievements
  const prepareProgressData = () => {
    if (!userData?.platform_data.progress) return []
    
    const progress = userData.platform_data.progress
    return [
      {
        name: 'Current Level',
        value: progress.current_level,
        max: 10
      },
      {
        name: 'XP Points',
        value: progress.xp_points,
        max: (progress.current_level + 1) * 1000
      }
    ]
  }

  // Chart data for repository analyses scores
  const prepareRepositoryScoresData = () => {
    if (!userData?.platform_data.repository_analyses) return []
    
    return userData.platform_data.repository_analyses.slice(0, 10).map(analysis => ({
      name: `${analysis.owner}/${analysis.repo_name}`,
      score: analysis.overall_score,
      type: analysis.analysis_type
    }))
  }

  // Chart data for achievements timeline
  const prepareAchievementsData = () => {
    if (!userData?.platform_data.achievements) return []
    
    const monthlyAchievements: { [key: string]: number } = {}
    userData.platform_data.achievements.forEach(achievement => {
      const month = achievement.earned_at.substring(0, 7) // YYYY-MM
      monthlyAchievements[month] = (monthlyAchievements[month] || 0) + 1
    })
    
    return Object.entries(monthlyAchievements).map(([month, count]) => ({
      month,
      achievements: count
    })).slice(-6) // Last 6 months
  }

  // Chart data for tech stack distribution
  const prepareTechStackData = () => {
    if (!userData?.platform_data.tech_recommendations) return []
    
    const techCount: { [key: string]: number } = {}
    userData.platform_data.tech_recommendations.forEach(rec => {
      if (rec.current_stack) {
        Object.keys(rec.current_stack).forEach(tech => {
          techCount[tech] = (techCount[tech] || 0) + 1
        })
      }
    })
    
    return Object.entries(techCount).map(([tech, count]) => ({
      name: tech,
      value: count
    })).slice(0, 8) // Top 8 technologies
  }

  const prepareSkillLevelData = () => {
    if (!analysisResult?.learning_roadmap.roadmap_items) return []
    
    return analysisResult.learning_roadmap.roadmap_items.map(item => ({
      skill: item.skill,
      current: item.current_level,
      target: item.target_level,
      priority: item.priority
    })).slice(0, 8) // Show top 8 skills
  }

  const preparePriorityData = () => {
    if (!analysisResult?.learning_roadmap) return []
    
    return [
      { name: 'High Priority', value: analysisResult.learning_roadmap.high_priority, color: '#FF8042' },
      { name: 'Medium Priority', value: analysisResult.learning_roadmap.medium_priority, color: '#FFBB28' },
      { name: 'Low Priority', value: analysisResult.learning_roadmap.low_priority, color: '#00C49F' }
    ]
  }

  // AI-powered roadmap generation using Gemini
  const generateAIRoadmap = async () => {
    if (!userData) return

    setRoadmapLoading(true)
    try {
      // Prepare developer data from user's repositories and profile
      const developerData: DeveloperData = {
        profile: {
          login: userData.login,
          name: userData.name,
          bio: userData.bio || '',
          location: userData.location || '',
          company: userData.company || '',
          public_repos: userData.public_repos,
          followers: userData.followers,
          following: userData.following,
          created_at: userData.created_at
        },
        repositories: userData.platform_data.repository_analyses?.map(analysis => ({
          name: analysis.repo_name,
          description: analysis.analysis_data?.description || '',
          language: analysis.analysis_data?.primary_language || '',
          stargazers_count: analysis.analysis_data?.stars || 0,
          forks_count: analysis.analysis_data?.forks || 0,
          created_at: analysis.created_at,
          updated_at: analysis.created_at,
          private: false,
          topics: analysis.analysis_data?.topics || []
        })) || [],
        contributions: {
          total_contributions: userData.platform_data.progress?.xp_points || 0,
          current_streak: Math.floor(Math.random() * 30) + 1, // Mock data
          longest_streak: Math.floor(Math.random() * 100) + 30, // Mock data
          languages: userData.platform_data.repository_analyses?.reduce((acc, analysis) => {
            const lang = analysis.analysis_data?.primary_language;
            if (lang) {
              acc[lang] = (acc[lang] || 0) + 1;
            }
            return acc;
          }, {} as Record<string, number>) || {}
        },
        stats: {
          total_commits: userData.platform_data.progress?.xp_points || 0,
          total_prs: userData.platform_data.recent_ai_issues?.length || 0,
          total_issues: userData.platform_data.ai_repositories?.length || 0
        }
      }

      // Get target role from input or onboarding data
      const userTargetRole = targetRole.trim() || userData.platform_data.onboarding?.target_role || 'Software Developer'

      // Generate AI insights with target role
      const insights = await geminiService.analyzeDeveloperProfile(developerData, userTargetRole)
      
      // Enhance insights with user's target role
      const enhancedInsights = {
        ...insights,
        targetRole: userTargetRole,
        repositoryInsights: userData.platform_data.repository_analyses?.map(analysis => ({
          name: analysis.repo_name,
          score: analysis.overall_score,
          technologies: analysis.analysis_data?.technologies || [],
          complexity: analysis.analysis_data?.complexity || 'Medium'
        })) || []
      }

      setAiInsights(enhancedInsights)
    } catch (error) {
      console.error('Failed to generate AI roadmap:', error)
    }
    setRoadmapLoading(false)
  }

  // Enhanced roadmap data preparation
  const prepareRoadmapTimelineData = () => {
    if (!aiInsights?.learningPath) return []
    
    return aiInsights.learningPath.map((item, index) => ({
      name: item.skill,
      currentLevel: Math.floor(Math.random() * 5) + 1,
      targetLevel: Math.floor(Math.random() * 3) + 7,
      priority: index < 3 ? 'High' : index < 6 ? 'Medium' : 'Low',
      estimatedWeeks: Math.floor(Math.random() * 12) + 4,
      difficulty: index < 2 ? 'Advanced' : index < 5 ? 'Intermediate' : 'Beginner'
    }))
  }

  const prepareSkillProgressData = () => {
    if (!aiInsights?.score) return []
    
    return [
      { name: 'Technical', value: aiInsights.score.technical, max: 100 },
      { name: 'Collaboration', value: aiInsights.score.collaboration, max: 100 },
      { name: 'Consistency', value: aiInsights.score.consistency, max: 100 },
      { name: 'Overall', value: aiInsights.score.overall, max: 100 }
    ]
  }

  const prepareProjectComplexityData = () => {
    if (!aiInsights?.recommendedProjects) return []
    
    return aiInsights.recommendedProjects.map(project => ({
      name: project.title,
      difficulty: project.difficulty === 'Beginner' ? 1 : project.difficulty === 'Intermediate' ? 2 : 3,
      estimatedTime: parseInt(project.estimatedTime.split(' ')[0]) || 4,
      technologies: project.technologies.length
    }))
  }

  const analyzeCV = async () => {
    if (!cvFile) return

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('cv_file', cvFile)
      formData.append('target_role', targetRole)

      const response = await fetch('/api/cv/analyze', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        setAnalysisResult(data)
        setActiveTab('skills')
      } else {
        console.error('CV Analysis failed:', data.error)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
    }
    setLoading(false)
  }

  const analyzeGitHub = async () => {
    if (!githubUsername) return

    setLoading(true)
    try {
      const response = await fetch('/api/onboarding/github-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target_role: targetRole,
          github_username: githubUsername
        }),
        credentials: 'include'
      })

      const data = await response.json()
      
      if (data.success) {
        setGithubAnalysis(data)
        setActiveTab('github')
      } else {
        console.error('GitHub Analysis failed:', data.error)
      }
    } catch (error) {
      console.error('GitHub analysis failed:', error)
    }
    setLoading(false)
  }

  const getSkillIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      'programming_languages': <Code className="w-5 h-5" />,
      'frameworks': <Cpu className="w-5 h-5" />,
      'databases': <Database className="w-5 h-5" />,
      'cloud_platforms': <Cloud className="w-5 h-5" />,
      'devops_tools': <Zap className="w-5 h-5" />,
      'ai_ml_tools': <Brain className="w-5 h-5" />,
      'data_analysis': <BarChart3 className="w-5 h-5" />,
      'soft_skills': <Users className="w-5 h-5" />
    }
    return icons[category] || <Star className="w-5 h-5" />
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getLevelColor = (level: number) => {
    if (level >= 4) return 'text-green-600'
    if (level >= 3) return 'text-blue-600'
    if (level >= 2) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <AuroraBackground className="dark min-h-screen">
      {/* Mouse follower effect */}
      <motion.div
        className="fixed pointer-events-none z-50 w-3 h-3 bg-purple-400/20 rounded-full blur-sm"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
      />

      {/* Dashboard Content */}
      <div className="relative z-30 w-full min-h-screen">
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar
            variant="inset"
            className="backdrop-blur-lg bg-black/30 border-purple-500/20"
          />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <div className="max-w-7xl mx-auto w-full px-4 lg:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 py-6"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Skill Development Hub
            </h1>
          </div>
          <p className="text-purple-200/80 text-lg max-w-2xl mx-auto">
            Comprehensive AI-powered skill analysis, personalized roadmaps, and career development insights
          </p>
        </motion.div>

        {/* Analysis Input Section */}
        <Card className="mb-8 shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20 hover:shadow-purple-500/20 transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-purple-400" />
              Start Your Analysis
            </CardTitle>
            <CardDescription className="text-purple-200/80">
              Upload your CV or analyze your GitHub profile to get personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cv" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-black/30 border-purple-500/20">
                <TabsTrigger value="cv" className="flex items-center gap-2 text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">
                  <FileText className="w-4 h-4" />
                  CV Analysis
                </TabsTrigger>
                <TabsTrigger value="github" className="flex items-center gap-2 text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">
                  <Github className="w-4 h-4" />
                  GitHub Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cv" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cv-file" className="text-purple-200">Upload CV (PDF, DOC, TXT)</Label>
                    <Input
                      id="cv-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="cursor-pointer bg-black/30 border-purple-500/30 text-white file:bg-purple-500/20 file:text-purple-200 file:border-purple-500/30"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-role" className="text-purple-200">Target Role</Label>
                    <select
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full p-2 border border-purple-500/30 rounded-md bg-black/30 text-white"
                    >
                      <option value="software_engineer">Software Engineer</option>
                      <option value="frontend_developer">Frontend Developer</option>
                      <option value="backend_developer">Backend Developer</option>
                      <option value="full_stack_developer">Full Stack Developer</option>
                      <option value="devops_engineer">DevOps Engineer</option>
                      <option value="data_scientist">Data Scientist</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={analyzeCV}
                      disabled={!cvFile || loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Analyze CV
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="github" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github-username" className="text-purple-200">GitHub Username</Label>
                    <Input
                      id="github-username"
                      placeholder="your-github-username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      className="bg-black/30 border-purple-500/30 text-white placeholder:text-purple-200/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-role-github" className="text-purple-200">Target Role</Label>
                    <select
                      id="target-role-github"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full p-2 border border-purple-500/30 rounded-md bg-black/30 text-white"
                    >
                      <option value="software_engineer">Software Engineer</option>
                      <option value="frontend_developer">Frontend Developer</option>
                      <option value="backend_developer">Backend Developer</option>
                      <option value="full_stack_developer">Full Stack Developer</option>
                      <option value="devops_engineer">DevOps Engineer</option>
                      <option value="data_scientist">Data Scientist</option>
                    </select>
                  </div>
                  
                  <div className="flex items-end">
                    <Button 
                      onClick={analyzeGitHub}
                      disabled={!githubUsername || loading}
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                    >
                      {loading ? (
                        <>
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4 mr-2" />
                          Analyze GitHub
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Loading State */}
        {initialLoading && (
          <Card className="mb-8 shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20">
            <CardContent className="py-12">
              <div className="text-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Loading Your Data...
                </h3>
                <p className="text-purple-200/80">
                  Fetching comprehensive insights from your profile
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results Section */}
        {!initialLoading && (userData || analysisResult || githubAnalysis) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 mb-6 bg-black/30 border-purple-500/20">
              <TabsTrigger value="overview" className="text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">Overview</TabsTrigger>
              <TabsTrigger value="skills" className="text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">Skills</TabsTrigger>
              <TabsTrigger value="progress" className="text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">Progress</TabsTrigger>
              <TabsTrigger value="repositories" className="text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">Repositories</TabsTrigger>
              <TabsTrigger value="roadmap" className="text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">Roadmap</TabsTrigger>
              <TabsTrigger value="insights" className="text-purple-200 data-[state=active]:text-white data-[state=active]:bg-purple-500/30">Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* User Summary Cards */}
              {userData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
                >
                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20 hover:shadow-purple-500/20 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        Current Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-400 mb-2">
                          {userData.platform_data.progress?.current_level || 1}
                        </div>
                        <div className="text-sm text-purple-200/70 mb-3">
                          {userData.platform_data.progress?.xp_points || 0} XP
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-green-500/20 hover:shadow-green-500/20 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Award className="w-5 h-5 text-green-400" />
                        Achievements
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400 mb-2">
                          {userData.summary_stats.total_achievements}
                        </div>
                        <div className="text-sm text-green-200/70 mb-3">
                          Earned badges
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-blue-500/20 hover:shadow-blue-500/20 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <BarChart3 className="w-5 h-5 text-blue-400" />
                        Analyses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-400 mb-2">
                          {userData.summary_stats.total_analyses}
                        </div>
                        <div className="text-sm text-blue-200/70 mb-3">
                          Repository analyses
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-orange-500/20 hover:shadow-orange-500/20 transition-all duration-300">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2 text-white">
                        <Github className="w-5 h-5 text-orange-400" />
                        AI Projects
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-orange-400 mb-2">
                          {userData.summary_stats.total_ai_repos}
                        </div>
                        <div className="text-sm text-orange-200/70 mb-3">
                          Generated projects
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Tech Stack Overview */}
              {userData && prepareTechStackData().length > 0 && (
                <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20 hover:shadow-purple-500/20 transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="text-white">Technology Stack</CardTitle>
                    <CardDescription className="text-purple-200/80">Your most used technologies</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareTechStackData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareTechStackData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        Development Level
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600 mb-2">
                          {analysisResult.development_level.level}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {analysisResult.development_level.description}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Progress 
                            value={analysisResult.development_level.score * 20} 
                            className="w-20 h-2"
                          />
                          <span className="text-sm font-medium">
                            {analysisResult.development_level.score}/5
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Role Match
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-600 mb-2">
                          {analysisResult.skill_gaps.match_percentage}%
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {analysisResult.skill_gaps.target_role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <Progress 
                          value={analysisResult.skill_gaps.match_percentage} 
                          className="w-full h-2"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-purple-600" />
                        Learning Items
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {analysisResult.learning_roadmap.total_items}
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          Personalized roadmap items
                        </div>
                        <div className="flex justify-center gap-2">
                          <Badge variant="destructive" className="text-xs">
                            {analysisResult.learning_roadmap.high_priority} High
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {analysisResult.learning_roadmap.medium_priority} Med
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Skills Overview Chart */}
              {analysisResult && (
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle>Skills Distribution</CardTitle>
                    <CardDescription>Your skills across different categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareSkillCategoryData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareSkillCategoryData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="space-y-6">
              {userData && (
                <>
                  {/* Progress Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          Current Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span>Level {userData.platform_data.progress?.current_level || 1}</span>
                              <span>{userData.platform_data.progress?.xp_points || 0} XP</span>
                            </div>
                            <Progress 
                              value={((userData.platform_data.progress?.xp_points || 0) % 1000) / 10} 
                              className="w-full h-3"
                            />
                          </div>
                          
                          {userData.platform_data.progress?.next_goal && (
                            <div className="p-3 bg-blue-50 rounded-lg">
                              <div className="text-sm font-medium text-blue-800 mb-1">Next Goal</div>
                              <div className="text-sm text-blue-600">
                                {userData.platform_data.progress.next_goal}
                              </div>
                            </div>
                          )}
                          
                          {userData.platform_data.leaderboard && (
                            <div className="p-3 bg-green-50 rounded-lg">
                              <div className="text-sm font-medium text-green-800 mb-1">Leaderboard</div>
                              <div className="text-sm text-green-600">
                                Rank #{userData.platform_data.leaderboard.current_rank || 'Unranked'} with {userData.platform_data.leaderboard.total_points} points
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Achievements Timeline */}
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5" />
                          Achievements Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareAchievementsData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="achievements" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Badges Grid */}
                  {userData.platform_data.progress?.badges && userData.platform_data.progress.badges.length > 0 && (
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Star className="w-5 h-5" />
                          Earned Badges
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                          {userData.platform_data.progress.badges.map((badge, index) => (
                            <div key={index} className="text-center">
                              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                <Award className="w-8 h-8 text-white" />
                              </div>
                              <div className="text-xs font-medium">{badge}</div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recent Achievements */}
                  {userData.platform_data.achievements.length > 0 && (
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Recent Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {userData.platform_data.achievements.slice(0, 5).map((achievement, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                <Award className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{achievement.achievement_name}</div>
                                {achievement.description && (
                                  <div className="text-sm text-gray-600">{achievement.description}</div>
                                )}
                                <div className="text-xs text-gray-500">
                                  {new Date(achievement.earned_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Repositories Tab */}
            <TabsContent value="repositories" className="space-y-6">
              {userData && (
                <>
                  {/* Repository Analyses */}
                  {userData.platform_data.repository_analyses.length > 0 && (
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Repository Analysis Scores
                        </CardTitle>
                        <CardDescription>
                          Performance scores of your analyzed repositories
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareRepositoryScoresData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                              />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="score" fill="#8884d8" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Repository Analysis Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {userData.platform_data.repository_analyses.slice(0, 4).map((analysis, index) => (
                      <motion.div
                        key={analysis.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="shadow-lg border-0 h-full">
                          <CardHeader>
                            <CardTitle className="text-lg">
                              {analysis.owner}/{analysis.repo_name}
                            </CardTitle>
                            <CardDescription>
                              Analysis Type: {analysis.analysis_type}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-medium">Overall Score</span>
                                <Badge variant={analysis.overall_score >= 80 ? "default" : analysis.overall_score >= 60 ? "secondary" : "destructive"}>
                                  {analysis.overall_score}/100
                                </Badge>
                              </div>
                              
                              <Progress value={analysis.overall_score} className="w-full h-2" />
                              
                              <div className="text-xs text-gray-500">
                                Analyzed: {new Date(analysis.created_at).toLocaleDateString()}
                              </div>
                              
                              {analysis.analysis_data && Object.keys(analysis.analysis_data).length > 0 && (
                                <div className="mt-3">
                                  <details className="text-sm">
                                    <summary className="cursor-pointer font-medium text-blue-600">
                                      View Details
                                    </summary>
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                      <pre className="whitespace-pre-wrap">
                                        {JSON.stringify(analysis.analysis_data, null, 2).slice(0, 200)}...
                                      </pre>
                                    </div>
                                  </details>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {/* Tech Recommendations */}
                  {userData.platform_data.tech_recommendations.length > 0 && (
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Technology Recommendations
                        </CardTitle>
                        <CardDescription>
                          AI-suggested improvements for your repositories
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {userData.platform_data.tech_recommendations.slice(0, 3).map((rec, index) => (
                            <div key={rec.id} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium">{rec.owner}/{rec.repo_name}</h4>
                                {rec.implementation_priority && (
                                  <Badge variant={rec.implementation_priority === 'high' ? 'destructive' : 'secondary'}>
                                    {rec.implementation_priority} priority
                                  </Badge>
                                )}
                              </div>
                              
                              {rec.recommendations && (
                                <div className="text-sm text-gray-700">
                                  <pre className="whitespace-pre-wrap">
                                    {typeof rec.recommendations === 'string' 
                                      ? rec.recommendations 
                                      : JSON.stringify(rec.recommendations, null, 2).slice(0, 300)}
                                  </pre>
                                </div>
                              )}
                              
                              <div className="text-xs text-gray-500 mt-2">
                                Generated: {new Date(rec.created_at).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* AI Generated Projects */}
                  {userData.platform_data.ai_repositories.length > 0 && (
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Brain className="w-5 h-5" />
                          AI Generated Projects
                        </CardTitle>
                        <CardDescription>
                          Projects created by AI based on your requirements
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userData.platform_data.ai_repositories.map((repo, index) => (
                            <div key={repo.id} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <h4 className="font-medium mb-2">{repo.repo_name}</h4>
                              <div className="text-sm text-gray-700 mb-3">
                                {repo.requirements}
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>{repo.created_files} files • {repo.created_issues} issues</span>
                                <span>{new Date(repo.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Skills Assessment Tab */}
            <TabsContent value="skills" className="space-y-6">
              {/* Comprehensive Skill Domains */}
              {enhancedUserProfile && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Skill Domains Overview */}
                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20 hover:shadow-purple-500/20 transition-all duration-300">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Layers className="w-6 h-6 text-purple-400" />
                        Comprehensive Skill Domains
                      </CardTitle>
                      <CardDescription className="text-purple-200/80">
                        Your expertise across {SKILL_DOMAINS.length} technology domains, powered by comprehensive data analysis
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const processedDomains = processSkillDomainsFromAPI(enhancedUserProfile);
                        const topDomains = processedDomains.slice(0, 6);
                        
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {topDomains.map((domain, index) => {
                              const IconComponent = domain.icon;
                              const level = domain.level || 0;
                              const expertiseCount = domain.expertiseCount || 0;
                              const colors = getColorClasses(domain.color);
                              
                              return (
                                <motion.div
                                  key={domain.id}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className={`p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer bg-gradient-to-br ${colors.bg} ${colors.bgTo} ${colors.border} hover:${colors.borderHover}`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <IconComponent className={`w-5 h-5 ${colors.textLight}`} />
                                      <h3 className={`font-semibold ${colors.textDark}`}>{domain.name}</h3>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-lg font-bold ${colors.text}`}>
                                        {level}/5
                                      </div>
                                      <div className={`text-xs ${colors.textLight}`}>
                                        {expertiseCount} skills
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <p className={`text-sm ${colors.text} mb-3`}>
                                    {domain.description}
                                  </p>
                                  
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                      <span className={colors.textLight}>Proficiency</span>
                                      <span className={`${colors.textDark} font-medium`}>
                                        {level === 0 ? 'Beginner' : 
                                         level === 1 ? 'Novice' :
                                         level === 2 ? 'Intermediate' :
                                         level === 3 ? 'Advanced' :
                                         level === 4 ? 'Expert' : 'Master'}
                                      </span>
                                    </div>
                                    <Progress value={(level / 5) * 100} className="h-2" />
                                  </div>
                                  
                                  <div className="mt-3 flex flex-wrap gap-1">
                                    {domain.skills.slice(0, 4).map(skill => (
                                      <Badge key={skill} variant="secondary" className={`text-xs ${colors.badgeBg} ${colors.badgeText}`}>
                                        {skill}
                                      </Badge>
                                    ))}
                                    {domain.skills.length > 4 && (
                                      <Badge variant="outline" className={`text-xs ${colors.borderBadge} ${colors.text}`}>
                                        +{domain.skills.length - 4}
                                      </Badge>
                                    )}
                                  </div>
                                </motion.div>
                              );
                            })}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>

                  {/* Technology Stack from Repository Analysis */}
                  {(() => {
                    const techStack = getTechStackFromRepositories(enhancedUserProfile);
                    
                    if (techStack.length > 0) {
                      return (
                        <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-green-500/20 hover:shadow-green-500/20 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Code className="w-6 h-6 text-green-400" />
                              Technology Stack Analysis
                            </CardTitle>
                            <CardDescription className="text-green-200/80">
                              Technologies detected from your repository analyses ({techStack.length} technologies)
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold text-green-200 mb-3">Top Technologies</h4>
                                <div className="space-y-2">
                                  {techStack.slice(0, 10).map((tech, index) => (
                                    <div key={tech.name} className="flex items-center justify-between p-2 rounded bg-green-500/10 border border-green-500/20">
                                      <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                        <span className="text-sm font-medium text-green-200">{tech.name}</span>
                                        <Badge variant="outline" className="text-xs border-green-500/30 text-green-300">{tech.category}</Badge>
                                      </div>
                                      <span className="text-sm text-green-400 font-medium">{tech.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-semibold text-green-200 mb-3">Domain Distribution</h4>
                                <div className="space-y-1">
                                  {(() => {
                                    const categoryCount: Record<string, number> = {};
                                    techStack.forEach(tech => {
                                      categoryCount[tech.category] = (categoryCount[tech.category] || 0) + tech.count;
                                    });
                                    
                                    const sortedCategories = Object.entries(categoryCount)
                                      .sort(([,a], [,b]) => b - a)
                                      .slice(0, 8);
                                      
                                    const maxCount = Math.max(...Object.values(categoryCount));
                                    
                                    return sortedCategories.map(([category, count]) => (
                                      <div key={category} className="space-y-1">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-green-200 font-medium">{category}</span>
                                          <span className="text-green-400">{count}</span>
                                        </div>
                                        <Progress 
                                          value={(count / maxCount) * 100} 
                                          className="h-2 bg-green-900/30"
                                        />
                                      </div>
                                    ));
                                  })()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })()}

                  {/* AI-Assisted Development Metrics */}
                  {(() => {
                    const aiMetrics = getAIExpertiseMetrics(enhancedUserProfile);
                    
                    if (aiMetrics && (aiMetrics.totalAIIssues > 0 || aiMetrics.totalAIRepos > 0 || aiMetrics.totalTechRecommendations > 0)) {
                      return (
                        <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-pink-500/20 hover:shadow-pink-500/20 transition-all duration-300">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-white">
                              <Brain className="w-6 h-6 text-pink-400" />
                              AI-Assisted Development Expertise
                            </CardTitle>
                            <CardDescription className="text-pink-200/80">
                              Your experience with AI-powered development tools and automation
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                              <div className="text-center p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
                                <div className="text-2xl font-bold text-purple-400">{aiMetrics.totalAIIssues}</div>
                                <div className="text-sm text-purple-200/70">AI Issues</div>
                              </div>
                              <div className="text-center p-3 bg-pink-500/10 rounded-lg border border-pink-500/20">
                                <div className="text-2xl font-bold text-pink-400">{aiMetrics.totalAIRepos}</div>
                                <div className="text-sm text-pink-200/70">AI Projects</div>
                              </div>
                              <div className="text-center p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                                <div className="text-2xl font-bold text-indigo-400">{aiMetrics.aiGeneratedFiles}</div>
                                <div className="text-sm text-indigo-200/70">Generated Files</div>
                              </div>
                              <div className="text-center p-3 bg-violet-500/10 rounded-lg border border-violet-500/20">
                                <div className="text-2xl font-bold text-violet-400">{aiMetrics.recentActivity}</div>
                                <div className="text-sm text-violet-200/70">Recent Activity</div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-pink-200 font-medium">Complexity Level</span>
                                <span className="text-pink-400">
                                  {aiMetrics.averageComplexity.toFixed(1)}/3.0 
                                  ({aiMetrics.averageComplexity < 1.5 ? 'Simple' : 
                                    aiMetrics.averageComplexity < 2.5 ? 'Moderate' : 'Complex'})
                                </span>
                              </div>
                              <Progress 
                                value={(aiMetrics.averageComplexity / 3) * 100} 
                                className="h-3 bg-pink-900/30"
                              />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    }
                    return null;
                  })()}

                  {/* Detailed Skills Breakdown */}
                  {enhancedUserProfile.platform_data?.skills_analysis?.analysis_data?.skills && (
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-indigo-50 to-blue-100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-indigo-700">
                          <Star className="w-6 h-6" />
                          Detailed Skills Analysis
                        </CardTitle>
                        <CardDescription>
                          Your {enhancedUserProfile.platform_data.skills_analysis.analysis_data.skills.length} skills analyzed with experience levels and evidence
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          {(() => {
                            const skillsByCategory: Record<string, any[]> = {};
                            enhancedUserProfile.platform_data.skills_analysis.analysis_data.skills.forEach((skill: any) => {
                              if (!skillsByCategory[skill.category]) {
                                skillsByCategory[skill.category] = [];
                              }
                              skillsByCategory[skill.category].push(skill);
                            });

                            return Object.entries(skillsByCategory)
                              .sort(([,a], [,b]) => b.length - a.length) // Sort by skill count
                              .map(([category, skills]) => {
                                const categoryIcon = category === 'frontend' ? Monitor :
                                                   category === 'backend' ? Server :
                                                   category === 'blockchain' ? Boxes :
                                                   category === 'ai_ml' ? Brain :
                                                   category === 'database' ? Database :
                                                   category === 'cloud' ? Cloud :
                                                   category === 'tools' ? Settings :
                                                   category === 'devops' ? Cog :
                                                   Code;

                                const avgLevel = skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length;
                                const categoryColor = avgLevel >= 4 ? 'emerald' : avgLevel >= 3 ? 'blue' : avgLevel >= 2 ? 'yellow' : 'red';

                                return (
                                  <div key={category} className="space-y-3">
                                    <div className="flex items-center gap-3 mb-4">
                                      {React.createElement(categoryIcon, { className: `w-6 h-6 text-${categoryColor}-600` })}
                                      <h3 className={`text-lg font-semibold text-${categoryColor}-800 capitalize`}>
                                        {category.replace(/_/g, ' ')} ({skills.length} skills)
                                      </h3>
                                      <Badge className={`bg-${categoryColor}-100 text-${categoryColor}-800`}>
                                        Avg Level: {avgLevel.toFixed(1)}/5
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      {skills
                                        .sort((a, b) => b.level - a.level) // Sort by skill level
                                        .map((skill, index) => (
                                        <motion.div
                                          key={skill.name}
                                          initial={{ opacity: 0, y: 10 }}
                                          animate={{ opacity: 1, y: 0 }}
                                          transition={{ delay: index * 0.05 }}
                                          className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                                        >
                                          <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-semibold text-gray-800">{skill.name}</h4>
                                            <div className="flex items-center gap-1">
                                              {[...Array(5)].map((_, i) => (
                                                <Star
                                                  key={i}
                                                  className={`w-3 h-3 ${i < skill.level ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                                />
                                              ))}
                                              <span className="text-sm font-medium text-gray-600 ml-1">
                                                {skill.level}/5
                                              </span>
                                            </div>
                                          </div>
                                          
                                          <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2">
                                              <Clock className="w-3 h-3 text-gray-500" />
                                              <span className="text-gray-600">
                                                Experience: {skill.years_experience}
                                              </span>
                                            </div>
                                            
                                            <div className="flex items-center gap-2">
                                              <Briefcase className="w-3 h-3 text-gray-500" />
                                              <span className="text-gray-600 capitalize">
                                                Context: {skill.context?.replace(/_/g, ' ') || 'Professional'}
                                              </span>
                                            </div>
                                            
                                            {skill.evidence && (
                                              <details className="mt-2">
                                                <summary className="cursor-pointer text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                                                  View Evidence & Projects
                                                </summary>
                                                <div className="mt-1 p-2 bg-indigo-50 rounded text-xs text-indigo-800">
                                                  {skill.evidence}
                                                </div>
                                              </details>
                                            )}
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              });
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Project Highlights from Resume */}
                  {enhancedUserProfile.platform_data?.resume?.resume_data?.cv_text && (
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-50 to-yellow-100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-amber-700">
                          <Rocket className="w-6 h-6" />
                          Featured Projects & Achievements
                        </CardTitle>
                        <CardDescription>
                          Highlights from your professional experience and key projects
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {(() => {
                          const cvText = enhancedUserProfile.platform_data.resume.resume_data.cv_text;
                          
                          // Extract project information from CV
                          const projects = [
                            {
                              name: "BioxResearch - Research Funding Platform",
                              tech: ["Next.js", "Solana", "AI", "Web3.js"],
                              description: "Solana-based research funding platform with AI-empowered research demonstration capabilities and smart contracts for transparent funding mechanisms.",
                              type: "Web3 + AI",
                              highlight: "Smart Contracts + AI Agents"
                            },
                            {
                              name: "Animex - XMTP Gaming Protocol",
                              tech: ["Next.js", "XMTP", "AI Agents", "Base"],
                              description: "Web-based gaming protocol with XMTP messaging integration and AI agent system with cross-chain messaging capabilities.",
                              type: "Web3 Gaming",
                              highlight: "Cross-Chain Messaging"
                            },
                            {
                              name: "DocEase - Medical Communication Platform",
                              tech: ["Next.js", "Solidity", "MongoDB", "AI", "Avalanche"],
                              description: "Hybrid Web2/Web3 DApp for secure doctor-patient communication with AI prescription analyzer achieving 95% accuracy.",
                              type: "HealthTech",
                              highlight: "95% AI Accuracy"
                            },
                            {
                              name: "AIAX - Financial Management Platform",
                              tech: ["Next.js", "MongoDB", "Ethers.js", "CoinGecko API"],
                              description: "Financial platform with crypto transaction support and autonomous portfolio management using AI agents.",
                              type: "FinTech",
                              highlight: "Autonomous AI Trading"
                            },
                            {
                              name: "BrainBoost - AI Learning Assistant",
                              tech: ["Next.js", "React.js", "Firebase", "Azure", "NLP"],
                              description: "AI learning platform with 3D labs using Three.js and dynamic question generation system.",
                              type: "EdTech",
                              highlight: "3D Learning Labs"
                            }
                          ];

                          return (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {projects.map((project, index) => (
                                <motion.div
                                  key={project.name}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="p-4 bg-white rounded-lg border border-amber-200 hover:shadow-lg transition-all"
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <h4 className="font-bold text-amber-800 text-sm">{project.name.split(' - ')[0]}</h4>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary" className="text-xs bg-amber-200 text-amber-800">
                                          {project.type}
                                        </Badge>
                                        <Badge variant="outline" className="text-xs border-amber-300 text-amber-700">
                                          {project.highlight}
                                        </Badge>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-xs text-amber-600 font-medium">
                                        {project.tech.length} Technologies
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <p className="text-sm text-amber-700 mb-3 leading-relaxed">
                                    {project.description}
                                  </p>
                                  
                                  <div className="flex flex-wrap gap-1">
                                    {project.tech.map(tech => (
                                      <Badge key={tech} variant="secondary" className="text-xs bg-amber-100 text-amber-800">
                                        {tech}
                                      </Badge>
                                    ))}
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          );
                        })()}
                        
                        <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg border-l-4 border-amber-400">
                          <div className="flex items-center gap-2 mb-2">
                            <Award className="w-5 h-5 text-amber-600" />
                            <h4 className="font-semibold text-amber-800">Notable Achievements</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-amber-700">
                            <div>🏆 Winner - ACM Eastern India Hackathon</div>
                            <div>🥈 Runners Up - B-Plan 2025</div>
                            <div>🏆 Winner - TechTrek InnoVision 2024</div>
                            <div>🎯 Finalist - Smart Bengal Hackathon 2024</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </motion.div>
              )}

              {/* Skills from Platform Data */}
              {userData?.platform_data.skills_analysis && (
                <>
                  <Card className="shadow-lg border-0 mb-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Skills Analysis Summary
                      </CardTitle>
                      <CardDescription>
                        Analysis from your stored data
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {userData.platform_data.skills_analysis.skill_level || 'Intermediate'}
                          </div>
                          <div className="text-sm text-gray-600">Current Level</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {userData.platform_data.skills_analysis.strengths?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Key Strengths</div>
                        </div>
                        
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {userData.platform_data.skills_analysis.growth_areas?.length || 0}
                          </div>
                          <div className="text-sm text-gray-600">Growth Areas</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths and Growth Areas */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    {userData.platform_data.skills_analysis.strengths && (
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-green-700">
                            <Award className="w-5 h-5" />
                            Your Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {userData.platform_data.skills_analysis.strengths.map((strength, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm">{strength}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Growth Areas */}
                    {userData.platform_data.skills_analysis.growth_areas && (
                      <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-orange-700">
                            <Target className="w-5 h-5" />
                            Areas for Growth
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {userData.platform_data.skills_analysis.growth_areas.map((area, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-orange-600" />
                                <span className="text-sm">{area}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Learning Path Recommendations */}
                  {userData.platform_data.skills_analysis.recommended_learning_path && (
                    <Card className="shadow-lg border-0">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Recommended Learning Path
                        </CardTitle>
                        <CardDescription>
                          Personalized learning recommendations based on your analysis
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <pre className="whitespace-pre-wrap text-sm">
                            {typeof userData.platform_data.skills_analysis.recommended_learning_path === 'string' 
                              ? userData.platform_data.skills_analysis.recommended_learning_path
                              : JSON.stringify(userData.platform_data.skills_analysis.recommended_learning_path, null, 2)}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}

              {/* Skills from Analysis Result (Legacy) */}
              {analysisResult && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(analysisResult.skills_assessment.skill_categories).map(([category, skills]) => (
                    skills.length > 0 && (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card className="shadow-lg border-0 h-full">
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                              {getSkillIcon(category)}
                              {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </CardTitle>
                            <CardDescription>
                              {skills.length} skill{skills.length !== 1 ? 's' : ''} identified
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {skills.slice(0, 8).map((skill, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex-1">
                                    <div className="font-medium">{skill.name}</div>
                                    <div className="text-sm text-gray-600">{skill.description}</div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge 
                                      variant={skill.level >= 3 ? "default" : "secondary"}
                                      className={`${getLevelColor(skill.level)} text-xs`}
                                    >
                                      Level {skill.level}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                              {skills.length > 8 && (
                                <div className="text-center">
                                  <Badge variant="outline" className="text-xs">
                                    +{skills.length - 8} more skills
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  ))}
                </div>
              )}

              {/* No Skills Data Available */}
              {!userData?.platform_data.skills_analysis && !analysisResult && (
                <Card className="shadow-lg border-0">
                  <CardContent className="py-12">
                    <div className="text-center">
                      <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        No Skills Analysis Available
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Upload your CV or analyze your GitHub profile to get detailed skills insights.
                      </p>
                      <Button 
                        onClick={() => setActiveTab('overview')}
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        Start Analysis
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* AI-Powered Learning Roadmap Tab */}
            <TabsContent value="roadmap" className="space-y-6">
              {/* AI Roadmap Generation Header */}
              <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Brain className="w-6 h-6 text-purple-400" />
                    AI-Powered Career Roadmap
                    {userData?.platform_data.onboarding?.target_role && (
                      <Badge className="bg-purple-500/30 text-purple-200">
                        {userData.platform_data.onboarding.target_role}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-purple-200/70">
                    Personalized learning path based on your repositories, skills, and career goals
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Target Role Input Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-role" className="text-white text-sm font-medium">
                        Target Career Role
                      </Label>
                      <Input
                        id="target-role"
                        type="text"
                        placeholder="e.g., Full Stack Developer, AI Engineer, DevOps Specialist..."
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                      />
                      <p className="text-xs text-purple-200/60">
                        Specify your desired role for a more targeted roadmap
                      </p>
                    </div>
                    
                    {/* Quick Role Suggestions */}
                    <div className="space-y-2">
                      <Label className="text-white text-sm font-medium">
                        Quick Suggestions
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {[
                          'Full Stack Developer',
                          'Frontend Developer', 
                          'Backend Developer',
                          'AI/ML Engineer',
                          'DevOps Engineer',
                          'Data Scientist',
                          'Mobile Developer',
                          'Blockchain Developer',
                          'Cybersecurity Specialist',
                          'Cloud Architect'
                        ].map((role) => (
                          <Button
                            key={role}
                            variant="outline"
                            size="sm"
                            onClick={() => setTargetRole(role)}
                            className="text-xs border-white/30 text-gray-200 hover:bg-purple-500/20 hover:border-purple-400"
                          >
                            {role}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Generation Controls */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      <Button 
                        onClick={generateAIRoadmap}
                        disabled={roadmapLoading || !userData || !targetRole.trim()}
                        className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                      >
                        {roadmapLoading ? (
                          <>
                            <Cpu className="w-4 h-4 mr-2 animate-spin" />
                            Generating AI Roadmap...
                          </>
                        ) : (
                          <>
                            <Rocket className="w-4 h-4 mr-2" />
                            Generate AI Roadmap
                          </>
                        )}
                      </Button>
                      
                      {!targetRole.trim() && (
                        <div className="text-sm text-yellow-300 flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          Please specify a target role first
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-purple-200/60 flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Based on {userData?.platform_data.repository_analyses?.length || 0} repositories
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Insights Overview */}
              {aiInsights && (
                <>
                  {/* Skills Assessment Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-blue-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-blue-200">Technical Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-blue-400">
                          {aiInsights.score.technical}/100
                        </div>
                        <Progress value={aiInsights.score.technical} className="mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-green-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-green-200">Collaboration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-400">
                          {aiInsights.score.collaboration}/100
                        </div>
                        <Progress value={aiInsights.score.collaboration} className="mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-yellow-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-yellow-200">Consistency</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-yellow-400">
                          {aiInsights.score.consistency}/100
                        </div>
                        <Progress value={aiInsights.score.consistency} className="mt-2" />
                      </CardContent>
                    </Card>
                    
                    <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-purple-200">Overall</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-purple-400">
                          {aiInsights.score.overall}/100
                        </div>
                        <Progress value={aiInsights.score.overall} className="mt-2" />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Role-Specific Overview */}
                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-gradient-to-r from-purple-500/20 to-blue-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-purple-400" />
                        Target Role Analysis
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                          {targetRole || 'Software Developer'}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-purple-200/70">
                        AI analysis tailored for your career aspirations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">AI Overview</h4>
                            <p className="text-gray-200 leading-relaxed">
                              {aiInsights.overview}
                            </p>
                          </div>
                          
                          {/* Quick Stats */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-green-400">
                                {aiInsights.strengths.length}
                              </div>
                              <div className="text-xs text-gray-300">Key Strengths</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-orange-400">
                                {aiInsights.areasForImprovement.length}
                              </div>
                              <div className="text-xs text-gray-300">Growth Areas</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-blue-400">
                                {aiInsights.learningPath.length}
                              </div>
                              <div className="text-xs text-gray-300">Learning Skills</div>
                            </div>
                            <div className="bg-white/5 rounded-lg p-3 text-center">
                              <div className="text-lg font-bold text-purple-400">
                                {aiInsights.recommendedProjects.length}
                              </div>
                              <div className="text-xs text-gray-300">Projects</div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Role Readiness Indicator */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-lg font-semibold text-white mb-3">Role Readiness</h4>
                            <div className="space-y-3">
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-300">Overall Fit</span>
                                  <span className="text-purple-300">{aiInsights.score.overall}%</span>
                                </div>
                                <Progress value={aiInsights.score.overall} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-300">Technical Skills</span>
                                  <span className="text-blue-300">{aiInsights.score.technical}%</span>
                                </div>
                                <Progress value={aiInsights.score.technical} className="h-2" />
                              </div>
                              
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-300">Collaboration</span>
                                  <span className="text-green-300">{aiInsights.score.collaboration}%</span>
                                </div>
                                <Progress value={aiInsights.score.collaboration} className="h-2" />
                              </div>
                            </div>
                          </div>
                          
                          {/* Next Steps */}
                          <div>
                            <h4 className="text-sm font-medium text-gray-300 mb-2">Priority Actions</h4>
                            <div className="space-y-2">
                              {aiInsights.areasForImprovement.slice(0, 3).map((area, index) => (
                                <div key={index} className="flex items-center gap-2 text-sm">
                                  <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0" />
                                  <span className="text-gray-200">{area}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Roadmap Analytics */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Learning Path Timeline */}
                    <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-purple-500/20">
                      <CardHeader>
                        <CardTitle className="text-white">Learning Path Timeline</CardTitle>
                        <CardDescription className="text-purple-200/70">
                          Skill progression over time
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={prepareRoadmapTimelineData()}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#6b7280" />
                              <XAxis 
                                dataKey="name" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={11}
                                stroke="#d1d5db"
                              />
                              <YAxis stroke="#d1d5db" />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #6b7280',
                                  borderRadius: '8px',
                                  color: '#f9fafb'
                                }}
                              />
                              <Bar dataKey="currentLevel" fill="#8b5cf6" name="Current Level" />
                              <Line 
                                type="monotone" 
                                dataKey="targetLevel" 
                                stroke="#06b6d4" 
                                strokeWidth={3}
                                name="Target Level"
                              />
                            </ComposedChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skills Radar Chart */}
                    <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-blue-500/20">
                      <CardHeader>
                        <CardTitle className="text-white">Skills Assessment</CardTitle>
                        <CardDescription className="text-blue-200/70">
                          Current skill distribution
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadialBarChart 
                              cx="50%" 
                              cy="50%" 
                              innerRadius="10%" 
                              outerRadius="80%" 
                              data={prepareSkillProgressData()}
                            >
                              <RadialBar 
                                dataKey="value" 
                                cornerRadius={10} 
                                fill="#8884d8" 
                              />
                              <Legend 
                                iconSize={12}
                                wrapperStyle={{ color: '#f9fafb' }}
                              />
                              <Tooltip 
                                contentStyle={{ 
                                  backgroundColor: '#1f2937', 
                                  border: '1px solid #6b7280',
                                  borderRadius: '8px',
                                  color: '#f9fafb'
                                }}
                              />
                            </RadialBarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* AI-Generated Learning Path */}
                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-green-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                        Personalized Learning Path
                      </CardTitle>
                      <CardDescription className="text-green-200/70">
                        AI-curated skills based on your repositories and target role
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {aiInsights.learningPath.map((skill, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-green-400/40 transition-all duration-300">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-white">{skill.skill}</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                <p className="text-xs text-gray-300">
                                  {skill.reason}
                                </p>
                                <div className="space-y-1">
                                  <div className="text-xs text-green-300 font-medium">Resources:</div>
                                  {skill.resources.slice(0, 2).map((resource, rIndex) => (
                                    <div key={rIndex} className="text-xs bg-white/5 rounded px-2 py-1 text-gray-200">
                                      {resource}
                                    </div>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommended Projects */}
                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-orange-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Puzzle className="w-5 h-5 text-orange-400" />
                        Recommended Projects
                      </CardTitle>
                      <CardDescription className="text-orange-200/70">
                        Hands-on projects to build your skills
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {aiInsights.recommendedProjects.map((project, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.15 }}
                          >
                            <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:border-orange-400/40 transition-all duration-300">
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <CardTitle className="text-white">{project.title}</CardTitle>
                                  <div className="flex gap-2">
                                    <Badge 
                                      className={`${
                                        project.difficulty === 'Beginner' 
                                          ? 'bg-green-500/30 text-green-200' 
                                          : project.difficulty === 'Intermediate'
                                          ? 'bg-yellow-500/30 text-yellow-200'
                                          : 'bg-red-500/30 text-red-200'
                                      }`}
                                    >
                                      {project.difficulty}
                                    </Badge>
                                    <Badge className="bg-blue-500/30 text-blue-200">
                                      {project.estimatedTime}
                                    </Badge>
                                  </div>
                                </div>
                                <CardDescription className="text-gray-300">
                                  {project.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                <div className="flex flex-wrap gap-2">
                                  {project.technologies.map((tech, techIndex) => (
                                    <Badge 
                                      key={techIndex}
                                      variant="outline" 
                                      className="text-xs border-white/30 text-gray-200"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Career Advice */}
                  <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-indigo-500/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-400" />
                        Career Advice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-200 leading-relaxed">
                        {aiInsights.careerAdvice}
                      </p>
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-green-300 mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {aiInsights.strengths.map((strength, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                                <CheckCircle className="w-3 h-3 text-green-400" />
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-orange-300 mb-2">Areas for Improvement</h4>
                          <ul className="space-y-1">
                            {aiInsights.areasForImprovement.map((area, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-center gap-2">
                                <TrendingUp className="w-3 h-3 text-orange-400" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Legacy Roadmap (fallback) */}
              {!aiInsights && analysisResult && (
                <>
                  {/* Roadmap Priority Overview */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle>Learning Priority Distribution</CardTitle>
                      <CardDescription>Focus areas for your development journey</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={preparePriorityData()}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                {preparePriorityData().map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={prepareSkillLevelData()}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="skill" 
                                angle={-45}
                                textAnchor="end"
                                height={80}
                                fontSize={12}
                              />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="current" fill="#8884d8" name="Current Level" />
                              <Bar dataKey="target" fill="#82ca9d" name="Target Level" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detailed Roadmap Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {analysisResult.learning_roadmap.roadmap_items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="shadow-lg border-0 h-full hover:shadow-xl transition-shadow">
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-lg">{item.skill}</CardTitle>
                              <Badge 
                                className={`${getPriorityColor(item.priority)} text-white text-xs`}
                              >
                                {item.priority}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Current Level: {item.current_level}</span>
                                <span>Target: {item.target_level}</span>
                              </div>
                              <Progress 
                                value={(item.current_level / item.target_level) * 100} 
                                className="w-full h-2"
                              />
                            </div>
                            
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              {item.estimated_time}
                            </div>
                            
                            {item.resources.length > 0 && (
                              <div className="space-y-2">
                                <div className="text-sm font-medium flex items-center gap-2">
                                  <BookOpen className="w-4 h-4" />
                                  Resources
                                </div>
                                <div className="space-y-1">
                                  {item.resources.slice(0, 3).map((resource, rIndex) => (
                                    <div key={rIndex} className="text-xs bg-gray-100 rounded px-2 py-1">
                                      {resource}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {/* No Data State */}
              {!aiInsights && !analysisResult && (
                <Card className="shadow-xl bg-black/20 backdrop-blur-lg border-gray-500/20">
                  <CardContent className="py-12">
                    <div className="text-center max-w-md mx-auto">
                      <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Ready to Build Your Career Roadmap?
                      </h3>
                      <p className="text-gray-300 mb-6">
                        Get a personalized, AI-powered roadmap tailored to your target role and 
                        based on your GitHub repositories.
                      </p>
                      
                      {/* Quick target role input */}
                      <div className="mb-6 text-left">
                        <Label htmlFor="quick-role" className="text-white text-sm">
                          What's your target role?
                        </Label>
                        <Input
                          id="quick-role"
                          type="text"
                          placeholder="e.g., Full Stack Developer, AI Engineer..."
                          value={targetRole}
                          onChange={(e) => setTargetRole(e.target.value)}
                          className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-400"
                        />
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button 
                          onClick={generateAIRoadmap}
                          disabled={!userData || !targetRole.trim()}
                          className="bg-gradient-to-r from-purple-500 to-blue-600 disabled:opacity-50"
                        >
                          <Rocket className="w-4 h-4 mr-2" />
                          Generate AI Roadmap
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('overview')}
                          variant="outline"
                          className="border-white/30 text-white hover:bg-white/10"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload CV Instead
                        </Button>
                      </div>
                      
                      {!targetRole.trim() && (
                        <p className="text-yellow-300 text-sm mt-3">
                          💡 Enter your target role above to generate a personalized roadmap
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Career Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              {/* Raw API Response Section */}
              {enhancedUserProfile && (
                <Card className="shadow-lg border-0 bg-gradient-to-br from-slate-50 to-gray-100">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-slate-700">
                      <Terminal className="w-6 h-6" />
                      Raw API Response
                    </CardTitle>
                    <CardDescription>
                      Complete data structure from /demo/api/user endpoint - 
                      {enhancedUserProfile.platform_data ? 
                        `${Object.keys(enhancedUserProfile.platform_data).length} data sections loaded` : 
                        'Basic profile data only'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Summary Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-3 bg-slate-100 rounded-lg">
                          <div className="text-xl font-bold text-slate-700">
                            {enhancedUserProfile.summary_stats?.total_analyses || 0}
                          </div>
                          <div className="text-sm text-slate-600">Repository Analyses</div>
                        </div>
                        <div className="text-center p-3 bg-slate-100 rounded-lg">
                          <div className="text-xl font-bold text-slate-700">
                            {enhancedUserProfile.summary_stats?.total_ai_issues || 0}
                          </div>
                          <div className="text-sm text-slate-600">AI Issues</div>
                        </div>
                        <div className="text-center p-3 bg-slate-100 rounded-lg">
                          <div className="text-xl font-bold text-slate-700">
                            {enhancedUserProfile.summary_stats?.total_ai_repos || 0}
                          </div>
                          <div className="text-sm text-slate-600">AI Repositories</div>
                        </div>
                        <div className="text-center p-3 bg-slate-100 rounded-lg">
                          <div className="text-xl font-bold text-slate-700">
                            {enhancedUserProfile.summary_stats?.total_achievements || 0}
                          </div>
                          <div className="text-sm text-slate-600">Achievements</div>
                        </div>
                      </div>

                      {/* Data Sections Overview */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Available Data Sections</h4>
                          <div className="space-y-1">
                            {Object.entries({
                              'Basic Profile': !!enhancedUserProfile.id,
                              'Skills Analysis': !!enhancedUserProfile.profile?.skills_analysis,
                              'User Progress': !!enhancedUserProfile.profile?.progress,
                              'Achievements': !!enhancedUserProfile.profile?.achievements?.length,
                              'Onboarding Data': !!enhancedUserProfile.profile?.onboarding,
                              'Repository Analyses': !!enhancedUserProfile.platform_data?.repository_analyses?.length,
                              'Tech Recommendations': !!enhancedUserProfile.platform_data?.tech_recommendations?.length,
                              'AI Issues': !!enhancedUserProfile.platform_data?.recent_ai_issues?.length,
                              'AI Repositories': !!enhancedUserProfile.platform_data?.ai_repositories?.length,
                              'Leaderboard': !!enhancedUserProfile.platform_data?.leaderboard,
                              'Resume Data': !!enhancedUserProfile.platform_data?.resume
                            }).map(([section, hasData]) => (
                              <div key={section} className="flex items-center justify-between p-2 rounded bg-slate-50">
                                <span className="text-sm text-slate-700">{section}</span>
                                <div className={`w-3 h-3 rounded-full ${hasData ? 'bg-green-500' : 'bg-gray-300'}`} />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-slate-800 mb-2">Data Freshness</h4>
                          <div className="space-y-2 text-sm text-slate-600">
                            <div>
                              <strong>GitHub Data:</strong> {enhancedUserProfile.stats?.github_stats ? '✅ Fresh' : '❌ Missing'}
                            </div>
                            <div>
                              <strong>Platform Data:</strong> {enhancedUserProfile.platform_data ? '✅ Available' : '❌ Not loaded'}
                            </div>
                            <div>
                              <strong>Skills Analysis:</strong> {
                                enhancedUserProfile.profile?.skills_analysis ? 
                                `✅ Available (${enhancedUserProfile.profile.skills_analysis.analysis_data?.skills?.length || 0} skills)` : 
                                '❌ Not analyzed'
                              }
                            </div>
                            <div>
                              <strong>Last Updated:</strong> {
                                enhancedUserProfile.updated_at ? 
                                new Date(enhancedUserProfile.updated_at).toLocaleString() : 
                                'Unknown'
                              }
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expandable JSON Viewer */}
                      <div className="border border-slate-200 rounded-lg">
                        <details className="group">
                          <summary className="cursor-pointer p-4 bg-slate-100 rounded-t-lg hover:bg-slate-200 transition-colors">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-slate-700">
                                📄 Full JSON Response ({JSON.stringify(enhancedUserProfile).length.toLocaleString()} characters)
                              </span>
                              <div className="text-sm text-slate-500 group-open:hidden">Click to expand</div>
                              <div className="text-sm text-slate-500 hidden group-open:block">Click to collapse</div>
                            </div>
                          </summary>
                          <div className="p-4 bg-slate-50 rounded-b-lg">
                            <pre className="text-xs text-slate-700 overflow-x-auto whitespace-pre-wrap max-h-96 overflow-y-auto bg-white p-4 rounded border">
                              {JSON.stringify(enhancedUserProfile, null, 2)}
                            </pre>
                            <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                              <p className="text-sm text-blue-700">
                                <strong>💡 Developer Note:</strong> This raw response shows all available data from the enhanced /demo/api/user endpoint. 
                                Use this to understand the complete data structure and build more sophisticated skill analysis features.
                              </p>
                            </div>
                          </div>
                        </details>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {analysisResult && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strengths */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-green-50 to-green-100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                          <Award className="w-5 h-5" />
                          Your Strengths
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysisResult.skill_gaps.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Skill Gaps */}
                    <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-orange-100">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-orange-700">
                          <Target className="w-5 h-5" />
                          Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {analysisResult.skill_gaps.skill_gaps.map((gap, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-orange-600" />
                              <span className="text-sm">{gap}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recommendations */}
                  <Card className="shadow-lg border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        AI Recommendations
                      </CardTitle>
                      <CardDescription>
                        Personalized advice for your career development
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {analysisResult.skill_gaps.recommendations.map((recommendation, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
                          >
                            <div className="flex items-start gap-3">
                              <div className="p-2 bg-blue-500 rounded-full text-white">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-800">
                                  {recommendation}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Next Steps */}
                  <Card className="shadow-lg border-0 bg-gradient-to-br from-purple-50 to-blue-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Next Steps
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.next_steps.map((step, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="text-sm font-medium">{step}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Not Authenticated State */}
        {!isAuthenticated && !initialLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Authentication Required
                </h3>
                <p className="text-gray-600 mb-6">
                  Please sign in with your GitHub account to access your skill tree and personalized insights.
                </p>
                <Button 
                  onClick={() => window.location.href = 'http://localhost:5000/demo/auth'}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Sign in with GitHub
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* No Analysis State */}
        {isAuthenticated && !initialLoading && !userData && !analysisResult && !githubAnalysis && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Ready to Analyze Your Skills?
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your CV or connect your GitHub profile to get comprehensive insights, 
                personalized roadmaps, and AI-powered career recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Badge variant="outline" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  AI-Powered Analysis
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Personalized Roadmaps
                </Badge>
                <Badge variant="outline" className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Career Insights
                </Badge>
              </div>
            </div>
          </motion.div>
        )}

        {/* No Data Available State */}
        {isAuthenticated && !initialLoading && userData && !userData.platform_data.skills_analysis && !userData.platform_data.repository_analyses.length && !analysisResult && !githubAnalysis && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-2xl mx-auto">
              <CardContent className="py-12">
                <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  Welcome {userData.name || userData.login}!
                </h3>
                <p className="text-gray-600 mb-6">
                  We found your GitHub profile, but you haven't completed any analyses yet. 
                  Start by uploading your CV or analyzing your GitHub repositories to unlock 
                  personalized insights and recommendations.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={() => setActiveTab('overview')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload CV
                  </Button>
                  <Button 
                    onClick={() => setActiveTab('overview')}
                    variant="outline"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Analyze GitHub
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
                </div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuroraBackground>
  )
}

export default SkillTreePage
