"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Line, Doughnut, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import { useAuth } from "@/context/Authcontext";
import { fetchDashboardData, fetchUserProjects, generateResume } from "@/lib/api";
import {
  IconUser,
  IconCode,
  IconGitCommit,
  IconStar,
  IconCalendar,
  IconTrendingUp,
  IconAward,
  IconTarget,
  IconBrain,
  IconRocket,
  IconTrophy,
  IconBookmark,
  IconGitBranch,
  IconExternalLink,
  IconRefresh,
  IconDownload,
  IconAlertCircle
} from "@tabler/icons-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

// Types for API responses
interface UserProgress {
  current_level: number;
  xp_points: number;
  xp_needed: number;
  progress_percentage: number;
  badges: string[];
  next_goal: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  repository_url?: string;
  tech_stack: string[];
  difficulty_level: string;
  status: string;
  created_at: string;
  target_role: string;
  progress: {
    total_issues: number;
    completed_issues: number;
    completion_percentage: number;
  };
}

interface SkillsAnalysis {
  skill_categories: {
    programming_languages: Array<{ name: string; level: number; category: string }>;
    frameworks: Array<{ name: string; level: number; category: string }>;
    databases: Array<{ name: string; level: number; category: string }>;
    cloud_platforms: Array<{ name: string; level: number; category: string }>;
    devops_tools: Array<{ name: string; level: number; category: string }>;
    soft_skills: Array<{ name: string; level: number; category: string }>;
  };
  development_level: {
    level: string;
    description: string;
    score: number;
  };
}

interface DashboardData {
  user_progress: UserProgress;
  recent_issues: Array<any>;
  recent_submissions: Array<any>;
  skills_analysis: SkillsAnalysis;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e2e8f0",
      },
    },
  },
  scales: {
    x: {
      ticks: {
        color: "#e2e8f0",
      },
      grid: {
        color: "#374151",
      },
    },
    y: {
      ticks: {
        color: "#e2e8f0",
      },
      grid: {
        color: "#374151",
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#e2e8f0",
      },
    },
  },
};



