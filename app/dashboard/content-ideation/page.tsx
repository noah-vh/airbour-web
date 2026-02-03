"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import {
  Search,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Brain,
  Zap,
  Radio,
  TrendingUp,
  MessageSquare,
  Edit3,
  List,
  Eye,
  Save,
  BarChart3,
  FileText,
  RefreshCw,
  Loader2,
  Calendar,
  Activity,
  Target,
  ChevronDown,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { PlatformPreview } from "@/components/content/PlatformPreview";

type WorkflowStage = "select" | "ideas" | "outline" | "content";
type Platform = "linkedin" | "twitter" | "instagram" | "blog" | "medium" | "youtube" | "tiktok" | "youtube_shorts" | "ig_reels";
type ContentFormat = "Article" | "Thread" | "Post" | "Video" | "Short Video";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "twitter", label: "Twitter", icon: "🐦" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "blog", label: "Blog", icon: "📝" },
  { value: "medium", label: "Medium", icon: "📰" },
  { value: "youtube", label: "YouTube", icon: "🎥" },
  { value: "tiktok", label: "TikTok", icon: "🎵" },
  { value: "youtube_shorts", label: "YouTube Shorts", icon: "▶️" },
  { value: "ig_reels", label: "IG Reels", icon: "📹" },
];

const CONTENT_FORMATS: ContentFormat[] = ["Article", "Thread", "Post", "Video", "Short Video"];

