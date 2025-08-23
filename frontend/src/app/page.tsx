'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import Link from "next/link";
import Plasma from "@/components/plasma";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Highlight } from "@/components/ui/hero-highlight";

const BorderMagicButton = () => {
    return (
        <Link href="/login" className="relative inline-flex h-20 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-4 focus:ring-slate-400 focus:ring-offset-4 focus:ring-offset-slate-50 transition-all duration-300 hover:scale-110">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-12 py-6 text-xl font-semibold text-white backdrop-blur-3xl gap-4 hover:bg-slate-900 transition-colors duration-300">
                <FaGithub className="w-8 h-8" />
                Connect with GitHub
            </span>
        </Link>
    );
};

export default function Home() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

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

            {/* Floating Particles */}
            <div className="absolute inset-0 z-20">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-purple-400/30 rounded-full"
                        animate={{
                            x: [0, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
                            y: [0, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        style={{
                            left: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920),
                            top: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080),
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Main Heading with Text Generate Effect */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <div className="text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight font-roboto text-center">
                            What's <Highlight className="text-white bg-gradient-to-r from-purple-400 to-purple-600 dark:from-purple-400 dark:to-purple-600">Stopping You from Making</Highlight> Today ?
                        </div>
                    </motion.div>

                    {/* Border Magic Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="flex justify-center"
                    >
                        <BorderMagicButton />
                    </motion.div>
                </div>

                {/* Mouse follower effect */}
                <motion.div
                    className="fixed pointer-events-none z-50 w-4 h-4 bg-purple-400/30 rounded-full blur-sm"
                    animate={{
                        x: mousePosition.x - 8,
                        y: mousePosition.y - 8,
                    }}
                    transition={{ type: "spring", damping: 30, stiffness: 400 }}
                />
            </div>
        </div>
    );
}