export default function ProfilePage() {
  const { user, fetchCompleteUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [completeProfile, setCompleteProfile] = useState<any>(null);

  // Fetch dashboard data using API utility
  const fetchDashboardDataLocal = async () => {
    try {
      const data = await fetchDashboardData();
      setDashboardData(data);
      return data;
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data');
      return null;
    }
  };

  // Fetch projects data using API utility
  const fetchProjectsLocal = async () => {
    try {
      const projectsData = await fetchUserProjects();
      setProjects(projectsData);
      return projectsData;
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setError('Failed to load projects');
      return [];
    }
  };

  // Refresh all data
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchDashboardDataLocal(), fetchProjectsLocal()]);
    setRefreshing(false);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch complete user profile with database ID
        if (fetchCompleteUserProfile) {
          const profile = await fetchCompleteUserProfile();
          if (profile) {
            setCompleteProfile(profile);
            console.log('Complete user profile loaded:', profile);
          }
        }

        await Promise.all([fetchDashboardDataLocal(), fetchProjectsLocal()]);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, fetchCompleteUserProfile]);

  // Generate resume using API utility
  const handleGenerateResume = async () => {
    try {
      const resume = await generateResume();
      console.log('Resume generated:', resume);
      // You can implement a download mechanism here
      // For example, create a blob and download it
      const blob = new Blob([resume], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'resume.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate resume:', error);
      setError('Failed to generate resume. Please try again.');
    }
  };

  // Create skill radar chart data
  const createSkillRadarData = () => {
    if (!dashboardData?.skills_analysis?.skill_categories) {
      return { labels: [], datasets: [] };
    }

    const categories = dashboardData.skills_analysis.skill_categories;
    const labels = Object.keys(categories).map(key =>
      key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );

    const skillLevels = labels.map((_label, index) => {
      const categoryKey = Object.keys(categories)[index];
      const skills = categories[categoryKey as keyof typeof categories];
      const avgLevel = skills.length > 0
        ? skills.reduce((sum, skill) => sum + skill.level, 0) / skills.length
        : 0;
      return avgLevel;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Skill Level',
          data: skillLevels,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderWidth: 2,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        },
      ],
    };
  };

  // Create contribution chart data (mock data for now)
  const contributionChartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Projects Completed",
        data: [2, 3, 1, 4, 2, 3],
        borderColor: "#8b5cf6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Create project status chart data
  const projectStatusChartData = {
    labels: ["Completed", "In Progress", "Assigned", "Paused"],
    datasets: [
      {
        data: [
          projects.filter(p => p.status === 'completed').length,
          projects.filter(p => p.status === 'active' || p.status === 'in_progress').length,
          projects.filter(p => p.status === 'assigned').length,
          projects.filter(p => p.status === 'paused').length,
        ],
        backgroundColor: ["#10b981", "#8b5cf6", "#f59e0b", "#ef4444"],
        borderColor: ["#059669", "#6d28d9", "#d97706", "#dc2626"],
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#e2e8f0",
        },
        grid: {
          color: "#374151",
        },
      },
      y: {
        ticks: {
          color: "#e2e8f0",
        },
        grid: {
          color: "#374151",
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
        },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 5,
        ticks: {
          color: "#e2e8f0",
        },
        grid: {
          color: "#374151",
        },
        angleLines: {
          color: "#374151",
        },
      },
    },
  };

  const completedProjects = projects.filter(p => p.status === 'completed');
  const userProgress = dashboardData?.user_progress;

  if (loading) {
    return (
      <AuroraBackground className="dark min-h-screen">
        <div className="relative z-30 w-full min-h-screen flex items-center justify-center">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </AuroraBackground>
    );
  }

  if (error) {
    return (
      <AuroraBackground className="dark min-h-screen">
        <div className="relative z-30 w-full min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-400 text-xl mb-4">{error}</div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Try Again'}
            </button>
          </div>
        </div>
      </AuroraBackground>
    );
  }

  return (
    <AuroraBackground className="dark min-h-screen">
      <div className="relative z-30 w-full min-h-screen">
        <SidebarProvider
          style={{
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties}
        >
          <AppSidebar variant="inset" className="backdrop-blur-lg bg-black/30 border-purple-500/20" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col gap-6 py-4 md:py-6"
                >
                  {/* Header with Actions */}
                  <div className="px-4 lg:px-6 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <IconUser className="size-8 text-green-400" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Developer Profile</h1>
                      </div>
                      <p className="text-lg text-purple-200/80">Your development journey and achievements</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                      >
                        <IconRefresh className={`size-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateResume}
                        className="border-green-500/30 text-green-200 hover:bg-green-500/20"
                      >
                        <IconDownload className="size-4 mr-2" />
                        Resume
                      </Button>
                    </div>
                  </div>

                  {/* Profile Card */}
                  <section className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                          <Avatar className="size-24 ring-4 ring-purple-400/30">
                            <AvatarImage src={user?.avatar_url} alt={user?.name || user?.login || "user"} />
                            <AvatarFallback className="bg-purple-600 text-white text-2xl font-bold">
                              {(user?.name || user?.login || "U U").split(" ").map((p) => p[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-4">
                            <div>
                              <h2 className="text-3xl font-bold text-white">{user?.name || user?.login || "Developer"}</h2>
                              {user?.login && <p className="text-lg text-purple-200/80">@{user.login}</p>}
                              {user?.email && <p className="text-purple-200/70">{user.email}</p>}
                              {dashboardData?.skills_analysis?.development_level && (
                                <Badge variant="outline" className="border-green-400/30 bg-green-400/10 text-green-300 mt-2">
                                  <IconBrain className="size-3 mr-1" />
                                  {dashboardData.skills_analysis.development_level.level} Developer
                                </Badge>
                              )}
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-400">{user?.public_repos ?? 0}</div>
                                <div className="text-sm text-purple-200/70">Public Repos</div>
                              </div>
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-blue-400">{projects.length}</div>
                                <div className="text-sm text-purple-200/70">AI Projects</div>
                              </div>
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-green-400">{completedProjects.length}</div>
                                <div className="text-sm text-purple-200/70">Completed</div>
                              </div>
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-purple-400">{userProgress?.current_level ?? 1}</div>
                                <div className="text-sm text-purple-200/70">Level</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Progress Section */}
                  {userProgress && (
                    <section className="px-4 lg:px-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold flex items-center gap-2">
                            <IconTarget className="size-5" />
                            Learning Progress
                          </CardTitle>
                          <CardDescription className="text-purple-200/80">Your current development journey</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-medium">Level {userProgress.current_level}</span>
                              <span className="text-purple-200/80">{userProgress.xp_points} / {userProgress.xp_needed} XP</span>
                            </div>
                            <Progress
                              value={userProgress.progress_percentage}
                              className="h-3 bg-purple-900/20"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                <IconTrophy className="size-4" />
                                Badges
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {userProgress.badges.map((badge, index) => (
                                  <Badge key={index} variant="outline" className="border-yellow-400/30 text-yellow-300 text-xs">
                                    {badge}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                <IconRocket className="size-4" />
                                Next Goal
                              </h4>
                              <p className="text-purple-200/80 text-sm">{userProgress.next_goal}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}

                  {/* Debug Section - User ID Information */}
                  {(completeProfile || user) && (
                    <section className="px-4 lg:px-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-yellow-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold flex items-center gap-2">
                            <IconUser className="size-5" />
                            User Profile Debug Info
                          </CardTitle>
                          <CardDescription className="text-yellow-200/80">Database and GitHub user identification</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-lg border border-yellow-500/20 bg-black/10 p-4">
                              <h4 className="text-yellow-400 font-medium mb-2">Current Context User</h4>
                              <div className="text-sm text-gray-300 space-y-1">
                                <p><span className="text-yellow-200">Login:</span> {user?.login || 'N/A'}</p>
                                <p><span className="text-yellow-200">GitHub ID:</span> {user?.id || 'N/A'}</p>
                                <p><span className="text-yellow-200">Database ID:</span> {user?.database_id || user?.user_id || 'N/A'}</p>
                                <p><span className="text-yellow-200">Email:</span> {user?.email || 'N/A'}</p>
                                <p><span className="text-yellow-200">Stored User:</span> {user?.is_stored_user ? 'Yes' : 'No'}</p>
                              </div>
                            </div>

                            {completeProfile && (
                              <div className="rounded-lg border border-green-500/20 bg-black/10 p-4">
                                <h4 className="text-green-400 font-medium mb-2">Complete Profile</h4>
                                <div className="text-sm text-gray-300 space-y-1">
                                  <p><span className="text-green-200">Database ID:</span> {completeProfile.database_id || completeProfile.id || 'N/A'}</p>
                                  <p><span className="text-green-200">User ID:</span> {completeProfile.user_id || 'N/A'}</p>
                                  <p><span className="text-green-200">GitHub User ID:</span> {completeProfile.github_user_id || 'N/A'}</p>
                                  <p><span className="text-green-200">Username:</span> {completeProfile.github_username || completeProfile.login || 'N/A'}</p>
                                  <p><span className="text-green-200">Created:</span> {completeProfile.created_at ? new Date(completeProfile.created_at).toLocaleDateString() : 'N/A'}</p>
                                  <p><span className="text-green-200">Updated:</span> {completeProfile.updated_at ? new Date(completeProfile.updated_at).toLocaleDateString() : 'N/A'}</p>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="text-xs text-yellow-200/60 p-3 rounded border border-yellow-500/20 bg-yellow-500/5">
                            <strong>Note:</strong> This debug section shows both the basic user context and the complete profile fetched from the database.
                            The database ID (primary key) is what should be used for all API calls requiring user identification.
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}

                  {/* Charts Section */}
                  <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold flex items-center gap-2">
                          <IconTrendingUp className="size-5" />
                          Project Activity
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Monthly project completions</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <Line data={contributionChartData} options={chartOptions} />
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold flex items-center gap-2">
                          <IconCode className="size-5" />
                          Project Status
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Current project distribution</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <Doughnut data={projectStatusChartData} options={doughnutOptions} />
                      </CardContent>
                    </Card>

                    {/* Skills Radar Chart */}
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold flex items-center gap-2">
                          <IconBrain className="size-5" />
                          Skill Profile
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Your technical competencies</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <Radar data={createSkillRadarData()} options={radarOptions} />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Projects Table */}
                  <section className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold text-xl flex items-center gap-2">
                          <IconGitBranch className="size-5" />
                          Recent Projects
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Your latest learning projects</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-hidden">
                          <Table>
                            <TableHeader className="bg-purple-900/20 backdrop-blur-lg">
                              <TableRow>
                                <TableHead className="text-white font-semibold">Project</TableHead>
                                <TableHead className="text-white font-semibold">Tech Stack</TableHead>
                                <TableHead className="text-white font-semibold">Progress</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Actions</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {projects.slice(0, 10).map((project) => (
                                <TableRow key={project.id} className="hover:bg-purple-500/10 border-purple-500/20 transition-colors">
                                  <TableCell className="text-white font-medium">
                                    <div>
                                      <div className="font-semibold">{project.name}</div>
                                      <div className="text-sm text-purple-200/70 line-clamp-1">{project.description}</div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white/80">
                                    <div className="flex gap-1 flex-wrap">
                                      {project.tech_stack.slice(0, 3).map((tech: string) => (
                                        <Badge key={tech} variant="outline" className="border-purple-400/30 text-purple-200 text-xs">
                                          {tech}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white/80">
                                    <div className="space-y-1">
                                      <div className="flex justify-between text-xs">
                                        <span>{project.progress.completed_issues}/{project.progress.total_issues} tasks</span>
                                        <span>{project.progress.completion_percentage}%</span>
                                      </div>
                                      <Progress value={project.progress.completion_percentage} className="h-1" />
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white/80">
                                    <Badge
                                      variant="outline"
                                      className={`text-xs ${project.status === 'completed' ? 'border-green-400/30 bg-green-400/10 text-green-300' :
                                        project.status === 'active' ? 'border-blue-400/30 bg-blue-400/10 text-blue-300' :
                                          project.status === 'assigned' ? 'border-yellow-400/30 bg-yellow-400/10 text-yellow-300' :
                                            'border-gray-400/30 bg-gray-400/10 text-gray-300'
                                        }`}
                                    >
                                      {project.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-white/80">
                                    {project.repository_url && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        asChild
                                        className="hover:bg-purple-500/20"
                                      >
                                        <a href={project.repository_url} target="_blank" rel="noopener noreferrer">
                                          <IconExternalLink className="size-4" />
                                        </a>
                                      </Button>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Achievements Section */}
                  {userProgress?.badges && userProgress.badges.length > 0 && (
                    <section className="px-4 lg:px-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold text-xl flex items-center gap-2">
                            <IconAward className="size-5" />
                            Recent Achievements
                          </CardTitle>
                          <CardDescription className="text-purple-200/80">Your latest accomplishments</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {userProgress.badges.slice(0, 8).map((badge, index) => (
                              <div
                                key={index}
                                className="rounded-lg border border-purple-500/20 bg-black/20 backdrop-blur-lg p-4 hover:border-purple-400/40 transition-colors"
                              >
                                <div className="text-center space-y-2">
                                  <div className="text-3xl">🏆</div>
                                  <h3 className="font-semibold text-white">{badge}</h3>
                                  <Badge variant="outline" className="border-purple-400/30 text-purple-200 text-xs">
                                    <IconCalendar className="size-3 mr-1" />
                                    Recent
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </section>
                  )}
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuroraBackground>
  );
}


