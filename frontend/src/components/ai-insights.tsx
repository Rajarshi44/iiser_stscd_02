"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts';
import { 
  IconBrain, 
  IconTrendingUp, 
  IconBulb, 
  IconTargetArrow,
  IconRocket,
  IconBook,
  IconStar,
  IconUsers,
  IconCode,
  IconRefresh,
  IconSparkles,
  IconChartBar,
  IconRoad
} from "@tabler/icons-react";
import { geminiService, type DeveloperData, type AIInsights } from "@/lib/gemini";

interface AIInsightsComponentProps {
  developerData: DeveloperData | null;
  className?: string;
}

export function AIInsightsComponent({ developerData, className = "" }: AIInsightsComponentProps) {
  const [insights, setInsights] = useState<AIInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeProfile = async () => {
    if (!developerData) return;

    setLoading(true);
    setError(null);

    try {
      const result = await geminiService.analyzeDeveloperProfile(developerData);
      setInsights(result);
    } catch (err) {
      console.error('Error analyzing profile:', err);
      setError('Failed to analyze profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (developerData && !insights && !loading) {
      analyzeProfile();
    }
  }, [developerData]);

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 50) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreGradient = (score: number) => {
    if (score >= 85) return "from-green-500 to-green-400";
    if (score >= 70) return "from-yellow-500 to-yellow-400";
    if (score >= 50) return "from-orange-500 to-orange-400";
    return "from-red-500 to-red-400";
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'border-green-400/40 text-green-300 bg-green-400/10';
      case 'Intermediate': return 'border-yellow-400/40 text-yellow-300 bg-yellow-400/10';
      case 'Advanced': return 'border-red-400/40 text-red-300 bg-red-400/10';
      default: return 'border-purple-400/40 text-purple-300 bg-purple-400/10';
    }
  };

  // Chart colors
  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];
  const RADIAL_COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe'];

  // Prepare chart data
  const prepareScoreData = (scores: any) => {
    return Object.entries(scores).map(([key, value], index) => ({
      name: key.charAt(0).toUpperCase() + key.slice(1),
      value: value as number,
      fill: RADIAL_COLORS[index % RADIAL_COLORS.length]
    }));
  };

  const prepareSkillsData = (insights: AIInsights) => {
    return insights.strengths.slice(0, 5).map((strength, index) => ({
      name: strength.length > 20 ? strength.substring(0, 20) + '...' : strength,
      value: 85 + Math.random() * 15, // Simulate strength values
      fill: COLORS[index % COLORS.length]
    }));
  };

  const prepareProjectDifficultyData = (insights: AIInsights) => {
    const difficultyCount = insights.recommendedProjects.reduce((acc, project) => {
      acc[project.difficulty] = (acc[project.difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(difficultyCount).map(([difficulty, count], index) => ({
      name: difficulty,
      value: count,
      fill: COLORS[index % COLORS.length]
    }));
  };

  if (!developerData) {
    return (
      <Card className={`bg-black/20 backdrop-blur-lg border-purple-500/20 ${className}`}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <IconBrain className="size-12 text-purple-400 mx-auto mb-4" />
            <p className="text-purple-200/70">No developer data available for AI analysis</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br from-black/30 to-purple-900/20 backdrop-blur-xl border border-purple-400/30 shadow-2xl hover:shadow-purple-500/30 hover:border-purple-400/50 transition-all duration-500 ${className}`}>
      <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-b border-purple-400/20">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white font-bold text-xl flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
                <IconBrain className="size-6 text-purple-300" />
              </div>
              AI Developer Insights
              {loading && (
                <IconRefresh className="size-5 animate-spin text-purple-400" />
              )}
            </CardTitle>
            <CardDescription className="text-purple-200/80 mt-2 text-base">
              AI-powered analysis of your development profile and personalized recommendations
            </CardDescription>
          </div>
          <Button
            onClick={analyzeProfile}
            disabled={loading}
            variant="outline"
            size="lg"
            className="border-purple-400/40 bg-purple-500/10 text-purple-200 hover:text-white hover:border-purple-300 hover:bg-purple-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-50"
          >
            {loading ? (
              <IconRefresh className="size-5 animate-spin mr-2" />
            ) : (
              <IconSparkles className="size-5 mr-2" />
            )}
            {loading ? 'Analyzing...' : 'Re-analyze'}
          </Button>
        </div>
        {error && (
          <div className="mt-2 p-2 rounded bg-red-500/10 border border-red-500/20">
            <span className="text-sm text-red-300">{error}</span>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-purple-200">
                <IconBrain className="size-6 animate-pulse" />
                <span>AI is analyzing your developer profile...</span>
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-4 bg-purple-500/10 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ) : insights ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-black/40 to-purple-900/30 border border-purple-400/30 rounded-xl p-1">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-purple-600/30 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <IconChartBar className="size-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-purple-600/30 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <IconRocket className="size-4 mr-2" />
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="learning" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-purple-600/30 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <IconBook className="size-4 mr-2" />
                Learning
              </TabsTrigger>
              <TabsTrigger 
                value="career" 
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500/30 data-[state=active]:to-purple-600/30 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 rounded-lg"
              >
                <IconRoad className="size-4 mr-2" />
                Career
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 mt-6">
              {/* Overview */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 backdrop-blur-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20 border border-purple-400/30">
                      <IconSparkles className="size-6 text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">AI Analysis Summary</h3>
                      <p className="text-purple-100 leading-relaxed">{insights.overview}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Developer Scores Chart */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl bg-black/40 border border-purple-500/30 backdrop-blur-sm"
                  >
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <IconChartBar className="size-5 text-purple-400" />
                      Developer Scores
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={prepareScoreData(insights.score)}>
                          <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '8px',
                              color: 'white'
                            }} 
                          />
                          <Legend 
                            iconSize={8}
                            wrapperStyle={{ color: 'white', fontSize: '12px' }}
                          />
                        </RadialBarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl bg-black/40 border border-purple-500/30 backdrop-blur-sm"
                  >
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <IconTrendingUp className="size-5 text-green-400" />
                      Top Strengths
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={prepareSkillsData(insights)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fill: 'white', fontSize: 10 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fill: 'white', fontSize: 12 }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '8px',
                              color: 'white'
                            }} 
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Score Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(insights.score).map(([key, value], index) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/20 border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300"
                    >
                      <div className="text-center space-y-3">
                        <div className="relative">
                          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${getScoreGradient(value)} flex items-center justify-center shadow-lg`}>
                            <span className="text-lg font-bold text-white">{value}</span>
                          </div>
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                            <IconStar className="size-2 text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white capitalize">{key}</p>
                          <div className="mt-2 bg-black/20 rounded-full h-2 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${value}%` }}
                              transition={{ delay: index * 0.2, duration: 1 }}
                              className={`h-full bg-gradient-to-r ${getScoreGradient(value)}`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Strengths and Areas for Improvement */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <IconTrendingUp className="size-4 text-green-400" />
                    Strengths
                  </h4>
                  <div className="space-y-2">
                    {insights.strengths.map((strength, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20"
                      >
                        <IconStar className="size-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-green-100">{strength}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <IconTargetArrow className="size-4 text-orange-400" />
                    Areas for Improvement
                  </h4>
                  <div className="space-y-2">
                    {insights.areasForImprovement.map((area, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/20"
                      >
                        <IconBulb className="size-4 text-orange-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-orange-100">{area}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="projects" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Project Overview Chart */}
                <div className="grid lg:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-1 p-6 rounded-xl bg-black/40 border border-purple-500/30 backdrop-blur-sm"
                  >
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <IconRocket className="size-5 text-purple-400" />
                      Project Difficulty Distribution
                    </h4>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareProjectDifficultyData(insights)}
                            cx="50%"
                            cy="50%"
                            innerRadius={30}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {prepareProjectDifficultyData(insights).map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '8px',
                              color: 'white'
                            }} 
                          />
                          <Legend 
                            iconSize={8}
                            wrapperStyle={{ color: 'white', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/20"
                  >
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <IconTargetArrow className="size-5 text-purple-400" />
                      Project Recommendations Overview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-black/20 border border-purple-500/20">
                        <div className="text-2xl font-bold text-purple-300">{insights.recommendedProjects.length}</div>
                        <div className="text-sm text-purple-200/70">Total Projects</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-black/20 border border-green-500/20">
                        <div className="text-2xl font-bold text-green-300">
                          {insights.recommendedProjects.filter(p => p.difficulty === 'Beginner').length}
                        </div>
                        <div className="text-sm text-green-200/70">Beginner</div>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-black/20 border border-yellow-500/20">
                        <div className="text-2xl font-bold text-yellow-300">
                          {insights.recommendedProjects.filter(p => p.difficulty === 'Advanced').length}
                        </div>
                        <div className="text-sm text-yellow-200/70">Advanced</div>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Project Cards */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <IconCode className="size-5 text-purple-400" />
                    Recommended Projects
                  </h4>
                  <div className="grid gap-4">
                    {insights.recommendedProjects.map((project, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group p-6 rounded-xl bg-gradient-to-r from-black/30 to-black/20 border border-purple-500/20 hover:border-purple-400/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30 group-hover:bg-purple-500/30 transition-colors">
                              <IconRocket className="size-5 text-purple-300" />
                            </div>
                            <h5 className="text-xl font-semibold text-white group-hover:text-purple-200 transition-colors">{project.title}</h5>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className={`${getDifficultyColor(project.difficulty)} transition-all duration-300 group-hover:scale-105`}>
                              {project.difficulty}
                            </Badge>
                            <Badge variant="outline" className="border-blue-400/40 text-blue-300 bg-blue-400/10 transition-all duration-300 group-hover:scale-105">
                              {project.estimatedTime}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-purple-200/80 text-sm mb-4 leading-relaxed">{project.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge
                              key={techIndex}
                              variant="outline"
                              className="border-purple-400/30 text-purple-200 text-xs hover:bg-purple-400/10 transition-colors"
                            >
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="learning" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Learning Path Overview */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-blue-500/20 border border-blue-400/30">
                      <IconBook className="size-6 text-blue-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Personalized Learning Journey</h3>
                      <p className="text-blue-100/80">Curated skills and resources based on your profile analysis</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-blue-500/20">
                      <div className="text-2xl font-bold text-blue-300">{insights.learningPath.length}</div>
                      <div className="text-sm text-blue-200/70">Skills to Learn</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-purple-500/20">
                      <div className="text-2xl font-bold text-purple-300">
                        {insights.learningPath.reduce((total, item) => total + item.resources.length, 0)}
                      </div>
                      <div className="text-sm text-purple-200/70">Resources</div>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-black/20 border border-green-500/20">
                      <div className="text-2xl font-bold text-green-300">
                        {Math.ceil(insights.learningPath.length * 2.5)}
                      </div>
                      <div className="text-sm text-green-200/70">Est. Weeks</div>
                    </div>
                  </div>
                </motion.div>

                {/* Learning Path Items */}
                <div className="space-y-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <IconRoad className="size-5 text-blue-400" />
                    Your Learning Roadmap
                  </h4>
                  <div className="space-y-4">
                    {insights.learningPath.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative p-6 rounded-xl bg-gradient-to-r from-black/30 to-black/20 border border-blue-500/20 hover:border-blue-400/40 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300"
                      >
                        {/* Progress indicator */}
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-xl" />
                        
                        <div className="flex items-start gap-4">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <IconBulb className="size-5 text-blue-400" />
                              <h5 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors">{item.skill}</h5>
                            </div>
                            <p className="text-blue-200/80 mb-4 leading-relaxed">{item.reason}</p>
                            <div className="space-y-2">
                              <p className="text-sm text-blue-200/60 font-medium flex items-center gap-2">
                                <IconBook className="size-3" />
                                Recommended Resources:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {item.resources.map((resource, resIndex) => (
                                  <Badge
                                    key={resIndex}
                                    variant="outline"
                                    className="border-blue-400/30 text-blue-200 text-xs hover:bg-blue-400/10 transition-all duration-300 hover:scale-105"
                                  >
                                    {resource}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="career" className="space-y-6 mt-6">
              <div className="space-y-6">
                {/* Career Overview */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-6 rounded-xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-green-500/20 border border-green-400/30">
                      <IconUsers className="size-6 text-green-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">Career Development Insights</h3>
                      <div className="p-4 rounded-lg bg-black/20 border border-green-500/20">
                        <p className="text-green-100 leading-relaxed">{insights.careerAdvice}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Career Metrics */}
                <div className="grid md:grid-cols-2 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl bg-black/40 border border-green-500/30"
                  >
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <IconTrendingUp className="size-5 text-green-400" />
                      Growth Opportunities
                    </h4>
                    <div className="space-y-3">
                      {insights.areasForImprovement.slice(0, 3).map((area, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-sm text-green-100">{area}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl bg-black/40 border border-green-500/30"
                  >
                    <h4 className="text-white font-medium mb-4 flex items-center gap-2">
                      <IconTargetArrow className="size-5 text-green-400" />
                      Key Strengths
                    </h4>
                    <div className="space-y-3">
                      {insights.strengths.slice(0, 3).map((strength, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                          <IconStar className="size-4 text-green-400" />
                          <span className="text-sm text-green-100">{strength}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 backdrop-blur-sm">
              <div className="p-4 rounded-full bg-purple-500/20 border border-purple-400/30 w-fit mx-auto mb-6">
                <IconBrain className="size-16 text-purple-300" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Ready for AI Analysis?</h3>
              <p className="text-purple-200/80 mb-6 max-w-md mx-auto leading-relaxed">
                Get personalized insights, project recommendations, and career advice powered by advanced AI analysis of your developer profile.
              </p>
              <Button
                onClick={analyzeProfile}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 py-3 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 hover:scale-105"
              >
                <IconSparkles className="size-5 mr-3" />
                Start AI Analysis
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
