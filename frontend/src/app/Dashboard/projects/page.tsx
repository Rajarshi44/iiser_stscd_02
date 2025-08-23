"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { VictoryChart, VictoryLine, VictoryAxis, VictoryTheme, VictoryArea, VictoryPolarAxis, VictoryBar } from "victory";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { IconCode, IconGitBranch, IconTarget, IconTrendingUp, IconStar, IconCalendar } from "@tabler/icons-react";

import projects from "../data.json";

type Project = {
  id: number;
  header: string;
  type: string;
  status: string;
  target: string;
  limit: string;
  reviewer: string;
};

const skills = [
  { name: "React", level: 4, maxLevel: 5, color: "#61dafb" },
  { name: "TypeScript", level: 4, maxLevel: 5, color: "#3178c6" },
  { name: "Node.js", level: 3, maxLevel: 5, color: "#339933" },
  { name: "Data Viz", level: 3, maxLevel: 5, color: "#ff6384" },
  { name: "CI/CD", level: 2, maxLevel: 5, color: "#ff9f40" },
  { name: "Testing", level: 2, maxLevel: 5, color: "#4bc0c0" },
];

const skillRadarData = skills.map(s => ({
  skill: s.name,
  current: s.level,
  target: s.maxLevel,
  x: s.name,
  y: s.level
}));

const projectProgressData = [
  { month: "Jan", progress: 65 },
  { month: "Feb", progress: 72 },
  { month: "Mar", progress: 78 },
  { month: "Apr", progress: 85 },
  { month: "May", progress: 90 },
  { month: "Jun", progress: 95 }
];

const technologyData = [
  { name: "Frontend", value: 45, color: "#8b5cf6" },
  { name: "Backend", value: 30, color: "#a855f7" },
  { name: "Database", value: 15, color: "#c084fc" },
  { name: "DevOps", value: 10, color: "#ddd6fe" }
];

