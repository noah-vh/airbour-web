"use client";

import { useState } from "react";
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

interface Source {
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

  // Mock data - replace with actual Convex queries
  const sources: Source[] = [
    {
      _id: "1",
      name: "TechCrunch RSS",
      type: "rss",
      url: "https://techcrunch.com/feed/",
      description: "Latest technology news and startup coverage",
      status: "active",
      lastUpdated: "2024-01-20T10:30:00Z",
      signalCount: 142,
      categories: ["Technology", "Startups", "AI"],
      keywords: ["innovation", "funding", "AI", "startup"],
      isActive: true
    },
    {
      _id: "2",
      name: "MIT Technology Review",
      type: "web",
      url: "https://www.technologyreview.com/",
      description: "In-depth technology analysis and research",
      status: "active",
      lastUpdated: "2024-01-20T09:15:00Z",
      signalCount: 89,
      categories: ["Research", "Technology", "Science"],
      keywords: ["research", "breakthrough", "innovation"],
      isActive: true
    },
    {
      _id: "3",
      name: "Elon Musk Twitter",
      type: "social",
      url: "https://twitter.com/elonmusk",
      description: "Updates from Elon Musk",
      status: "active",
      lastUpdated: "2024-01-20T11:45:00Z",
      signalCount: 56,
      categories: ["Social Media", "Innovation"],
      keywords: ["tesla", "spacex", "innovation"],
      isActive: true
    },
    {
      _id: "4",
      name: "Y Combinator Newsletter",
      type: "newsletter",
      url: "hello@ycombinator.com",
      description: "Weekly startup insights and news",
      status: "pending",
      lastUpdated: "2024-01-19T16:00:00Z",
      signalCount: 23,
      categories: ["Startups", "Funding"],
      keywords: ["startup", "funding", "accelerator"],
      isActive: true
    },
    {
      _id: "5",
      name: "Broken API Source",
      type: "api",
      url: "https://api.example.com/news",
      description: "News API that's currently having issues",
      status: "error",
      lastUpdated: "2024-01-18T14:20:00Z",
      signalCount: 0,
      categories: ["News"],
      keywords: ["news"],
      isActive: false
    }
  ];

  // Filter sources based on search and filters
  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         source.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || source.type === filterType;
    const matchesStatus = filterStatus === "all" || source.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const getSourceIcon = (type: SourceType) => {
    switch (type) {
      case "rss": return <Rss className="h-5 w-5" />;
      case "web": return <Globe className="h-5 w-5" />;
      case "social": return <Twitter className="h-5 w-5" />;
      case "api": return <Database className="h-5 w-5" />;
      case "newsletter": return <Database className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: SourceStatus) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-gray-100 text-gray-800 border-gray-200";
      case "error": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: SourceStatus) => {
    switch (status) {
      case "active": return <CheckCircle className="h-4 w-4" />;
      case "inactive": return <Clock className="h-4 w-4" />;
      case "error": return <AlertCircle className="h-4 w-4" />;
      case "pending": return <RefreshCw className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const totalSources = sources.length;
  const activeSources = sources.filter(s => s.status === "active").length;
  const totalSignals = sources.reduce((sum, s) => sum + s.signalCount, 0);
  const errorSources = sources.filter(s => s.status === "error").length;

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
            <Button variant="outline">
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
                    <Input placeholder="Enter source name" />
                  </div>
                  <div>
                    <Label>Source Type</Label>
                    <Select>
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
                    <Input placeholder="Enter source URL" />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Optional description" />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">Add Source</Button>
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
                          {source.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {source.description}
                            </p>
                          )}
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
                            <span>{source.signalCount} signals</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              Updated {new Date(source.lastUpdated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Categories and Keywords */}
                      <div className="space-y-2">
                        {source.categories.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">Categories:</span>
                            <div className="flex flex-wrap gap-1">
                              {source.categories.map((category) => (
                                <Badge key={category} variant="secondary" className="text-xs">
                                  {category}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {source.keywords.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-gray-500">Keywords:</span>
                            <div className="flex flex-wrap gap-1">
                              {source.keywords.slice(0, 5).map((keyword) => (
                                <Badge key={keyword} variant="outline" className="text-xs">
                                  {keyword}
                                </Badge>
                              ))}
                              {source.keywords.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                  +{source.keywords.length - 5} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
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