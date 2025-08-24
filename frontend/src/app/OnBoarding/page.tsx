"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Briefcase,
  FileText,
  Upload,
  Sparkles,
  Github,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";

const roleOptions = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "DevOps Engineer",
  "Data Scientist",
  "Product Manager",
  "UI/UX Designer",
  "Other"
];

interface AnalysisResult {
  success: boolean;
  message: string;
  analysis: {
    cv_file: string;
    target_role: string;
    cv_text_length: number;
    extraction_method: string;
  };
  skills_assessment: {
    total_skills: number;
    skill_categories: {
      programming_languages: Array<{name: string; level: number; category: string}>;
      frameworks: Array<{name: string; level: number; category: string}>;
      databases: Array<{name: string; level: number; category: string}>;
      cloud_platforms: Array<{name: string; level: number; category: string}>;
      devops_tools: Array<{name: string; level: number; category: string}>;
      ai_ml_tools: Array<{name: string; level: number; category: string}>;
      data_analysis: Array<{name: string; level: number; category: string}>;
      soft_skills: Array<{name: string; level: number; category: string}>;
      other: Array<{name: string; level: number; category: string}>;
    };
    skill_levels: {
      average_level: number;
      highest_level: number;
      lowest_level: number;
    };
  };
  development_level: {
    level: string;
    description: string;
    score: number;
    confidence: string;
  };
  career_goals: {
    primary_target: string;
    industry: string;
    experience_level: string;
    timeline: string;
  };
  skill_gaps: {
    target_role: string;
    match_percentage: number;
    skill_gaps: string[];
    strengths: string[];
    recommendations: string[];
  };
  learning_roadmap: {
    total_items: number;
    high_priority: number;
    medium_priority: number;
    low_priority: number;
    roadmap_items: Array<{
      skill: string;
      current_level: number;
      target_level: number;
      priority: string;
      estimated_time: string;
      resources: string[];
    }>;
  };
  next_steps: string[];
}

// Inline component for label input container
const LabelInputContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <div className={`flex w-full flex-col space-y-2 ${className || ''}`}>
      {children}
    </div>
  );
};

// Inline component for bottom gradient effect
const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

