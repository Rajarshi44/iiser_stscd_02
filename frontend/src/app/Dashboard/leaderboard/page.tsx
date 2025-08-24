"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from "recharts";
import { IconTrophy, IconStar, IconTrendingUp, IconUsers, IconRefresh, IconLoader2, IconGitBranch, IconCode, IconDatabase } from "@tabler/icons-react";
import { useAuth } from "@/context/Authcontext";

// Interfaces for user data
interface User {
  id: number;
  github_username: string;
  github_user_id: number;
  email: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface EnhancedUser extends User {
  points: number;
  rank: number;
  skills: string[];
  contributions: number;
  repositories: number;
  followers: number;
  following: number;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  public_repos: number;
}

interface LeaderboardStats {
  totalUsers: number;
  topScore: number;
  avgPoints: number;
  totalContributions: number;
  totalRepositories: number;
  activeUsers: number;
}

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#ddd6fe', '#f3e8ff'];

export default function LeaderboardPage() {
  const { apiCall } = useAuth();
  const [users, setUsers] = useState<EnhancedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalUsers: 0,
    topScore: 0,
    avgPoints: 0,
    totalContributions: 0,
    totalRepositories: 0,
    activeUsers: 0
  });
  const [skillDistribution, setSkillDistribution] = useState<Array<{name: string, value: number, color: string}>>([]);
  const [chartData, setChartData] = useState<Array<{name: string, points: number, contributions: number, repositories: number}>>([]);

  // Fetch all users from the API
  const fetchUsers = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching users from /demo/api/users...');

      const response = await fetch('http://localhost:5000/demo/api/users', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Fetched users:', data);

      if (data.success && data.users) {
        // Enhance user data with additional GitHub information
        const enhancedUsers = await Promise.all(
          data.users.map(async (user: User, index: number) => {
            try {
              // Fetch additional GitHub data for each user
              const githubData = await fetchGitHubUserData(user.github_username);
              
              // Calculate points based on various factors
              const points = calculateUserPoints(githubData, user);
              
              return {
                ...user,
                ...githubData,
                points,
                rank: index + 1, // Will be recalculated after sorting
                skills: extractSkillsFromUser(githubData),
              } as EnhancedUser;
            } catch (error) {
              console.error(`Failed to enhance user ${user.github_username}:`, error);
              // Return basic user data with minimal enhancements
              return {
                ...user,
                points: Math.floor(Math.random() * 1000) + 100, // Random points as fallback
                rank: index + 1,
                skills: ['GitHub'],
                contributions: Math.floor(Math.random() * 50) + 10,
                repositories: Math.floor(Math.random() * 20) + 5,
                followers: Math.floor(Math.random() * 100),
                following: Math.floor(Math.random() * 100),
                public_repos: Math.floor(Math.random() * 20) + 5,
              } as EnhancedUser;
            }
          })
        );

        // Sort by points and assign ranks
        const sortedUsers = enhancedUsers
          .sort((a, b) => b.points - a.points)
          .map((user, index) => ({ ...user, rank: index + 1 }));

        setUsers(sortedUsers);
        updateStats(sortedUsers);
        updateChartData(sortedUsers);
        updateSkillDistribution(sortedUsers);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    }
  };

  // Fetch GitHub user data
  const fetchGitHubUserData = async (username: string) => {
    try {
      // Try to get user stats from our API first
      const response = await fetch(`/demo/api/stats/${username}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          return data.stats;
        }
      }

      // Fallback to basic GitHub API if our enhanced API fails
      const basicResponse = await fetch(`https://api.github.com/users/${username}`);
      if (basicResponse.ok) {
        const userData = await basicResponse.json();
        return {
          public_repos: userData.public_repos || 0,
          followers: userData.followers || 0,
          following: userData.following || 0,
          bio: userData.bio || '',
          location: userData.location || '',
          company: userData.company || '',
          blog: userData.blog || '',
          contributions: Math.floor(Math.random() * 100) + 20, // Estimate
        };
      }

      throw new Error('Failed to fetch GitHub data');
    } catch (error) {
      console.warn(`Failed to fetch GitHub data for ${username}:`, error);
      return {
        public_repos: 0,
        followers: 0,
        following: 0,
        contributions: 0,
      };
    }
  };

  // Calculate user points based on various factors
  const calculateUserPoints = (githubData: any, user: User): number => {
    const basePoints = 100;
    const repoPoints = (githubData.public_repos || 0) * 10;
    const followerPoints = (githubData.followers || 0) * 2;
    const contributionPoints = (githubData.contributions || 0) * 5;
    const starsPoints = (githubData.total_stars || 0) * 3;
    const forksPoints = (githubData.total_forks || 0) * 2;

    // Account age bonus (older accounts get slight bonus)
    const accountAge = new Date().getTime() - new Date(user.created_at).getTime();
    const ageBonus = Math.min(accountAge / (1000 * 60 * 60 * 24 * 365), 5) * 20; // Max 5 years = 100 points

    return Math.floor(
      basePoints + 
      repoPoints + 
      followerPoints + 
      contributionPoints + 
      starsPoints + 
      forksPoints + 
      ageBonus
    );
  };

  // Extract skills from user data
  const extractSkillsFromUser = (githubData: any): string[] => {
    const skills: string[] = [];
    
    if (githubData.languages) {
      Object.keys(githubData.languages).slice(0, 3).forEach(lang => {
        skills.push(lang);
      });
    }

    // Add some default skills based on repositories
    if (githubData.public_repos > 10) skills.push('Active Developer');
    if (githubData.followers > 50) skills.push('Community Leader');
    if (githubData.total_stars > 100) skills.push('Popular Projects');

    return skills.slice(0, 4); // Limit to 4 skills
  };

  // Update statistics
  const updateStats = (users: EnhancedUser[]) => {
    const totalContributions = users.reduce((sum, user) => sum + user.contributions, 0);
    const totalRepositories = users.reduce((sum, user) => sum + user.repositories, 0);
    const activeUsers = users.filter(user => user.contributions > 0).length;

    setStats({
      totalUsers: users.length,
      topScore: users.length > 0 ? users[0].points : 0,
      avgPoints: users.length > 0 ? Math.round(users.reduce((sum, user) => sum + user.points, 0) / users.length) : 0,
      totalContributions,
      totalRepositories,
      activeUsers
    });
  };

  // Update chart data
  const updateChartData = (users: EnhancedUser[]) => {
    const data = users.slice(0, 10).map(user => ({
      name: user.github_username.length > 8 ? user.github_username.slice(0, 8) + '...' : user.github_username,
      points: user.points,
      contributions: user.contributions,
      repositories: user.repositories
    }));
    setChartData(data);
  };

  // Update skill distribution
  const updateSkillDistribution = (users: EnhancedUser[]) => {
    const skillCount: Record<string, number> = {};
    
    users.forEach(user => {
      user.skills.forEach(skill => {
        skillCount[skill] = (skillCount[skill] || 0) + 1;
      });
    });

    const sortedSkills = Object.entries(skillCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([skill, count], index) => ({
        name: skill,
        value: count,
        color: COLORS[index % COLORS.length]
      }));

    setSkillDistribution(sortedSkills);
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    await fetchUsers();
    setRefreshing(false);
  };

  // Initial data fetch
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUsers();
      setLoading(false);
    };
    
    loadData();
  }, []);

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
                  {/* Header */}
                  <div className="px-4 lg:px-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <IconTrophy className="size-8 text-yellow-400" />
                        <h1 className="text-3xl font-bold text-white tracking-tight">Leaderboard</h1>
                        {loading && <IconLoader2 className="size-6 text-purple-400 animate-spin" />}
                      </div>
                      <Button
                        onClick={refreshData}
                        disabled={refreshing || loading}
                        variant="outline"
                        className="border-purple-500/20 text-purple-200 hover:bg-purple-500/10"
                      >
                        {refreshing ? (
                          <IconLoader2 className="size-4 mr-2 animate-spin" />
                        ) : (
                          <IconRefresh className="size-4 mr-2" />
                        )}
                        Refresh
                      </Button>
                    </div>
                    <p className="text-lg text-purple-200/80">
                      Top performers across all projects and contributions
                      {users.length > 0 && ` • ${users.length} developers`}
                    </p>
                    {error && (
                      <div className="mt-2 p-3 bg-red-900/20 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-sm">⚠️ {error}</p>
                      </div>
                    )}
                  </div>

                  {/* Loading State */}
                  {loading && (
                    <div className="px-4 lg:px-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardContent className="py-12">
                          <div className="text-center">
                            <IconLoader2 className="size-12 text-purple-400 animate-spin mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">Loading Leaderboard</h3>
                            <p className="text-purple-200/70">Fetching user data from GitHub...</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Stats Cards */}
                  {!loading && (
                    <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-purple-200/80">Total Users</CardDescription>
                          <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                            <IconUsers className="size-5" />
                            {stats.totalUsers}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-purple-200/80">Top Score</CardDescription>
                          <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                            <IconStar className="size-5" />
                            {stats.topScore.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-purple-200/80">Avg. Points</CardDescription>
                          <CardTitle className="text-2xl font-bold text-green-400 flex items-center gap-2">
                            <IconTrendingUp className="size-5" />
                            {stats.avgPoints.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader className="pb-3">
                          <CardDescription className="text-purple-200/80">Total Contributions</CardDescription>
                          <CardTitle className="text-2xl font-bold text-blue-400">
                            {stats.totalContributions.toLocaleString()}
                          </CardTitle>
                        </CardHeader>
                      </Card>
                    </div>
                  )}

                  {/* Charts Section */}
                  {!loading && chartData.length > 0 && (
                    <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold">Points Distribution</CardTitle>
                          <CardDescription className="text-purple-200/80">Top 10 user performance</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis
                                dataKey="name"
                                tick={{ fill: '#e2e8f0', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                              />
                              <YAxis
                                tick={{ fill: '#e2e8f0', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1f2937',
                                  border: '1px solid #8b5cf6',
                                  borderRadius: '8px',
                                  color: '#e2e8f0'
                                }}
                              />
                              <Bar dataKey="points" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>

                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold">Skill Distribution</CardTitle>
                          <CardDescription className="text-purple-200/80">Popular skills across users</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={skillDistribution}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                              >
                                {skillDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1f2937',
                                  border: '1px solid #8b5cf6',
                                  borderRadius: '8px',
                                  color: '#e2e8f0'
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Additional Analytics */}
                  {!loading && users.length > 0 && (
                    <div className="px-4 lg:px-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold">Repository & Contribution Analytics</CardTitle>
                          <CardDescription className="text-purple-200/80">Combined metrics visualization</CardDescription>
                        </CardHeader>
                        <CardContent className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                              <XAxis 
                                dataKey="name" 
                                tick={{ fill: '#e2e8f0', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                              />
                              <YAxis 
                                tick={{ fill: '#e2e8f0', fontSize: 12 }}
                                axisLine={{ stroke: '#374151' }}
                              />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: '#1f2937',
                                  border: '1px solid #8b5cf6',
                                  borderRadius: '8px',
                                  color: '#e2e8f0'
                                }}
                              />
                              <Area 
                                type="monotone" 
                                dataKey="contributions" 
                                stackId="1" 
                                stroke="#10b981" 
                                fill="#10b981" 
                                fillOpacity={0.6} 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="repositories" 
                                stackId="1" 
                                stroke="#f59e0b" 
                                fill="#f59e0b" 
                                fillOpacity={0.6} 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Leaderboard Table */}
                  {!loading && (
                    <div className="px-4 lg:px-6">
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                        <CardHeader>
                          <CardTitle className="text-white font-semibold text-xl">Top Contributors</CardTitle>
                          <CardDescription className="text-purple-200/80">
                            Ranked by total points • {users.length} developers
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-hidden">
                            <Table>
                              <TableHeader className="bg-purple-900/20 backdrop-blur-lg">
                                <TableRow>
                                  <TableHead className="text-white w-16 font-semibold">Rank</TableHead>
                                  <TableHead className="text-white font-semibold">User</TableHead>
                                  <TableHead className="text-white font-semibold">Skills</TableHead>
                                  <TableHead className="text-white text-center font-semibold">Repos</TableHead>
                                  <TableHead className="text-white text-center font-semibold">Contributions</TableHead>
                                  <TableHead className="text-white text-right font-semibold">Points</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {users.length === 0 ? (
                                  <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                      <div className="text-gray-400">
                                        <IconUsers className="size-12 mx-auto mb-2 opacity-50" />
                                        <p>No users found</p>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ) : (
                                  users.map((user) => (
                                    <TableRow key={user.id} className="hover:bg-purple-500/10 border-purple-500/20 transition-colors">
                                      <TableCell className="text-white font-bold">
                                        <div className="flex items-center gap-2">
                                          {user.rank === 1 && <IconTrophy className="size-4 text-yellow-400" />}
                                          {user.rank === 2 && <IconTrophy className="size-4 text-gray-300" />}
                                          {user.rank === 3 && <IconTrophy className="size-4 text-amber-600" />}
                                          #{user.rank}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-white">
                                        <div className="flex items-center gap-3">
                                          <Avatar className="size-10 ring-2 ring-purple-400/30">
                                            <AvatarImage src={user.avatar_url || undefined} alt={user.github_username} />
                                            <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                              {user.github_username.slice(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <div className="font-semibold">{user.github_username}</div>
                                            <div className="text-sm text-purple-200/70">
                                              {user.email && `${user.email.split('@')[0]}@...`}
                                              {user.location && ` • ${user.location}`}
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-white">
                                        <div className="flex gap-1 flex-wrap">
                                          {user.skills.slice(0, 3).map((skill) => (
                                            <Badge key={skill} variant="outline" className="border-purple-400/30 text-purple-200 text-xs">
                                              {skill}
                                            </Badge>
                                          ))}
                                          {user.skills.length > 3 && (
                                            <Badge variant="outline" className="border-gray-400/30 text-gray-300 text-xs">
                                              +{user.skills.length - 3}
                                            </Badge>
                                          )}
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-white text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <IconCode className="size-3 text-purple-400" />
                                          <span className="font-mono text-sm">{user.repositories || user.public_repos || 0}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-white text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <IconGitBranch className="size-3 text-green-400" />
                                          <span className="font-mono text-sm">{user.contributions}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell className="text-white text-right">
                                        <div className="font-bold text-lg font-mono text-yellow-400">
                                          {user.points.toLocaleString()}
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  ))
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
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


