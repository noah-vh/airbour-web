"use client";

import { useQuery, api } from "@/lib/mockConvex";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Radio, Database, Bell, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Radio className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Dashboard</h1>
            <p className="text-sm text-[#a3a3a3]">Innovation monitoring overview</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Radio className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">--</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Active Signals</h3>
            <p className="text-xs text-[#666]">Innovation signals tracked</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                <Database className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">--</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Data Sources</h3>
            <p className="text-xs text-[#666]">Connected data feeds</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
                <Bell className="h-4 w-4 text-orange-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">--</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">New Mentions</h3>
            <p className="text-xs text-[#666]">Requires attention</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                <TrendingUp className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">--</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Trending Topics</h3>
            <p className="text-xs text-[#666]">Growth patterns detected</p>
          </div>
        </div>

        {/* System Status */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#f5f5f5]">System Active</h2>
              <p className="text-sm text-[#a3a3a3]">All services operational</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-[#f5f5f5]">Frontend Application Running</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-[#f5f5f5]">Mock Data System Active</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span className="text-sm text-[#f5f5f5]">All Dashboard Pages Available</span>
            </div>
          </div>

          <div className="border border-white/5 rounded-lg p-4 bg-blue-500/5">
            <p className="text-sm font-medium text-blue-300 mb-2">Available Features</p>
            <ul className="text-sm text-[#a3a3a3] space-y-1.5">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                <span>Navigate through all dashboard sections using the sidebar</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                <span>View team profiles, signals, sources, and analytics with mock data</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 shrink-0"></div>
                <span>All components styled and fully functional for demo purposes</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
