"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Database,
  Bell,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Clock,
  ArrowUpRight,
  Mail,
  Sparkles,
  FileText,
  Activity,
  ChevronRight,
  ChevronLeft,
  Target,
  AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function DashboardPage() {
  const [activeSignalIndex, setActiveSignalIndex] = useState(0);
  const [stats, setStats] = useState({
    activeSignals: 247,
    dataSources: 12,
    newMentions: 1850,
    trendingTopics: 23
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  // Featured signals data
  const featuredSignals = [
    {
      rank: 1,
      title: "AI-Powered Healthcare Automation",
      description: "Significant increase in enterprise adoption discussions. Major players announcing new initiatives.",
      growth: "+127%",
      mentions: 842,
      sources: 12,
      tags: ["Digital Health", "Enterprise AI", "Automation"],
      trend: [25, 30, 28, 35, 42, 38, 55, 62, 58, 75, 85, 92]
    },
    {
      rank: 2,
      title: "Sustainable Supply Chain Tech",
      description: "Growing focus on carbon tracking and ESG compliance tools across manufacturing sectors.",
      growth: "+89%",
      mentions: 634,
      sources: 9,
      tags: ["ESG", "Supply Chain", "Sustainability"],
      trend: [30, 35, 40, 38, 45, 52, 58, 55, 65, 70, 78, 85]
    },
    {
      rank: 3,
      title: "Edge Computing in Retail",
      description: "Real-time inventory and customer analytics driving adoption in physical retail spaces.",
      growth: "+64%",
      mentions: 421,
      sources: 7,
      tags: ["Retail Tech", "Edge Computing", "Analytics"],
      trend: [20, 25, 30, 35, 32, 40, 45, 50, 55, 58, 62, 68]
    }
  ];

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

  const currentSignal = featuredSignals[activeSignalIndex];

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-8 max-w-[1400px]"
      >
        {/* Header - Stats + Actions combined */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          {/* Compact Stats */}
          <div className="flex items-center gap-8">
            <Link href="/dashboard/signals" className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-foreground">{stats.activeSignals}</span>
                <span className="text-sm text-muted-foreground">signals</span>
                <span className="text-xs text-emerald-600 font-medium">+12</span>
              </div>
            </Link>
            <div className="h-8 w-px bg-black/[0.06]" />
            <Link href="/dashboard/sources" className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-foreground">{stats.dataSources}</span>
                <span className="text-sm text-muted-foreground">sources</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />
              </div>
            </Link>
            <div className="h-8 w-px bg-black/[0.06]" />
            <Link href="/dashboard/mentions" className="group">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-foreground">{stats.newMentions.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">mentions</span>
                <span className="text-xs text-emerald-600 font-medium">+8%</span>
              </div>
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/content-library">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm">
                <FileText className="h-4 w-4 text-amber-500" />
                <span>Library</span>
              </button>
            </Link>
            <Link href="/dashboard/newsletters">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm">
                <Mail className="h-4 w-4 text-purple-500" />
                <span>Newsletter</span>
              </button>
            </Link>
            <Link href="/dashboard/analytics">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm">
                <BarChart3 className="h-4 w-4 text-emerald-500" />
                <span>Analytics</span>
              </button>
            </Link>
            <Link href="/dashboard/team">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm">
                <Users className="h-4 w-4 text-violet-500" />
                <span>Team</span>
              </button>
            </Link>
            <Link href="/dashboard/content-ideation">
              <button className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Trending Signals Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Trending Signals</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSignalIndex(i => i > 0 ? i - 1 : featuredSignals.length - 1)}
                className="h-8 w-8 rounded-full border border-black/[0.08] flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveSignalIndex(i => i < featuredSignals.length - 1 ? i + 1 : 0)}
                className="h-8 w-8 rounded-full border border-black/[0.08] flex items-center justify-center hover:bg-white transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <Link href="/dashboard/signals" className="text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
                View all
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* Featured Signal - Large */}
            <div className="col-span-2 bg-[#1C1C1C] rounded-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-medium">
                      #{currentSignal.rank} Trending
                    </span>
                  </div>
                  <h3 className="text-xl font-medium mb-2">{currentSignal.title}</h3>
                  <p className="text-white/60 text-sm mb-5">{currentSignal.description}</p>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-2xl font-light">{currentSignal.growth}</p>
                      <p className="text-xs text-white/50">Growth</p>
                    </div>
                    <div>
                      <p className="text-2xl font-light">{currentSignal.mentions}</p>
                      <p className="text-xs text-white/50">Mentions</p>
                    </div>
                    <div>
                      <p className="text-2xl font-light">{currentSignal.sources}</p>
                      <p className="text-xs text-white/50">Sources</p>
                    </div>
                  </div>
                </div>
                <div className="ml-6">
                  <div className="flex items-end gap-1 h-20 w-28">
                    {currentSignal.trend.map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-white/20" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <p className="text-xs text-white/40 mt-2 text-right">12 weeks</p>
                </div>
              </div>
              <div className="mt-5 pt-4 border-t border-white/10 flex items-center gap-2">
                {currentSignal.tags.map((tag, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-white/10 text-white/70">{tag}</span>
                ))}
              </div>
            </div>

            {/* Signal List - Right side */}
            <div className="space-y-3">
              {featuredSignals.map((signal, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSignalIndex(i)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all",
                    i === activeSignalIndex
                      ? "bg-white border-2 border-foreground/20 shadow-sm"
                      : "bg-white/60 border border-black/[0.04] hover:bg-white"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">#{signal.rank}</span>
                    <span className="text-xs font-medium text-emerald-600">{signal.growth}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{signal.title}</p>
                  <p className="text-xs text-muted-foreground">{signal.mentions} mentions</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Signals & Mentions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Latest Mentions</h2>
              <Link href="/dashboard/mentions" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
              {[
                { source: "TechCrunch", signal: "Healthcare AI", time: "2m", sentiment: "positive" },
                { source: "Reuters", signal: "Supply Chain", time: "15m", sentiment: "neutral" },
                { source: "Forbes", signal: "Edge Computing", time: "1h", sentiment: "positive" },
                { source: "WSJ", signal: "AI Regulation", time: "2h", sentiment: "negative" },
              ].map((mention, i, arr) => (
                <div
                  key={i}
                  className={cn(
                    "px-4 py-3 hover:bg-black/[0.01] transition-colors cursor-pointer",
                    i !== arr.length - 1 && "border-b border-black/[0.04]"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{mention.source}</span>
                    <span className="text-xs text-muted-foreground">{mention.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{mention.signal}</span>
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      mention.sentiment === "positive" ? "bg-emerald-500" :
                      mention.sentiment === "negative" ? "bg-red-400" : "bg-gray-300"
                    )} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Content & Newsletters */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Content</h2>
              <Link href="/dashboard/content-library" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>
            </div>
            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-black/[0.04] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Weekly Digest</p>
                    <p className="text-xs text-muted-foreground">Sent 1h ago • 2.4k opens</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">68% open rate</span>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-black/[0.04] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">AI Trends Report</p>
                    <p className="text-xs text-muted-foreground">Draft • Last edited 3h ago</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">In progress</span>
                </div>
              </div>

              <Link href="/dashboard/content-ideation" className="block">
                <div className="border-2 border-dashed border-black/[0.08] rounded-2xl p-4 hover:border-black/[0.15] transition-colors text-center">
                  <Sparkles className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-medium text-muted-foreground">Generate new content</p>
                </div>
              </Link>
            </div>
          </motion.div>

          {/* Alerts & Actions */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-foreground">Needs Attention</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                    <Clock className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-900">AI Regulatory Changes</p>
                    <p className="text-xs text-amber-700 mt-1">New EU guidelines announced. Review recommended within 48h.</p>
                    <button className="text-xs font-medium text-amber-700 mt-2 hover:text-amber-900">Review now →</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-black/[0.04]">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Target className="h-4 w-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Quantum Computing</p>
                    <p className="text-xs text-muted-foreground mt-1">Low competition opportunity. Consider creating content.</p>
                    <button className="text-xs font-medium text-blue-600 mt-2 hover:text-blue-700">Explore →</button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-4 border border-black/[0.04]">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4 text-violet-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Team Update</p>
                    <p className="text-xs text-muted-foreground mt-1">Sarah Chen joined the Analytics team.</p>
                    <button className="text-xs font-medium text-violet-600 mt-2 hover:text-violet-700">View team →</button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Status */}
        <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-black/[0.06]">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              All systems operational
            </span>
            <span>•</span>
            <span>Last sync 2m ago</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
