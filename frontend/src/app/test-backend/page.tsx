"use client";

import React, { useEffect, useState } from "react";
import { User, GitBranch, ExternalLink, LogOut } from "lucide-react";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  public_repos: number;
  followers: number;
  following: number;
}

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

const GitHubOAuthDemo: React.FC = () => {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/demo/api/user", {
        credentials: "include",
      });

      if (response.ok) {
        const userData: GitHubUser = await response.json();
        setUser(userData);
        await fetchRepos();
      }
    } catch (_err) {
      // ignore: unauthenticated or network error
    } finally {
      setLoading(false);
    }
  };

  const fetchRepos = async () => {
    try {
      const response = await fetch("http://localhost:5000/demo/api/repos", {
        credentials: "include",
      });

      if (response.ok) {
        const reposData: GitHubRepo[] = await response.json();
        setRepos(reposData.slice(0, 10));
      }
    } catch (_err) {
      setError("Failed to fetch repositories");
    }
  };

  const handleLogin = () => {
    window.location.href = "http://localhost:5000/demo/auth";
  };

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:5000/demo/logout", {
        credentials: "include",
      });
      setUser(null);
      setRepos([]);
    } catch (_err) {
      setError("Failed to logout");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-800 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <GitBranch className="mx-auto h-12 w-12 text-gray-900 mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">GitHub OAuth Demo</h1>
            <p className="text-gray-600 mb-6">
              Connect your GitHub account to view your repositories and profile information
            </p>
            <button
              onClick={handleLogin}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center space-x-2"
            >
              <User className="h-5 w-5" />
              <span>Login with GitHub</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <img
                src={user.avatar_url}
                alt={user.name || user.login}
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Welcome, {user.name || user.login}!
                </h1>
                <p className="text-sm text-gray-500">@{user.login}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Public Repos</h3>
            <p className="text-3xl font-bold text-blue-600">{user.public_repos}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Followers</h3>
            <p className="text-3xl font-bold text-green-600">{user.followers}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Following</h3>
            <p className="text-3xl font-bold text-purple-600">{user.following}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Repositories</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {repos.length > 0 ? (
              repos.map((repo) => (
                <div key={repo.id} className="p-6 hover:bg-gray-50 transition duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                        </h3>
                        <ExternalLink className="h-4 w-4 text-gray-400" />
                      </div>
                      {repo.description && (
                        <p className="text-gray-600 mb-2">{repo.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {repo.language && (
                          <span className="flex items-center space-x-1">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            <span>{repo.language}</span>
                          </span>
                        )}
                        <span>⭐ {repo.stargazers_count}</span>
                        <span>🍴 {repo.forks_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No repositories found</div>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GitHubOAuthDemo;


