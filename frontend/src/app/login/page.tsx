"use client";

import type React from "react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { AuthCard } from "@/components/auth/auth-card";
import Plasma from "@/components/plasma";

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Account created!",
        description: "Your account has been created successfully.",
      });
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    toast({
      title: `${provider} login`,
      description: `Redirecting to ${provider}...`,
    });
  };

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Plasma Background */}
      <div className="absolute inset-0 z-0">
        <Plasma
          color="#8b5cf6"
          speed={1.7}
          direction="forward"
          scale={1.9}
          opacity={0.8}
          mouseInteractive={true}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 z-10" />

      {/* Main Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md mx-auto relative">
          {/* Subtle Purple Edge Lighting */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/30 via-purple-400/40 to-purple-500/30 rounded-[24px] opacity-60 blur-sm"></div>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 via-purple-400/30 to-purple-500/20 rounded-[22px] opacity-40"></div>

          {/* Auth Card Container */}
          <div className="relative bg-black/70 backdrop-blur-xl border border-white/10 rounded-[20px] shadow-2xl">
            <AuthCard
              isLoading={isLoading}
              email={email}
              setEmail={setEmail}
              onSignUp={handleSignUp}
              onSocialLogin={handleSocialLogin}
            />
          </div>
        </div>
        <Toaster />
      </div>
    </div>
  );
}
