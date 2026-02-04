"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery, useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import {
  Search,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Brain,
  Zap,
  Radio,
  Edit3,
  List,
  Eye,
  Save,
  BarChart3,
  FileText,
  RefreshCw,
  Loader2,
  MessageSquare,
  Check,
  ChevronRight,
  Layout,
  PenTool,
  Image,
  AlignLeft,
  Grid3X3,
  Film,
  Hash,
  FolderOpen,
  Clock,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { TeamMemberSelector, TeamMemberContext, buildVoiceContext } from "@/components/content/TeamMemberSelector";

type WizardStep = "ideas" | "overview" | "outline" | "content";
type Platform = "linkedin" | "twitter" | "instagram" | "blog" | "carousel" | "youtube" | "tiktok";
type ContentFormat = "Article" | "Thread" | "Post" | "Carousel" | "Video" | "Story";

const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "💼", formats: ["Article", "Post", "Carousel"] },
  { value: "twitter", label: "Twitter/X", icon: "𝕏", formats: ["Thread", "Post"] },
  { value: "instagram", label: "Instagram", icon: "📸", formats: ["Post", "Carousel", "Story"] },
  { value: "blog", label: "Blog", icon: "📝", formats: ["Article"] },
  { value: "youtube", label: "YouTube", icon: "🎥", formats: ["Video"] },
  { value: "tiktok", label: "TikTok", icon: "🎵", formats: ["Video"] },
];

const WIZARD_STEPS: { key: WizardStep; label: string; icon: any }[] = [
  { key: "ideas", label: "Select Idea", icon: Lightbulb },
  { key: "overview", label: "Overview", icon: FileText },
  { key: "outline", label: "Outline", icon: List },
  { key: "content", label: "Content", icon: PenTool },
];

