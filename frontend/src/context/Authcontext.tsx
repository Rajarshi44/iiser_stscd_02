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
    // On mount, try to hydrate session from cookie via demo endpoint
    refreshSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshSession = async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/demo/api/user`, {
        credentials: 'include',
      });
      if (res.ok) {
        const user: User = await res.json();
        setState({ user, isAuthenticated: true, isLoading: false, token: 'cookie' });
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false, token: null });
      }
    } catch {
      setState({ user: null, isAuthenticated: false, isLoading: false, token: null });
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
    setState({ user: null, isAuthenticated: false, isLoading: false, token: null });
    toast({ title: 'Signed Out', description: 'You have been successfully signed out' });
  };

  const contextValue: AuthContextType = {
    ...state,
    loginWithGitHub,
    logout,
    refreshSession,
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