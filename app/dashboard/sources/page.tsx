"use client";

import { useState } from "react";
import { useQuery, useMutation, api } from "@/lib/mockConvexTyped";
import type { Source } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSidebar } from "@/components/dashboard/sidebar-context";
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
  const [newSource, setNewSource] = useState({
    name: "",
    type: "rss" as SourceType,
    url: "",
    description: "",
  });

  // Convex queries
  const sources = useQuery<Source[]>(api.sources.listSources);

  const sourceStats = useQuery(api.sources.getSourceStats);

  // Mutations
  const createSource = useMutation(api.sources.createSource);
  const updateSource = useMutation(api.sources.updateSource);
  const deleteSource = useMutation(api.sources.deleteSource);
  // Mock mutations for refresh operations
  const refreshSource = useMutation("sources.refreshSource");
  const refreshAllSources = useMutation("sources.refreshAllSources");

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

  const totalSources = sources?.length || 0;
  const activeSources = sources?.filter(s => s.status === 'active').length || 0;
  const totalSignals = sources?.reduce((sum, s) => sum + s.signalsFound, 0) || 0;
  const errorSources = sources?.filter(s => s.status === 'error').length || 0;

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

  if (sources === undefined || sourceStats === undefined) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Database className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Loading sources...</p>
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
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Signal Sources
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage data sources for signal collection and monitoring
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleRefreshAll}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Source</DialogTitle>
                  <DialogDescription>
                    Configure a new data source for signal collection
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Source Name</Label>
                    <Input
                      placeholder="Enter source name"
                      value={newSource.name}
                      onChange={(e) => setNewSource(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Source Type</Label>
                    <Select
                      value={newSource.type}
                      onValueChange={(value) => setNewSource(prev => ({ ...prev, type: value as SourceType }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select source type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rss">RSS Feed</SelectItem>
                        <SelectItem value="web">Web Scraping</SelectItem>
                        <SelectItem value="social">Social Media</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="newsletter">Newsletter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>URL</Label>
                    <Input
                      placeholder="Enter source URL"
                      value={newSource.url}
                      onChange={(e) => setNewSource(prev => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Optional description"
                      value={newSource.description}
                      onChange={(e) => setNewSource(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1"
                      onClick={handleAddSource}
                      disabled={!newSource.name || !newSource.url}
                    >
                      Add Source
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Sources
                    </p>
                    <p className="text-2xl font-bold">{totalSources}</p>
                  </div>
                  <Database className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Active Sources
                    </p>
                    <p className="text-2xl font-bold">{activeSources}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Signals
                    </p>
                    <p className="text-2xl font-bold">{totalSignals}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Issues
                    </p>
                    <p className="text-2xl font-bold text-red-500">{errorSources}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        className="mb-6"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search sources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterType} onValueChange={(value) => setFilterType(value as SourceType | "all")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="rss">RSS</SelectItem>
                    <SelectItem value="web">Web</SelectItem>
                    <SelectItem value="social">Social</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as SourceStatus | "all")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sources List */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredSources.map((source) => (
          <motion.div key={source._id} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {getSourceIcon(source.type)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {source.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Automated data source for innovation signals
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                              {source.url}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(source.status)} variant="outline">
                            {getStatusIcon(source.status)}
                            <span className="ml-1 capitalize">{source.status}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <BarChart3 className="h-4 w-4" />
                            <span>{source.signalsFound || 0} signals</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Updated {new Date(source.lastCrawled).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRefreshSource(source._id)}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800"
                            onClick={() => handleDeleteSource(source._id, source.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Categories and Keywords */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500">Type:</span>
                          <Badge variant="secondary" className="text-xs capitalize">
                            {source.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredSources.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Database className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Sources Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || filterType !== "all" || filterStatus !== "all"
              ? "No sources match your current filters."
              : "Get started by adding your first signal source."}
          </p>
          {(!searchQuery && filterType === "all" && filterStatus === "all") && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Source
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}