const STEEP_CATEGORIES = [
  { value: "social", label: "Social", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
  { value: "technological", label: "Tech", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  { value: "economic", label: "Economic", color: "bg-green-500/10 text-green-400 border-green-500/20" },
  { value: "environmental", label: "Enviro", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "political", label: "Political", color: "bg-red-500/10 text-red-400 border-red-500/20" },
];

export default function ContentIdeationPage() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>("ideas");
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(new Set());

  // Selection state
  const [selectedSignalIds, setSelectedSignalIds] = useState<Id<"signals">[]>([]);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("linkedin");
  const [selectedFormat, setSelectedFormat] = useState<ContentFormat>("Article");
  const [selectedVoice, setSelectedVoice] = useState<TeamMemberContext | null>(null);

  // Content state
  const [generatedIdeas, setGeneratedIdeas] = useState<any[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<any | null>(null);
  const [overview, setOverview] = useState("");
  const [outline, setOutline] = useState<any[]>([]);
  const [finalContent, setFinalContent] = useState("");

  // For carousel/slides
  const [slides, setSlides] = useState<{ title: string; content: string }[]>([]);
  const [activeSlide, setActiveSlide] = useState(0);

  // Loading states
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("");
  const [filterSteep, setFilterSteep] = useState<string[]>([]);

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    search: searchTerm || undefined,
    lifecycle: filterLifecycle ? [filterLifecycle] : undefined,
    steep: filterSteep.length > 0 ? filterSteep : undefined,
  });

  const existingIdeas = useQuery(api.contentIdeas.list, { limit: 50 });

  // Populate ideas from database on load
  useEffect(() => {
    if (existingIdeas && existingIdeas.length > 0 && generatedIdeas.length === 0) {
      setGeneratedIdeas(existingIdeas);
    }
  }, [existingIdeas]);

  // Draft state
  const [currentDraftId, setCurrentDraftId] = useState<Id<"content_drafts"> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showDraftsModal, setShowDraftsModal] = useState(false);

  // Draft queries and mutations
  const existingDrafts = useQuery(api.contentDrafts.list, { limit: 20 });
  const createDraft = useMutation(api.contentDrafts.create);
  const updateDraft = useMutation(api.contentDrafts.update);

  // Actions
  const generateIdeasAction = useAction(api.actions.contentGeneration.generateContentIdeas);
  const generateOutlineAction = useAction(api.actions.contentGeneration.generateContentOutline);
  const generateContentAction = useAction(api.actions.contentGeneration.generateFullContent);

  // Get available formats for selected platform
  const availableFormats = PLATFORMS.find(p => p.value === selectedPlatform)?.formats || ["Article"];

  // Update format when platform changes
  useEffect(() => {
    if (!availableFormats.includes(selectedFormat)) {
      setSelectedFormat(availableFormats[0] as ContentFormat);
    }
  }, [selectedPlatform, availableFormats, selectedFormat]);

  // Handlers
  const handleSignalSelect = (signalId: Id<"signals">) => {
    setSelectedSignalIds(prev =>
      prev.includes(signalId)
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
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
    if (selectedSignalIds.length === 0) {
      toast.error("Please select at least one signal");
      return;
    }

    setIsGeneratingIdeas(true);
    try {
      const result = await generateIdeasAction({
        signalIds: selectedSignalIds,
        mentionIds: [],
        contentFormats: [selectedFormat],
        numberOfIdeas: 5,
        voiceContext: buildVoiceContext(selectedVoice),
      });

      setGeneratedIdeas(prev => [...result.ideas, ...prev]);
      toast.success(`Generated ${result.ideas.length} new content ideas!`);
    } catch (error: any) {
      toast.error(`Failed to generate ideas: ${error.message}`);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  const selectIdeaAndContinue = async (idea: any) => {
    setSelectedIdea(idea);
    setCompletedSteps(prev => new Set([...prev, "ideas"]));
    setCurrentStep("overview");

    // Reset draft ID for new idea (will be created on first save)
    setCurrentDraftId(null);
    setLastSaved(null);

    // Auto-generate overview
    await generateOverview(idea);
  };

  const generateOverview = async (idea: any) => {
    setIsGeneratingOverview(true);
    try {
      // Generate a summary paragraph based on the idea
      const overviewText = `${idea.hook}\n\n${idea.description}\n\nKey angle: ${idea.angle}`;
      setOverview(overviewText);
      toast.success("Overview generated!");
    } catch (error: any) {
      toast.error(`Failed to generate overview: ${error.message}`);
    } finally {
      setIsGeneratingOverview(false);
    }
  };

  const continueToOutline = async () => {
    if (!overview.trim()) {
      toast.error("Please add an overview first");
      return;
    }

    // Save overview before continuing
    await saveDraft("overview");

    setCompletedSteps(prev => new Set([...prev, "overview"]));
    setCurrentStep("outline");

    // Generate outline based on format
    await generateOutline();
  };

  const generateOutline = async () => {
    if (!selectedIdea) return;

    setIsGeneratingOutline(true);
    try {
      const result = await generateOutlineAction({
        contentIdeaId: selectedIdea._id,
        platform: selectedPlatform,
        voiceContext: buildVoiceContext(selectedVoice),
      });

      // Parse sections for outline
      if (result.outline?.sections) {
        setOutline(result.outline.sections);
      }

      // For carousel/slides format, also prepare slide structure
      if (selectedFormat === "Carousel" || selectedFormat === "Story") {
        const slideCount = selectedFormat === "Story" ? 5 : 8;
        const newSlides = result.outline?.sections?.map((s: any, i: number) => ({
          title: s.title || `Slide ${i + 1}`,
          content: s.keyPoints?.join("\n") || "",
        })) || Array.from({ length: slideCount }, (_, i) => ({
          title: `Slide ${i + 1}`,
          content: "",
        }));
        setSlides(newSlides);
      }

      toast.success("Outline generated!");
    } catch (error: any) {
      toast.error(`Failed to generate outline: ${error.message}`);
    } finally {
      setIsGeneratingOutline(false);
    }
  };

  const continueToContent = async () => {
    // Save outline before continuing
    await saveDraft("outline");

    setCompletedSteps(prev => new Set([...prev, "outline"]));
    setCurrentStep("content");

    // Generate final content
    await generateFinalContent();
  };

  const generateFinalContent = async () => {
    setIsGeneratingContent(true);
    try {
      // For now, combine overview and outline into content
      // In production, this would call the actual content generation API
      let content = "";

      if (selectedFormat === "Carousel" || selectedFormat === "Story") {
        // For carousel, generate slide-by-slide content
        const generatedSlides = slides.map((slide, i) => ({
          title: slide.title,
          content: outline[i]?.keyPoints?.join("\n\n") || slide.content || `Content for slide ${i + 1}...`,
        }));
        setSlides(generatedSlides);
        content = generatedSlides.map(s => `## ${s.title}\n${s.content}`).join("\n\n---\n\n");
      } else if (selectedFormat === "Thread") {
        // Generate thread format
        content = outline.map((section, i) =>
          `${i + 1}/${outline.length} ${section.title}\n\n${section.keyPoints?.join("\n\n")}`
        ).join("\n\n---\n\n");
      } else {
        // Article/Post format
        content = `# ${selectedIdea?.hook || "Title"}\n\n${overview}\n\n${outline.map(s =>
          `## ${s.title}\n${s.keyPoints?.join("\n\n")}`
        ).join("\n\n")}`;
      }

      setFinalContent(content);
      setCompletedSteps(prev => new Set([...prev, "content"]));
      toast.success("Content generated!");
    } catch (error: any) {
      toast.error(`Failed to generate content: ${error.message}`);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  // Save draft function
  const saveDraft = useCallback(async (stage: "overview" | "outline" | "content") => {
    if (!selectedIdea) return;

    setIsSaving(true);
    try {
      // Map format to content type
      const contentTypeMap: Record<string, "article" | "thread" | "post" | "newsletter" | "whitepaper" | "video_script" | "short_video_script"> = {
        "Article": "article",
        "Thread": "thread",
        "Post": "post",
        "Carousel": "post", // Carousel is a type of post
        "Video": "video_script",
        "Story": "short_video_script",
      };

      // Map platform
      const platformMap: Record<string, "linkedin" | "twitter" | "instagram" | "blog" | "medium" | "youtube" | "tiktok" | "youtube_shorts" | "ig_reels"> = {
        "linkedin": "linkedin",
        "twitter": "twitter",
        "instagram": "instagram",
        "blog": "blog",
        "youtube": "youtube",
        "tiktok": "tiktok",
      };

      // Prepare overview object
      const overviewObj = overview ? {
        hook: selectedIdea.hook || "",
        angle: selectedIdea.angle || "",
        description: overview,
        targetAudience: selectedIdea.targetAudience || "General audience",
        keyMessages: selectedIdea.keyMessages || [],
        generatedAt: Date.now(),
      } : undefined;

      // Prepare outline object
      const outlineObj = outline.length > 0 ? {
        sections: outline.map(s => ({
          title: s.title || "",
          keyPoints: s.keyPoints || [],
          examples: s.examples,
          estimatedLength: s.estimatedLength,
        })),
        structure: selectedFormat,
        generatedAt: Date.now(),
      } : undefined;

      // Prepare content object
      const contentObj = finalContent ? {
        fullText: finalContent,
        formattedText: finalContent,
        wordCount: finalContent.split(/\s+/).length,
        characterCount: finalContent.length,
        estimatedReadTime: Math.ceil(finalContent.split(/\s+/).length / 200),
        generatedAt: Date.now(),
      } : undefined;

      if (currentDraftId) {
        // Update existing draft
        await updateDraft({
          id: currentDraftId,
          stage,
          overview: overviewObj,
          outline: outlineObj,
          content: contentObj,
        });
      } else {
        // Create new draft
        const draftId = await createDraft({
          title: selectedIdea.hook || "Untitled Draft",
          contentType: contentTypeMap[selectedFormat] || "article",
          platform: platformMap[selectedPlatform],
          stage,
          overview: overviewObj,
          outline: outlineObj,
          content: contentObj,
          sourceSignalIds: selectedSignalIds,
          sourceMentionIds: [],
          aiModel: "claude-3-5-sonnet",
          totalTokensUsed: 0,
          generationCost: 0,
          createdBy: "user",
        });
        setCurrentDraftId(draftId);
      }

      setLastSaved(new Date());
      toast.success("Draft saved!");
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [selectedIdea, overview, outline, finalContent, selectedFormat, selectedPlatform, selectedSignalIds, currentDraftId, createDraft, updateDraft]);

  // Load a draft
  const loadDraft = (draft: any) => {
    // Map content type back to format
    const contentTypeToFormat: Record<string, ContentFormat> = {
      "article": "Article",
      "thread": "Thread",
      "post": "Post",
      "video_script": "Video",
      "short_video_script": "Story",
    };

    const format = draft.outline?.structure || contentTypeToFormat[draft.contentType] || "Article";

    setSelectedIdea({
      _id: draft._id,
      hook: draft.title,
      description: draft.overview?.description || "",
      angle: draft.overview?.angle || "",
      format: format,
      targetAudience: draft.overview?.targetAudience,
      keyMessages: draft.overview?.keyMessages,
    });

    // Set platform first
    if (draft.platform) {
      setSelectedPlatform(draft.platform as Platform);
    }

    // Set format
    setSelectedFormat(format as ContentFormat);

    if (draft.overview) {
      setOverview(draft.overview.description || "");
      setCompletedSteps(prev => new Set([...prev, "ideas"]));
    }

    if (draft.outline?.sections) {
      setOutline(draft.outline.sections);
      setCompletedSteps(prev => new Set([...prev, "ideas", "overview"]));

      // For carousel/slides, populate slides
      if (format === "Carousel" || format === "Story") {
        setSlides(draft.outline.sections.map((s: any, i: number) => ({
          title: s.title || `Slide ${i + 1}`,
          content: s.keyPoints?.join("\n") || "",
        })));
      }
    }

    if (draft.content?.fullText) {
      setFinalContent(draft.content.fullText);
      setCompletedSteps(prev => new Set([...prev, "ideas", "overview", "outline"]));
    }

    setCurrentDraftId(draft._id);
    setShowDraftsModal(false);
    setLastSaved(draft.updatedAt ? new Date(draft.updatedAt) : null);

    // Navigate to the appropriate step
    if (draft.content?.fullText) {
      setCurrentStep("content");
    } else if (draft.outline?.sections?.length > 0) {
      setCurrentStep("outline");
    } else if (draft.overview) {
      setCurrentStep("overview");
    } else {
      setCurrentStep("ideas");
    }

    toast.success("Draft loaded!");
  };

  // Start fresh
  const startNewDraft = () => {
    setCurrentDraftId(null);
    setSelectedIdea(null);
    setOverview("");
    setOutline([]);
    setFinalContent("");
    setSlides([]);
    setCompletedSteps(new Set());
    setCurrentStep("ideas");
    setLastSaved(null);
  };

  const goToStep = (step: WizardStep) => {
    const stepIndex = WIZARD_STEPS.findIndex(s => s.key === step);
    const currentIndex = WIZARD_STEPS.findIndex(s => s.key === currentStep);

    // Allow going back or to completed steps
    if (stepIndex < currentIndex || completedSteps.has(step)) {
      setCurrentStep(step);
    }
  };

  const getLifecycleConfig = (lifecycle: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      weak: { label: "Weak", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
      emerging: { label: "Emerging", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      growing: { label: "Growing", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case "ideas":
        return (
          <div className="space-y-4">
            {/* Generate Ideas Button */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Select a Content Idea</h3>
                <p className="text-sm text-muted-foreground/60">Choose an idea to develop into content</p>
              </div>
              <button
                onClick={generateIdeas}
                disabled={isGeneratingIdeas || selectedSignalIds.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingIdeas ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Ideas
                  </>
                )}
              </button>
            </div>

            {/* Ideas List */}
            {generatedIdeas.length > 0 ? (
              <div className="grid gap-3">
                {generatedIdeas.map((idea: any) => (
                  <div
                    key={idea._id}
                    onClick={() => selectIdeaAndContinue(idea)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-colors",
                      selectedIdea?._id === idea._id
                        ? "bg-purple-500/20 border-purple-500/30"
                        : "bg-muted border hover:bg-muted/80 hover:border/80"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                        selectedIdea?._id === idea._id ? "bg-purple-500 border-purple-500" : "border"
                      )}>
                        {selectedIdea?._id === idea._id && <Check className="h-3 w-3 text-white" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {idea.format}
                          </span>
                          {idea.createdAt && (
                            <span className="text-[10px] text-muted-foreground/50">{formatDate(idea.createdAt)}</span>
                          )}
                        </div>
                        <h4 className="text-sm font-semibold text-foreground mb-1">{idea.hook}</h4>
                        <p className="text-xs text-muted-foreground/80 line-clamp-2">{idea.description}</p>
                        <p className="text-xs text-purple-300/70 italic mt-2">"{idea.angle}"</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60 flex-shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Lightbulb className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-foreground mb-2">No Ideas Yet</h4>
                <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
                  Select signals from the left panel, then click "Generate Ideas" to create content suggestions.
                </p>
              </div>
            )}
          </div>
        );

      case "overview":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Overview</h3>
                <p className="text-sm text-muted-foreground/60">A general summary describing your content</p>
              </div>
              <button
                onClick={() => selectedIdea && generateOverview(selectedIdea)}
                disabled={isGeneratingOverview}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingOverview ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </button>
            </div>

            {/* Selected Idea Summary */}
            {selectedIdea && (
              <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-medium text-purple-300">Selected Idea</span>
                </div>
                <p className="text-sm text-foreground">{selectedIdea.hook}</p>
              </div>
            )}

            {/* Overview Editor */}
            <div>
              <label className="text-sm font-medium text-foreground block mb-2">Overview Content</label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                rows={8}
                className="w-full rounded-lg border bg-muted p-4 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-purple-500/50 resize-none"
                placeholder="Write or edit your overview here..."
              />
            </div>

            {/* Continue Button */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => saveDraft("overview")}
                disabled={!overview.trim() || isSaving}
                className="px-4 py-2 rounded-lg bg-muted border text-muted-foreground hover:bg-muted/80 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              <button
                onClick={continueToOutline}
                disabled={!overview.trim() || isGeneratingOutline}
                className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue to Outline
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        );

      case "outline":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedFormat === "Carousel" || selectedFormat === "Story" ? "Slides Outline" : "Content Outline"}
                </h3>
                <p className="text-sm text-muted-foreground/60">
                  Structure your {selectedFormat.toLowerCase()} content
                </p>
              </div>
              <button
                onClick={generateOutline}
                disabled={isGeneratingOutline}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isGeneratingOutline ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerate
              </button>
            </div>

            {/* Format-specific outline */}
            {selectedFormat === "Carousel" || selectedFormat === "Story" ? (
              /* Carousel/Slides View */
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Grid3X3 className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-foreground">
                    {slides.length} Slides
                  </span>
                </div>
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={cn(
                      "p-4 rounded-lg border transition-colors cursor-pointer",
                      activeSlide === index
                        ? "bg-blue-500/20 border-blue-500/30"
                        : "bg-muted border hover:border/80"
                    )}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded bg-white/10 text-xs font-medium text-foreground">
                        {index + 1}
                      </div>
                      <input
                        value={slide.title}
                        onChange={(e) => {
                          e.stopPropagation();
                          const newSlides = [...slides];
                          newSlides[index].title = e.target.value;
                          setSlides(newSlides);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1 px-3 py-1.5 rounded border bg-muted text-sm font-medium text-foreground outline-none focus:border-blue-500/50"
                        placeholder={`Slide ${index + 1} title...`}
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const newSlides = slides.filter((_, i) => i !== index);
                          setSlides(newSlides);
                          if (activeSlide >= newSlides.length) {
                            setActiveSlide(Math.max(0, newSlides.length - 1));
                          }
                        }}
                        className="text-xs text-red-400/50 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <textarea
                      value={slide.content}
                      onChange={(e) => {
                        e.stopPropagation();
                        const newSlides = [...slides];
                        newSlides[index].content = e.target.value;
                        setSlides(newSlides);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      rows={3}
                      className="w-full px-3 py-2 rounded border bg-muted text-xs text-muted-foreground outline-none focus:border-blue-500/50 resize-none"
                      placeholder="Slide content/key points..."
                    />
                  </div>
                ))}
                <button
                  onClick={() => setSlides([...slides, { title: `Slide ${slides.length + 1}`, content: "" }])}
                  className="w-full p-3 rounded-lg border border-dashed border/80 text-sm text-muted-foreground/60 hover:border/60 hover:text-muted-foreground/80 transition-colors"
                >
                  + Add Slide
                </button>
              </div>
            ) : selectedFormat === "Thread" ? (
              /* Thread View */
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Hash className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-foreground">
                    {outline.length} Tweets
                  </span>
                  <button
                    onClick={() => setOutline([...outline, { title: "", keyPoints: [""] }])}
                    className="ml-auto text-xs text-blue-400 hover:text-blue-300"
                  >
                    + Add Tweet
                  </button>
                </div>
                {outline.map((section, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted border hover:border/80 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium text-blue-400">{index + 1}/{outline.length}</span>
                      <button
                        onClick={() => {
                          const newOutline = outline.filter((_, i) => i !== index);
                          setOutline(newOutline);
                        }}
                        className="ml-auto text-xs text-red-400/50 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      value={section.title || ""}
                      onChange={(e) => {
                        const newOutline = [...outline];
                        newOutline[index] = { ...newOutline[index], title: e.target.value };
                        setOutline(newOutline);
                      }}
                      className="w-full px-3 py-2 rounded-lg border bg-muted text-sm font-medium text-foreground outline-none focus:border-blue-500/50 mb-3"
                      placeholder="Tweet hook/main point..."
                    />
                    <div className="space-y-2">
                      {(section.keyPoints || [""]).map((point: string, pidx: number) => (
                        <div key={pidx} className="flex items-start gap-2">
                          <span className="text-blue-400 mt-2">•</span>
                          <input
                            value={point}
                            onChange={(e) => {
                              const newOutline = [...outline];
                              const newPoints = [...(newOutline[index].keyPoints || [])];
                              newPoints[pidx] = e.target.value;
                              newOutline[index] = { ...newOutline[index], keyPoints: newPoints };
                              setOutline(newOutline);
                            }}
                            className="flex-1 px-3 py-1.5 rounded border bg-muted text-xs text-muted-foreground outline-none focus:border-blue-500/50"
                            placeholder="Key point..."
                          />
                          <button
                            onClick={() => {
                              const newOutline = [...outline];
                              const newPoints = (newOutline[index].keyPoints || []).filter((_: any, i: number) => i !== pidx);
                              newOutline[index] = { ...newOutline[index], keyPoints: newPoints };
                              setOutline(newOutline);
                            }}
                            className="text-xs text-red-400/50 hover:text-red-400 mt-1.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOutline = [...outline];
                          newOutline[index] = {
                            ...newOutline[index],
                            keyPoints: [...(newOutline[index].keyPoints || []), ""]
                          };
                          setOutline(newOutline);
                        }}
                        className="text-xs text-muted-foreground/60 hover:text-muted-foreground/80 ml-4"
                      >
                        + Add point
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Article/Post Outline */
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">{outline.length} Sections</span>
                  <button
                    onClick={() => setOutline([...outline, { title: "", keyPoints: [""] }])}
                    className="text-xs text-purple-400 hover:text-purple-300"
                  >
                    + Add Section
                  </button>
                </div>
                {outline.map((section, index) => (
                  <div key={index} className="p-4 rounded-lg bg-muted border hover:border/80 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground/60">Section {index + 1}</span>
                      <button
                        onClick={() => {
                          const newOutline = outline.filter((_, i) => i !== index);
                          setOutline(newOutline);
                        }}
                        className="ml-auto text-xs text-red-400/50 hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <input
                      value={section.title || ""}
                      onChange={(e) => {
                        const newOutline = [...outline];
                        newOutline[index] = { ...newOutline[index], title: e.target.value };
                        setOutline(newOutline);
                      }}
                      className="w-full px-3 py-2 rounded-lg border bg-muted text-sm font-semibold text-foreground outline-none focus:border-purple-500/50 mb-3"
                      placeholder="Section title..."
                    />
                    <div className="space-y-2">
                      {(section.keyPoints || [""]).map((point: string, pidx: number) => (
                        <div key={pidx} className="flex items-start gap-2">
                          <span className="text-purple-400 mt-2">•</span>
                          <input
                            value={point}
                            onChange={(e) => {
                              const newOutline = [...outline];
                              const newPoints = [...(newOutline[index].keyPoints || [])];
                              newPoints[pidx] = e.target.value;
                              newOutline[index] = { ...newOutline[index], keyPoints: newPoints };
                              setOutline(newOutline);
                            }}
                            className="flex-1 px-3 py-1.5 rounded border bg-muted text-xs text-muted-foreground outline-none focus:border-purple-500/50"
                            placeholder="Key point..."
                          />
                          <button
                            onClick={() => {
                              const newOutline = [...outline];
                              const newPoints = (newOutline[index].keyPoints || []).filter((_: any, i: number) => i !== pidx);
                              newOutline[index] = { ...newOutline[index], keyPoints: newPoints };
                              setOutline(newOutline);
                            }}
                            className="text-xs text-red-400/50 hover:text-red-400 mt-1.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          const newOutline = [...outline];
                          newOutline[index] = {
                            ...newOutline[index],
                            keyPoints: [...(newOutline[index].keyPoints || []), ""]
                          };
                          setOutline(newOutline);
                        }}
                        className="text-xs text-muted-foreground/60 hover:text-muted-foreground/80 ml-4"
                      >
                        + Add point
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Continue Button */}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => saveDraft("outline")}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-muted border text-muted-foreground hover:bg-muted/80 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              <button
                onClick={continueToContent}
                disabled={isGeneratingContent}
                className="px-4 py-2 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingContent ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Content
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case "content":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Final Content</h3>
                <p className="text-sm text-muted-foreground/60">Your {selectedFormat.toLowerCase()} is ready to edit and publish</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={generateFinalContent}
                  disabled={isGeneratingContent}
                  className="px-3 py-1.5 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isGeneratingContent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Regenerate
                </button>
                <button
                  onClick={() => saveDraft("content")}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>

            {/* Format-specific content view */}
            {selectedFormat === "Carousel" || selectedFormat === "Story" ? (
              /* Carousel Preview */
              <div className="grid grid-cols-2 gap-4">
                {/* Slide Navigator */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <Layout className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-foreground">Slides</span>
                  </div>
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      onClick={() => setActiveSlide(index)}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-colors",
                        activeSlide === index
                          ? "bg-blue-500/20 border-blue-500/30"
                          : "bg-muted border hover:bg-muted/80"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-foreground">{index + 1}.</span>
                        <span className="text-xs text-muted-foreground truncate">{slide.title}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Active Slide Editor */}
                <div className="bg-muted border rounded-lg p-4">
                  <div className="aspect-square bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg p-6 flex flex-col">
                    <input
                      value={slides[activeSlide]?.title || ""}
                      onChange={(e) => {
                        const newSlides = [...slides];
                        if (newSlides[activeSlide]) {
                          newSlides[activeSlide].title = e.target.value;
                          setSlides(newSlides);
                        }
                      }}
                      className="text-lg font-bold text-foreground bg-white/10 border/80 rounded-lg px-3 py-2 outline-none focus:border-purple-500/50 mb-4"
                      placeholder="Slide title..."
                    />
                    <textarea
                      value={slides[activeSlide]?.content || ""}
                      onChange={(e) => {
                        const newSlides = [...slides];
                        if (newSlides[activeSlide]) {
                          newSlides[activeSlide].content = e.target.value;
                          setSlides(newSlides);
                        }
                      }}
                      className="flex-1 text-sm text-muted-foreground bg-white/10 border/80 rounded-lg px-3 py-2 outline-none focus:border-purple-500/50 resize-none"
                      placeholder="Slide content..."
                    />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <button
                      onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
                      disabled={activeSlide === 0}
                      className="p-2 rounded text-muted-foreground hover:bg-muted/80 disabled:opacity-30"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="text-xs text-muted-foreground/60">{activeSlide + 1} / {slides.length}</span>
                    <button
                      onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))}
                      disabled={activeSlide === slides.length - 1}
                      className="p-2 rounded text-muted-foreground hover:bg-muted/80 disabled:opacity-30"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Article/Thread/Post Editor */
              <div className="grid grid-cols-2 gap-4">
                {/* Editor */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Editor</label>
                  <textarea
                    value={finalContent}
                    onChange={(e) => setFinalContent(e.target.value)}
                    rows={20}
                    className="w-full rounded-lg border bg-muted p-4 text-sm text-foreground font-mono outline-none focus:border-blue-500/50 resize-none"
                    placeholder="Your content here..."
                  />
                </div>

                {/* Preview */}
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">Preview</label>
                  <div className="rounded-lg border bg-muted p-4 h-[480px] overflow-y-auto">
                    <div className="prose prose-invert prose-sm max-w-none">
                      {finalContent.split("\n").map((line, i) => {
                        if (line.startsWith("# ")) {
                          return <h1 key={i} className="text-xl font-bold text-foreground mb-3">{line.slice(2)}</h1>;
                        }
                        if (line.startsWith("## ")) {
                          return <h2 key={i} className="text-lg font-semibold text-foreground mb-2 mt-4">{line.slice(3)}</h2>;
                        }
                        if (line === "---") {
                          return <hr key={i} className="border my-4" />;
                        }
                        if (line.trim()) {
                          return <p key={i} className="text-sm text-muted-foreground mb-2">{line}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen overflow-hidden">
      <div className="flex h-full">
        {/* Left Column - Signals (1/3 width) */}
        <div className="w-1/3 border-r border flex flex-col">
          <div className="p-4 border-b border">
            <div className="flex items-center gap-2 mb-3">
              <Radio className="h-4 w-4 text-blue-400" />
              <h2 className="text-sm font-semibold text-foreground">Signals</h2>
              <span className="text-xs text-muted-foreground/50">({signals?.length || 0})</span>
              <div className="flex-1" />
              <span className="text-xs text-purple-400">{selectedSignalIds.length} selected</span>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-8 pl-9 pr-3 rounded-lg border bg-muted text-xs text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-purple-500/50"
                placeholder="Search signals..."
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-2">
              <select
                value={filterLifecycle}
                onChange={(e) => setFilterLifecycle(e.target.value)}
                className="flex-1 bg-transparent border rounded-lg px-2 py-1.5 text-xs text-muted-foreground cursor-pointer"
              >
                <option value="">Stage</option>
                <option value="weak">Weak</option>
                <option value="emerging">Emerging</option>
                <option value="growing">Growing</option>
                <option value="mainstream">Mainstream</option>
              </select>
            </div>

            {/* STEEP */}
            <div className="flex flex-wrap gap-1.5">
              {STEEP_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => toggleSteepFilter(cat.value)}
                  className={cn(
                    "px-2 py-1 rounded text-[10px] font-medium transition-colors",
                    filterSteep.includes(cat.value)
                      ? cat.color
                      : "text-muted-foreground/60 hover:text-muted-foreground/80"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Signals List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {signals?.map((signal: any) => {
              const isSelected = selectedSignalIds.includes(signal._id);
              const lifecycleConfig = getLifecycleConfig(signal.lifecycle);

              return (
                <div
                  key={signal._id}
                  onClick={() => handleSignalSelect(signal._id)}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-colors",
                    isSelected
                      ? "bg-purple-500/20 border-purple-500/30"
                      : "bg-muted border hover:bg-muted/80"
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected ? "bg-purple-500 border-purple-500" : "border"
                    )}>
                      {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-foreground line-clamp-1">{signal.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn("px-1.5 py-0.5 rounded text-[10px] border", lifecycleConfig.color)}>
                          {lifecycleConfig.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground/50">{formatDate(signal.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column - Wizard (2/3 width) */}
        <div className="flex-1 flex flex-col">
          {/* Header with Platform/Format Selection */}
          <div className="p-4 border-b border">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <Brain className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-foreground">Content Ideation</h1>
                  <p className="text-xs text-muted-foreground/60">{selectedSignalIds.length} signals selected</p>
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              {/* Platform Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/60">Platform:</span>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as Platform)}
                  className="bg-muted border rounded-lg px-3 py-1.5 text-sm text-foreground cursor-pointer"
                >
                  {PLATFORMS.map((p) => (
                    <option key={p.value} value={p.value}>{p.icon} {p.label}</option>
                  ))}
                </select>
              </div>

              {/* Format Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/60">Format:</span>
                <div className="flex gap-1">
                  {availableFormats.map((format) => (
                    <button
                      key={format}
                      onClick={() => setSelectedFormat(format as ContentFormat)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        selectedFormat === format
                          ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                          : "bg-muted border text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {format}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-8 w-px bg-white/10" />

              {/* Voice/Perspective Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground/60">Voice:</span>
                <TeamMemberSelector
                  value={selectedVoice}
                  onChange={setSelectedVoice}
                  compact
                />
              </div>

              <div className="flex-1" />

              {/* Save Status */}
              {lastSaved && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="h-3 w-3 text-green-400" />
                      <span>Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                </div>
              )}

              {/* Drafts Button */}
              <button
                onClick={() => setShowDraftsModal(true)}
                className="px-3 py-1.5 rounded-lg bg-muted border text-muted-foreground hover:bg-muted/80 text-xs flex items-center gap-2"
              >
                <FolderOpen className="h-3.5 w-3.5" />
                My Drafts
                {existingDrafts && existingDrafts.length > 0 && (
                  <span className="bg-purple-500/30 text-purple-300 px-1.5 py-0.5 rounded text-[10px]">
                    {existingDrafts.length}
                  </span>
                )}
              </button>

              {/* New Draft Button */}
              {currentDraftId && (
                <button
                  onClick={startNewDraft}
                  className="px-3 py-1.5 rounded-lg bg-muted border text-muted-foreground hover:bg-muted/80 text-xs"
                >
                  + New
                </button>
              )}
            </div>
          </div>

          {/* Wizard Steps Tabs */}
          <div className="px-4 py-3 border-b border">
            <div className="flex items-center gap-1">
              {WIZARD_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.key;
                const isCompleted = completedSteps.has(step.key);
                const isClickable = isCompleted || index === 0 || completedSteps.has(WIZARD_STEPS[index - 1]?.key);

                return (
                  <div key={step.key} className="flex items-center">
                    {index > 0 && (
                      <div className={cn(
                        "w-8 h-px mx-2",
                        isCompleted || isActive ? "bg-purple-500/50" : "bg-white/10"
                      )} />
                    )}
                    <button
                      onClick={() => isClickable && goToStep(step.key)}
                      disabled={!isClickable}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
                        isActive
                          ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                          : isCompleted
                            ? "bg-green-500/10 border border-green-500/20 text-green-300"
                            : "bg-muted border text-muted-foreground/60",
                        isClickable ? "cursor-pointer hover:bg-muted/80" : "cursor-not-allowed opacity-50"
                      )}
                    >
                      {isCompleted && !isActive ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      <span className="text-sm font-medium">{step.label}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Drafts Modal */}
      {showDraftsModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-background border rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-foreground">My Drafts</h2>
              </div>
              <button
                onClick={() => setShowDraftsModal(false)}
                className="p-1 rounded hover:bg-muted/80 text-muted-foreground/60 hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {existingDrafts && existingDrafts.length > 0 ? (
                <div className="space-y-2">
                  {existingDrafts.map((draft: any) => (
                    <div
                      key={draft._id}
                      onClick={() => loadDraft(draft)}
                      className={cn(
                        "p-4 rounded-lg border cursor-pointer transition-colors",
                        currentDraftId === draft._id
                          ? "bg-purple-500/20 border-purple-500/30"
                          : "bg-muted border hover:bg-muted/80 hover:border/80"
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground line-clamp-1">
                            {draft.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-medium",
                              draft.stage === "content" ? "bg-green-500/20 text-green-300" :
                              draft.stage === "outline" ? "bg-blue-500/20 text-blue-300" :
                              "bg-yellow-500/20 text-yellow-300"
                            )}>
                              {draft.stage}
                            </span>
                            {draft.platform && (
                              <span className="text-[10px] text-muted-foreground/60">{draft.platform}</span>
                            )}
                            {draft.contentType && (
                              <span className="text-[10px] text-muted-foreground/60">{draft.contentType}</span>
                            )}
                          </div>
                          {draft.overview?.description && (
                            <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-2">
                              {draft.overview.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-4">
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/50">
                            <Clock className="h-3 w-3" />
                            {formatDate(draft.updatedAt || draft.createdAt)}
                          </div>
                          {currentDraftId === draft._id && (
                            <span className="text-[10px] text-purple-400">Current</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-foreground mb-2">No Drafts Yet</h4>
                  <p className="text-sm text-muted-foreground/60">
                    Your saved drafts will appear here. Start by selecting an idea and creating content.
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 border-t border flex justify-end gap-2">
              <button
                onClick={() => setShowDraftsModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  startNewDraft();
                  setShowDraftsModal(false);
                }}
                className="px-4 py-2 rounded-lg bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm hover:bg-purple-500/30"
              >
                Start New Draft
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
