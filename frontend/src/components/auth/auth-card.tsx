"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Mail } from "lucide-react";

interface AuthCardProps {
  isLoading: boolean;
  email: string;
  setEmail: (email: string) => void;
  onSignUp: (e: React.FormEvent) => void;
  onSocialLogin: (provider: string) => void;
}

export function AuthCard({
  isLoading,
  email,
  setEmail,
  onSignUp,
  onSocialLogin,
}: AuthCardProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  return (
    <div className="w-full">
      <div className="bg-transparent p-6 transform transition-all duration-300">
        {/* Header with close button */}
        <div className="flex items-center justify-end mb-6">
          <button
            className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all duration-200 hover:scale-110 hover:rotate-90"
            aria-label="Close"
            title="Close"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        <h1 className="text-3xl font-normal text-white mb-6 transition-all duration-300">
          Create an account
        </h1>

        {/* Sign Up Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSignUp(e);
          }}
          className="space-y-4"
        >
          {/* Name fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              {/* White Edge Lighting for First Name */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-xl opacity-0 focus-within:opacity-60 hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-xl opacity-0 focus-within:opacity-40 hover:opacity-20 transition-opacity duration-300"></div>

              <Input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl h-12 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-0 focus:outline-none text-base transition-all duration-200 hover:bg-white/10 focus:bg-white/10"
                placeholder="First name"
              />
            </div>
            <div className="relative">
              {/* White Edge Lighting for Last Name */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-xl opacity-0 focus-within:opacity-60 hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
              <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-xl opacity-0 focus-within:opacity-40 hover:opacity-20 transition-opacity duration-300"></div>

              <Input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl h-12 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-0 focus:outline-none text-base transition-all duration-200 hover:bg-white/10 focus:bg-white/10"
                placeholder="Last name"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="relative">
            {/* White Edge Lighting for Email */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 via-white/30 to-white/20 rounded-xl opacity-0 focus-within:opacity-60 hover:opacity-40 transition-opacity duration-300 blur-sm"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-xl opacity-0 focus-within:opacity-40 hover:opacity-20 transition-opacity duration-300"></div>

            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/70 transition-colors duration-200 z-10" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="relative bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl h-12 text-white placeholder:text-white/70 focus:border-white/40 focus:ring-0 focus:outline-none pl-12 text-base transition-all duration-200 hover:bg-white/10 focus:bg-white/10"
              placeholder="Enter your email"
            />
          </div>

          {/* GitHub button */}
          <div className="relative mb-4 group">
            {/* Purple Edge Lighting for GitHub Button */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/40 via-purple-400/50 to-purple-500/40 rounded-xl opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-sm"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 via-purple-400/40 to-purple-500/30 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>

            <button
              onClick={() => onSocialLogin("github")}
              className="relative w-full bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl h-12 flex items-center justify-center hover:bg-white/10 hover:border-white/30 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              aria-label="Sign up with GitHub"
              title="Sign up with GitHub"
            >
              <div className="w-6 h-6 text-white mr-3">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>
              <span className="text-white font-medium">Continue with GitHub</span>
            </button>
          </div>

          {/* Create account button */}
          <div className="relative mt-6 group">
            {/* Purple Edge Lighting for Create Account Button */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/40 via-purple-400/50 to-purple-500/40 rounded-xl opacity-0 group-hover:opacity-80 transition-opacity duration-300 blur-sm"></div>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 via-purple-400/40 to-purple-500/30 rounded-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>

            <Button
              type="submit"
              className="relative w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 hover:border-white/30 text-white font-medium rounded-xl h-12 text-base transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create an account"}
            </Button>
          </div>
        </form>

        <p className="text-center text-white/50 text-sm mt-6">
          By creating an account, you agree to our Terms & Service
        </p>


      </div>
    </div>

  );
}
