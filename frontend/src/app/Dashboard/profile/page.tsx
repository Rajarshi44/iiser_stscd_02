"use client";

import React from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Line, Doughnut } from "react-chartjs-2";
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
} from "chart.js";
import { useAuth } from "@/context/Authcontext";
import { IconUser, IconCode, IconGitCommit, IconStar, IconCalendar, IconTrendingUp, IconAward } from "@tabler/icons-react";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
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

const contributionChartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    {
      label: "Contributions",
      data: [23, 31, 28, 35, 42, 38],
      borderColor: "#8b5cf6",
      backgroundColor: "rgba(139, 92, 246, 0.1)",
      borderWidth: 2,
      fill: true,
      tension: 0.4,
    },
  ],
};

const projectTypeChartData = {
  labels: ["Frontend", "Backend", "Full-Stack", "Data Science"],
  datasets: [
    {
      data: [8, 5, 3, 2],
      backgroundColor: ["#8b5cf6", "#a855f7", "#c084fc", "#ddd6fe"],
      borderColor: ["#6d28d9", "#7c3aed", "#9333ea", "#c4b5fd"],
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

const achievements = [
  { name: "Early Adopter", description: "Completed 5 projects", icon: "🏆", date: "Dec 2024" },
  { name: "Code Warrior", description: "100+ commits", icon: "⚔️", date: "Nov 2024" },
  { name: "Team Player", description: "Collaborated on 10 projects", icon: "🤝", date: "Oct 2024" },
  { name: "Bug Hunter", description: "Fixed 50+ issues", icon: "🐛", date: "Sep 2024" },
];

export default function ProfilePage() {
  const { user } = useAuth();
  const completed = (projects as Project[]).filter((p) => p.status === "Done");

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
                      <IconUser className="size-8 text-green-400" />
                      <h1 className="text-3xl font-bold text-white tracking-tight">Developer Profile</h1>
                    </div>
                    <p className="text-lg text-purple-200/80">Your development journey and achievements</p>
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
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-yellow-400">{user?.public_repos ?? 0}</div>
                                <div className="text-sm text-purple-200/70">Public Repos</div>
                              </div>
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-blue-400">{user?.followers ?? 0}</div>
                                <div className="text-sm text-purple-200/70">Followers</div>
                              </div>
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-green-400">{user?.following ?? 0}</div>
                                <div className="text-sm text-purple-200/70">Following</div>
                              </div>
                              <div className="rounded-lg border border-purple-500/20 bg-black/20 p-4 text-center">
                                <div className="text-2xl font-bold text-purple-400">{completed.length}</div>
                                <div className="text-sm text-purple-200/70">Completed</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Charts Section */}
                  <div className="px-4 lg:px-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold flex items-center gap-2">
                          <IconTrendingUp className="size-5" />
                          Monthly Contributions
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Your activity over the past 6 months</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <Line data={contributionChartData} options={chartOptions} />
                      </CardContent>
                    </Card>

                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold flex items-center gap-2">
                          <IconCode className="size-5" />
                          Project Types
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Distribution of your project work</CardDescription>
                      </CardHeader>
                      <CardContent className="h-80">
                        <Doughnut data={projectTypeChartData} options={doughnutOptions} />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Achievements Section */}
                  <section className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold text-xl flex items-center gap-2">
                          <IconAward className="size-5" />
                          Achievements
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Your development milestones</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {achievements.map((achievement) => (
                            <div
                              key={achievement.name}
                              className="rounded-lg border border-purple-500/20 bg-black/20 backdrop-blur-lg p-4 hover:border-purple-400/40 transition-colors"
                            >
                              <div className="text-center space-y-2">
                                <div className="text-3xl">{achievement.icon}</div>
                                <h3 className="font-semibold text-white">{achievement.name}</h3>
                                <p className="text-sm text-purple-200/70">{achievement.description}</p>
                                <Badge variant="outline" className="border-purple-400/30 text-purple-200 text-xs">
                                  {achievement.date}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </section>

                  {/* Completed Projects Table */}
                  <section className="px-4 lg:px-6">
                    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-white font-semibold text-xl flex items-center gap-2">
                          <IconStar className="size-5" />
                          Completed Projects
                        </CardTitle>
                        <CardDescription className="text-purple-200/80">Successfully delivered projects</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0">
                        <div className="overflow-hidden">
                          <Table>
                            <TableHeader className="bg-purple-900/20 backdrop-blur-lg">
                              <TableRow>
                                <TableHead className="text-white font-semibold">Repository</TableHead>
                                <TableHead className="text-white font-semibold">Type</TableHead>
                                <TableHead className="text-white font-semibold">Completed</TableHead>
                                <TableHead className="text-white font-semibold">Collaborators</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {completed.map((p) => (
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
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline" className="border-green-400/30 bg-green-400/10 text-green-300">
                                        <IconStar className="size-3 mr-1" />
                                        {p.target}
                                      </Badge>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-white/80 text-sm">{p.reviewer}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
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


