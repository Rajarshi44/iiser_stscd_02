"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/Authcontext";
import { IconGitBranch, IconStar, IconUsers, IconCalendar, IconFlame, IconTrendingUp, IconCode, IconLock, IconWorld, IconRefresh, IconAlertCircle, IconClock } from "@tabler/icons-react";
import GitHubContributionChart from "@/components/GitHubContributionChart";

import data from "./data.json";



export default function Page() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [repos, setRepos] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [contributions, setContributions] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repoFilter, setRepoFilter] = useState<'all' | 'public' | 'private'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, getUserProfile, getUserRepos, getUserContributions, getUserStats, getUserActivity } = useAuth();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Enhanced data fetching with error handling and contributions
  const fetchGitHubData = async (isRefresh = false) => {
    if (!user) return;
    
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    setError(null);
    
    try {
      console.log('🔄 Fetching GitHub data...');
      
      // Fetch all data in parallel for better performance
      const [profileData, reposData, contributionsData, statsData, activityData] = await Promise.all([
        getUserProfile().catch(err => {
          console.error('Profile fetch error:', err);
          return null;
        }),
        getUserRepos().catch(err => {
          console.error('Repos fetch error:', err);
          return [];
        }),
        getUserContributions(user.login, 'year').catch(err => {
          console.error('Contributions fetch error:', err);
          return null;
        }),
        getUserStats(user.login).catch(err => {
          console.error('Stats fetch error:', err);
          return null;
        }),
        getUserActivity(user.login).catch(err => {
          console.error('Activity fetch error:', err);
          return null;
        })
      ]);

      setProfile(profileData);
      setRepos(Array.isArray(reposData) ? reposData : []);
      setContributions(contributionsData);
      setStats(statsData);
      setActivity(activityData);
      setLastUpdated(new Date());
      
      console.log('✅ GitHub data fetched successfully:', {
        profile: !!profileData,
        repos: reposData?.length || 0,
        contributions: !!contributionsData,
        stats: !!statsData,
        activity: !!activityData
      });
      
    } catch (error) {
      console.error('❌ Error fetching GitHub data:', error);
      setError('Failed to load GitHub data. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!user) return;

    fetchGitHubData();
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing GitHub data...');
      fetchGitHubData(true);
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user, getUserProfile, getUserRepos, getUserContributions, getUserStats, getUserActivity]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchGitHubData(true);
  };

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
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                >
                  
                  
                  {/* GitHub Profile Section */}
                  {user && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.15 }}
                      className="px-4 lg:px-6"
                    >
                      <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl hover:shadow-purple-500/20 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-white font-semibold flex items-center gap-2">
                                <IconGitBranch className="size-5" />
                                GitHub Profile
                                {refreshing && (
                                  <IconRefresh className="size-4 animate-spin text-purple-400" />
                                )}
                              </CardTitle>
                              <CardDescription className="text-purple-200/80">
                                Your GitHub account information and recent repositories
                              </CardDescription>
                            </div>
                            <div className="flex items-center gap-2">
                              {lastUpdated && (
                                <div className="flex items-center gap-1 text-xs text-purple-200/60">
                                  <IconClock className="size-3" />
                                  Updated {lastUpdated.toLocaleTimeString()}
                                </div>
                              )}
                              <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-lg border border-purple-500/30 text-purple-200 hover:text-white hover:border-purple-400 transition-colors disabled:opacity-50"
                                title="Refresh GitHub data"
                              >
                                <IconRefresh className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
                              </button>
                            </div>
                          </div>
                          {error && (
                            <div className="flex items-center gap-2 mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
                              <IconAlertCircle className="size-4 text-red-400" />
                              <span className="text-sm text-red-300">{error}</span>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent>
                          {/* GitHub Stats Overview */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{user.public_repos || 0}</div>
                              <div className="text-sm text-purple-200/70">Repositories</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{user.followers || 0}</div>
                              <div className="text-sm text-purple-200/70">Followers</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{user.following || 0}</div>
                              <div className="text-sm text-purple-200/70">Following</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">
                                {contributions?.total_contributions || 0}
                              </div>
                              <div className="text-sm text-purple-200/70">Contributions</div>
                            </div>
                          </div>

                          <div className="flex flex-col lg:flex-row gap-6">
                            {/* User Info */}
                            <div className="flex items-center gap-4">
                              <Avatar className="size-20 ring-2 ring-purple-400/30">
                                <AvatarImage src={user.avatar_url} alt={user.login} />
                                <AvatarFallback className="bg-purple-600 text-white text-xl font-bold">
                                  {user.login?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-white">{user.name || user.login}</h3>
                                <p className="text-purple-200/80">@{user.login}</p>
                                {user.email && (
                                  <p className="text-sm text-purple-200/60">{user.email}</p>
                                )}
                                {contributions && (
                                  <div className="flex gap-2 mt-2">
                                    <Badge variant="outline" className="border-orange-400/30 text-orange-300">
                                      <IconFlame className="size-3 mr-1" />
                                      {contributions.current_streak} day streak
                                    </Badge>
                                    <Badge variant="outline" className="border-green-400/30 text-green-300">
                                      <IconTrendingUp className="size-3 mr-1" />
                                      {contributions.longest_streak} longest
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Contribution Chart */}
                            <div className="flex-1">
                              <GitHubContributionChart className="bg-black/20 border-purple-500/20" />
                            </div>
                          </div>

                          {/* Languages */}
                          {contributions?.languages && Object.keys(contributions.languages).length > 0 && (
                            <div className="mt-6">
                              <h4 className="text-white font-medium mb-3">Top Languages</h4>
                              <div className="flex gap-2 flex-wrap">
                                {Object.entries(contributions.languages)
                                  .sort(([,a], [,b]) => (b as number) - (a as number))
                                  .slice(0, 5)
                                  .map(([language, count]) => (
                                    <Badge key={language} variant="outline" className="border-purple-400/30 text-purple-200">
                                      {language} ({count as number})
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* Recent Repositories */}
                          <div className="mt-6">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-white font-medium flex items-center gap-2">
                                <IconGitBranch className="size-4" />
                                Recent Repositories
                              </h4>
                              
                              {/* Repository Filter */}
                              <div className="flex gap-1 text-xs">
                                {(['all', 'public', 'private'] as const).map((filter) => (
                                  <button
                                    key={filter}
                                    onClick={() => setRepoFilter(filter)}
                                    className={`px-3 py-1 rounded border transition-colors capitalize ${
                                      repoFilter === filter
                                        ? 'border-purple-400 bg-purple-500/20 text-white'
                                        : 'border-purple-600/30 text-purple-200/70 hover:border-purple-500 hover:text-white'
                                    }`}
                                  >
                                    {filter}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            {loading ? (
                              <div className="text-purple-200/60">Loading repositories...</div>
                            ) : (() => {
                              const filteredRepos = repos.filter(repo => {
                                if (repoFilter === 'all') return true;
                                if (repoFilter === 'private') return repo.private;
                                if (repoFilter === 'public') return !repo.private;
                                return true;
                              });
                              
                              return filteredRepos.length > 0 ? (
                                <>
                                  {/* Repository Stats */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                    <div className="text-center p-3 rounded-lg bg-black/30 border border-purple-500/10">
                                      <div className="text-lg font-bold text-white">
                                        {repos.filter(r => !r.private).length}
                                      </div>
                                      <div className="text-xs text-green-400 flex items-center justify-center gap-1">
                                        <IconWorld className="size-3" />
                                        Public
                                      </div>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-black/30 border border-purple-500/10">
                                      <div className="text-lg font-bold text-white">
                                        {repos.filter(r => r.private).length}
                                      </div>
                                      <div className="text-xs text-yellow-400 flex items-center justify-center gap-1">
                                        <IconLock className="size-3" />
                                        Private
                                      </div>
                                    </div>
                                    <div className="text-center p-3 rounded-lg bg-black/30 border border-purple-500/10">
                                      <div className="text-lg font-bold text-white">
                                        {repos.reduce((total, repo) => total + (repo.stargazers_count || 0), 0)}
                                      </div>
                                      <div className="text-xs text-purple-400 flex items-center justify-center gap-1">
                                        <IconStar className="size-3" />
                                        Total Stars
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* Repository Grid */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {filteredRepos.map((repo: any) => (
                                      <div 
                                        key={repo.id} 
                                        className={`rounded-lg border p-4 hover:shadow-lg transition-all duration-300 ${
                                          repo.private 
                                            ? 'border-yellow-500/30 bg-yellow-500/5 hover:border-yellow-400/50' 
                                            : 'border-green-500/30 bg-green-500/5 hover:border-green-400/50'
                                        }`}
                                      >
                                        <div className="flex items-start justify-between mb-2">
                                          <h5 className="text-white font-medium truncate pr-2 flex items-center gap-2">
                                            {repo.private ? (
                                              <IconLock className="size-3 text-yellow-400" />
                                            ) : (
                                              <IconWorld className="size-3 text-green-400" />
                                            )}
                                            {repo.name}
                                          </h5>
                                          <Badge 
                                            variant="outline" 
                                            className={`text-xs ${
                                              repo.private 
                                                ? 'border-yellow-400/40 text-yellow-300 bg-yellow-400/10' 
                                                : 'border-green-400/40 text-green-300 bg-green-400/10'
                                            }`}
                                          >
                                            {repo.private ? 'Private' : 'Public'}
                                          </Badge>
                                        </div>
                                        
                                        {repo.description && (
                                          <p className="text-xs text-purple-200/70 mb-3 line-clamp-2">
                                            {repo.description}
                                          </p>
                                        )}
                                        
                                        <div className="flex items-center justify-between text-xs text-purple-200/60">
                                          <div className="flex items-center gap-3">
                                            {repo.language && (
                                              <span className="flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${
                                                  repo.private ? 'bg-yellow-400' : 'bg-green-400'
                                                }`}></div>
                                                {repo.language}
                                              </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                              <IconStar className="size-3" />
                                              {repo.stargazers_count || 0}
                                            </span>
                                          </div>
                                          <span className="flex items-center gap-1">
                                            <IconCalendar className="size-3" />
                                            {new Date(repo.updated_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </>
                              ) : (
                                <div className="text-purple-200/60 text-center py-8">
                                  No {repoFilter === 'all' ? '' : repoFilter + ' '}repositories found
                                </div>
                              );
                            })()}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
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
