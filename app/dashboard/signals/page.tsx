"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Zap,
  Target,
  Lightbulb,
  Radio,
  MessageSquare,
  Twitter,
  Linkedin,
  Globe,
  Heart,
  Repeat2,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  Star,
  Flag,
  Hash,
  ExternalLink,
  Bell,
  X,
  Archive,
  ArchiveRestore,
  Bookmark,
  BookmarkCheck,
  Link,
  Flame,
  Plus,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

const LIFECYCLE_OPTIONS = [
  { value: "weak", label: "Weak Signal", color: "bg-gray-100 text-gray-800" },
  { value: "emerging", label: "Emerging", color: "bg-blue-100 text-blue-800" },
  { value: "growing", label: "Growing", color: "bg-yellow-100 text-yellow-800" },
  { value: "mainstream", label: "Mainstream", color: "bg-green-100 text-green-800" },
  { value: "declining", label: "Declining", color: "bg-red-100 text-red-800" },
];

const STEEP_OPTIONS = [
  { value: "social", label: "Social", icon: "👥" },
  { value: "technological", label: "Technological", icon: "🔬" },
  { value: "economic", label: "Economic", icon: "💰" },
  { value: "environmental", label: "Environmental", icon: "🌍" },
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

interface RawMention {
  _id: string;
  _creationTime: number;
  author?: string;
  content?: string;
  contentHash?: string;
  duplicateOfMentionId?: string;
  externalId?: string;
  fetchedAt?: number;
  isDuplicate?: boolean;
  matchConfidence?: string;
  processed?: boolean;
  signal?: LocalSignal; // Populated when querying with signal data
  sentiment: number; // Synthetic sentiment added by query
}

// Helper interface for display purposes
interface MentionWithMetadata extends RawMention {
  sentimentLabel: "positive" | "negative" | "neutral";
  isImportant: boolean;
}

export default function SignalsDashboard() {
  const { isCollapsed } = useSidebar();
  const [activeTab, setActiveTab] = useState("signals");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLifecycle, setSelectedLifecycle] = useState<string[]>([]);
  const [selectedSteep, setSelectedSteep] = useState<string[]>([]);
  const [editingSignal, setEditingSignal] = useState<any | null>(null);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocalSignal | MentionWithMetadata | null>(null);

  // Form state for editing signals
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lifecycle: "",
    steep: [] as string[],
    confidence: 0.5,
    keywords: [] as string[],
  });

  // Additional state for new features
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [mergePrimarySignal, setMergePrimarySignal] = useState<LocalSignal | null>(null);
  const [mergeSecondarySignals, setMergeSecondarySignals] = useState<string[]>([]);
  const [mergeDescription, setMergeDescription] = useState("");
  const [savedSignalsOnly, setSavedSignalsOnly] = useState(false);
  const [showArchivedSignals, setShowArchivedSignals] = useState(false);
  const [viewTimeframe, setViewTimeframe] = useState("7d");

  // Mention-specific state
  const [mentionsFilter, setMentionsFilter] = useState<"all" | "processed" | "unprocessed" | "duplicates">("all");
  const [selectedMentions, setSelectedMentions] = useState<string[]>([]);
  const [editingMention, setEditingMention] = useState<any | null>(null);
  const [createMentionDialogOpen, setCreateMentionDialogOpen] = useState(false);
  const [mentionFormData, setMentionFormData] = useState({
    author: "",
    content: "",
    externalId: "",
    matchConfidence: "high",
  });

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    lifecycle: selectedLifecycle.length > 0 ? selectedLifecycle : undefined,
    steep: selectedSteep.length > 0 ? selectedSteep : undefined,
    search: searchTerm || undefined,
  });

  const signalStats = useQuery(api.signals.getSignalStats);

  // Additional queries for new features
  const trendingSignals = useQuery(api.signals.getTrendingSignals, {
    timeframe: viewTimeframe,
    limit: 5,
  });

  const savedSignals = useQuery(api.signals.getSavedSignals, {
    userId: "current-user", // Replace with actual user ID
    limit: 20,
  });

  const relatedSignals = useQuery(api.signals.getRelatedSignals,
    selectedItem && '_id' in selectedItem ? {
      signalId: selectedItem._id as any,
      limit: 5,
    } : "skip"
  );

  // Mutations
  const updateSignal = useMutation(api.signals.updateSignal);
  const deleteSignal = useMutation(api.signals.deleteSignal);
  const deleteSignals = useMutation(api.signals.deleteSignals);
  const updateSignalDescription = useMutation(api.signals.updateSignalDescription);
  const archiveSignal = useMutation(api.signals.archiveSignal);
  const restoreSignal = useMutation(api.signals.restoreSignal);
  const mergeSignals = useMutation(api.signals.mergeSignals);
  const toggleSaveSignal = useMutation(api.signals.toggleSaveSignal);
  const incrementViewCount = useMutation(api.signals.incrementViewCount);
  const recalculateMetrics = useMutation(api.signals.recalculateAllSignalMetrics);

  // Mention mutations
  const createRawMention = useMutation(api.mentions.createRawMention);
  const deleteMention = useMutation(api.mentions.deleteMention);
  const markAsDuplicate = useMutation(api.mentions.markAsDuplicate);
  const markMentionProcessed = useMutation(api.mentions.markMentionProcessed);
  const updateMentionContent = useMutation(api.mentions.updateMentionContent);

  // Query mentions based on filter
  const rawMentions = useQuery(
    mentionsFilter === "unprocessed"
      ? api.mentions.getUnprocessed
      : api.mentions.listMentions,
    { limit: 50 }
  );

  const unprocessedMentions = useQuery(api.mentions.getUnprocessed, { limit: 50 });

  // Transform mentions to include display metadata
  const mentions: MentionWithMetadata[] = rawMentions?.map((mention) => ({
    ...mention,
    sentimentLabel: mention.sentiment > 0.6 ? "positive" :
                   mention.sentiment < 0.4 ? "negative" : "neutral",
    isImportant: mention.sentiment > 0.7 || mention.sentiment < 0.3,
  })) || [];

  // Filter mentions based on selected filter
  const filteredMentions = mentions.filter(mention => {
    switch (mentionsFilter) {
      case "processed":
        return mention.processed === true;
      case "unprocessed":
        return mention.processed !== true;
      case "duplicates":
        return mention.isDuplicate === true;
      default:
        return true;
    }
  });


  const handleUpdateSignal = async () => {
    if (!editingSignal) return;

    try {
      await updateSignal({
        id: editingSignal._id as any,
        name: formData.name,
        description: formData.description,
        lifecycle: formData.lifecycle,
        steep: formData.steep,
        confidence: formData.confidence,
        keywords: formData.keywords,
      });

      toast.success("Signal updated successfully");
      setEditingSignal(null);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to update signal: ${error.message}`);
    }
  };

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
      toast.success(`${selectedSignals.length} signals deleted successfully`);
      setSelectedSignals([]);
    } catch (error: any) {
      toast.error(`Failed to delete signals: ${error.message}`);
    }
  };

  // New handler functions for additional features
  const handleArchiveSignal = async (signalId: string, reason?: string) => {
    try {
      await archiveSignal({ id: signalId as any, reason });
      toast.success("Signal archived successfully");
    } catch (error: any) {
      toast.error(`Failed to archive signal: ${error.message}`);
    }
  };

  const handleRestoreSignal = async (signalId: string) => {
    try {
      await restoreSignal({ id: signalId as any });
      toast.success("Signal restored successfully");
    } catch (error: any) {
      toast.error(`Failed to restore signal: ${error.message}`);
    }
  };

  const handleToggleSave = async (signalId: string) => {
    try {
      await toggleSaveSignal({ signalId: signalId as any, userId: "current-user" });
      toast.success("Signal save status updated");
    } catch (error: any) {
      toast.error(`Failed to update save status: ${error.message}`);
    }
  };

  const handleMergeSignals = async () => {
    if (!mergePrimarySignal || mergeSecondarySignals.length === 0) return;

    try {
      await mergeSignals({
        primaryId: mergePrimarySignal._id as any,
        secondaryIds: mergeSecondarySignals as any,
        newDescription: mergeDescription || undefined,
      });
      toast.success(`Successfully merged ${mergeSecondarySignals.length} signals`);
      setMergeDialogOpen(false);
      setMergePrimarySignal(null);
      setMergeSecondarySignals([]);
      setMergeDescription("");
    } catch (error: any) {
      toast.error(`Failed to merge signals: ${error.message}`);
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

  const handleViewSignal = async (signalId: string) => {
    try {
      await incrementViewCount({ id: signalId as any });
    } catch (error) {
      // Silently handle view count errors
      console.error("Failed to increment view count:", error);
    }
  };

  // Mention handler functions
  const handleCreateMention = async () => {
    if (!mentionFormData.content || !mentionFormData.author) return;

    try {
      await createRawMention({
        author: mentionFormData.author,
        content: mentionFormData.content,
        externalId: mentionFormData.externalId || undefined,
        matchConfidence: mentionFormData.matchConfidence,
        fetchedAt: Date.now(),
      });
      toast.success("Mention created successfully");
      setCreateMentionDialogOpen(false);
      setMentionFormData({ author: "", content: "", externalId: "", matchConfidence: "high" });
    } catch (error: any) {
      toast.error(`Failed to create mention: ${error.message}`);
    }
  };

  const handleDeleteMention = async (mentionId: string) => {
    try {
      await deleteMention({ id: mentionId as any });
      toast.success("Mention deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete mention: ${error.message}`);
    }
  };

  const handleMarkAsDuplicate = async (mentionId: string, duplicateOfMentionId?: string) => {
    try {
      await markAsDuplicate({
        id: mentionId as any,
        duplicateOfMentionId: duplicateOfMentionId as any
      });
      toast.success("Mention marked as duplicate");
    } catch (error: any) {
      toast.error(`Failed to mark as duplicate: ${error.message}`);
    }
  };

  const handleMarkMentionProcessed = async (mentionId: string, processed: boolean = true) => {
    try {
      await markMentionProcessed({ id: mentionId as any, processed });
      toast.success(processed ? "Mention marked as processed" : "Mention marked as unprocessed");
    } catch (error: any) {
      toast.error(`Failed to update mention status: ${error.message}`);
    }
  };

  const handleUpdateMention = async () => {
    if (!editingMention) return;

    try {
      await updateMentionContent({
        id: editingMention._id as any,
        content: mentionFormData.content || undefined,
        author: mentionFormData.author || undefined,
        matchConfidence: mentionFormData.matchConfidence || undefined,
      });
      toast.success("Mention updated successfully");
      setEditingMention(null);
      setMentionFormData({ author: "", content: "", externalId: "", matchConfidence: "high" });
    } catch (error: any) {
      toast.error(`Failed to update mention: ${error.message}`);
    }
  };

  const handleDeleteSelectedMentions = async () => {
    if (selectedMentions.length === 0) return;

    try {
      for (const mentionId of selectedMentions) {
        await deleteMention({ id: mentionId as any });
      }
      toast.success(`${selectedMentions.length} mentions deleted successfully`);
      setSelectedMentions([]);
    } catch (error: any) {
      toast.error(`Failed to delete mentions: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      lifecycle: "",
      steep: [],
      confidence: 0.5,
      keywords: [],
    });
  };

  const openEditDialog = (signal: any) => {
    setEditingSignal(signal);
    setFormData({
      name: signal.name,
      description: signal.description,
      lifecycle: signal.lifecycle,
      steep: signal.steep,
      confidence: signal.confidence,
      keywords: signal.keywords,
    });
  };

  const getLifecycleConfig = (lifecycle: string) => {
    return LIFECYCLE_OPTIONS.find(opt => opt.value === lifecycle) || LIFECYCLE_OPTIONS[0];
  };

  const getSteepIcon = (steep: string) => {
    const config = STEEP_OPTIONS.find(opt => opt.value === steep);
    return config?.icon || "📊";
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? "+" : "";
    return `${sign}${Math.round(growth * 100)}%`;
  };

  const getSourceIcon = (source: string) => {
    switch (source.toLowerCase()) {
      case "twitter": return <Twitter className="h-4 w-4" />;
      case "linkedin": return <Linkedin className="h-4 w-4" />;
      case "reddit": return <MessageSquare className="h-4 w-4" />;
      case "news": return <Globe className="h-4 w-4" />;
      case "blog": return <Globe className="h-4 w-4" />;
      case "forum": return <MessageSquare className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentimentLabel: "positive" | "negative" | "neutral") => {
    switch (sentimentLabel) {
      case "positive": return "bg-green-500/10 text-green-300 border-green-500/20";
      case "negative": return "bg-red-500/10 text-red-300 border-red-500/20";
      case "neutral": return "bg-gray-500/10 text-gray-300 border-gray-500/20";
      default: return "bg-gray-500/10 text-gray-300 border-gray-500/20";
    }
  };

  const handleItemClick = (item: LocalSignal | MentionWithMetadata) => {
    setSelectedItem(item);
    setSidePanelOpen(true);

    // Increment view count for signals
    if ('lifecycle' in item && item._id) {
      handleViewSignal(item._id);
    }
  };


  // Show loading only if data is actually loading, not just undefined
  const isLoading = signals === undefined && signalStats === undefined;

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64",
      sidePanelOpen ? "right-96" : "right-0"
    )}>
      <div className="p-6 space-y-6 h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Radio className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Signals & Mentions</h1>
              <p className="text-sm text-[#a3a3a3]">
                Monitor innovation signals and brand mentions
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signalStats?.total || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Total Signals</h3>
            <p className="text-xs text-[#666]">All tracked signals</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signalStats?.byLifecycle?.emerging || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Emerging</h3>
            <p className="text-xs text-[#666]">Early stage signals</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <Zap className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signalStats?.byLifecycle?.growing || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Growing</h3>
            <p className="text-xs text-[#666]">Gaining momentum</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signalStats?.byLifecycle?.mainstream || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Mainstream</h3>
            <p className="text-xs text-[#666]">Established trends</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-[#a3a3a3]" />
              <h3 className="text-lg font-semibold text-[#f5f5f5]">Filters</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleRecalculateMetrics}
                className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Recalculate Metrics
              </Button>
              {selectedSignals.length >= 2 && (
                <Button
                  size="sm"
                  onClick={() => {
                    if (signals && signals.length > 0) {
                      setMergePrimarySignal(signals.find(s => s._id === selectedSignals[0]) || null);
                      setMergeSecondarySignals(selectedSignals.slice(1));
                      setMergeDialogOpen(true);
                    }
                  }}
                  className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                >
                  <Link className="h-4 w-4 mr-1" />
                  Merge Selected ({selectedSignals.length})
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search" className="text-[#f5f5f5]">Search Signals</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#666]" />
                <Input
                  id="search"
                  placeholder="Search by name or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#f5f5f5]">Lifecycle Stage</Label>
              <Select
                value={selectedLifecycle.length === 1 ? selectedLifecycle[0] : "all"}
                onValueChange={(value) => setSelectedLifecycle(value === "all" ? [] : [value])}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="all" className="text-[#f5f5f5] focus:bg-white/10">All stages</SelectItem>
                  {LIFECYCLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[#f5f5f5] focus:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#f5f5f5]">STEEP Category</Label>
              <Select
                value={selectedSteep.length === 1 ? selectedSteep[0] : "all"}
                onValueChange={(value) => setSelectedSteep(value === "all" ? [] : [value])}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="all" className="text-[#f5f5f5] focus:bg-white/10">All categories</SelectItem>
                  {STEEP_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[#f5f5f5] focus:bg-white/10">
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#f5f5f5]">View Options</Label>
              <div className="flex items-center space-x-4 pt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="saved-only"
                    checked={savedSignalsOnly}
                    onCheckedChange={(checked) => setSavedSignalsOnly(!!checked)}
                    className="border-white/10"
                  />
                  <Label htmlFor="saved-only" className="text-sm text-[#a3a3a3]">Saved only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-archived"
                    checked={showArchivedSignals}
                    onCheckedChange={(checked) => setShowArchivedSignals(!!checked)}
                    className="border-white/10"
                  />
                  <Label htmlFor="show-archived" className="text-sm text-[#a3a3a3]">Show archived</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Signals Section */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Flame className="h-5 w-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-[#f5f5f5]">Trending Signals</h3>
            </div>
            <Select
              value={viewTimeframe}
              onValueChange={setViewTimeframe}
            >
              <SelectTrigger className="w-24 bg-white/5 border-white/10 text-[#f5f5f5]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                <SelectItem value="1d" className="text-[#f5f5f5] focus:bg-white/10">1d</SelectItem>
                <SelectItem value="7d" className="text-[#f5f5f5] focus:bg-white/10">7d</SelectItem>
                <SelectItem value="30d" className="text-[#f5f5f5] focus:bg-white/10">30d</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {trendingSignals?.map((signal, index) => (
              <div
                key={signal._id}
                className="p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 hover:bg-orange-500/20 transition-standard cursor-pointer"
                onClick={() => handleItemClick(signal as LocalSignal)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-orange-400 bg-orange-500/20 px-2 py-1 rounded">
                    #{index + 1}
                  </span>
                  <TrendingUp className="h-4 w-4 text-orange-400" />
                </div>
                <h4 className="font-medium text-[#f5f5f5] mb-1 line-clamp-2">{signal.name}</h4>
                <div className="flex items-center justify-between text-xs text-[#a3a3a3]">
                  <span>{signal.mentionCount} mentions</span>
                  <span className="text-orange-400">+{Math.round((signal.growth || 0) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="signals" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Radio className="h-4 w-4 mr-2" />
              Signals
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <BookmarkCheck className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
            <TabsTrigger value="mentions" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mentions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signals" className="space-y-6 mt-6">
            {/* Signals Table */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#f5f5f5]">Innovation Signals</h3>
            {selectedSignals.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-standard"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Delete ({selectedSignals.length})</span>
              </button>
            )}
          </div>

          {signals && signals.length > 0 ? (
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[#a3a3a3] w-12">
                      <Checkbox
                        checked={selectedSignals.length === signals.length && signals.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSignals(signals.map(s => s._id));
                          } else {
                            setSelectedSignals([]);
                          }
                        }}
                        className="border-white/10"
                      />
                    </TableHead>
                    <TableHead className="text-[#a3a3a3]">Signal</TableHead>
                    <TableHead className="text-[#a3a3a3]">Lifecycle</TableHead>
                    <TableHead className="text-[#a3a3a3]">STEEP</TableHead>
                    <TableHead className="text-[#a3a3a3]">Confidence</TableHead>
                    <TableHead className="text-[#a3a3a3]">Mentions</TableHead>
                    <TableHead className="text-[#a3a3a3]">Growth</TableHead>
                    <TableHead className="text-[#a3a3a3]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.map((signal) => {
                    const lifecycleConfig = getLifecycleConfig(signal.lifecycle);

                    return (
                      <TableRow
                        key={signal._id}
                        className="border-white/5 hover:bg-white/5 cursor-pointer"
                        onClick={() => handleItemClick(signal)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedSignals.includes(signal._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSignals(prev => [...prev, signal._id]);
                              } else {
                                setSelectedSignals(prev => prev.filter(id => id !== signal._id));
                              }
                            }}
                            className="border-white/10"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#f5f5f5]">{signal.name}</p>
                            <p className="text-sm text-[#a3a3a3] line-clamp-2">
                              {signal.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {lifecycleConfig.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {signal.steep?.map((category) => (
                              <span key={category} className="text-lg">
                                {getSteepIcon(category)}
                              </span>
                            )) || <span className="text-[#666]">-</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20">
                            {formatConfidence(signal.confidence)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-[#f5f5f5]">{signal.mentionCount || 0}</span>
                            <div className="text-xs text-[#666]">
                              {signal.sourceCount || 0} sources
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {signal.growth > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : signal.growth < 0 ? (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            ) : (
                              <Activity className="h-4 w-4 text-[#666]" />
                            )}
                            <span className="text-sm text-[#f5f5f5]">
                              {formatGrowth(signal.growth)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleSave(signal._id);
                              }}
                              className="p-1.5 rounded text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-standard"
                              title="Save/Unsave Signal"
                            >
                              <Bookmark className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleArchiveSignal(signal._id);
                              }}
                              className="p-1.5 rounded text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 transition-standard"
                              title="Archive Signal"
                            >
                              <Archive className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditDialog(signal);
                              }}
                              className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5 transition-standard"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSignal(signal._id);
                              }}
                              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-standard"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-[#666] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-2">No signals found</h3>
              <p className="text-[#a3a3a3] mb-4">
                {searchTerm || selectedLifecycle.length > 0 || selectedSteep.length > 0
                  ? "Try adjusting your filters or search terms"
                  : "Create your first innovation signal to get started"
                }
              </p>
            </div>
          )}
        </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6 mt-6">
            {/* Saved Signals */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f5f5f5]">Saved Signals</h3>
                <div className="text-sm text-[#a3a3a3]">
                  {savedSignals?.length || 0} saved signals
                </div>
              </div>

              {savedSignals && savedSignals.length > 0 ? (
                <div className="border border-white/5 rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="border-white/5">
                        <TableHead className="text-[#a3a3a3]">Signal</TableHead>
                        <TableHead className="text-[#a3a3a3]">Lifecycle</TableHead>
                        <TableHead className="text-[#a3a3a3]">STEEP</TableHead>
                        <TableHead className="text-[#a3a3a3]">Confidence</TableHead>
                        <TableHead className="text-[#a3a3a3]">Mentions</TableHead>
                        <TableHead className="text-[#a3a3a3]">Growth</TableHead>
                        <TableHead className="text-[#a3a3a3]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {savedSignals.map((signal) => {
                        const lifecycleConfig = getLifecycleConfig(signal.lifecycle);

                        return (
                          <TableRow
                            key={signal._id}
                            className="border-white/5 hover:bg-white/5 cursor-pointer"
                            onClick={() => handleItemClick(signal)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <BookmarkCheck className="h-4 w-4 text-yellow-400" />
                                <div>
                                  <p className="font-medium text-[#f5f5f5]">{signal.name}</p>
                                  <p className="text-sm text-[#a3a3a3] line-clamp-2">
                                    {signal.description}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                {lifecycleConfig.label}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-1">
                                {signal.steep?.map((category) => (
                                  <span key={category} className="text-lg">
                                    {getSteepIcon(category)}
                                  </span>
                                )) || <span className="text-[#666]">-</span>}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20">
                                {formatConfidence(signal.confidence)}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="text-[#f5f5f5]">{signal.mentionCount || 0}</span>
                                <div className="text-xs text-[#666]">
                                  {signal.sourceCount || 0} sources
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                {signal.growth > 0 ? (
                                  <TrendingUp className="h-4 w-4 text-green-400" />
                                ) : signal.growth < 0 ? (
                                  <TrendingDown className="h-4 w-4 text-red-400" />
                                ) : (
                                  <Activity className="h-4 w-4 text-[#666]" />
                                )}
                                <span className="text-sm text-[#f5f5f5]">
                                  {formatGrowth(signal.growth)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleSave(signal._id);
                                  }}
                                  className="p-1.5 rounded text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 transition-standard"
                                  title="Remove from Saved"
                                >
                                  <BookmarkCheck className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(signal);
                                  }}
                                  className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5 transition-standard"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <BookmarkCheck className="h-12 w-12 text-[#666] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#f5f5f5] mb-2">No saved signals</h3>
                  <p className="text-[#a3a3a3] mb-4">
                    Save signals from the main signals tab to view them here
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="mentions" className="space-y-6 mt-6">
            {/* Mentions Header and Controls */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f5f5f5]">Brand Mentions</h3>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => setCreateMentionDialogOpen(true)}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Create Mention
                  </Button>
                  {selectedMentions.length > 0 && (
                    <Button
                      size="sm"
                      onClick={handleDeleteSelectedMentions}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete ({selectedMentions.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Filter Controls */}
              <div className="flex items-center gap-4 mb-4">
                <div>
                  <Label className="text-[#f5f5f5] text-sm">Filter by Status</Label>
                  <Select value={mentionsFilter} onValueChange={setMentionsFilter}>
                    <SelectTrigger className="w-48 bg-white/5 border-white/10 text-[#f5f5f5]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                      <SelectItem value="all" className="text-[#f5f5f5] focus:bg-white/10">All Mentions</SelectItem>
                      <SelectItem value="unprocessed" className="text-[#f5f5f5] focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Unprocessed ({unprocessedMentions?.length || 0})
                        </div>
                      </SelectItem>
                      <SelectItem value="processed" className="text-[#f5f5f5] focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Processed
                        </div>
                      </SelectItem>
                      <SelectItem value="duplicates" className="text-[#f5f5f5] focus:bg-white/10">
                        <div className="flex items-center gap-2">
                          <Archive className="h-4 w-4" />
                          Duplicates
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-[#a3a3a3]">
                  Showing {filteredMentions.length} of {mentions.length} mentions
                </div>
              </div>
            </div>

            {/* Mentions List */}
            <div className="space-y-4">
              {filteredMentions.length > 0 ? (
                filteredMentions.map((mention) => (
                  <div
                    key={mention._id}
                    className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 hover:bg-white/5 transition-standard"
                  >
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedMentions.includes(mention._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedMentions(prev => [...prev, mention._id]);
                              } else {
                                setSelectedMentions(prev => prev.filter(id => id !== mention._id));
                              }
                            }}
                            className="border-white/10 mt-1"
                          />
                          <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                            <MessageSquare className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-[#f5f5f5]">{mention.author || "Unknown Author"}</h3>
                              {mention.isImportant && (
                                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                              {mention.isDuplicate && (
                                <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Duplicate</Badge>
                              )}
                              {mention.processed && (
                                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Processed</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                              <span>Raw Mention</span>
                              <span>•</span>
                              <span>{new Date(mention.fetchedAt || mention._creationTime).toLocaleDateString()}</span>
                              {mention.signal && (
                                <>
                                  <span>•</span>
                                  <span className="text-blue-300">Related to: {mention.signal.name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={cn("px-2 py-1 rounded text-xs font-medium border", getSentimentColor(mention.sentimentLabel))}>
                            {mention.sentimentLabel}
                          </div>
                          <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {Math.round(mention.sentiment * 100)}%
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="pl-16">
                        <p className="text-[#f5f5f5] leading-relaxed line-clamp-3 mb-3">
                          {mention.content || "No content available"}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleItemClick(mention)}
                            className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Details
                          </Button>

                          {!mention.processed && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkMentionProcessed(mention._id, true)}
                              className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Mark Processed
                            </Button>
                          )}

                          {mention.processed && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkMentionProcessed(mention._id, false)}
                              className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                            >
                              <Clock className="h-4 w-4 mr-1" />
                              Mark Unprocessed
                            </Button>
                          )}

                          {!mention.isDuplicate && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkAsDuplicate(mention._id)}
                              className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                            >
                              <Archive className="h-4 w-4 mr-1" />
                              Mark Duplicate
                            </Button>
                          )}

                          <Button
                            size="sm"
                            onClick={() => {
                              setEditingMention(mention);
                              setMentionFormData({
                                author: mention.author || "",
                                content: mention.content || "",
                                externalId: mention.externalId || "",
                                matchConfidence: mention.matchConfidence || "high",
                              });
                            }}
                            className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>

                          <Button
                            size="sm"
                            onClick={() => handleDeleteMention(mention._id)}
                            className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-[#666] mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-[#f5f5f5] mb-2">No mentions found</h3>
                  <p className="text-[#a3a3a3] mb-4">
                    {mentionsFilter !== "all"
                      ? `No ${mentionsFilter} mentions available`
                      : "Create your first mention to get started"
                    }
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Side Panel */}
      {sidePanelOpen && selectedItem && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-50">
          <div className="p-6 h-full overflow-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f5f5f5]">
                {'source' in selectedItem ? 'Mention Details' : 'Signal Details'}
              </h2>
              <button
                onClick={() => setSidePanelOpen(false)}
                className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5 transition-standard"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            {'author' in selectedItem || 'content' in selectedItem ? (
              // Mention Details
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Author & Metadata</h3>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      <MessageSquare className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-[#f5f5f5]">{(selectedItem as MentionWithMetadata).author || "Unknown Author"}</p>
                      <p className="text-sm text-[#a3a3a3]">Raw Mention</p>
                      <p className="text-xs text-[#666]">
                        {new Date((selectedItem as MentionWithMetadata).fetchedAt || (selectedItem as MentionWithMetadata)._creationTime).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Content</h3>
                  <p className="text-[#f5f5f5] leading-relaxed whitespace-pre-wrap">
                    {(selectedItem as MentionWithMetadata).content || "No content available"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Status</h3>
                    <div className="space-y-2">
                      {(selectedItem as MentionWithMetadata).processed && (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Processed</Badge>
                      )}
                      {(selectedItem as MentionWithMetadata).isDuplicate && (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Duplicate</Badge>
                      )}
                      {(selectedItem as MentionWithMetadata).isImportant && (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">Important</Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Match Confidence</h3>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 w-fit">
                      {(selectedItem as MentionWithMetadata).matchConfidence || "Unknown"}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Sentiment Analysis</h3>
                  <div className="flex items-center gap-4">
                    <div className={cn("px-2 py-1 rounded text-xs font-medium border", getSentimentColor((selectedItem as MentionWithMetadata).sentimentLabel))}>
                      {(selectedItem as MentionWithMetadata).sentimentLabel}
                    </div>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {Math.round((selectedItem as MentionWithMetadata).sentiment * 100)}% confidence
                    </div>
                  </div>
                </div>

                {(selectedItem as MentionWithMetadata).signal && (
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Related Signal</h3>
                    <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                      <p className="font-medium text-[#f5f5f5]">{(selectedItem as MentionWithMetadata).signal!.name}</p>
                      <p className="text-sm text-[#a3a3a3] mt-1">{(selectedItem as MentionWithMetadata).signal!.description}</p>
                    </div>
                  </div>
                )}

                {(selectedItem as MentionWithMetadata).externalId && (
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">External ID</h3>
                    <p className="text-sm text-[#f5f5f5] font-mono bg-white/5 px-2 py-1 rounded">
                      {(selectedItem as MentionWithMetadata).externalId}
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingMention(selectedItem);
                      setMentionFormData({
                        author: (selectedItem as MentionWithMetadata).author || "",
                        content: (selectedItem as MentionWithMetadata).content || "",
                        externalId: (selectedItem as MentionWithMetadata).externalId || "",
                        matchConfidence: (selectedItem as MentionWithMetadata).matchConfidence || "high",
                      });
                    }}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Mention
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => handleDeleteMention((selectedItem as MentionWithMetadata)._id)}
                    className="bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            ) : (
              // Signal Details
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Name</h3>
                  <p className="font-medium text-[#f5f5f5]">{(selectedItem as LocalSignal).name}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Description</h3>
                  <p className="text-[#f5f5f5] leading-relaxed">{(selectedItem as LocalSignal).description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Lifecycle</h3>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 w-fit">
                      {getLifecycleConfig((selectedItem as LocalSignal).lifecycle).label}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Confidence</h3>
                    <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20 w-fit">
                      {formatConfidence((selectedItem as LocalSignal).confidence)}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">STEEP Categories</h3>
                  <div className="flex space-x-1">
                    {(selectedItem as LocalSignal).steep.map((category) => (
                      <span key={category} className="text-lg">
                        {getSteepIcon(category)}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Metrics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Mentions:</span>
                      <span className="text-[#f5f5f5]">{(selectedItem as LocalSignal).mentionCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Sources:</span>
                      <span className="text-[#f5f5f5]">{(selectedItem as LocalSignal).sourceCount || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#a3a3a3]">Growth:</span>
                      <span className={cn("flex items-center gap-1",
                        (selectedItem as LocalSignal).growth > 0 ? "text-green-400" :
                        (selectedItem as LocalSignal).growth < 0 ? "text-red-400" : "text-[#666]"
                      )}>
                        {(selectedItem as LocalSignal).growth > 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (selectedItem as LocalSignal).growth < 0 ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                        {formatGrowth((selectedItem as LocalSignal).growth)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Related Signals */}
                {relatedSignals && relatedSignals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-[#a3a3a3] mb-3">Related Signals</h3>
                    <div className="space-y-2">
                      {relatedSignals.map((relatedSignal) => (
                        <div
                          key={relatedSignal._id}
                          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 cursor-pointer transition-standard"
                          onClick={() => handleItemClick(relatedSignal as LocalSignal)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-[#f5f5f5] text-sm mb-1">{relatedSignal.name}</p>
                              <p className="text-xs text-[#a3a3a3] line-clamp-2 mb-2">{relatedSignal.description}</p>
                              <div className="flex items-center gap-2">
                                <div className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                  {getLifecycleConfig(relatedSignal.lifecycle).label}
                                </div>
                                <span className="text-xs text-[#666]">
                                  {relatedSignal.mentionCount || 0} mentions
                                </span>
                              </div>
                            </div>
                            <div className="ml-2">
                              {relatedSignal.growth > 0 ? (
                                <TrendingUp className="h-3 w-3 text-green-400" />
                              ) : relatedSignal.growth < 0 ? (
                                <TrendingDown className="h-3 w-3 text-red-400" />
                              ) : (
                                <Activity className="h-3 w-3 text-[#666]" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                  <Button
                    size="sm"
                    onClick={() => handleToggleSave((selectedItem as LocalSignal)._id)}
                    className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/30"
                  >
                    <Bookmark className="h-4 w-4 mr-1" />
                    Save Signal
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleArchiveSignal((selectedItem as LocalSignal)._id)}
                    className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
                  >
                    <Archive className="h-4 w-4 mr-1" />
                    Archive
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => openEditDialog(selectedItem)}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Signal
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Signal Dialog */}
      {editingSignal && (
        <Dialog open={!!editingSignal} onOpenChange={() => setEditingSignal(null)}>
          <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f5]">Edit Signal</DialogTitle>
              <DialogDescription className="text-[#a3a3a3]">
                Update the signal details and properties
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-[#f5f5f5]">Signal Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter signal name"
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-[#f5f5f5]">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the signal"
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingSignal(null)}
                className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSignal}
                disabled={!formData.name || !formData.lifecycle}
                className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
              >
                Update Signal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Create Mention Dialog */}
      {createMentionDialogOpen && (
        <Dialog open={createMentionDialogOpen} onOpenChange={() => setCreateMentionDialogOpen(false)}>
          <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f5]">Create New Mention</DialogTitle>
              <DialogDescription className="text-[#a3a3a3]">
                Add a new mention to track and analyze
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mention-author" className="text-[#f5f5f5]">Author</Label>
                  <Input
                    id="mention-author"
                    value={mentionFormData.author}
                    onChange={(e) => setMentionFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name"
                    className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                  />
                </div>
                <div>
                  <Label htmlFor="mention-external-id" className="text-[#f5f5f5]">External ID</Label>
                  <Input
                    id="mention-external-id"
                    value={mentionFormData.externalId}
                    onChange={(e) => setMentionFormData(prev => ({ ...prev, externalId: e.target.value }))}
                    placeholder="External reference ID (optional)"
                    className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="mention-content" className="text-[#f5f5f5]">Content</Label>
                <Textarea
                  id="mention-content"
                  value={mentionFormData.content}
                  onChange={(e) => setMentionFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the mention content..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
              <div>
                <Label className="text-[#f5f5f5]">Match Confidence</Label>
                <Select
                  value={mentionFormData.matchConfidence}
                  onValueChange={(value) => setMentionFormData(prev => ({ ...prev, matchConfidence: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                    <SelectItem value="high" className="text-[#f5f5f5] focus:bg-white/10">High</SelectItem>
                    <SelectItem value="medium" className="text-[#f5f5f5] focus:bg-white/10">Medium</SelectItem>
                    <SelectItem value="low" className="text-[#f5f5f5] focus:bg-white/10">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateMentionDialogOpen(false)}
                className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateMention}
                disabled={!mentionFormData.content || !mentionFormData.author}
                className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
              >
                Create Mention
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Mention Dialog */}
      {editingMention && (
        <Dialog open={!!editingMention} onOpenChange={() => setEditingMention(null)}>
          <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f5]">Edit Mention</DialogTitle>
              <DialogDescription className="text-[#a3a3a3]">
                Update the mention details and content
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-mention-author" className="text-[#f5f5f5]">Author</Label>
                  <Input
                    id="edit-mention-author"
                    value={mentionFormData.author}
                    onChange={(e) => setMentionFormData(prev => ({ ...prev, author: e.target.value }))}
                    placeholder="Enter author name"
                    className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-mention-external-id" className="text-[#f5f5f5]">External ID</Label>
                  <Input
                    id="edit-mention-external-id"
                    value={mentionFormData.externalId}
                    onChange={(e) => setMentionFormData(prev => ({ ...prev, externalId: e.target.value }))}
                    placeholder="External reference ID (optional)"
                    className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-mention-content" className="text-[#f5f5f5]">Content</Label>
                <Textarea
                  id="edit-mention-content"
                  value={mentionFormData.content}
                  onChange={(e) => setMentionFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the mention content..."
                  rows={4}
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
              <div>
                <Label className="text-[#f5f5f5]">Match Confidence</Label>
                <Select
                  value={mentionFormData.matchConfidence}
                  onValueChange={(value) => setMentionFormData(prev => ({ ...prev, matchConfidence: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                    <SelectItem value="high" className="text-[#f5f5f5] focus:bg-white/10">High</SelectItem>
                    <SelectItem value="medium" className="text-[#f5f5f5] focus:bg-white/10">Medium</SelectItem>
                    <SelectItem value="low" className="text-[#f5f5f5] focus:bg-white/10">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingMention(null)}
                className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateMention}
                disabled={!mentionFormData.content || !mentionFormData.author}
                className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
              >
                Update Mention
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Merge Signals Dialog */}
      {mergeDialogOpen && mergePrimarySignal && (
        <Dialog open={mergeDialogOpen} onOpenChange={() => setMergeDialogOpen(false)}>
          <DialogContent className="max-w-3xl glass bg-[#0a0a0a]/95 border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f5]">Merge Signals</DialogTitle>
              <DialogDescription className="text-[#a3a3a3]">
                Merge multiple signals into "{mergePrimarySignal.name}". Secondary signals will be archived.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">Primary Signal (will keep this)</h4>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-[#f5f5f5]">{mergePrimarySignal.name}</p>
                      <p className="text-sm text-[#a3a3a3] mt-1">{mergePrimarySignal.description}</p>
                    </div>
                    <div className="ml-4 text-sm text-blue-300">
                      {mergePrimarySignal.mentionCount || 0} mentions
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#f5f5f5] mb-2">
                  Signals to merge ({mergeSecondarySignals.length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {signals?.filter(signal => mergeSecondarySignals.includes(signal._id)).map((signal) => (
                    <div key={signal._id} className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-[#f5f5f5] text-sm">{signal.name}</p>
                          <p className="text-xs text-[#a3a3a3] mt-1 line-clamp-2">{signal.description}</p>
                        </div>
                        <div className="ml-4 text-sm text-orange-300">
                          {signal.mentionCount || 0} mentions
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="merge-description" className="text-[#f5f5f5]">
                  Updated Description (optional)
                </Label>
                <Textarea
                  id="merge-description"
                  value={mergeDescription}
                  onChange={(e) => setMergeDescription(e.target.value)}
                  placeholder="Enter an updated description for the merged signal..."
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
                <p className="text-xs text-[#666] mt-1">
                  Leave empty to keep the primary signal's current description
                </p>
              </div>

              <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-300">Important</p>
                    <p className="text-xs text-[#a3a3a3] mt-1">
                      This action will merge all mentions and metrics into the primary signal.
                      Secondary signals will be archived and cannot be recovered without database access.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setMergeDialogOpen(false);
                  setMergePrimarySignal(null);
                  setMergeSecondarySignals([]);
                  setMergeDescription("");
                }}
                className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMergeSignals}
                disabled={mergeSecondarySignals.length === 0}
                className="bg-orange-500/20 border border-orange-500/30 text-orange-300 hover:bg-orange-500/30"
              >
                <Link className="h-4 w-4 mr-1" />
                Merge {mergeSecondarySignals.length} Signals
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}