"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { SidebarProvider, useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import {
  Radio,
  Database,
  Bell,
  TrendingUp,
  Activity,
  Users,
  Calendar,
  BarChart3,
  Zap,
  Target,
  Clock,
  ArrowUp,
  ArrowDown,
  Mail,
  FileText,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

function DashboardContent() {
  const { isCollapsed } = useSidebar();
  const [stats, setStats] = useState({
    activeSignals: 247,
    dataSources: 12,
    newMentions: 1850,
    trendingTopics: 23
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Mock real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        activeSignals: prev.activeSignals + Math.floor(Math.random() * 3),
        dataSources: prev.dataSources,
        newMentions: prev.newMentions + Math.floor(Math.random() * 5),
        trendingTopics: prev.trendingTopics + (Math.random() > 0.8 ? 1 : 0)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300",
          isCollapsed ? "pl-16" : "pl-64"
        )}
      >
        {/* Page Content */}
        <main className="relative flex-1 overflow-y-auto bg-[#0a0a0a] p-6">
          <div className="relative mx-auto max-w-7xl">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Header */}
              <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Radio className="h-6 w-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Dashboard</h1>
                  <p className="text-sm text-[#a3a3a3]">Innovation monitoring overview</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/dashboard/newsletters">
                    <button className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-blue-500/20 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span className="text-sm text-blue-300">Newsletters</span>
                    </button>
                  </Link>
                  <Link href="/dashboard/content-ideation">
                    <button className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-purple-500/20 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-sm text-purple-300">Create Content</span>
                    </button>
                  </Link>
                </div>
              </motion.div>

              {/* Stats Grid */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link href="/dashboard/signals">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                        <Zap className="h-4 w-4 text-blue-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.span
                          key={stats.activeSignals}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-bold text-[#f5f5f5]"
                        >
                          {stats.activeSignals}
                        </motion.span>
                        <ArrowUp className="h-3 w-3 text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Active Signals</h3>
                    <p className="text-xs text-[#666]">Innovation signals tracked</p>
                  </motion.div>
                </Link>

                <Link href="/dashboard/sources">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                        <Database className="h-4 w-4 text-green-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-2xl font-bold text-[#f5f5f5]">{stats.dataSources}</span>
                        <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Data Sources</h3>
                    <p className="text-xs text-[#666]">Connected data feeds</p>
                  </motion.div>
                </Link>

                <Link href="/dashboard/mentions">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
                        <Bell className="h-4 w-4 text-orange-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.span
                          key={stats.newMentions}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-bold text-[#f5f5f5]"
                        >
                          {stats.newMentions.toLocaleString()}
                        </motion.span>
                        <ArrowUp className="h-3 w-3 text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">New Mentions</h3>
                    <p className="text-xs text-[#666]">Requires attention</p>
                  </motion.div>
                </Link>

                <Link href="/dashboard/analytics">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                        <TrendingUp className="h-4 w-4 text-purple-400" />
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.span
                          key={stats.trendingTopics}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-2xl font-bold text-[#f5f5f5]"
                        >
                          {stats.trendingTopics}
                        </motion.span>
                        <ArrowUp className="h-3 w-3 text-green-400" />
                      </div>
                    </div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Trending Topics</h3>
                    <p className="text-xs text-[#666]">Growth patterns detected</p>
                  </motion.div>
                </Link>
              </motion.div>

              {/* System Status */}
              <motion.div variants={itemVariants} className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
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
              </motion.div>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div variants={itemVariants} className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <Activity className="h-4 w-4 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#f5f5f5]">Recent Activity</h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      { action: "New signal detected", item: "AI-powered automation in healthcare", time: "2 minutes ago", type: "signal" },
                      { action: "Mention analyzed", item: "Digital transformation leadership", time: "5 minutes ago", type: "mention" },
                      { action: "Newsletter sent", item: "Weekly Innovation Digest", time: "1 hour ago", type: "newsletter" },
                      { action: "Content created", item: "Future of Work Analysis", time: "3 hours ago", type: "content" },
                      { action: "Team member added", item: "Sarah Chen joined Analytics team", time: "1 day ago", type: "team" }
                    ].map((activity, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-standard">
                        <div className={cn(
                          "w-2 h-2 rounded-full",
                          activity.type === "signal" ? "bg-blue-400" :
                          activity.type === "mention" ? "bg-green-400" :
                          activity.type === "newsletter" ? "bg-purple-400" :
                          activity.type === "content" ? "bg-yellow-400" : "bg-pink-400"
                        )}></div>
                        <div className="flex-1">
                          <p className="text-sm text-[#f5f5f5] font-medium">{activity.action}</p>
                          <p className="text-xs text-[#a3a3a3]">{activity.item}</p>
                        </div>
                        <div className="text-xs text-[#666]">{activity.time}</div>
                      </div>
                    ))}
                  </div>

                  <Link href="/dashboard/analytics">
                    <button className="w-full mt-4 glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-3 transition-standard hover:bg-blue-500/20 text-sm text-blue-300">
                      View Full Activity Log
                    </button>
                  </Link>
                </motion.div>

                {/* Quick Insights */}
                <motion.div variants={itemVariants} className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                      <Target className="h-4 w-4 text-yellow-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-[#f5f5f5]">Quick Insights</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-300">Trending Signal</span>
                      </div>
                      <p className="text-sm text-[#f5f5f5] mb-2">AI Ethics in Enterprise</p>
                      <p className="text-xs text-[#a3a3a3]">+127% mention growth this week</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-green-300">High Impact Opportunity</span>
                      </div>
                      <p className="text-sm text-[#f5f5f5] mb-2">Quantum Computing Applications</p>
                      <p className="text-xs text-[#a3a3a3]">Low competition, high interest</p>
                    </div>

                    <div className="p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-orange-400" />
                        <span className="text-sm font-medium text-orange-300">Time Sensitive</span>
                      </div>
                      <p className="text-sm text-[#f5f5f5] mb-2">Regulatory Changes in AI</p>
                      <p className="text-xs text-[#a3a3a3]">Action required within 48 hours</p>
                    </div>
                  </div>

                  <Link href="/dashboard/analytics">
                    <button className="w-full mt-4 glass bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-4 py-3 transition-standard hover:bg-yellow-500/20 text-sm text-yellow-300">
                      View Detailed Analytics
                    </button>
                  </Link>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div variants={itemVariants} className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#f5f5f5]">Quick Actions</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link href="/dashboard/content-ideation">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg p-6 transition-standard hover:bg-purple-500/20 flex flex-col items-center text-center"
                    >
                      <Sparkles className="h-8 w-8 text-purple-400 mb-3" />
                      <span className="text-sm font-medium text-purple-300 mb-1">Generate Ideas</span>
                      <span className="text-xs text-[#a3a3a3]">AI-powered content</span>
                    </motion.button>
                  </Link>

                  <Link href="/dashboard/newsletters">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg p-6 transition-standard hover:bg-blue-500/20 flex flex-col items-center text-center"
                    >
                      <Mail className="h-8 w-8 text-blue-400 mb-3" />
                      <span className="text-sm font-medium text-blue-300 mb-1">Send Newsletter</span>
                      <span className="text-xs text-[#a3a3a3]">Engage audience</span>
                    </motion.button>
                  </Link>

                  <Link href="/dashboard/team">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass bg-green-500/10 border border-green-500/20 rounded-lg p-6 transition-standard hover:bg-green-500/20 flex flex-col items-center text-center"
                    >
                      <Users className="h-8 w-8 text-green-400 mb-3" />
                      <span className="text-sm font-medium text-green-300 mb-1">Team Collab</span>
                      <span className="text-xs text-[#a3a3a3]">Work together</span>
                    </motion.button>
                  </Link>

                  <Link href="/dashboard/analytics">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass bg-orange-500/10 border border-orange-500/20 rounded-lg p-6 transition-standard hover:bg-orange-500/20 flex flex-col items-center text-center"
                    >
                      <BarChart3 className="h-8 w-8 text-orange-400 mb-3" />
                      <span className="text-sm font-medium text-orange-300 mb-1">View Analytics</span>
                      <span className="text-xs text-[#a3a3a3]">Deep insights</span>
                    </motion.button>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
