"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Edit,
  Trash2,
  Radio,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Clock,
  Archive,
  ArchiveRestore,
  Bookmark,
  BookmarkCheck,
  Flame,
  Plus,
  RefreshCw,
  ChevronRight,
  Sparkles,
  Filter,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const LIFECYCLE_OPTIONS = [
  { value: "weak", label: "Weak Signal", color: "bg-gray-50 text-gray-600 border-gray-200" },
  { value: "emerging", label: "Emerging", color: "bg-blue-50 text-blue-600 border-blue-200" },
  { value: "growing", label: "Growing", color: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "mainstream", label: "Mainstream", color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { value: "declining", label: "Declining", color: "bg-red-50 text-red-600 border-red-200" },
];

const STEEP_OPTIONS = [
  { value: "social", label: "Social", icon: "👥" },
  { value: "technological", label: "Tech", icon: "🔬" },
  { value: "economic", label: "Economic", icon: "💰" },
  { value: "environmental", label: "Enviro", icon: "🌍" },
  { value: "political", label: "Political", icon: "🏛️" },
];

interface LocalSignal {
  _id: string;
  name: string;
  description: string;
  lifecycle: string;
  steep: string[];
  confidence: number;
  keywords: string[];
  mentionCount: number;
  sourceCount: number;
  sentiment: number;
  growth: number;
  createdAt: number;
  updatedAt: number;
}

export default function SignalsDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLifecycle, setSelectedLifecycle] = useState<string[]>([]);
  const [selectedSteep, setSelectedSteep] = useState<string[]>([]);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [viewTimeframe, setViewTimeframe] = useState("7d");
  const [activeTab, setActiveTab] = useState<"signals" | "saved">("signals");

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    lifecycle: selectedLifecycle.length > 0 ? selectedLifecycle : undefined,
    steep: selectedSteep.length > 0 ? selectedSteep : undefined,
    search: searchTerm || undefined,
  });

  const signalStats = useQuery(api.signals.getSignalStats);

  const trendingSignals = useQuery(api.signals.getTrendingSignals, {
    timeframe: viewTimeframe,
    limit: 5,
  });

  const savedSignals = useQuery(api.signals.getSavedSignals, {
    userId: "current-user",
    limit: 20,
  });

  // Mutations
  const deleteSignal = useMutation(api.signals.deleteSignal);
  const deleteSignals = useMutation(api.signals.deleteSignals);
  const archiveSignal = useMutation(api.signals.archiveSignal);
  const toggleSaveSignal = useMutation(api.signals.toggleSaveSignal);
  const recalculateMetrics = useMutation(api.signals.recalculateAllSignalMetrics);

  const handleDeleteSignal = async (signalId: string) => {
    try {
      await deleteSignal({ id: signalId as any });
      toast.success("Signal deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete signal: ${error.message}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSignals.length === 0) return;
    try {
      await deleteSignals({ ids: selectedSignals as any });
      toast.success(`${selectedSignals.length} signals deleted`);
      setSelectedSignals([]);
    } catch (error: any) {
      toast.error(`Failed to delete signals: ${error.message}`);
    }
  };

  const handleArchiveSignal = async (signalId: string) => {
    try {
      await archiveSignal({ id: signalId as any });
      toast.success("Signal archived");
    } catch (error: any) {
      toast.error(`Failed to archive signal: ${error.message}`);
    }
  };

  const handleToggleSave = async (signalId: string) => {
    try {
      await toggleSaveSignal({ signalId: signalId as any, userId: "current-user" });
      toast.success("Signal saved");
    } catch (error: any) {
      toast.error(`Failed to save signal: ${error.message}`);
    }
  };

  const handleRecalculateMetrics = async () => {
    try {
      const result = await recalculateMetrics({});
      toast.success(`Recalculated metrics for ${result.recalculated} signals`);
    } catch (error: any) {
      toast.error(`Failed to recalculate metrics: ${error.message}`);
    }
  };

  const getLifecycleConfig = (lifecycle: string) => {
    return LIFECYCLE_OPTIONS.find(opt => opt.value === lifecycle) || LIFECYCLE_OPTIONS[0];
  };

  const formatConfidence = (confidence: number) => `${Math.round(confidence * 100)}%`;
  const formatGrowth = (growth: number) => `${growth > 0 ? "+" : ""}${Math.round(growth * 100)}%`;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const displayedSignals = activeTab === "saved" ? savedSignals : signals;

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-8 max-w-[1400px]"
      >
        {/* Header - Stats + Actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          {/* Compact Stats */}
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{signalStats?.total || 0}</span>
              <span className="text-sm text-muted-foreground">signals</span>
              <span className="text-xs text-emerald-600 font-medium">+{signalStats?.byLifecycle?.emerging || 0}</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{signalStats?.byLifecycle?.growing || 0}</span>
              <span className="text-sm text-muted-foreground">growing</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{signalStats?.byLifecycle?.mainstream || 0}</span>
              <span className="text-sm text-muted-foreground">mainstream</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRecalculateMetrics}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span>Refresh</span>
            </button>
            <Link href="/dashboard/mentions">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm">
                <MessageSquare className="h-4 w-4 text-purple-500" />
                <span>Mentions</span>
              </button>
            </Link>
            <Link href="/dashboard/content-ideation">
              <button className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Content
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Trending Signals Section */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Trending Signals</h2>
            <div className="flex items-center gap-2">
              {["1d", "7d", "30d"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setViewTimeframe(tf)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    viewTimeframe === tf
                      ? "bg-[#1C1C1C] text-white"
                      : "bg-white border border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
                  )}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-5 gap-3">
            {trendingSignals?.map((signal: any, index: number) => (
              <div
                key={signal._id}
                className="bg-[#1C1C1C] rounded-2xl p-4 text-white hover:bg-[#2C2C2C] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <h4 className="font-medium text-sm mb-2 line-clamp-2">{signal.name}</h4>
                <div className="flex items-center justify-between text-xs text-white/60">
                  <span>{signal.mentionCount} mentions</span>
                  <span className="text-emerald-400">{formatGrowth(signal.growth || 0)}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-black/[0.04] p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search signals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>

            {/* Lifecycle Filter */}
            <div className="flex items-center gap-1">
              {LIFECYCLE_OPTIONS.slice(1, 4).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSelectedLifecycle(prev =>
                      prev.includes(opt.value)
                        ? prev.filter(l => l !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    selectedLifecycle.includes(opt.value)
                      ? opt.color
                      : "bg-white border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* STEEP Filter */}
            <div className="h-6 w-px bg-black/[0.06]" />
            <div className="flex items-center gap-1">
              {STEEP_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setSelectedSteep(prev =>
                      prev.includes(opt.value)
                        ? prev.filter(s => s !== opt.value)
                        : [...prev, opt.value]
                    );
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full text-sm transition-colors border flex items-center justify-center",
                    selectedSteep.includes(opt.value)
                      ? "bg-purple-50 border-purple-200"
                      : "bg-white border-black/[0.06] hover:border-black/[0.12]"
                  )}
                  title={opt.label}
                >
                  {opt.icon}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {(selectedLifecycle.length > 0 || selectedSteep.length > 0 || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedLifecycle([]);
                  setSelectedSteep([]);
                  setSearchTerm("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="flex items-center gap-4 mb-4">
          <button
            onClick={() => setActiveTab("signals")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "signals"
                ? "bg-[#1C1C1C] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Radio className="h-4 w-4" />
            All Signals
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors",
              activeTab === "saved"
                ? "bg-[#1C1C1C] text-white"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <BookmarkCheck className="h-4 w-4" />
            Saved
          </button>

          {/* Delete Selected */}
          {selectedSignals.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-50 border border-red-100 text-red-600 text-sm font-medium hover:bg-red-100 transition-colors ml-auto"
            >
              <Trash2 className="h-4 w-4" />
              Delete ({selectedSignals.length})
            </button>
          )}
        </motion.div>

        {/* Signals List */}
        <motion.div variants={itemVariants}>
          <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
            {displayedSignals && displayedSignals.length > 0 ? (
              displayedSignals.map((signal: any, index: number, arr: any[]) => {
                const lifecycleConfig = getLifecycleConfig(signal.lifecycle);
                const isSelected = selectedSignals.includes(signal._id);

                return (
                  <div
                    key={signal._id}
                    className={cn(
                      "px-4 py-4 hover:bg-black/[0.01] transition-colors cursor-pointer",
                      index !== arr.length - 1 && "border-b border-black/[0.04]",
                      isSelected && "bg-purple-50/50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedSignals(prev =>
                            prev.includes(signal._id)
                              ? prev.filter(id => id !== signal._id)
                              : [...prev, signal._id]
                          );
                        }}
                        className={cn(
                          "mt-1 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors",
                          isSelected
                            ? "bg-purple-500 border-purple-500 text-white"
                            : "border-black/[0.15] hover:border-purple-500"
                        )}
                      >
                        {isSelected && <CheckCircle className="h-3 w-3" />}
                      </button>

                      {/* Icon Box */}
                      <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0">
                        <Radio className="h-5 w-5 text-purple-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-medium text-foreground">{signal.name}</h3>
                          <div className="flex items-center gap-2 ml-4">
                            <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium border", lifecycleConfig.color)}>
                              {lifecycleConfig.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
                              {formatConfidence(signal.confidence)}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{signal.description}</p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            {signal.mentionCount || 0} mentions
                          </span>
                          <span>{signal.sourceCount || 0} sources</span>
                          <span className="flex items-center gap-1">
                            {signal.growth > 0 ? (
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                            ) : signal.growth < 0 ? (
                              <TrendingDown className="h-3 w-3 text-red-400" />
                            ) : (
                              <Activity className="h-3 w-3" />
                            )}
                            <span className={signal.growth > 0 ? "text-emerald-600" : signal.growth < 0 ? "text-red-400" : ""}>
                              {formatGrowth(signal.growth)}
                            </span>
                          </span>
                          <div className="flex gap-1">
                            {signal.steep?.map((cat: string) => {
                              const steepOpt = STEEP_OPTIONS.find(s => s.value === cat);
                              return steepOpt ? (
                                <span key={cat} className="text-sm" title={steepOpt.label}>{steepOpt.icon}</span>
                              ) : null;
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSave(signal._id);
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition-colors"
                          title="Save"
                        >
                          <Bookmark className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveSignal(signal._id);
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-purple-500 hover:bg-purple-50 transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSignal(signal._id);
                          }}
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground ml-2" />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-purple-50 flex items-center justify-center mx-auto mb-4">
                  <Radio className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">No signals found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {searchTerm || selectedLifecycle.length > 0 || selectedSteep.length > 0
                    ? "Try adjusting your filters or search terms"
                    : activeTab === "saved"
                    ? "Save signals from the main list to see them here"
                    : "Signals will appear here as they're detected"
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Status */}
        <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-black/[0.06]">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Signal monitoring active
            </span>
            <span>•</span>
            <span>Last sync 2m ago</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
