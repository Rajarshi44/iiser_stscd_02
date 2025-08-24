"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconReport,
  IconSearch,
  IconSettings,
  IconUser,
  IconChartDots,
  IconBrain,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/context/Authcontext";

const staticData = {
  navMain: [
    {
      title: "Leaderboard",
      url: "/dashboard/leaderboard",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "/dashboard/projects",
      icon: IconFolder,
    },
    {
      title: "Profile",
      url: "/dashboard/profile",
      icon: IconUser,
    },
    {
      title: "Contributions",
      url: "/contribution-chart",
      icon: IconChartDots,
    },
    {
      title: "Skill Tree",
      url: "/dashboard/skilltree",
      icon: IconBrain,
    },
  ],
  
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, isAuthenticated } = useAuth();

  // Create user data for sidebar - use logged-in user or fallback
  const userData = user ? {
    name: user.name || user.login || "GitHub User",
    email: user.email || `${user.login}@github.com`,
    avatar: user.avatar_url || "/avatars/default.jpg",
  } : {
    name: "Not signed in",
    email: "Please sign in",
    avatar: "/avatars/default.jpg",
  };

  // Show different navigation based on authentication status
  const navItems = isAuthenticated ? staticData.navMain : [
    {
      title: "Sign In",
      url: "/login",
      icon: IconUser,
    }
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Sloop</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
        {isAuthenticated && (
          <>
           
            
          </>
        )}
        {!isAuthenticated && (
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Sign in to access all features
          </div>
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  );
}
