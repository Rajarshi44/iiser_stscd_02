'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Plasma from "@/components/plasma";

const BorderMagicButton = () => {
    return (
        <button className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-9 py-5 text-sm font-medium text-white backdrop-blur-3xl">
                Let's Start
            </span>
        </button>
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
                            x: [0, Math.random() * window.innerWidth],
                            y: [0, Math.random() * window.innerHeight],
                        }}
                        transition={{
                            duration: Math.random() * 10 + 10,
                            repeat: Infinity,
                            repeatType: "reverse",
                            ease: "linear",
                        }}
                        style={{
                            left: Math.random() * window.innerWidth,
                            top: Math.random() * window.innerHeight,
                        }}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="relative z-30 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-4xl mx-auto">
                    {/* Main Heading */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="mb-12"
                    >
                        <motion.h1
                            className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold text-white mb-4 leading-tight tracking-tight font-sans"
                            animate={{
                                backgroundImage: [
                                    "linear-gradient(45deg, #ffffff, #e5e7eb)",
                                    "linear-gradient(45deg, #8b5cf6, #3b82f6)",
                                    "linear-gradient(45deg, #ffffff, #e5e7eb)",
                                ],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                repeatType: "reverse",
                            }}
                            style={{
                                backgroundClip: "text",
                                WebkitBackgroundClip: "text",
                                color: "transparent",
                            }}
                        >
                            What's Stopping You from Making?
                        </motion.h1>
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