export default function OnBoardingPage() {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [customRole, setCustomRole] = useState("");
  const [showAiSection, setShowAiSection] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'analysis' | 'complete'>('upload');
  const { toast } = useToast();

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Invalid file type",
          description: "Please upload a PDF or Word document.",
          variant: "destructive"
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload a file smaller than 5MB.",
          variant: "destructive"
        });
        return;
      }

      setCvFile(file);
      setShowAiSection(false);
      setAnalysisResult(null);
      setCurrentStep('upload');
      toast({
        title: "CV uploaded successfully",
        description: `${file.name} has been uploaded.`
      });
    }
  };

  const handleRemoveCV = () => {
    setCvFile(null);
    setShowAiSection(true);
    setAnalysisResult(null);
    setCurrentStep('upload');
  };

  const handleRoleChange = (role: string) => {
    setTargetRole(role);
    if (role !== "Other") {
      setCustomRole("");
    }
  };

  const analyzeCV = async (): Promise<AnalysisResult> => {
    if (!cvFile) {
      throw new Error("No CV file uploaded");
    }

    const formData = new FormData();
    formData.append('cv_file', cvFile); // Fixed field name to match backend
    formData.append('target_role', targetRole === "Other" ? customRole : targetRole);

    const response = await fetch(`${BACKEND_URL}/api/cv/analyze`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      body: formData
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `CV analysis failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('CV Analysis Result:', result); // Debug log

    return result;
  };

  const analyzeGitHubProfile = async (): Promise<AnalysisResult> => {
    const finalRole = targetRole === "Other" ? customRole : targetRole;

    const response = await fetch(`${BACKEND_URL}/api/onboarding/github-analysis`, {
      method: 'POST',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target_role: finalRole,
        user_description: aiPrompt,
        analysis_type: 'profile_generation'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `GitHub analysis failed: ${response.status}`);
    }

    return await response.json();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const finalRole = targetRole === "Other" ? customRole : targetRole;
    if (!finalRole) {
      toast({
        title: "Target role required",
        description: "Please select or specify your target role.",
        variant: "destructive"
      });
      return;
    }

    if (!cvFile && !aiPrompt) {
      toast({
        title: "Profile information required",
        description: "Please upload a CV or provide information for AI profile generation.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setCurrentStep('analysis');

    try {
      let result: AnalysisResult;

      if (cvFile) {
        // Analyze CV
        toast({
          title: "Analyzing CV...",
          description: "Processing your resume for insights and recommendations.",
        });
        result = await analyzeCV();
      } else {
        // Generate profile from AI prompt
        toast({
          title: "Generating profile...",
          description: "Creating your profile based on your description.",
        });
        result = await analyzeGitHubProfile();
      }

      setAnalysisResult(result);
      setCurrentStep('complete');

      toast({
        title: "Analysis complete!",
        description: "Your profile has been analyzed and recommendations are ready.",
      });

    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze profile. Please try again.",
        variant: "destructive"
      });
      setCurrentStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinue = () => {
    // Here you would typically redirect to dashboard or next step
    toast({
      title: "Profile setup complete!",
      description: "Redirecting to dashboard...",
    });
    // You can add navigation logic here
  };

  const renderAnalysisResult = () => {
    if (!analysisResult) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="space-y-6"
      >
        <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-semibold text-white">Analysis Complete!</h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Skills */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">
                Key Skills Identified
                {analysisResult?.skills_assessment?.total_skills && (
                  <span className="ml-2 text-sm text-gray-400">
                    ({analysisResult.skills_assessment.total_skills} total)
                  </span>
                )}
              </h4>
              <div className="space-y-3">
                {(() => {
                  if (!analysisResult?.skills_assessment?.skill_categories) {
                    return <span className="text-gray-400 text-sm">No skills identified</span>;
                  }

                  const categories = analysisResult.skills_assessment.skill_categories;
                  const categoryColors = {
                    programming_languages: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                    frameworks: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                    databases: 'bg-green-500/20 text-green-300 border-green-500/30',
                    cloud_platforms: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
                    devops_tools: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
                    ai_ml_tools: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
                    data_analysis: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
                    soft_skills: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
                    other: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                  };

                  return Object.entries(categories).map(([categoryKey, skills]) => {
                    if (!Array.isArray(skills) || skills.length === 0) return null;
                    
                    const categoryName = categoryKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    const colorClass = categoryColors[categoryKey as keyof typeof categoryColors] || categoryColors.other;
                    
                    return (
                      <div key={categoryKey} className="space-y-1">
                        <h5 className="text-sm font-medium text-gray-400">{categoryName}</h5>
                        <div className="flex flex-wrap gap-2">
                          {skills.slice(0, 8).map((skill, index) => (
                            <span
                              key={index}
                              className={`px-3 py-1 text-sm rounded-full border ${colorClass}`}
                              title={`Level: ${skill.level}/5`}
                            >
                              {skill.name}
                            </span>
                          ))}
                          {skills.length > 8 && (
                            <span className="px-3 py-1 text-sm rounded-full border border-gray-500/30 bg-gray-500/20 text-gray-300">
                              +{skills.length - 8} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }).filter(Boolean);
                })()}
              </div>
            </div>

            {/* Role Fit */}
            <div>
              <h4 className="text-lg font-medium text-white mb-3">Role Fit</h4>
              <div className="bg-slate-800/50 rounded-lg p-3">
                <div className="space-y-2">
                  <p className="text-gray-300">
                    <span className="font-medium text-white">Match: </span>
                    {analysisResult?.skill_gaps?.match_percentage || 0}%
                  </p>
                  <p className="text-gray-300">
                    <span className="font-medium text-white">Level: </span>
                    {analysisResult?.development_level?.level || 'Not assessed'}
                  </p>
                  <p className="text-gray-300 text-sm">
                    {analysisResult?.development_level?.description || 'No description available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Experience Summary */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-white mb-3">Development Level</h4>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Overall Score:</span>
                  <span className="text-lg font-bold text-green-400">
                    {analysisResult?.development_level?.score || 0}/5
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Average Skill Level</span>
                    <span className="text-gray-300">{analysisResult?.skills_assessment?.skill_levels?.average_level || 0}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(analysisResult?.development_level?.score || 0) * 20}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="mt-6">
            <h4 className="text-lg font-medium text-white mb-3">Recommendations</h4>
            <ul className="space-y-2">
              {(analysisResult?.skill_gaps?.recommendations || analysisResult?.next_steps || []).map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                  <span className="text-gray-300">{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6">
            <Button
              onClick={handleContinue}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              Continue to Dashboard →
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderUploadForm = () => {
    return (
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Bento Grid Container */}
        <BentoGrid className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:auto-rows-[20rem] md:grid-cols-2">

          {/* Target Role Card */}
          <BentoGridItem
            className="md:col-span-2 bg-slate-950/80 backdrop-blur-md border-purple-500/30"
            title={
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-semibold text-white">Target Role *</span>
              </div>
            }
            header={
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roleOptions.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleRoleChange(role)}
                      className={`group/btn relative p-3 rounded-lg border text-sm font-medium transition-all ${targetRole === role
                        ? "border-purple-500 bg-purple-500/20 text-purple-100"
                        : "border-gray-600 bg-slate-800/50 text-gray-300 hover:border-purple-400 hover:bg-slate-700/50"
                        }`}
                    >
                      {role}
                      <BottomGradient />
                    </button>
                  ))}
                </div>

                {targetRole === "Other" && (
                  <LabelInputContainer>
                    <Input
                      placeholder="Specify your target role"
                      value={customRole}
                      onChange={(e) => setCustomRole(e.target.value)}
                      className="bg-slate-800/50 border-gray-600 text-white placeholder-gray-400 focus:border-purple-400"
                    />
                  </LabelInputContainer>
                )}
              </motion.div>
            }
          />

          {/* CV Upload Card */}
          <BentoGridItem
            className="md:col-span-1 bg-slate-950/80 backdrop-blur-md border-purple-500/30"
            title={
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-purple-400" />
                <span className="text-xl font-semibold text-white">Upload CV</span>
                <span className="text-sm text-gray-400">(Optional)</span>
              </div>
            }
            header={
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {!cvFile ? (
                  <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                    <Label htmlFor="cvUpload" className="cursor-pointer">
                      <span className="text-white font-medium block">Click to upload</span>
                      <span className="text-gray-400 text-sm">PDF, DOC, DOCX (max 5MB)</span>
                    </Label>
                    <Input
                      id="cvUpload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-800/50 border border-gray-600 rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-purple-400" />
                      <div className="flex-1">
                        <p className="text-white font-medium text-sm">{cvFile.name}</p>
                        <p className="text-gray-400 text-xs">{(cvFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCV}
                      className="group/btn relative w-full text-sm px-3 py-2 rounded-md bg-slate-700 hover:bg-slate-600 text-gray-300 transition-colors"
                    >
                      Remove
                      <BottomGradient />
                    </button>
                  </div>
                )}
              </motion.div>
            }
          />

          {/* AI Profile Generation Card */}
          {(showAiSection || !cvFile) && (
            <BentoGridItem
              className="md:col-span-2 bg-slate-950/80 backdrop-blur-md border-purple-500/30"
              title={
                <div className="flex items-center gap-3">
                  <Github className="w-6 h-6 text-purple-400" />
                  <span className="text-xl font-semibold text-white">GitHub Profile Analysis</span>
                  {!cvFile && <span className="text-purple-400 font-semibold">*</span>}
                </div>
              }
              description="Tell us about your experience, skills, and career goals. Our AI will analyze your GitHub profile and create recommendations."
              header={
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <textarea
                    placeholder="Describe your background, skills, experience, and what you're looking for in your next role..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={6}
                    className="w-full bg-slate-800/50 border border-gray-600 rounded-lg p-4 text-white placeholder-gray-400 resize-none focus:border-purple-400 focus:outline-none transition-colors"
                    required={!cvFile}
                  />
                </motion.div>
              }
            />
          )}
        </BentoGrid>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex justify-center"
        >
          <Button
            type="submit"
            disabled={isLoading}
            className="group/btn relative px-12 py-4 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold text-lg rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Profile...
              </>
            ) : (
              "Analyze Profile →"
            )}
            <BottomGradient />
          </Button>
        </motion.div>
      </form>
    );
  };

  const renderLoadingState = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center py-12"
      >
        <div className="flex items-center justify-center mb-6">
          <Loader2 className="w-16 h-16 text-purple-400 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Analyzing Your Profile</h2>
        <p className="text-gray-300 text-lg">
          {cvFile
            ? "Processing your CV and extracting insights..."
            : "Analyzing your GitHub profile and generating recommendations..."
          }
        </p>
        <div className="mt-6">
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div className="bg-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
      {/* Main Content */}
      <div className="min-h-screen p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-7xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Welcome to Your Journey</h1>
            <p className="text-gray-300 text-lg">
              {currentStep === 'upload' && "Let's set up your profile to get started"}
              {currentStep === 'analysis' && "Analyzing your profile..."}
              {currentStep === 'complete' && "Your profile analysis is complete!"}
            </p>
          </div>

          {/* Content based on current step */}
          {currentStep === 'upload' && renderUploadForm()}
          {currentStep === 'analysis' && renderLoadingState()}
          {currentStep === 'complete' && renderAnalysisResult()}
        </motion.div>
      </div>

      <Toaster />
    </div>
  );
}
