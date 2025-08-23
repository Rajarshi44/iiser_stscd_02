"use client";

import { IconDashboardFilled, type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton asChild tooltip="Dashboard" className="min-w-8 duration-200 ease-linear">
              <a
                href="/dashboard"
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
                  "hover:bg-primary/90 hover:text-primary-foreground",
                  pathname === "/dashboard" && "bg-primary text-primary-foreground"
                )}
              >
                <IconDashboardFilled />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a
                  href={item.url}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5",
                    "hover:bg-primary/90 hover:text-primary-foreground",
                    pathname.startsWith(item.url) && "bg-primary text-primary-foreground"
                  )}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
