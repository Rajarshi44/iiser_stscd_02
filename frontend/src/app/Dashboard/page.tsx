'use client';

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppSidebar } from "@/components/app-sidebar";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Plasma from "@/components/plasma";

import data from "./data.json";

export default function Page() {
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
          speed={1.2}
          direction="forward"
          scale={2.2}
          opacity={0.6}
          mouseInteractive={true}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-blue-900/20 z-10" />

      {/* Floating Particles */}
      <div className="absolute inset-0 z-20">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full"
            animate={{
              x: [0, Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1920)],
              y: [0, Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1080)],
            }}
            transition={{
              duration: Math.random() * 15 + 15,
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

      {/* Mouse follower effect */}
      <motion.div
        className="fixed pointer-events-none z-50 w-3 h-3 bg-purple-400/20 rounded-full blur-sm"
        animate={{
          x: mousePosition.x - 6,
          y: mousePosition.y - 6,
        }}
        transition={{ type: "spring", damping: 30, stiffness: 400 }}
      />

      {/* Dashboard Content */}
      <div className="relative z-30">
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" className="backdrop-blur-lg bg-black/30 border-purple-500/20" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                  >
                    <SectionCards />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="px-4 lg:px-6"
                  >
                    <ChartAreaInteractive />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <DataTable data={data} />
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </div>
  );
}
