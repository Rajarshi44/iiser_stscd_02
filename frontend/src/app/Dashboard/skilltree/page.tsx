"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Lightbulb
} from 'lucide-react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar, Legend } from 'recharts'

// Types for API responses
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

interface GitHubAnalysisResult {
  success: boolean
  message: string
  analysis: any
  onboarding: any
  next_steps: string[]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658', '#ff7c7c']
const RADIAL_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#d084a6', '#ffb347']

const SkillTreePage = () => {
  const [analysisResult, setAnalysisResult] = useState<SkillAnalysisResult | null>(null)
  const [githubAnalysis, setGithubAnalysis] = useState<GitHubAnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [targetRole, setTargetRole] = useState('software_engineer')
  const [githubUsername, setGithubUsername] = useState('')
  const [cvFile, setCvFile] = useState<File | null>(null)

  // Chart data preparation functions
  const prepareSkillCategoryData = () => {
    if (!analysisResult?.skills_assessment.skill_categories) return []
    
    const categories = analysisResult.skills_assessment.skill_categories
    return Object.entries(categories).map(([category, skills]) => ({
      name: category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      value: skills.length,
      skills: skills.length
    }))
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Skill Development Hub
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive AI-powered skill analysis, personalized roadmaps, and career development insights
          </p>
        </motion.div>

        {/* Analysis Input Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Start Your Analysis
            </CardTitle>
            <CardDescription>
              Upload your CV or analyze your GitHub profile to get personalized insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cv" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="cv" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CV Analysis
                </TabsTrigger>
                <TabsTrigger value="github" className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  GitHub Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="cv" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cv-file">Upload CV (PDF, DOC, TXT)</Label>
                    <Input
                      id="cv-file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-role">Target Role</Label>
                    <select
                      id="target-role"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full p-2 border rounded-md"
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
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
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
                    <Label htmlFor="github-username">GitHub Username</Label>
                    <Input
                      id="github-username"
                      placeholder="your-github-username"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-role-github">Target Role</Label>
                    <select
                      id="target-role-github"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full p-2 border rounded-md"
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
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
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

        {/* Results Section */}
        {(analysisResult || githubAnalysis) && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="skills">Skills Assessment</TabsTrigger>
              <TabsTrigger value="roadmap">Learning Roadmap</TabsTrigger>
              <TabsTrigger value="insights">Career Insights</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
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

            {/* Skills Assessment Tab */}
            <TabsContent value="skills" className="space-y-6">
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
            </TabsContent>

            {/* Learning Roadmap Tab */}
            <TabsContent value="roadmap" className="space-y-6">
              {analysisResult && (
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
            </TabsContent>

            {/* Career Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
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

        {/* No Analysis State */}
        {!analysisResult && !githubAnalysis && !loading && (
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
      </div>
    </div>
  )
}

export default SkillTreePage
