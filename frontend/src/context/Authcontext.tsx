"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

interface User {
  login: string;
  name?: string;
  avatar_url?: string;
  email?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  id?: number;
  database_id?: number;
  is_stored_user?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null; // bearer for future APIs; cookie-based for demo
}

interface AuthContextType extends AuthState {
  loginWithGitHub: () => void;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<Response>;
  getUserProfile: () => Promise<any>;
  getUserRepos: () => Promise<any>;
  getUserContributions: (username: string, period?: string) => Promise<any>;
  getUserStats: (username: string) => Promise<any>;
  getUserActivity: (username: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  const { toast } = useToast();

  useEffect(() => {
    // On mount, try to hydrate session from localStorage first, then cookies
    initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initializeSession = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      // First check localStorage for persisted session
      const persistedUser = localStorage.getItem('auth_user');
      const persistedToken = localStorage.getItem('auth_token');
      
      if (persistedUser && persistedToken) {
        const user = JSON.parse(persistedUser);
        setState({ 
          user, 
          isAuthenticated: true, 
          isLoading: false, 
          token: persistedToken 
        });
        
        // Verify the session is still valid
        await verifySession(persistedToken);
        return;
      }
      
      // Fallback to cookie-based session
      await refreshSession();
    } catch (error) {
      console.error('Session initialization error:', error);
      clearSession();
    }
  };

  const verifySession = async (token: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/demo/api/user`, {
        credentials: 'include',
        headers: token.startsWith('Bearer ') ? {
          'Authorization': token
        } : {}
      });
      
      if (!res.ok) {
        clearSession();
      }
    } catch (error) {
      console.error('Session verification failed:', error);
      clearSession();
    }
  };

  const clearSession = () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_token');
    setState({ user: null, isAuthenticated: false, isLoading: false, token: null });
  };

  const persistSession = (user: User, token: string) => {
    localStorage.setItem('auth_user', JSON.stringify(user));
    localStorage.setItem('auth_token', token);
    setState({ user, isAuthenticated: true, isLoading: false, token });
  };

  const refreshSession = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/demo/api/user`, {
        credentials: 'include',
      });
      if (res.ok) {
        const user: User = await res.json();
        // Persist the session for future visits
        persistSession(user, 'cookie');
      } else {
        clearSession();
      }
    } catch (error) {
      console.error('Refresh session error:', error);
      clearSession();
    }
  };

  const loginWithGitHub = () => {
    // Use backend demo OAuth which will set httpOnly cookie and redirect back
    window.location.href = `${BACKEND_URL}/demo/auth`;
  };

  const logout = async () => {
    try {
      await fetch(`${BACKEND_URL}/demo/logout`, { credentials: 'include' });
    } catch {
      // ignore network errors on logout
    }
    clearSession();
    toast({ title: 'Signed Out', description: 'You have been successfully signed out' });
  };

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add authorization header if we have a bearer token
    if (state.token && state.token !== 'cookie') {
      headers['Authorization'] = state.token.startsWith('Bearer ') ? state.token : `Bearer ${state.token}`;
    }

    return fetch(`${BACKEND_URL}${endpoint}`, {
      credentials: 'include', // Always include cookies for demo endpoints
      ...options,
      headers,
    });
  };

  const getUserProfile = async () => {
    try {
      const response = await apiCall('/demo/api/profile');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch profile');
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  };

  const getUserRepos = async () => {
    try {
      const response = await apiCall('/demo/api/repos?per_page=10&sort=updated');
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch repositories');
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw error;
    }
  };

  const getUserContributions = async (username: string, period: string = 'year') => {
    try {
      const response = await apiCall(`/demo/api/contributions/${username}?period=${period}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch contributions');
    } catch (error) {
      console.error('Error fetching user contributions:', error);
      throw error;
    }
  };

  const getUserStats = async (username: string) => {
    try {
      const response = await apiCall(`/demo/api/stats/${username}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch user stats');
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  };

  const getUserActivity = async (username: string) => {
    try {
      const response = await apiCall(`/demo/api/activity/${username}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to fetch user activity');
    } catch (error) {
      console.error('Error fetching user activity:', error);
      throw error;
    }
  };

  const contextValue: AuthContextType = {
    ...state,
    loginWithGitHub,
    logout,
    refreshSession,
    apiCall,
    getUserProfile,
    getUserRepos,
    getUserContributions,
    getUserStats,
    getUserActivity,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    if (isLoading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      );
    }
    if (!isAuthenticated) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return null;
    }
    return <Component {...props} />;
  };
}

export default AuthContext;