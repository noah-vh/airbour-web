"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Database,
  Plus,
  Globe,
  Rss,
  Twitter,
  Settings,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  Search,
  Sparkles,
  ChevronRight,
  X,
  Power,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type SourceType = "rss" | "web" | "social" | "api" | "newsletter";
type SourceStatus = "active" | "inactive" | "error" | "pending";

interface LocalSource {
  _id: string;
  name: string;
  type: SourceType;
  url: string;
  description?: string;
  status: SourceStatus;
  lastUpdated: string;
  signalCount: number;
  categories: string[];
  keywords: string[];
  isActive: boolean;
}

export default function SourcesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<SourceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<SourceStatus | "all">("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newSource, setNewSource] = useState({
    name: "",
    type: "rss" as SourceType,
    url: "",
    description: "",
  });

  // Convex queries
  const sources = useQuery(api.sources.listSources, {
    type: filterType === "all" ? undefined : filterType,
    status: filterStatus === "all" ? undefined : filterStatus,
    search: searchQuery || undefined,
  });

  const sourceStats = useQuery(api.sources.getSourceStats);
  const sourceHealthStats = useQuery(api.sources.getSourceHealthStats, { timeframe: "24h" });

  // Mutations
  const createSource = useMutation(api.sources.createSource);
  const deleteSource = useMutation(api.sources.deleteSource);
  const refreshSource = useMutation(api.sources.refreshSource);
  const refreshAllSources = useMutation(api.sources.refreshAllSources);
  const toggleSource = useMutation(api.sources.toggleSource);

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "rss": return <Rss className="h-4 w-4" />;
      case "web": return <Globe className="h-4 w-4" />;
      case "social": return <Twitter className="h-4 w-4" />;
      case "api": return <Database className="h-4 w-4" />;
      case "newsletter": return <Database className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      toast.error("Name and URL are required");
      return;
    }

    try {
      await createSource({
        name: newSource.name,
        type: newSource.type,
        url: newSource.url,
        description: newSource.description || undefined,
      });
      toast.success("Source added successfully");
      setShowAddDialog(false);
      setNewSource({ name: "", type: "rss", url: "", description: "" });
    } catch (error: any) {
      toast.error(`Failed to add source: ${error.message}`);
    }
  };

  const handleDeleteSource = async (sourceId: string, sourceName?: string) => {
    if (!confirm(`Delete "${sourceName || 'this source'}"?`)) return;
    try {
      await deleteSource({ id: sourceId as any });
      toast.success("Source deleted");
    } catch (error: any) {
      toast.error(`Failed to delete source: ${error.message}`);
    }
  };

  const handleRefreshSource = async (sourceId: string) => {
    try {
      await refreshSource({ id: sourceId as any });
      toast.success("Source refresh started");
    } catch (error: any) {
      toast.error(`Failed to refresh source: ${error.message}`);
    }
  };

  const handleRefreshAll = async () => {
    try {
      const result = await refreshAllSources();
      toast.success(`Refreshing ${result.refreshed} sources`);
    } catch (error: any) {
      toast.error(`Failed to refresh sources: ${error.message}`);
    }
  };

  const handleToggleSource = async (sourceId: string) => {
    try {
      const result = await toggleSource({ id: sourceId as any });
      toast.success(`Source ${result.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error(`Failed to toggle source: ${error.message}`);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (sources === undefined || sourceStats === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading sources...
        </div>
      </div>
    );
  }

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
              <span className="text-3xl font-light text-foreground">{sourceStats?.total || 0}</span>
              <span className="text-sm text-muted-foreground">sources</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{sourceStats?.active || 0}</span>
              <span className="text-sm text-muted-foreground">active</span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{sourceStats?.totalSignals || 0}</span>
              <span className="text-sm text-muted-foreground">signals</span>
              <span className="text-xs text-emerald-600 font-medium">collected</span>
            </div>
            {sourceStats?.error > 0 && (
              <>
                <div className="h-8 w-px bg-black/[0.06]" />
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-light text-red-500">{sourceStats.error}</span>
                  <span className="text-sm text-muted-foreground">errors</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshAll}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4 text-blue-500" />
              <span>Refresh All</span>
            </button>
            <button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Source
            </button>
          </div>
        </motion.div>

        {/* Health Overview */}
        {sourceHealthStats && (
          <motion.div variants={itemVariants} className="mb-8">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Health:</span>
                <span className={cn(
                  "text-sm font-medium",
                  sourceHealthStats.healthPercentage >= 80 ? "text-emerald-600" :
                  sourceHealthStats.healthPercentage >= 60 ? "text-amber-600" : "text-red-500"
                )}>
                  {sourceHealthStats.healthPercentage}%
                </span>
              </div>
              <div className="h-4 w-px bg-black/[0.06]" />
              <span className="text-sm text-muted-foreground">
                {sourceHealthStats.healthy} healthy, {sourceHealthStats.stalled} stalled
              </span>
              {sourceHealthStats.avgSignalsPerSource > 0 && (
                <>
                  <div className="h-4 w-px bg-black/[0.06]" />
                  <span className="text-sm text-muted-foreground">
                    ~{Math.round(sourceHealthStats.avgSignalsPerSource)} signals/source avg
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-black/[0.04] p-4 mb-6">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search sources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            {/* Type Filter */}
            <div className="flex items-center gap-1">
              {["all", "rss", "web", "social", "api"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as SourceType | "all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    filterType === type
                      ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                      : "bg-white border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
                  )}
                >
                  {type === "all" ? "All" : type.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-black/[0.06]" />

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {["all", "active", "inactive", "error"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status as SourceStatus | "all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    filterStatus === status
                      ? status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        status === "error" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      : "bg-white border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
                  )}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>

            {/* Clear Filters */}
            {(filterType !== "all" || filterStatus !== "all" || searchQuery) && (
              <button
                onClick={() => {
                  setFilterType("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Sources List */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Data Sources</h2>
            <span className="text-sm text-muted-foreground">{sources?.length || 0} sources</span>
          </div>

          <div className="bg-white rounded-2xl border border-black/[0.04] overflow-hidden">
            {sources && sources.length > 0 ? (
              sources.map((source: any, index: number, arr: any[]) => (
                <div
                  key={source._id}
                  className={cn(
                    "px-4 py-4 hover:bg-black/[0.01] transition-colors",
                    index !== arr.length - 1 && "border-b border-black/[0.04]"
                  )}
                >
                  <div className="flex items-center gap-4">
                    {/* Icon Box */}
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      source.isActive ? "bg-emerald-50" : "bg-gray-50"
                    )}>
                      <span className={source.isActive ? "text-emerald-500" : "text-gray-400"}>
                        {getSourceIcon(source.type)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">{source.name}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium border",
                          source.status === "active" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                          source.status === "error" ? "bg-red-50 text-red-600 border-red-200" :
                          source.status === "pending" ? "bg-amber-50 text-amber-600 border-amber-200" :
                          "bg-gray-50 text-gray-600 border-gray-200"
                        )}>
                          {source.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-200">
                          {source.type.toUpperCase()}
                        </span>
                      </div>

                      {/* URL */}
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:text-blue-600 flex items-center gap-1 mb-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="truncate max-w-md">{source.url}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3 w-3" />
                          {source.signalCount || 0} signals
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {source.lastUpdated ? new Date(source.lastUpdated).toLocaleDateString() : 'Never synced'}
                        </span>
                      </div>
                    </div>

                    {/* Toggle + Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSource(source._id)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          source.isActive ? "bg-emerald-500" : "bg-gray-200"
                        )}
                      >
                        <span className={cn(
                          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                          source.isActive ? "translate-x-6" : "translate-x-1"
                        )} />
                      </button>
                      <button
                        onClick={() => handleRefreshSource(source._id)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors"
                        title="Refresh"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSource(source._id, source.name)}
                        className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                  <Database className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">No sources found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-4">
                  {searchQuery || filterType !== "all" || filterStatus !== "all"
                    ? "Try adjusting your filters"
                    : "Add your first data source to start collecting signals"
                  }
                </p>
                <button
                  onClick={() => setShowAddDialog(true)}
                  className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add First Source
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Status */}
        <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-black/[0.06]">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Source monitoring active
            </span>
            <span>•</span>
            <span>Auto-sync every 15 minutes</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Add Source Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowAddDialog(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-foreground mb-4">Add New Source</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Source name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Type</label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource(prev => ({ ...prev, type: e.target.value as SourceType }))}
                  className="w-full px-4 py-2 rounded-xl border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="web">Web Scraping</option>
                  <option value="social">Social Media</option>
                  <option value="api">API</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL</label>
                <input
                  type="url"
                  value={newSource.url}
                  onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Description (optional)</label>
                <textarea
                  value={newSource.description}
                  onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-black/[0.1] focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
                  rows={3}
                  placeholder="Brief description..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddDialog(false)}
                className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSource}
                disabled={!newSource.name || !newSource.url}
                className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
