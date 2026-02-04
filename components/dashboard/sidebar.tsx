"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Settings,
  Database,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  Mail,
  Search,
  Lightbulb,
  FolderOpen,
  Users,
  Radio,
  BarChart3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSidebar } from "./sidebar-context";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Signals", href: "/dashboard/signals", icon: Radio },
  { name: "Sources", href: "/dashboard/sources", icon: Database },
  { name: "Mentions", href: "/dashboard/mentions", icon: MessageSquare },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const contentNav = [
  { name: "Ideation", href: "/dashboard/content-ideation", icon: Lightbulb },
  { name: "Library", href: "/dashboard/content-library", icon: FolderOpen },
  { name: "Newsletters", href: "/dashboard/newsletters", icon: Mail },
];

const settingsNav = [
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const NavItem = ({ item }: { item: { name: string; href: string; icon: any } }) => {
    const isActive = pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href));

    return (
      <Link
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-white text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground hover:bg-white/50"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", isActive && "text-foreground")} />
        {!isCollapsed && <span>{item.name}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 flex flex-col rounded-2xl transition-all duration-300 relative",
        isCollapsed ? "w-16" : "w-56"
      )}
      style={{ backgroundColor: '#ECEAE6' }}
    >
      {/* Header with Toggle */}
      <div className={cn("flex items-center px-4 pt-5 pb-4", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <span className="text-base font-semibold text-foreground">Airbour</span>}
        <button
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-lg bg-white/60 hover:bg-white flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      {/* Search */}
      {!isCollapsed && (
        <div className="px-3 mb-2">
          <button className="flex w-full items-center gap-2 rounded-xl bg-white/60 px-3 py-2 text-sm text-muted-foreground hover:bg-white transition-colors">
            <Search className="h-4 w-4" />
            <span className="flex-1 text-left">Search</span>
            <kbd className="text-xs text-muted-foreground/60">⌘K</kbd>
          </button>
        </div>
      )}

      {/* Main Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-auto">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* Content Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-1">
            <p className="px-3 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Content</p>
          </div>
        )}
        {isCollapsed && <div className="h-px bg-black/[0.06] my-3" />}
        {contentNav.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        {/* Settings Section */}
        {!isCollapsed && (
          <div className="pt-4 pb-1">
            <p className="px-3 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-wider">Settings</p>
          </div>
        )}
        {isCollapsed && <div className="h-px bg-black/[0.06] my-3" />}
        {settingsNav.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom Section - User */}
      <div className="p-3">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 rounded-xl bg-white/60 p-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
              JD
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">John Doe</p>
              <p className="text-xs text-muted-foreground">Pro Plan</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
              JD
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
