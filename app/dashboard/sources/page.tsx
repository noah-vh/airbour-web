"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import {
  Database,
  Plus,
  Globe,
  Rss,
  Twitter,
  Youtube,
  Linkedin,
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
  Filter
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
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<SourceType | "all">("all");
  const [filterStatus, setFilterStatus] = useState<SourceStatus | "all">("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [healthTimeframe, setHealthTimeframe] = useState<"24h" | "7d" | "30d">("24h");
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
  const sourceHealthStats = useQuery(api.sources.getSourceHealthStats, {
    timeframe: healthTimeframe
  });

  // Mutations
  const createSource = useMutation(api.sources.createSource);
  const updateSource = useMutation(api.sources.updateSource);
  const deleteSource = useMutation(api.sources.deleteSource);
  const refreshSource = useMutation(api.sources.refreshSource);
  const refreshAllSources = useMutation(api.sources.refreshAllSources);
  const toggleSource = useMutation(api.sources.toggleSource);
  const updateSourceHealth = useMutation(api.sources.updateSourceHealth);

  // Since filtering is now handled in Convex, we can use sources directly
  const filteredSources = sources || [];

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "rss": return <Rss className="h-5 w-5" />;
      case "web": return <Globe className="h-5 w-5" />;
      case "social": return <Twitter className="h-5 w-5" />;
      case "api": return <Database className="h-5 w-5" />;
      case "newsletter": return <Database className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const getFaviconUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      // Use multiple favicon services for better reliability
      return [
        `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        `https://icons.duckduckgo.com/ip3/${domain}.ico`,
        `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        `${urlObj.protocol}//${domain}/favicon.ico`
      ];
    } catch {
      return null;
    }
  };

  const SourceIcon = ({ source }: { source: LocalSource }) => {
    const [showFavicon, setShowFavicon] = useState(true);

    let faviconUrl;
    try {
      faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(source.url).hostname}&sz=32`;
    } catch {
      return getSourceIcon(source.type);
    }

    if (showFavicon) {
      return (
        <img
          src={faviconUrl}
          alt={`${source.name} favicon`}
          className="h-5 w-5 rounded-sm"
          onError={() => setShowFavicon(false)}
        />
      );
    }

    return getSourceIcon(source.type);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "error": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />;
      case "inactive": return <Clock className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      case "pending": return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalSources = sourceStats?.total || 0;
  const activeSources = sourceStats?.active || 0;
  const totalSignals = sourceStats?.totalSignals || 0;
  const errorSources = sourceStats?.error || 0;

  // Handlers
  const handleAddSource = async () => {
    if (!newSource.name || !newSource.url) {
      toast.error("Name and URL are required");
      return;
    }

    // Basic URL validation
    if (!newSource.type.includes("newsletter") && !isValidUrl(newSource.url)) {
      toast.error("Please enter a valid URL");
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

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleDeleteSource = async (sourceId: string, sourceName?: string) => {
    if (!sourceId) {
      toast.error("Invalid source ID");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${sourceName || 'this source'}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteSource({ id: sourceId as any }); // Still needed due to no schema
      toast.success("Source deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete source: ${error.message}`);
    }
  };

  const handleRefreshSource = async (sourceId: string) => {
    if (!sourceId) {
      toast.error("Invalid source ID");
      return;
    }

    try {
      await refreshSource({ id: sourceId as any }); // Still needed due to no schema
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

  const handleToggleSource = async (sourceId: string, currentStatus: boolean) => {
    if (!sourceId) {
      toast.error("Invalid source ID");
      return;
    }

    try {
      const result = await toggleSource({ id: sourceId as any });
      toast.success(`Source ${result.isActive ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      toast.error(`Failed to toggle source: ${error.message}`);
    }
  };

  if (sources === undefined || sourceStats === undefined || sourceHealthStats === undefined) {
    return (
      <div className={cn(
        "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
        isCollapsed ? "left-16" : "left-64"
      )}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 animate-spin text-blue-400" />
            <span className="text-[#f5f5f5]">Loading sources...</span>
          </div>
        </div>
      </div>
    );
  }

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
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
            <Database className="h-6 w-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Signal Sources</h1>
            <p className="text-sm text-[#a3a3a3]">Manage data sources for signal collection and monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAll}
              className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-blue-500/20 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">Refresh All</span>
            </button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <button className="glass bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-green-500/20 flex items-center gap-2">
                  <Plus className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-green-300">Add Source</span>
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md glass bg-[#0a0a0a]/95 border border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-[#f5f5f5]">Add New Source</DialogTitle>
                  <DialogDescription className="text-[#a3a3a3]">
                    Configure a new data source for signal collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#f5f5f5]">Source Name</Label>
                    <Input
                      placeholder="Enter source name"
                      value={newSource.name}
                      onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#f5f5f5]">Source Type</Label>
                    <Select
                      value={newSource.type}
                      onValueChange={(value) => setNewSource(prev => ({ ...prev, type: value as SourceType }))}
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                      <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                        <SelectItem value="rss" className="text-[#f5f5f5] focus:bg-white/10">RSS Feed</SelectItem>
                        <SelectItem value="web" className="text-[#f5f5f5] focus:bg-white/10">Web Scraping</SelectItem>
                        <SelectItem value="social" className="text-[#f5f5f5] focus:bg-white/10">Social Media</SelectItem>
                        <SelectItem value="api" className="text-[#f5f5f5] focus:bg-white/10">API</SelectItem>
                        <SelectItem value="newsletter" className="text-[#f5f5f5] focus:bg-white/10">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#f5f5f5]">URL</Label>
                    <Input
                      placeholder="Enter source URL"
                      value={newSource.url}
                      onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                      className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#f5f5f5]">Description</Label>
                    <Textarea
                      placeholder="Optional description"
                      value={newSource.description}
                      onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                      onClick={handleAddSource}
                      disabled={!newSource.name || !newSource.url}
                    >
                      Add Source
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Database className="h-3.5 w-3.5 text-blue-400" />
              </div>
              <span className="text-xl font-bold text-[#f5f5f5]">{totalSources}</span>
            </div>
            <h3 className="text-xs font-medium text-[#a3a3a3] mb-1">Total Sources</h3>
            <p className="text-xs text-[#666]">All data sources</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              </div>
              <span className="text-xl font-bold text-[#f5f5f5]">{activeSources}</span>
            </div>
            <h3 className="text-xs font-medium text-[#a3a3a3] mb-1">Active Sources</h3>
            <p className="text-xs text-[#666]">Currently monitoring</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                <BarChart3 className="h-3.5 w-3.5 text-purple-400" />
              </div>
              <span className="text-xl font-bold text-[#f5f5f5]">{totalSignals}</span>
            </div>
            <h3 className="text-xs font-medium text-[#a3a3a3] mb-1">Total Signals</h3>
            <p className="text-xs text-[#666]">Signals collected</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
                <AlertCircle className="h-3.5 w-3.5 text-red-400" />
              </div>
              <span className="text-xl font-bold text-red-400">{errorSources}</span>
            </div>
            <h3 className="text-xs font-medium text-[#a3a3a3] mb-1">Issues</h3>
            <p className="text-xs text-[#666]">Need attention</p>
          </div>
        </motion.div>

        {/* Source Health Metrics */}
        <motion.div variants={itemVariants} className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                <BarChart3 className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#f5f5f5]">Source Health Overview</h3>
            </div>
            <Select value={healthTimeframe} onValueChange={(value) => setHealthTimeframe(value as "24h" | "7d" | "30d")}>
              <SelectTrigger className="w-[100px] bg-white/5 border-white/10 text-[#f5f5f5]">
                <SelectValue placeholder="Period" />
              </SelectTrigger>
              <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                <SelectItem value="24h" className="text-[#f5f5f5] focus:bg-white/10">24h</SelectItem>
                <SelectItem value="7d" className="text-[#f5f5f5] focus:bg-white/10">7d</SelectItem>
                <SelectItem value="30d" className="text-[#f5f5f5] focus:bg-white/10">30d</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {sourceHealthStats?.healthPercentage || 0}%
              </div>
              <div className="text-xs text-[#a3a3a3]">Health Score</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-2xl font-bold text-blue-400 mb-1">
                {sourceHealthStats?.healthy || 0}
              </div>
              <div className="text-xs text-[#a3a3a3]">Healthy Sources</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-2xl font-bold text-red-400 mb-1">
                {sourceHealthStats?.errors || 0}
              </div>
              <div className="text-xs text-[#a3a3a3]">Error Sources</div>
            </div>

            <div className="text-center p-4 rounded-lg bg-white/5 border border-white/5">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {sourceHealthStats?.stalled || 0}
              </div>
              <div className="text-xs text-[#a3a3a3]">Stalled Sources</div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 text-blue-400 text-sm">
              <BarChart3 className="h-4 w-4" />
              <span>Average {sourceHealthStats?.avgSignalsPerSource || 0} signals per source</span>
            </div>
          </div>
        </motion.div>

        {/* Filters and Search */}
        <motion.div variants={itemVariants} className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-[#a3a3a3]" />
            <h3 className="text-lg font-semibold text-[#f5f5f5]">Filters</h3>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#666] h-4 w-4" />
                <Input
                  placeholder="Search sources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={(value) => setFilterType(value as SourceType | "all")}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="all" className="text-[#f5f5f5] focus:bg-white/10">All Types</SelectItem>
                  <SelectItem value="rss" className="text-[#f5f5f5] focus:bg-white/10">RSS</SelectItem>
                  <SelectItem value="web" className="text-[#f5f5f5] focus:bg-white/10">Web</SelectItem>
                  <SelectItem value="social" className="text-[#f5f5f5] focus:bg-white/10">Social</SelectItem>
                  <SelectItem value="api" className="text-[#f5f5f5] focus:bg-white/10">API</SelectItem>
                  <SelectItem value="newsletter" className="text-[#f5f5f5] focus:bg-white/10">Newsletter</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as SourceStatus | "all")}>
                <SelectTrigger className="w-[140px] bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="all" className="text-[#f5f5f5] focus:bg-white/10">All Status</SelectItem>
                  <SelectItem value="active" className="text-[#f5f5f5] focus:bg-white/10">Active</SelectItem>
                  <SelectItem value="inactive" className="text-[#f5f5f5] focus:bg-white/10">Inactive</SelectItem>
                  <SelectItem value="error" className="text-[#f5f5f5] focus:bg-white/10">Error</SelectItem>
                  <SelectItem value="pending" className="text-[#f5f5f5] focus:bg-white/10">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.div>

        {/* Sources Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredSources.map((source) => (
            <motion.div key={source._id} variants={itemVariants}>
              <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 hover:bg-white/5 transition-standard h-full flex flex-col">
                {/* Header with icon and status */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 text-[#a3a3a3] flex items-center justify-center">
                      <SourceIcon source={source} />
                    </div>
                    <div className={cn(
                      "px-2 py-1 rounded text-xs font-medium border flex items-center gap-1",
                      source.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" :
                      source.status === "inactive" ? "bg-gray-500/10 text-gray-400 border-gray-500/20" :
                      source.status === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                    )}>
                      {getStatusIcon(source.status)}
                      <span className="ml-1 capitalize">{source.status}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5 transition-standard">
                      <Edit className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleRefreshSource(source._id)}
                      className="p-1.5 rounded text-[#a3a3a3] hover:text-blue-400 hover:bg-blue-500/10 transition-standard"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSource(source._id, source.name)}
                      className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-standard"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                {/* Active/Inactive Toggle */}
                <div className="flex items-center justify-between mb-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "h-2 w-2 rounded-full",
                      source.isActive ? "bg-green-400" : "bg-gray-400"
                    )} />
                    <span className="text-sm text-[#f5f5f5]">
                      {source.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <Switch
                    checked={source.isActive}
                    onCheckedChange={() => handleToggleSource(source._id, source.isActive)}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>

                {/* Title and Type */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-[#f5f5f5] line-clamp-2 mb-1">
                    {source.name}
                  </h3>
                  <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 capitalize inline-block">
                    {source.type}
                  </div>
                </div>

                {/* URL */}
                <div className="mb-3">
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-standard truncate"
                    title={source.url}
                  >
                    <span className="truncate">{source.url}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-[#a3a3a3] mb-3">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="h-3 w-3" />
                    <span>{source.signalCount || 0} signals</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>
                      {source.lastUpdated ?
                        new Date(source.lastUpdated).toLocaleDateString() :
                        'Never'
                      }
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-[#666] mt-auto">
                  Automated data source for innovation signals
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {filteredSources.length === 0 && (
          <motion.div
            className="text-center py-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Database className="h-16 w-16 text-[#666] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#f5f5f5] mb-2">No Sources Found</h3>
            <p className="text-[#a3a3a3] mb-6">
              {searchQuery || filterType !== "all" || filterStatus !== "all"
                ? "No sources match your current filters."
                : "Get started by adding your first signal source."}
            </p>
            {(!searchQuery && filterType === "all" && filterStatus === "all") && (
              <button
                onClick={() => setShowAddDialog(true)}
                className="glass bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-green-500/20 flex items-center gap-2 mx-auto"
              >
                <Plus className="h-4 w-4 text-green-400" />
                <span className="text-sm text-green-300">Add First Source</span>
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}