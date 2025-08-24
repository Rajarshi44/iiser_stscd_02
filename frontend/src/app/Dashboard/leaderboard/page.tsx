"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { IconTrophy, IconStar, IconTrendingUp, IconUsers } from "@tabler/icons-react";

const mockLeaders = [
  { name: "Alice Johnson", username: "alicej", points: 1340, rank: 1, avatar: "", skills: ["React", "TypeScript"], contributions: 45 },
  { name: "Brian Lee", username: "blee", points: 1205, rank: 2, avatar: "", skills: ["Node.js", "Python"], contributions: 38 },
  { name: "Carla Gomez", username: "carlag", points: 1150, rank: 3, avatar: "", skills: ["Data Science", "ML"], contributions: 42 },
  { name: "Dinesh Rao", username: "dineshr", points: 980, rank: 4, avatar: "", skills: ["DevOps", "AWS"], contributions: 29 },
  { name: "Emily Chen", username: "echen", points: 910, rank: 5, avatar: "", skills: ["UI/UX", "Frontend"], contributions: 31 },
];

const chartData = mockLeaders.map(u => ({
  name: u.name.split(' ')[0],
  points: u.points,
  contributions: u.contributions
}));

const skillDistribution = [
  { name: "Frontend", value: 35, color: "#8b5cf6" },
  { name: "Backend", value: 28, color: "#a855f7" },
  { name: "DevOps", value: 18, color: "#c084fc" },
  { name: "Data Science", value: 19, color: "#ddd6fe" },
];

const COLORS = ['#8b5cf6', '#a855f7', '#c084fc', '#ddd6fe'];

export default function LeaderboardPage() {
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
                    <div className="flex items-center gap-3 mb-2">
                      <IconTrophy className="size-8 text-yellow-400" />
                      <h1 className="text-3xl font-bold text-white tracking-tight">Leaderboard</h1>
                    </div>
                    <p className="text-lg text-purple-200/80">Top performers across all projects and contributions</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Total Users</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                          <IconUsers className="size-5" />
                          {mockLeaders.length}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Top Score</CardDescription>
                        <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                          <IconStar className="size-5" />
                          {mockLeaders[0]?.points.toLocaleString()}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Avg. Points</CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-400 flex items-center gap-2">
                          <IconTrendingUp className="size-5" />
                          {Math.round(mockLeaders.reduce((acc, u) => acc + u.points, 0) / mockLeaders.length).toLocaleString()}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Total Contributions</CardDescription>
                        <CardTitle className="text-2xl font-bold text-blue-400">
                          {mockLeaders.reduce((acc, u) => acc + u.contributions, 0)}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Charts Section */}
                  <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold">Points Distribution</CardTitle>
                        <CardDescription className="text-purple-200/80">User performance comparison</CardDescription>
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
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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

                  {/* Leaderboard Table */}
                  <div className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold text-xl">Top Contributors</CardTitle>
                        <CardDescription className="text-purple-200/80">Ranked by total points earned</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-hidden">
                          <Table>
                            <TableHeader className="bg-purple-900/20 backdrop-blur-lg">
                              <TableRow>
                                <TableHead className="text-white w-16 font-semibold">Rank</TableHead>
                                <TableHead className="text-white font-semibold">User</TableHead>
                                <TableHead className="text-white font-semibold">Skills</TableHead>
                                <TableHead className="text-white text-center font-semibold">Contributions</TableHead>
                                <TableHead className="text-white text-right font-semibold">Points</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {mockLeaders.map((u) => (
                                <TableRow key={u.rank} className="hover:bg-purple-500/10 border-purple-500/20 transition-colors">
                                  <TableCell className="text-white font-bold">
                                    <div className="flex items-center gap-2">
                                      {u.rank === 1 && <IconTrophy className="size-4 text-yellow-400" />}
                                      #{u.rank}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white">
                                    <div className="flex items-center gap-3">
                                      <Avatar className="size-10 ring-2 ring-purple-400/30">
                                        <AvatarImage src={u.avatar || undefined} alt={u.name} />
                                        <AvatarFallback className="bg-purple-600 text-white font-semibold">
                                          {u.name.split(" ").map(p => p[0]).join("")}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="font-semibold">{u.name}</div>
                                        <div className="text-sm text-purple-200/70">@{u.username}</div>
                                      </div>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white">
                                    <div className="flex gap-1 flex-wrap">
                                      {u.skills.map((skill) => (
                                        <Badge key={skill} variant="outline" className="border-purple-400/30 text-purple-200 text-xs">
                                          {skill}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white text-center font-mono">{u.contributions}</TableCell>
                                  <TableCell className="text-white text-right">
                                    <div className="font-bold text-lg font-mono text-yellow-400">
                                      {u.points.toLocaleString()}
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuroraBackground>
  );
}