export default function ProjectsPage() {
  const ongoing = (projects as Project[]).filter((p) => p.status !== "Done");

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
                      <IconCode className="size-8 text-blue-400" />
                      <h1 className="text-3xl font-bold text-white tracking-tight">Projects & Skills</h1>
                    </div>
                    <p className="text-lg text-purple-200/80">Track your ongoing projects and skill development journey</p>
                  </div>

                  {/* Stats Cards */}
                  <div className="px-4 lg:px-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Active Projects</CardDescription>
                        <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                          <IconGitBranch className="size-5" />
                          {ongoing.length}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Skill Level Avg</CardDescription>
                        <CardTitle className="text-2xl font-bold text-green-400 flex items-center gap-2">
                          <IconStar className="size-5" />
                          {(skills.reduce((acc, s) => acc + s.level, 0) / skills.length).toFixed(1)}/5
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Completion Rate</CardDescription>
                        <CardTitle className="text-2xl font-bold text-yellow-400 flex items-center gap-2">
                          <IconTarget className="size-5" />
                          85%
                        </CardTitle>
                      </CardHeader>
                    </Card>
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader className="pb-3">
                        <CardDescription className="text-purple-200/80">Next Milestone</CardDescription>
                        <CardTitle className="text-2xl font-bold text-blue-400 flex items-center gap-2">
                          <IconCalendar className="size-5" />
                          Q1 2025
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>

                  {/* Charts Section */}
                  <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold">Skill Radar</CardTitle>
                        <CardDescription className="text-purple-200/80">Current vs Target levels</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <VictoryChart
                          polar
                          theme={VictoryTheme.material}
                          domain={{ y: [0, 5] }}
                          width={400}
                          height={300}
                          style={{
                            background: { fill: "transparent" }
                          }}
                        >
                          <VictoryPolarAxis 
                            dependentAxis
                            style={{
                              tickLabels: { fill: "#e2e8f0", fontSize: 10 },
                              grid: { stroke: "#374151", strokeWidth: 1 }
                            }}
                          />
                          <VictoryPolarAxis 
                            style={{
                              tickLabels: { fill: "#e2e8f0", fontSize: 10 },
                              grid: { stroke: "#374151", strokeWidth: 1 }
                            }}
                          />
                          <VictoryArea
                            data={skillRadarData}
                            x="skill"
                            y="current"
                            style={{
                              data: { fill: "#8b5cf6", fillOpacity: 0.4, stroke: "#8b5cf6", strokeWidth: 2 }
                            }}
                          />
                        </VictoryChart>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold">Project Progress</CardTitle>
                        <CardDescription className="text-purple-200/80">Monthly completion trend</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={projectProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis 
                              dataKey="month" 
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
                              dataKey="progress" 
                              stroke="#8b5cf6" 
                              fill="#8b5cf6" 
                              fillOpacity={0.3}
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold">Technology Focus</CardTitle>
                        <CardDescription className="text-purple-200/80">Time allocation by area</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <VictoryChart
                          theme={VictoryTheme.material}
                          width={400}
                          height={300}
                          padding={{ left: 80, top: 20, right: 40, bottom: 60 }}
                          style={{
                            background: { fill: "transparent" }
                          }}
                        >
                          <VictoryAxis 
                            dependentAxis
                            style={{
                              tickLabels: { fill: "#e2e8f0", fontSize: 10 },
                              grid: { stroke: "#374151", strokeWidth: 1 }
                            }}
                          />
                          <VictoryAxis 
                            style={{
                              tickLabels: { fill: "#e2e8f0", fontSize: 10 },
                              grid: { stroke: "#374151", strokeWidth: 1 }
                            }}
                          />
                          <VictoryBar
                            data={technologyData}
                            x="name"
                            y="value"
                            style={{
                              data: { fill: ({ datum }) => datum.color }
                            }}
                          />
                        </VictoryChart>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Ongoing Projects Table */}
                  <section className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold text-xl flex items-center gap-2">
                          <IconGitBranch className="size-5" />
                          Active Projects
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Currently in development</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-hidden">
                          <Table>
                            <TableHeader className="bg-purple-900/20 backdrop-blur-lg">
                              <TableRow>
                                <TableHead className="text-white font-semibold">Repository</TableHead>
                                <TableHead className="text-white font-semibold">Type</TableHead>
                                <TableHead className="text-white font-semibold">Status</TableHead>
                                <TableHead className="text-white font-semibold">Target</TableHead>
                                <TableHead className="text-white font-semibold">Collaborators</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {ongoing.map((p) => (
                                <TableRow key={p.id} className="hover:bg-purple-500/10 border-purple-500/20 transition-colors">
                                  <TableCell className="text-white font-medium">{p.header}</TableCell>
                                  <TableCell className="text-white/80">
                                    <div className="flex gap-1 flex-wrap">
                                      {p.type.split(", ").slice(0, 2).map((type) => (
                                        <Badge key={type} variant="outline" className="border-purple-400/30 text-purple-200 text-xs">
                                          {type}
                                        </Badge>
                                      ))}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white/80">
                                    <Badge variant="outline" className="border-yellow-400/30 bg-yellow-400/10 text-yellow-300">
                                      {p.status}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-white/80 font-mono">{p.target}</TableCell>
                                  <TableCell className="text-white/80 text-sm">{p.reviewer}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Enhanced Skill Tree */}
                  <section className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold text-xl flex items-center gap-2">
                          <IconStar className="size-5" />
                          Skill Development Tree
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Your progression across different technologies</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                          {skills.map((s) => {
                            const progress = (s.level / s.maxLevel) * 100;
                            return (
                              <div key={s.name} className="rounded-lg border border-purple-500/20 bg-black/20 backdrop-blur-lg p-6 hover:border-purple-400/40 transition-colors">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-3">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: s.color }}
                                    />
                                    <span className="text-white font-semibold text-lg">{s.name}</span>
                                  </div>
                                  <Badge variant="outline" className="border-purple-400/30 text-purple-200">
                                    Level {s.level}/{s.maxLevel}
                                  </Badge>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-purple-200/70">Progress</span>
                                    <span className="text-white font-mono">{progress.toFixed(0)}%</span>
                                  </div>
                                  <Progress 
                                    value={progress} 
                                    className="h-3 bg-purple-900/30"
                                  />
                                  <div className="flex justify-between text-xs text-purple-200/60">
                                    <span>Beginner</span>
                                    <span>Expert</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </section>
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </AuroraBackground>
  );
}