const STEEP_CATEGORIES = [
  { value: "social", label: "Social", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { value: "technological", label: "Tech", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "economic", label: "Economic", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { value: "environmental", label: "Enviro", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "political", label: "Political", color: "bg-orange-500/10 text-orange-400 border-orange-500/20" },
];

export default function ContentIdeationPage() {
  const { isCollapsed } = useSidebar();

  // Workflow state
  const [currentStage, setCurrentStage] = useState<WorkflowStage>("select");
  const [selectedSignalIds, setSelectedSignalIds] = useState<Id<"signals">[]>([]);
  const [selectedMentionIds, setSelectedMentionIds] = useState<Id<"raw_mentions">[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("linkedin");
  const [selectedFormats, setSelectedFormats] = useState<ContentFormat[]>(["Article", "Thread", "Post"]);

  // Content state
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<Id<"content_ideas"> | null>(null);
  const [currentDraftId, setCurrentDraftId] = useState<Id<"content_drafts"> | null>(null);
  const [currentDraft, setCurrentDraft] = useState<any>(null);

  // Loading states
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);

  // Refs for auto-scroll
  const contentSectionRef = useRef<HTMLDivElement>(null);

  // Filter state - Signals
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("");
  const [filterSteep, setFilterSteep] = useState<string[]>([]);
  const [filterConfidence, setFilterConfidence] = useState<string>("");
  const [filterDateRange, setFilterDateRange] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"signals" | "mentions">("signals");

  // Filter state - Ideas
  const [ideaSearchTerm, setIdeaSearchTerm] = useState("");
  const [ideaFilterFormat, setIdeaFilterFormat] = useState<string>("");
  const [ideaSortBy, setIdeaSortBy] = useState<string>("newest");

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    search: searchTerm || undefined,
    lifecycle: filterLifecycle ? [filterLifecycle] : undefined,
    steep: filterSteep.length > 0 ? filterSteep : undefined,
  });

  const mentions = useQuery(api.mentions.listMentions, {
    limit: 50,
  });

  // Load existing ideas from database for persistence
  const existingIdeas = useQuery(api.contentIdeas.list, { limit: 50 });

  // Populate generatedIdeas from database on load (for persistence)
  useEffect(() => {
    if (existingIdeas && existingIdeas.length > 0 && generatedIdeas.length === 0) {
      setGeneratedIdeas(existingIdeas);
    }
  }, [existingIdeas]);

  // Actions
  const generateIdeasAction = useAction(api.actions.contentGeneration.generateContentIdeas);
  const generateOutlineAction = useAction(api.actions.contentGeneration.generateContentOutline);
  const generateContentAction = useAction(api.actions.contentGeneration.generateFullContent);
  const enhanceContentAction = useAction(api.actions.contentGeneration.enhanceContent);

  // Handlers
  const handleSignalSelect = (signalId: Id<"signals">) => {
    setSelectedSignalIds(prev =>
      prev.includes(signalId)
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
    );
  };

  const handleMentionSelect = (mentionId: Id<"raw_mentions">) => {
    setSelectedMentionIds(prev =>
      prev.includes(mentionId)
        ? prev.filter(id => id !== mentionId)
        : [...prev, mentionId]
    );
  };

  const toggleFormat = (format: ContentFormat) => {
    setSelectedFormats(prev =>
      prev.includes(format)
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  const toggleSteepFilter = (steep: string) => {
    setFilterSteep(prev =>
      prev.includes(steep)
        ? prev.filter(s => s !== steep)
        : [...prev, steep]
    );
  };

  const generateIdeas = async () => {
    if (selectedSignalIds.length === 0 && selectedMentionIds.length === 0) {
      toast.error("Please select at least one signal or mention");
      return;
    }

    if (selectedFormats.length === 0) {
      toast.error("Please select at least one content format");
      return;
    }

    setIsGeneratingIdeas(true);
    try {
      const result = await generateIdeasAction({
        signalIds: selectedSignalIds,
        mentionIds: selectedMentionIds,
        contentFormats: selectedFormats,
        numberOfIdeas: 5,
      });

      setGeneratedIdeas(prev => [...result.ideas, ...prev]);
      toast.success(`Generated ${result.ideas.length} new content ideas!`);
    } catch (error: any) {
      toast.error(`Failed to generate ideas: ${error.message}`);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdea = async (ideaId: Id<"content_ideas">) => {
    setSelectedIdeaId(ideaId);
  };

  const advanceToOutline = async () => {
    if (!selectedIdeaId) {
      toast.error("Please select an idea first");
      return;
    }

    setIsGeneratingOutline(true);
    try {
      const result = await generateOutlineAction({
        contentIdeaId: selectedIdeaId,
        platform: selectedPlatform,
      });

      const outlineDraft = { ...result.outline, draftId: result.draftId };
      setCurrentDraftId(result.draftId);
      setCurrentDraft(outlineDraft);
      setCurrentStage("outline");
      toast.success("Outline generated successfully!");

      // Automatically proceed to content generation
      setIsGeneratingOutline(false);
      await advanceToContentAfterOutline(result.draftId, outlineDraft);
    } catch (error: any) {
      toast.error(`Failed to generate outline: ${error.message}`);
      setIsGeneratingOutline(false);
    }
  };

  const advanceToContentAfterOutline = async (draftId: Id<"content_drafts">, outlineDraft: any) => {
    setIsGeneratingContent(true);
    try {
      toast.info("Generating full content...");
      const result = await generateContentAction({
        draftId: draftId,
      });

      console.log("Content generation result:", result);
      console.log("Outline draft:", outlineDraft);

      // Update the draft with the generated content
      const updatedDraft = {
        ...outlineDraft,
        content: result.content,
        metrics: result.metrics,
      };

      console.log("Updated draft with content:", updatedDraft);
      setCurrentDraft(updatedDraft);
      setCurrentStage("content");
      toast.success("Content generated successfully!");

      // Auto-scroll to content section
      setTimeout(() => {
        contentSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error: any) {
      console.error("Content generation error:", error);
      toast.error(`Failed to generate content: ${error.message}`);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const advanceToContent = async () => {
    if (!currentDraftId) {
      toast.error("No draft available");
      return;
    }

    setIsGeneratingContent(true);
    try {
      const result = await generateContentAction({
        draftId: currentDraftId,
      });

      setCurrentDraft((prev: any) => ({ ...prev, content: result.content, metrics: result.metrics }));
      setCurrentStage("content");
      toast.success("Content generated successfully!");
    } catch (error: any) {
      toast.error(`Failed to generate content: ${error.message}`);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const enhanceContent = async (enhancementType: string) => {
    if (!currentDraftId) return;

    setIsEnhancing(true);
    try {
      const result = await enhanceContentAction({
        draftId: currentDraftId,
        enhancementType: enhancementType as any,
      });

      setCurrentDraft((prev: any) => ({ ...prev, content: result.enhancedContent }));
      toast.success("Content enhanced!");
    } catch (error: any) {
      toast.error(`Enhancement failed: ${error.message}`);
    } finally {
      setIsEnhancing(false);
    }
  };

  const getLifecycleConfig = (lifecycle: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      weak: { label: "Weak", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
      emerging: { label: "Emerging", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      growing: { label: "Growing", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
      mainstream: { label: "Mainstream", color: "bg-green-500/10 text-green-400 border-green-500/20" },
      declining: { label: "Declining", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    return configs[lifecycle] || configs.weak;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-400";
    if (confidence >= 0.6) return "text-yellow-400";
    if (confidence >= 0.4) return "text-orange-400";
    return "text-red-400";
  };

  const getGrowthIndicator = (growth: number) => {
    if (growth > 0.05) return { icon: "↑", color: "text-green-400" };
    if (growth < -0.05) return { icon: "↓", color: "text-red-400" };
    return { icon: "→", color: "text-gray-400" };
  };

  // Filter signals by confidence
  const filteredSignals = signals?.filter(signal => {
    if (filterConfidence === "high" && signal.confidence < 0.7) return false;
    if (filterConfidence === "medium" && (signal.confidence < 0.4 || signal.confidence >= 0.7)) return false;
    if (filterConfidence === "low" && signal.confidence >= 0.4) return false;

    if (filterDateRange === "today") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (signal.createdAt < today.getTime()) return false;
    } else if (filterDateRange === "week") {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      if (signal.createdAt < weekAgo) return false;
    } else if (filterDateRange === "month") {
      const monthAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
      if (signal.createdAt < monthAgo) return false;
    }

    return true;
  });

  // Filter and sort ideas
  const filteredIdeas = generatedIdeas
    .filter(idea => {
      if (ideaSearchTerm && !idea.hook?.toLowerCase().includes(ideaSearchTerm.toLowerCase()) &&
          !idea.description?.toLowerCase().includes(ideaSearchTerm.toLowerCase())) {
        return false;
      }
      if (ideaFilterFormat && idea.format !== ideaFilterFormat) {
        return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (ideaSortBy === "newest") return (b.createdAt || 0) - (a.createdAt || 0);
      if (ideaSortBy === "oldest") return (a.createdAt || 0) - (b.createdAt || 0);
      if (ideaSortBy === "format") return (a.format || "").localeCompare(b.format || "");
      return 0;
    });

  // Get source signals for an idea
  const getSourceSignalsForIdea = (idea: any) => {
    if (!idea.sourceSignalIds || !signals) return [];
    return signals.filter((s: any) => idea.sourceSignalIds.includes(s._id));
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="p-6 h-full">
        {/* Main Content - Two Columns (1/3 - 2/3 split) */}
        <div className="flex gap-6 h-full">
          {/* Left Column - Signals (1/3 width) */}
          <div className="w-1/3 flex-shrink-0 flex flex-col space-y-4">
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-[#f5f5f5]">Signals</h2>
                  <span className="text-xs text-[#555]">({filteredSignals?.length || 0})</span>
                </div>
                <span className="text-xs text-purple-400 font-medium">{selectedSignalIds.length} selected</span>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-white/10 bg-white/5 text-sm text-[#f5f5f5] placeholder-[#555] transition-standard focus:border-purple-500/50 focus:bg-white/10"
                  placeholder="Search signals..."
                />
              </div>

              {/* Inline Filters Row 1: Dropdowns */}
              <div className="flex gap-2 mb-2">
                <select
                  value={filterLifecycle}
                  onChange={(e) => setFilterLifecycle(e.target.value)}
                  className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#a3a3a3] hover:border-white/20 transition-standard cursor-pointer"
                >
                  <option value="">Stage</option>
                  <option value="weak">Weak</option>
                  <option value="emerging">Emerging</option>
                  <option value="growing">Growing</option>
                  <option value="mainstream">Mainstream</option>
                  <option value="declining">Declining</option>
                </select>
                <select
                  value={filterConfidence}
                  onChange={(e) => setFilterConfidence(e.target.value)}
                  className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#a3a3a3] hover:border-white/20 transition-standard cursor-pointer"
                >
                  <option value="">Confidence</option>
                  <option value="high">High 70%+</option>
                  <option value="medium">Med 40-70%</option>
                  <option value="low">Low &lt;40%</option>
                </select>
                <select
                  value={filterDateRange}
                  onChange={(e) => setFilterDateRange(e.target.value)}
                  className="flex-1 bg-transparent border border-white/10 rounded-lg px-2 py-1.5 text-xs text-[#a3a3a3] hover:border-white/20 transition-standard cursor-pointer"
                >
                  <option value="">Date</option>
                  <option value="today">Today</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                </select>
              </div>

              {/* Inline Filters Row 2: STEEP Categories */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {STEEP_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => toggleSteepFilter(cat.value)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-standard",
                      filterSteep.includes(cat.value)
                        ? cat.color
                        : "text-[#666] hover:text-[#888] hover:bg-white/5"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
                {(filterLifecycle || filterSteep.length > 0 || filterConfidence || filterDateRange) && (
                  <button
                    onClick={() => {
                      setFilterLifecycle("");
                      setFilterSteep([]);
                      setFilterConfidence("");
                      setFilterDateRange("");
                    }}
                    className="px-2 py-1 text-[11px] text-purple-400/70 hover:text-purple-400 transition-standard"
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* Signals List */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {filteredSignals && filteredSignals.length > 0 ? filteredSignals.map((signal: any) => {
                  const isSelected = selectedSignalIds.includes(signal._id);
                  const lifecycleConfig = getLifecycleConfig(signal.lifecycle);
                  const growthIndicator = getGrowthIndicator(signal.growth);

                  return (
                    <div
                      key={signal._id}
                      onClick={() => handleSignalSelect(signal._id)}
                      className={cn(
                        "p-4 rounded-xl border transition-standard cursor-pointer",
                        isSelected
                          ? "bg-purple-500/20 border-purple-500/30 ring-1 ring-purple-500/20"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      {/* Header: Checkbox + Title */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                          isSelected ? "bg-purple-500 border-purple-500" : "border-[#444] hover:border-[#666]"
                        )}>
                          {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-[#f5f5f5] leading-snug">{signal.name}</h4>
                        </div>
                      </div>

                      {/* Description */}
                      {signal.description && (
                        <p className="text-xs text-[#888] leading-relaxed line-clamp-2 mb-3 pl-8">{signal.description}</p>
                      )}

                      {/* Lifecycle & STEEP Driver Row */}
                      <div className="flex items-center gap-4 mb-3 pl-8">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wide text-[#555]">Stage</span>
                          <span className={cn("px-2 py-0.5 rounded-md text-xs font-medium border", lifecycleConfig.color)}>
                            {lifecycleConfig.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase tracking-wide text-[#555]">Driver</span>
                          {signal.steep?.map((cat: string) => {
                            const steepConfig = STEEP_CATEGORIES.find(s => s.value === cat);
                            return (
                              <span key={cat} className={cn("px-2 py-0.5 rounded-md text-xs font-medium border", steepConfig?.color || "bg-white/5 text-[#888] border-white/10")}>
                                {steepConfig?.label || cat}
                              </span>
                            );
                          })}
                        </div>
                        {signal.hasUpdate && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                            New
                          </span>
                        )}
                      </div>

                      {/* Keywords */}
                      {signal.keywords && signal.keywords.length > 0 && (
                        <div className="pl-8 mb-3">
                          <div className="flex flex-wrap gap-1.5">
                            {signal.keywords.slice(0, 5).map((keyword: string, idx: number) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-white/5 text-[11px] text-[#888] border border-white/5">
                                {keyword}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Bottom Stats Row */}
                      <div className="flex items-center gap-4 pl-8 text-[11px] text-[#666]">
                        <span className={cn("font-medium", getConfidenceColor(signal.confidence))}>
                          {Math.round(signal.confidence * 100)}% confidence
                        </span>
                        <span className="text-[#444]">•</span>
                        <span>{signal.mentionCount} mentions</span>
                        <span className="text-[#444]">•</span>
                        <span>{formatDate(signal.createdAt)}</span>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-12 text-sm text-[#666]">
                    {signals === undefined ? "Loading signals..." : "No signals match your filters"}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Content Ideation (2/3 width) */}
          <div className="flex-1 flex flex-col space-y-4">
            {/* Content Ideation Toolbar */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <Brain className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-[#f5f5f5]">Content Ideation</h1>
                    <p className="text-xs text-[#a3a3a3]">
                      <span className="text-blue-400">{selectedSignalIds.length}</span> signals selected
                    </p>
                  </div>
                </div>

                <div className="h-8 w-px bg-white/10 hidden sm:block" />

                {/* Format Selector */}
                <div className="flex items-center gap-2 flex-wrap">
                  {CONTENT_FORMATS.map((format) => {
                    const isSelected = selectedFormats.includes(format);
                    return (
                      <button
                        key={format}
                        onClick={() => toggleFormat(format)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg border text-xs font-medium transition-standard",
                          isSelected
                            ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                            : "bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
                        )}
                      >
                        {format}
                      </button>
                    );
                  })}
                </div>

                <div className="flex-1" />

                {/* Generate Button */}
                <button
                  onClick={generateIdeas}
                  disabled={isGeneratingIdeas || selectedSignalIds.length === 0 || selectedFormats.length === 0}
                  className="glass bg-purple-500/20 border border-purple-500/30 rounded-lg px-5 py-2.5 transition-standard hover:bg-purple-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingIdeas ? (
                    <>
                      <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                      <span className="text-sm font-medium text-purple-300">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Generate</span>
                    </>
                  )}
                </button>

                {/* Create Outline Button */}
                <button
                  onClick={advanceToOutline}
                  disabled={isGeneratingOutline || !selectedIdeaId}
                  className="glass bg-orange-500/20 border border-orange-500/30 rounded-lg px-5 py-2.5 transition-standard hover:bg-orange-500/30 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingOutline ? (
                    <>
                      <Loader2 className="h-4 w-4 text-orange-400 animate-spin" />
                      <span className="text-sm font-medium text-orange-300">Creating...</span>
                    </>
                  ) : (
                    <>
                      <List className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-300">Create Outline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Ideas Section */}
            <div className="flex-1 overflow-y-auto space-y-4">
              {generatedIdeas.length > 0 ? (
                <>
                  {/* Ideas Filter Bar */}
                  <div className="flex items-center gap-3">
                    {/* Search Ideas */}
                    <div className="relative flex-1 max-w-xs">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-[#555]" />
                      <input
                        value={ideaSearchTerm}
                        onChange={(e) => setIdeaSearchTerm(e.target.value)}
                        className="w-full h-8 pl-9 pr-3 rounded-lg border border-white/10 bg-white/5 text-xs text-[#f5f5f5] placeholder-[#555] transition-standard focus:border-purple-500/50"
                        placeholder="Search ideas..."
                      />
                    </div>

                    {/* Filter by Format */}
                    <select
                      value={ideaFilterFormat}
                      onChange={(e) => setIdeaFilterFormat(e.target.value)}
                      className="h-8 bg-transparent border border-white/10 rounded-lg px-2 text-xs text-[#a3a3a3] hover:border-white/20 transition-standard cursor-pointer"
                    >
                      <option value="">All Formats</option>
                      {CONTENT_FORMATS.map(format => (
                        <option key={format} value={format}>{format}</option>
                      ))}
                    </select>

                    {/* Sort By */}
                    <select
                      value={ideaSortBy}
                      onChange={(e) => setIdeaSortBy(e.target.value)}
                      className="h-8 bg-transparent border border-white/10 rounded-lg px-2 text-xs text-[#a3a3a3] hover:border-white/20 transition-standard cursor-pointer"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="format">By Format</option>
                    </select>

                    <div className="flex-1" />

                    <span className="text-xs text-[#555]">{filteredIdeas.length} of {generatedIdeas.length} ideas</span>

                    <button
                      onClick={() => setGeneratedIdeas([])}
                      className="text-xs text-[#555] hover:text-red-400 transition-standard"
                    >
                      Clear All
                    </button>
                  </div>

                  {/* Ideas Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredIdeas.map((idea: any) => {
                      const sourceSignals = getSourceSignalsForIdea(idea);
                      return (
                        <div
                          key={idea._id}
                          onClick={() => selectIdea(idea._id)}
                          className={cn(
                            "glass border rounded-xl p-4 transition-standard cursor-pointer",
                            selectedIdeaId === idea._id
                              ? "bg-purple-500/20 border-purple-500/30 ring-1 ring-purple-500/50"
                              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          )}
                        >
                          {/* Header */}
                          <div className="flex items-start gap-3 mb-3">
                            <div className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                              selectedIdeaId === idea._id ? "bg-purple-500 border-purple-500" : "border-[#444] hover:border-[#666]"
                            )}>
                              {selectedIdeaId === idea._id && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  {idea.format}
                                </span>
                                {idea.createdAt && (
                                  <span className="text-[10px] text-[#555]">{formatDate(idea.createdAt)}</span>
                                )}
                              </div>
                              <h4 className="text-sm font-semibold text-[#f5f5f5] leading-snug">{idea.hook}</h4>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-[#888] leading-relaxed line-clamp-2 mb-3 pl-8">{idea.description}</p>

                          {/* Angle */}
                          <div className="text-xs text-purple-300/80 italic mb-3 pl-8">"{idea.angle}"</div>

                          {/* Source Signals */}
                          {sourceSignals.length > 0 && (
                            <div className="pl-8 mb-2">
                              <span className="text-[10px] uppercase tracking-wide text-[#555] mb-1.5 block">Based on {sourceSignals.length} signal{sourceSignals.length > 1 ? 's' : ''}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {sourceSignals.slice(0, 3).map((signal: any) => {
                                  const lifecycleConfig = getLifecycleConfig(signal.lifecycle);
                                  const steepConfig = STEEP_CATEGORIES.find(s => signal.steep?.includes(s.value));
                                  return (
                                    <div key={signal._id} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
                                      <span className={cn("w-1.5 h-1.5 rounded-full", lifecycleConfig.color.includes("blue") ? "bg-blue-400" : lifecycleConfig.color.includes("yellow") ? "bg-yellow-400" : lifecycleConfig.color.includes("green") ? "bg-green-400" : lifecycleConfig.color.includes("red") ? "bg-red-400" : "bg-gray-400")} />
                                      <span className="text-[10px] text-[#a3a3a3] truncate max-w-[120px]">{signal.name}</span>
                                    </div>
                                  );
                                })}
                                {sourceSignals.length > 3 && (
                                  <span className="text-[10px] text-[#555] px-2 py-1">+{sourceSignals.length - 3} more</span>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Bottom Stats */}
                          <div className="flex items-center gap-3 pl-8 text-[10px] text-[#555]">
                            {idea.targetAudience && (
                              <>
                                <span>Audience: {idea.targetAudience}</span>
                                <span className="text-[#333]">•</span>
                              </>
                            )}
                            {idea.keyMessages && idea.keyMessages.length > 0 && (
                              <span>{idea.keyMessages.length} key messages</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-12 flex flex-col items-center justify-center text-center min-h-[300px]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 mb-4">
                    <Lightbulb className="h-8 w-8 text-purple-400/50" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">No Ideas Generated Yet</h3>
                  <p className="text-sm text-[#666] max-w-md">
                    Select signals from the left panel, choose your content formats, then click "Generate Ideas" to create content suggestions.
                  </p>
                </div>
              )}

              {/* Section 3: Outline (shown when draft with outline exists) */}
              {currentDraft && currentDraft.sections && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
                        <List className="h-4 w-4 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#f5f5f5]">Content Outline</h3>
                        <p className="text-sm text-[#a3a3a3]">Review and edit the structure</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {currentDraft.sections?.map((section: any, idx: number) => (
                        <div key={idx} className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                          <h4 className="text-sm font-semibold text-[#f5f5f5] mb-2">{section.title}</h4>
                          <ul className="space-y-1">
                            {section.keyPoints.map((point: string, pidx: number) => (
                              <li key={pidx} className="text-xs text-[#a3a3a3] flex items-start gap-2">
                                <span className="text-purple-400 mt-1">•</span>
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end mt-6">
                      <button
                        onClick={advanceToContent}
                        disabled={isGeneratingContent}
                        className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-6 py-2 transition-standard hover:bg-purple-500/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGeneratingContent ? (
                          <>
                            <Loader2 className="h-4 w-4 text-purple-400 animate-spin" />
                            <span className="text-sm text-purple-300">Generating...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-purple-300">Generate Content</span>
                            <ArrowRight className="h-4 w-4 text-purple-400" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">Platform Settings</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-[#f5f5f5] block mb-2">Target Platform</label>
                        <select
                          value={selectedPlatform}
                          onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                          className="w-full glass bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f5f5f5] transition-standard hover:bg-white/10"
                        >
                          {PLATFORMS.map((platform) => (
                            <option key={platform.value} value={platform.value}>
                              {platform.icon} {platform.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-[#f5f5f5] mb-2">Outline Preview</h4>
                        <div className="text-xs text-[#a3a3a3] whitespace-pre-wrap max-h-96 overflow-y-auto">
                          {currentDraft.structure}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section 4: Generated Content (shown when draft has content) */}
              {currentDraft && currentDraft.content && (
                <div ref={contentSectionRef} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                        <Edit3 className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[#f5f5f5]">Generated Content</h3>
                        <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
                          {currentDraft.metrics && (
                            <>
                              <span>{currentDraft.metrics.wordCount} words</span>
                              <span>•</span>
                              <span>{currentDraft.metrics.charCount} characters</span>
                              {currentDraft.metrics.estimatedReadTime && (
                                <>
                                  <span>•</span>
                                  <span>{currentDraft.metrics.estimatedReadTime} min read</span>
                                </>
                              )}
                              {currentDraft.metrics.estimatedDuration && (
                                <>
                                  <span>•</span>
                                  <span>{currentDraft.metrics.estimatedDuration}s video</span>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-blue-500/20 flex items-center gap-2"
                      >
                        <Save className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-300">Save Draft</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Content Editor */}
                    <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-semibold text-[#f5f5f5]">Content</h4>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => enhanceContent("improve_clarity")}
                            disabled={isEnhancing}
                            className="glass bg-purple-500/10 border border-purple-500/20 rounded px-3 py-1 text-xs text-purple-300 hover:bg-purple-500/20 transition-standard disabled:opacity-50"
                          >
                            {isEnhancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                      <textarea
                        value={currentDraft.content}
                        onChange={(e) => setCurrentDraft((prev: any) => ({ ...prev, content: e.target.value }))}
                        className="w-full h-[600px] rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm p-4 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10 resize-none font-mono"
                        placeholder="Generated content will appear here..."
                      />
                    </div>

                    {/* Platform Preview */}
                    <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                      <h4 className="text-sm font-semibold text-[#f5f5f5] mb-4">Platform Preview - {selectedPlatform}</h4>
                      <PlatformPreview content={currentDraft.content} platform={selectedPlatform} />
                    </div>
                  </div>

                  {/* Enhancement Options */}
                  <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-[#f5f5f5] mb-3">AI Enhancements</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                      {[
                        { type: "improve_clarity", label: "Improve Clarity", icon: Eye },
                        { type: "add_data", label: "Add Data", icon: BarChart3 },
                        { type: "strengthen_cta", label: "Strengthen CTA", icon: Zap },
                        { type: "adjust_tone", label: "Adjust Tone", icon: MessageSquare },
                        { type: "platform_optimize", label: "Platform Optimize", icon: RefreshCw },
                        { type: "add_hooks", label: "Add Hooks", icon: Sparkles },
                      ].map((enhancement) => {
                        const Icon = enhancement.icon;
                        return (
                          <button
                            key={enhancement.type}
                            onClick={() => enhanceContent(enhancement.type)}
                            disabled={isEnhancing}
                            className="glass bg-white/5 border border-white/10 rounded-lg p-3 transition-standard hover:bg-white/10 flex flex-col items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Icon className="h-4 w-4 text-[#a3a3a3]" />
                            <span className="text-xs text-[#f5f5f5] text-center">{enhancement.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
