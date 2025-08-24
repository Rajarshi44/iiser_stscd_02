"use client";

import React, { useState } from 'react';
import { createDemoRoadmap, createDemoRoadmapSimple, createProject, fetchDemoProjects } from '@/lib/api';

export default function DemoTestPage() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');

    const testRoadmapGeneration = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Simple roadmap generation - just target role required!
            const response = await createDemoRoadmapSimple('full_stack_developer');

            setResult({
                type: 'roadmap',
                data: response
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate roadmap');
        } finally {
            setLoading(false);
        }
    };

    const testAdvancedRoadmapGeneration = async () => {
        setLoading(true);
        setError('');
        setResult(null);

        try {
            // Advanced roadmap generation with custom data
            const roadmapData = {
                target_role: 'ai_engineer',
                user_skills: [
                    { name: 'Python', level: 8 },
                    { name: 'Machine Learning', level: 6 },
                    { name: 'TensorFlow', level: 4 },
                    { name: 'Data Analysis', level: 7 }
                ],
                current_level: 3,
                preferences: {
                    learning_style: 'project_based',
                    difficulty: 'advanced',
                    focus_areas: ['deep_learning', 'nlp']
                }
            };

            const response = await createDemoRoadmap(roadmapData);
            setResult({
                type: 'roadmap',
                data: response
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate roadmap');
        } finally {
            setLoading(false);
        }
    };

    const testProjectCreation = async () => {
        if (!result || result.type !== 'roadmap' || !result.data.roadmap_id) {
            setError('Please generate a roadmap first');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const projectData = {
                roadmap_id: result.data.roadmap_id,
                project_name: `demo-test-project-${Date.now()}`,
                milestone_focus: 1,
                make_public: false
            };

            const response = await createProject(projectData);
            setResult({
                type: 'project',
                data: response,
                roadmap_id: result.data.roadmap_id
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create project');
        } finally {
            setLoading(false);
        }
    };

    const testListProjects = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetchDemoProjects();
            setResult({
                type: 'projects_list',
                data: response
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to list projects');
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setResult(null);
        setError('');
    };

    return (
        <div className="container mx-auto p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Demo API Routes Test</h1>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-yellow-800">🎯 New Intelligent System</h2>
                <p className="text-yellow-700 mt-1">
                    Now you only need to provide a <strong>target_role</strong>! The system will intelligently gather your skills from GitHub, determine your level, and create personalized roadmaps automatically.
                </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="font-semibold text-blue-800">⚠️ Prerequisites</h2>
                <p className="text-blue-700 mt-1">
                    Make sure you&apos;re authenticated via GitHub OAuth before testing these routes.
                </p>
            </div>

            <div className="space-y-4 mb-8">
                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold text-gray-700">Roadmap Generation Tests</h3>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={testRoadmapGeneration}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : '1a. Simple Roadmap (Just Target Role)'}
                        </button>

                        <button
                            onClick={testAdvancedRoadmapGeneration}
                            disabled={loading}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                            {loading ? 'Generating...' : '1b. Advanced Roadmap (Custom Data)'}
                        </button>
                    </div>
                </div>

                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold text-gray-700">Project Creation Test</h3>
                    <button
                        onClick={testProjectCreation}
                        disabled={loading || !result || result.type !== 'roadmap'}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 w-fit"
                    >
                        {loading ? 'Creating...' : '2. Test Project Creation'}
                    </button>
                </div>

                <div className="flex flex-col space-y-2">
                    <h3 className="font-semibold text-gray-700">Project Management Test</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={testListProjects}
                            disabled={loading}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : '3. Test List Projects'}
                        </button>

                        <button
                            onClick={clearResults}
                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                        >
                            Clear Results
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold text-red-800">Error:</h3>
                    <p className="text-red-700 mt-1 font-mono text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-800 mb-3">
                        Result ({result.type}):
                    </h3>

                    {result.type === 'roadmap' && (
                        <div className="space-y-3">
                            <p className="text-green-600 font-semibold">✅ Roadmap generated successfully!</p>
                            <p><strong>Roadmap ID:</strong> {result.data.roadmap_id}</p>
                            <p><strong>Milestones:</strong> {result.data.roadmap?.milestones?.length || 0}</p>
                            <p><strong>Tech Stack:</strong> {result.data.roadmap?.tech_stack?.join(', ') || 'None'}</p>

                            {result.data.intelligence_summary && (
                                <div className="bg-green-50 p-3 rounded-lg border">
                                    <p className="font-semibold text-green-800">🤖 Intelligence Summary:</p>
                                    <ul className="text-sm text-green-700 mt-2">
                                        <li>• <strong>Skills Analyzed:</strong> {result.data.intelligence_summary.skills_analyzed}</li>
                                        <li>• <strong>Level Determined:</strong> {result.data.intelligence_summary.level_determined}</li>
                                        <li>• <strong>Personalization Applied:</strong> {result.data.intelligence_summary.personalization_applied ? 'Yes' : 'No'}</li>
                                        <li>• <strong>Data Sources:</strong> {result.data.intelligence_summary.data_sources_used?.join(', ')}</li>
                                    </ul>
                                </div>
                            )}

                            {result.data.gathered_data && (
                                <div className="bg-blue-50 p-3 rounded-lg border">
                                    <p className="font-semibold text-blue-800">📊 Intelligently Gathered Data:</p>
                                    <div className="text-sm text-blue-700 mt-2">
                                        <p><strong>Skills Found:</strong> {result.data.gathered_data.skills?.map((s: any) => `${s.name} (${s.level}/10)`).join(', ')}</p>
                                        <p><strong>Current Level:</strong> {result.data.gathered_data.current_level}</p>
                                        <p><strong>Learning Style:</strong> {result.data.gathered_data.preferences?.learning_style}</p>
                                    </div>
                                </div>
                            )}

                            <div className="mt-3">
                                <p className="font-semibold">Next Steps:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {result.data.next_steps?.map((step: string, index: number) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {result.type === 'project' && (
                        <div className="space-y-3">
                            <p className="text-green-600 font-semibold">✅ Project created successfully!</p>
                            <p><strong>Repository URL:</strong>
                                <a href={result.data.project?.repository?.html_url}
                                    target="_blank"
                                    className="text-blue-600 hover:underline ml-2">
                                    {result.data.project?.repository?.html_url}
                                </a>
                            </p>
                            <p><strong>Folders Created:</strong> {result.data.project?.folders?.length || 0}</p>
                            <p><strong>Issues Created:</strong> {result.data.project?.issues?.length || 0}</p>
                            <div className="mt-3">
                                <p className="font-semibold">Next Steps:</p>
                                <ul className="list-disc list-inside text-sm text-gray-600">
                                    {result.data.next_steps?.map((step: string, index: number) => (
                                        <li key={index}>{step}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {result.type === 'projects_list' && (
                        <div className="space-y-3">
                            <p className="text-green-600 font-semibold">✅ Projects loaded successfully!</p>
                            <p><strong>Total Projects:</strong> {result.data.total || 0}</p>
                            {result.data.projects && result.data.projects.length > 0 && (
                                <div className="mt-3">
                                    <p className="font-semibold">Projects:</p>
                                    <div className="space-y-2">
                                        {result.data.projects.map((project: any, index: number) => (
                                            <div key={index} className="bg-white p-3 rounded border">
                                                <p><strong>Name:</strong> {project.repository_name}</p>
                                                <p><strong>Status:</strong> {project.status}</p>
                                                <p><strong>Progress:</strong> {project.progress_percentage}%</p>
                                                <a href={project.repository_url}
                                                    target="_blank"
                                                    className="text-blue-600 hover:underline text-sm">
                                                    View Repository
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <details className="mt-6">
                        <summary className="cursor-pointer text-gray-600 text-sm">
                            Show Raw Response
                        </summary>
                        <pre className="mt-2 bg-gray-100 p-3 rounded text-xs overflow-auto max-h-96">
                            {JSON.stringify(result.data, null, 2)}
                        </pre>
                    </details>
                </div>
            )}

            <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800">🎯 Intelligent Testing Instructions:</h3>
                <ol className="list-decimal list-inside text-green-700 mt-2 space-y-1">
                    <li><strong>Simple Test:</strong> Click &quot;Simple Roadmap&quot; - only requires target role, everything else is intelligent!</li>
                    <li><strong>Advanced Test:</strong> Click &quot;Advanced Roadmap&quot; - shows custom data override capability</li>
                    <li>Then click &quot;Test Project Creation&quot; to create a GitHub repository from the roadmap</li>
                    <li>Finally, click &quot;Test List Projects&quot; to see all your created projects</li>
                    <li>Check your GitHub account for the newly created repository with project structure!</li>
                </ol>

                <div className="mt-4 bg-white p-3 rounded border">
                    <h4 className="font-semibold text-green-800">🤖 What the Intelligence System Does:</h4>
                    <ul className="list-disc list-inside text-green-700 mt-2 space-y-1 text-sm">
                        <li><strong>Skill Detection:</strong> Analyzes your GitHub repositories to find programming languages and technologies</li>
                        <li><strong>Level Assessment:</strong> Determines your expertise level based on repository count and activity</li>
                        <li><strong>Preference Generation:</strong> Creates learning preferences based on your GitHub activity patterns</li>
                        <li><strong>Personalization:</strong> Customizes roadmap milestones and tasks based on gathered intelligence</li>
                        <li><strong>Smart Caching:</strong> Stores analysis results for faster future roadmap generation</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
