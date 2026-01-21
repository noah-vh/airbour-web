"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  Map,
  Settings,
  Database,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Mail,
  Search,
  Bell,
  User,
  Command,
  Lightbulb,
  FolderOpen,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Sources",
    href: "/dashboard/sources",
    icon: Database,
  },
  {
    name: "Signals",
    href: "/dashboard/signals",
    icon: Radio,
  },
  {
    name: "Maps",
    href: "/dashboard/analytics",
    icon: Map,
  },
  {
    name: "Chat",
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    name: "Newsletters",
    href: "/dashboard/newsletters",
    icon: Mail,
  },
  {
    name: "Content Ideation",
    href: "/dashboard/content-ideation",
    icon: Lightbulb,
  },
  {
    name: "Content Library",
    href: "/dashboard/content-library",
    icon: FolderOpen,
  },
  {
    name: "Team",
    href: "/dashboard/team",
    icon: Users,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    name: "Admin",
    href: "/dashboard/admin",
    icon: User,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-white/5 glass bg-[#0a0a0a]/80 transition-standard",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between border-b border-white/5 px-6">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 transition-standard hover:bg-purple-500/30">
              <Radio className="h-5 w-5 text-purple-400" />
            </div>
            <span className="text-lg font-semibold text-[#f5f5f5] tracking-tight">SysInno</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-[#a3a3a3] transition-standard hover:bg-white/5 hover:text-[#f5f5f5]",
            isCollapsed ? "mx-auto" : "ml-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="border-b border-white/5 px-3 py-4">
          <button
            className={cn(
              "group flex w-full h-10 items-center gap-3 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm px-4 text-sm text-[#a3a3a3]",
              "transition-standard",
              "hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-[#f5f5f5]",
              "focus:border-blue-500/50 focus:text-[#f5f5f5]"
            )}
          >
            <Search className="h-4 w-4 transition-colors group-hover:text-blue-400 shrink-0" />
            <span className="flex-1 text-left">Search</span>
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/10 bg-[#171717] px-1.5 font-mono text-xs text-[#a3a3a3]">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-standard",
                isActive
                  ? "bg-blue-500/10 text-blue-300 border border-blue-500/20 shadow-sm"
                  : "text-[#a3a3a3] hover:bg-white/5 hover:text-[#f5f5f5]"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-colors",
                  isActive
                    ? "text-blue-400"
                    : "group-hover:text-[#f5f5f5]"
                )}
              />
              {!isCollapsed && (
                <span className="truncate">{item.name}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Status/User Section */}
      <div className="border-t border-white/5 p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 rounded-lg bg-white/5 p-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#f5f5f5] truncate">System Active</p>
              <p className="text-xs text-[#a3a3a3]">Monitoring 12 sources</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Badge */}
      {!isCollapsed && (
        <div className="px-3 pb-3">
          <div className="flex items-center justify-between rounded-lg bg-orange-500/10 border border-orange-500/20 p-3">
            <div className="flex items-center gap-3">
              <Bell className="h-4 w-4 text-orange-400" />
              <div>
                <p className="text-sm font-medium text-orange-300">3 New Signals</p>
                <p className="text-xs text-orange-400/70">Requires attention</p>
              </div>
            </div>
            <button className="text-orange-400 hover:text-orange-300 transition-colors">
              <Command className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}