"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/Authcontext';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Completing authentication...');
  const { refreshSession } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if we have URL parameters indicating success/error
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authentication failed: ${error}`);
          // Redirect to login after showing error
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          return;
        }

        // If we have a token, store it and proceed
        if (token) {
          localStorage.setItem('auth_token', token);
        }

        // Refresh session to get user data
        await refreshSession();
        
        setStatus('success');
        setMessage('Authentication successful! Redirecting...');
        
        // The backend should have already redirected to the appropriate page
        // But just in case, we'll check user onboarding status
        setTimeout(async () => {
          try {
            const response = await fetch('http://localhost:5000/demo/api/user', {
              credentials: 'include'
            });
            
            if (response.ok) {
              const userData = await response.json();
              
              // Check if user has completed onboarding
              if (userData.profile?.is_onboarded) {
                router.push('/dashboard');
              } else {
                router.push('/onboarding');
              }
            } else {
              router.push('/onboarding');
            }
          } catch (err) {
            console.error('Error checking user status:', err);
            router.push('/onboarding');
          }
        }, 2000);

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('Something went wrong during authentication.');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    };

    handleCallback();
  }, [refreshSession, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900 flex items-center justify-center">
      <div className="bg-black/70 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mb-6">
            {status === 'loading' && (
              <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto" />
            )}
            {status === 'success' && (
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
            )}
            {status === 'error' && (
              <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {status === 'loading' && 'Authenticating...'}
            {status === 'success' && 'Welcome!'}
            {status === 'error' && 'Authentication Failed'}
          </h1>
          
          <p className="text-gray-300 mb-4">
            {message}
          </p>
          
          {status === 'loading' && (
            <div className="space-y-2">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
              <p className="text-sm text-gray-400">Setting up your profile...</p>
            </div>
          )}
          
          {status === 'success' && (
            <p className="text-sm text-gray-400">
              Taking you to your {' '}
              <span className="text-purple-400 font-medium">learning journey</span>
            </p>
          )}
          
          {status === 'error' && (
            <p className="text-sm text-gray-400">
              Redirecting back to login page...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
