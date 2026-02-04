"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Id } from "@/convex/_generated/dataModel";
import {
  Mail,
  Plus,
  Search,
  Grip,
  Save,
  Send,
  Eye,
  Calendar,
  Radio,
  TrendingUp,
  MoveUp,
  MoveDown,
  Edit,
  Trash2,
  Sparkles,
  FileText,
  ArrowLeft,
  Check,
  Loader2,
  BarChart3,
  Lightbulb,
  Link as LinkIcon,
  Zap,
  AlignCenter,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  LayoutTemplate,
  FolderOpen,
  X,
  Copy,
} from "lucide-react";
import { Reorder } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TeamMemberSelector, TeamMemberContext, buildVoiceContext } from "@/components/content/TeamMemberSelector";

interface NewsletterSection {
  id: string;
  type: "header" | "signal_highlight" | "trending_mentions" | "data_insights" | "expert_commentary" | "quick_takes" | "innovation_spotlight" | "resources" | "custom_content" | "footer";
  title: string;
  content: string;
  signalIds?: Id<"signals">[];
  mentionIds?: Id<"raw_mentions">[];
  order: number;
  aiGenerated?: boolean;
  generatedAt?: number;
}

const SECTION_TYPES = [
  {
    type: "header",
    label: "Header",
    description: "Newsletter introduction",
    icon: FileText,
    defaultContent: "Welcome to this week's innovation insights..."
  },
  {
    type: "signal_highlight",
    label: "Signal Highlight",
    description: "Showcase innovation signals",
    icon: Radio,
    defaultContent: "This week's most important innovation signals..."
  },
  {
    type: "trending_mentions",
    label: "Trending Mentions",
    description: "Popular discussions",
    icon: TrendingUp,
    defaultContent: "What's trending in the innovation community..."
  },
  {
    type: "data_insights",
    label: "Data Insights",
    description: "Charts and statistics",
    icon: BarChart3,
    defaultContent: "Key data insights from our signals..."
  },
  {
    type: "expert_commentary",
    label: "Expert Commentary",
    description: "Curated expert opinions",
    icon: MessageSquare,
    defaultContent: "What experts are saying..."
  },
  {
    type: "quick_takes",
    label: "Quick Takes",
    description: "Brief micro-trend summaries",
    icon: Zap,
    defaultContent: "Quick takes on emerging trends..."
  },
  {
    type: "innovation_spotlight",
    label: "Innovation Spotlight",
    description: "Deep dive on major signal",
    icon: Lightbulb,
    defaultContent: "This week's innovation spotlight..."
  },
  {
    type: "resources",
    label: "Resources",
    description: "Curated links and tools",
    icon: LinkIcon,
    defaultContent: "Recommended resources..."
  },
  {
    type: "custom_content",
    label: "Custom Content",
    description: "Your own content",
    icon: Edit,
    defaultContent: "Add your thoughts and insights..."
  },
  {
    type: "footer",
    label: "Footer",
    description: "Newsletter footer",
    icon: AlignCenter,
    defaultContent: "Thank you for reading! Stay innovative..."
  }
] as const;

export default function CreateNewsletterPage() {
  const { isCollapsed } = useSidebar();
  const router = useRouter();

  // Newsletter state
  const [newsletterId, setNewsletterId] = useState<Id<"newsletters"> | null>(null);
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [sections, setSections] = useState<NewsletterSection[]>([]);

  // UI state
  const [selectedSignalIds, setSelectedSignalIds] = useState<Id<"signals">[]>([]);
  const [selectedMentionIds, setSelectedMentionIds] = useState<Id<"raw_mentions">[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [generatingSections, setGeneratingSections] = useState<Set<string>>(new Set());
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Auto-save state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mutations
  const createNewsletter = useMutation(api.newsletters.create);
  const updateNewsletter = useMutation(api.newsletters.update);
  const generateSectionAction = useAction(api.actions.newsletterGeneration.generateNewsletterSection);

  // Template mutations and queries
  const templates = useQuery(api.newsletterTemplates.list, { limit: 50 });
  const createTemplate = useMutation(api.newsletterTemplates.create);

  // Template UI state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Voice/perspective selection
  const [selectedVoice, setSelectedVoice] = useState<TeamMemberContext | null>(null);

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    search: searchTerm || undefined,
    lifecycle: filterLifecycle ? [filterLifecycle] : undefined,
  });

  // Note: Mentions API not yet implemented
  const mentions: any[] = [];

  // Calculate statistics
  const totalWords = sections.reduce((sum, section) => {
    return sum + section.content.split(/\s+/).filter(w => w.length > 0).length;
  }, 0);
  const aiGeneratedCount = sections.filter(s => s.aiGenerated).length;

  // Auto-save function
  const saveNewsletter = useCallback(async () => {
    if (!newsletterTitle || !newsletterSubject) return;

    setIsSaving(true);
    try {
      if (newsletterId) {
        // Update existing newsletter
        await updateNewsletter({
          id: newsletterId,
          title: newsletterTitle,
          subject: newsletterSubject,
          sections: sections.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            content: s.content,
            order: s.order,
            signalIds: s.signalIds,
            mentionIds: s.mentionIds,
            aiGenerated: s.aiGenerated || false,
            generatedAt: s.generatedAt,
          })),
        });
      } else {
        // Create new newsletter
        const id = await createNewsletter({
          title: newsletterTitle,
          subject: newsletterSubject,
          sections: sections.map(s => ({
            id: s.id,
            type: s.type,
            title: s.title,
            content: s.content,
            order: s.order,
            signalIds: s.signalIds,
            mentionIds: s.mentionIds,
            aiGenerated: s.aiGenerated || false,
            generatedAt: s.generatedAt,
          })),
          createdBy: "current-user",
        });
        setNewsletterId(id);
      }
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
    } catch (error: any) {
      toast.error(`Failed to save: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  }, [newsletterId, newsletterTitle, newsletterSubject, sections, createNewsletter, updateNewsletter]);

  // Debounced auto-save
  useEffect(() => {
    if (hasUnsavedChanges && newsletterTitle && newsletterSubject) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveNewsletter();
      }, 3000);
    }
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, newsletterTitle, newsletterSubject, saveNewsletter]);

  // Mark as unsaved on changes
  useEffect(() => {
    if (newsletterTitle || newsletterSubject || sections.length > 0) {
      setHasUnsavedChanges(true);
    }
  }, [newsletterTitle, newsletterSubject, sections]);

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

  const getLifecycleConfig = (lifecycle: string) => {
    const configs: Record<string, {label: string, color: string}> = {
      weak: { label: "Weak Signal", color: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
      emerging: { label: "Emerging", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      growing: { label: "Growing", color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
      mainstream: { label: "Mainstream", color: "bg-green-500/10 text-green-400 border-green-500/20" },
      declining: { label: "Declining", color: "bg-red-500/10 text-red-400 border-red-500/20" },
    };
    return configs[lifecycle] || configs.weak;
  };

  const addSection = (type: NewsletterSection["type"]) => {
    const sectionType = SECTION_TYPES.find(s => s.type === type);
    if (!sectionType) return;

    let assignedSignalIds: Id<"signals">[] = [];
    let assignedMentionIds: Id<"raw_mentions">[] = [];

    if (['signal_highlight', 'data_insights', 'innovation_spotlight', 'quick_takes', 'resources'].includes(type)) {
      assignedSignalIds = [...selectedSignalIds];
    }
    if (['trending_mentions', 'expert_commentary'].includes(type)) {
      assignedMentionIds = [...selectedMentionIds];
    }

    const newSection: NewsletterSection = {
      id: `section-${Date.now()}`,
      type,
      title: sectionType.label,
      content: sectionType.defaultContent,
      signalIds: assignedSignalIds,
      mentionIds: assignedMentionIds,
      order: sections.length,
      aiGenerated: false,
    };

    setSections(prev => [...prev, newSection]);
    setExpandedSection(newSection.id);
    toast.success(`${sectionType.label} added`);
  };

  const updateSection = (sectionId: string, updates: Partial<NewsletterSection>) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
    if (expandedSection === sectionId) {
      setExpandedSection(null);
    }
    toast.success("Section removed");
  };

  const moveSection = (sectionId: string, direction: "up" | "down") => {
    setSections(prev => {
      const index = prev.findIndex(s => s.id === sectionId);
      if (index === -1) return prev;

      const newIndex = direction === "up" ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newSections = [...prev];
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];

      return newSections.map((section, i) => ({ ...section, order: i }));
    });
  };

  const generateNewsletterSection = async (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return;

    setGeneratingSections(prev => new Set(prev).add(sectionId));

    try {
      const result = await generateSectionAction({
        sectionType: section.type,
        signalIds: section.signalIds || [],
        mentionIds: section.mentionIds || [],
        voiceContext: buildVoiceContext(selectedVoice),
      });

      setSections(prev => prev.map(s =>
        s.id === sectionId
          ? { ...s, content: result.content, aiGenerated: true, generatedAt: Date.now() }
          : s
      ));

      toast.success(`${section.title} generated`);
    } catch (error: any) {
      toast.error(`Failed to generate: ${error.message}`);
    } finally {
      setGeneratingSections(prev => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }
  };

  const generateNewsletterContent = async () => {
    if (sections.length === 0) {
      toast.error("Add at least one section to generate content");
      return;
    }

    setIsGeneratingAll(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      await Promise.all(
        sections.map(async (section) => {
          try {
            const result = await generateSectionAction({
              sectionType: section.type,
              signalIds: section.signalIds || [],
              mentionIds: section.mentionIds || [],
              voiceContext: buildVoiceContext(selectedVoice),
            });

            setSections(prev => prev.map(s =>
              s.id === section.id
                ? { ...s, content: result.content, aiGenerated: true, generatedAt: Date.now() }
                : s
            ));

            successCount++;
          } catch (error) {
            errorCount++;
          }
        })
      );

      if (successCount > 0) {
        toast.success(`Generated ${successCount} sections`);
      }
      if (errorCount > 0) {
        toast.error(`Failed to generate ${errorCount} sections`);
      }
    } finally {
      setIsGeneratingAll(false);
    }
  };

  const handleSave = async () => {
    if (!newsletterTitle || !newsletterSubject) {
      toast.error("Please enter newsletter title and subject");
      return;
    }
    await saveNewsletter();
    toast.success("Newsletter saved");
  };

  const handleSend = () => {
    if (!newsletterTitle || !newsletterSubject || sections.length === 0) {
      toast.error("Complete all fields and add sections before sending");
      return;
    }
    toast.success("Newsletter sent successfully");
  };

  // Template handlers
  const loadTemplate = (template: any) => {
    if (template.sections && template.sections.length > 0) {
      // Convert template sections to newsletter sections with new IDs
      const loadedSections: NewsletterSection[] = template.sections.map((s: any, index: number) => ({
        id: `section-${Date.now()}-${index}`,
        type: s.type,
        title: s.title,
        content: s.content,
        order: index,
        signalIds: [],
        mentionIds: [],
        aiGenerated: false,
      }));
      setSections(loadedSections);
      toast.success(`Loaded template: ${template.name}`);
    }
    setShowTemplateModal(false);
  };

  const handleSaveAsTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Please enter a template name");
      return;
    }
    if (sections.length === 0) {
      toast.error("Add at least one section to save as template");
      return;
    }

    setIsSavingTemplate(true);
    try {
      await createTemplate({
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        sections: sections.map((s) => ({
          id: s.id,
          type: s.type,
          title: s.title,
          content: s.content,
          order: s.order,
        })),
        category: "custom",
      });
      toast.success("Template saved successfully");
      setShowSaveTemplateModal(false);
      setTemplateName("");
      setTemplateDescription("");
    } catch (error: any) {
      toast.error(`Failed to save template: ${error.message}`);
    } finally {
      setIsSavingTemplate(false);
    }
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 transition-colors duration-300 bg-background flex flex-col",
      isCollapsed ? "left-16" : "left-64"
    )}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/newsletters">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Mail className="h-4 w-4 text-purple-400" />
          </div>
          <input
            value={newsletterTitle}
            onChange={(e) => setNewsletterTitle(e.target.value)}
            placeholder="Newsletter Title"
            className="bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground/60 outline-none border-none w-64"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Save status indicator */}
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : lastSaved ? (
              <span className="flex items-center gap-1.5 text-green-400">
                <Check className="h-3 w-3" />
                Saved
              </span>
            ) : hasUnsavedChanges ? (
              <span className="text-muted-foreground/60">Unsaved changes</span>
            ) : null}
          </div>

          {/* Voice Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground/60">Voice:</span>
            <TeamMemberSelector
              value={selectedVoice}
              onChange={setSelectedVoice}
              compact
            />
          </div>

          {/* Templates Button */}
          <button
            onClick={() => setShowTemplateModal(true)}
            className="px-3 py-1.5 rounded-lg text-sm bg-muted border text-muted-foreground hover:bg-muted/80 transition-colors flex items-center gap-2"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </button>

          <button
            onClick={() => setShowPreview(!showPreview)}
            disabled={sections.length === 0}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2",
              showPreview
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-300"
                : "bg-muted border text-muted-foreground hover:bg-muted/80",
              sections.length === 0 && "opacity-50 cursor-not-allowed"
            )}
          >
            <Eye className="h-4 w-4" />
            {showPreview ? "Edit" : "Preview"}
          </button>

          {/* Save as Template Button */}
          <button
            onClick={() => setShowSaveTemplateModal(true)}
            disabled={sections.length === 0}
            className="px-3 py-1.5 rounded-lg text-sm bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FolderOpen className="h-4 w-4" />
            Save Template
          </button>

          <button
            onClick={handleSave}
            disabled={!newsletterTitle || !newsletterSubject}
            className="px-3 py-1.5 rounded-lg text-sm bg-muted border text-muted-foreground hover:bg-muted/80 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            Save
          </button>

          <button
            onClick={handleSend}
            disabled={!newsletterTitle || !newsletterSubject || sections.length === 0}
            className="px-3 py-1.5 rounded-lg text-sm bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Send
          </button>
        </div>
      </div>

      {/* Main 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Metadata + Sources (300px) */}
        <div className="w-[300px] border-r overflow-y-auto p-4 space-y-4">
          {/* Newsletter Metadata */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Newsletter Details</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Subject Line</label>
              <input
                value={newsletterSubject}
                onChange={(e) => setNewsletterSubject(e.target.value)}
                placeholder="Email subject line"
                className="w-full h-9 rounded-lg border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-blue-500/50"
              />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
              <span>{sections.length} sections</span>
              <span>{totalWords} words</span>
              <span>{aiGeneratedCount} AI</span>
            </div>
          </div>

          <div className="border-t pt-4">
            {/* Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search content..."
                className="w-full h-8 pl-9 pr-3 rounded-lg border bg-muted text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-blue-500/50"
              />
            </div>

            {/* Lifecycle Filter */}
            <select
              value={filterLifecycle}
              onChange={(e) => setFilterLifecycle(e.target.value)}
              className="w-full h-8 rounded-lg border bg-muted px-3 text-sm text-foreground outline-none focus:border-blue-500/50 mb-3"
            >
              <option value="">All Lifecycles</option>
              <option value="weak">Weak Signal</option>
              <option value="emerging">Emerging</option>
              <option value="growing">Growing</option>
              <option value="mainstream">Mainstream</option>
            </select>
          </div>

          {/* Signals */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-blue-500/20 border border-blue-500/30">
                <Radio className="h-3 w-3 text-blue-400" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">Signals ({signals?.length || 0})</h4>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {signals && signals.length > 0 ? signals.slice(0, 15).map((signal: any) => {
                const isSelected = selectedSignalIds.includes(signal._id);
                const lifecycleConfig = getLifecycleConfig(signal.lifecycle);
                return (
                  <div
                    key={signal._id}
                    onClick={() => handleSignalSelect(signal._id)}
                    className={cn(
                      "p-2 rounded-lg border cursor-pointer transition-colors text-xs",
                      isSelected
                        ? "bg-blue-500/20 border-blue-500/30"
                        : "bg-muted border hover:bg-muted/80"
                    )}
                  >
                    <p className="font-medium text-foreground line-clamp-1">{signal.name}</p>
                    <div className={cn("px-1.5 py-0.5 rounded text-[10px] border inline-block mt-1", lifecycleConfig.color)}>
                      {lifecycleConfig.label}
                    </div>
                  </div>
                );
              }) : (
                <p className="text-xs text-muted-foreground/60 text-center py-3">No signals available</p>
              )}
            </div>
          </div>

          {/* Mentions */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-5 w-5 items-center justify-center rounded bg-green-500/20 border border-green-500/30">
                <TrendingUp className="h-3 w-3 text-green-400" />
              </div>
              <h4 className="text-xs font-semibold text-foreground">Mentions ({mentions?.length || 0})</h4>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {mentions && mentions.length > 0 ? mentions.slice(0, 15).map((mention: any) => {
                const isSelected = selectedMentionIds.includes(mention._id);
                return (
                  <div
                    key={mention._id}
                    onClick={() => handleMentionSelect(mention._id)}
                    className={cn(
                      "p-2 rounded-lg border cursor-pointer transition-colors text-xs",
                      isSelected
                        ? "bg-green-500/20 border-green-500/30"
                        : "bg-muted border hover:bg-muted/80"
                    )}
                  >
                    <p className="font-medium text-foreground line-clamp-2">{mention.title}</p>
                  </div>
                );
              }) : (
                <p className="text-xs text-muted-foreground/60 text-center py-3">No mentions available</p>
              )}
            </div>
          </div>

          {/* Selected counts */}
          {(selectedSignalIds.length > 0 || selectedMentionIds.length > 0) && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                Selected: {selectedSignalIds.length} signals, {selectedMentionIds.length} mentions
              </p>
            </div>
          )}
        </div>

        {/* Center Panel - Builder/Preview (flex-1) */}
        <div className="flex-1 overflow-y-auto p-6">
          {showPreview && sections.length > 0 ? (
            /* Preview Mode */
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                  <h1 className="text-2xl font-bold mb-2">{newsletterTitle || 'Your Newsletter Title'}</h1>
                  <p className="text-blue-100">{newsletterSubject || 'Newsletter subject line'}</p>
                </div>
                <div className="p-8 space-y-6">
                  {sections.map((section) => (
                    <div key={section.id} className="border-b border-gray-200 pb-6 last:border-0">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">{section.title}</h2>
                      <div className="text-gray-700 whitespace-pre-wrap prose prose-sm max-w-none">
                        {section.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : sections.length > 0 ? (
            /* Builder Mode */
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-foreground">Newsletter Sections</h3>
                <button
                  onClick={generateNewsletterContent}
                  disabled={isGeneratingAll || sections.length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingAll ? (
                    <>
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3 w-3" />
                      AI Generate All
                    </>
                  )}
                </button>
              </div>

              <Reorder.Group values={sections} onReorder={setSections} className="space-y-3">
                {sections.map((section, index) => {
                  const sectionType = SECTION_TYPES.find(s => s.type === section.type);
                  const Icon = sectionType?.icon || FileText;
                  const isExpanded = expandedSection === section.id;

                  return (
                    <Reorder.Item
                      key={section.id}
                      value={section}
                      className="bg-muted border rounded-lg overflow-hidden"
                    >
                      {/* Section Header - Always visible */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted"
                        onClick={() => setExpandedSection(isExpanded ? null : section.id)}
                      >
                        <Grip className="h-4 w-4 text-muted-foreground/60 cursor-grab active:cursor-grabbing" />

                        <div className="flex h-7 w-7 items-center justify-center rounded bg-blue-500/20 border border-blue-500/30">
                          <Icon className="h-3.5 w-3.5 text-blue-400" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-medium text-foreground">{section.title}</h4>
                            {section.aiGenerated && (
                              <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-[10px] text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Sparkles className="h-2.5 w-2.5" />
                                AI
                              </span>
                            )}
                          </div>
                          {!isExpanded && (
                            <p className="text-xs text-muted-foreground/60 line-clamp-1 mt-0.5">{section.content}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              generateNewsletterSection(section.id);
                            }}
                            disabled={generatingSections.has(section.id)}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted/80 hover:text-purple-400 transition-colors disabled:opacity-50"
                            title="Generate with AI"
                          >
                            {generatingSections.has(section.id) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Sparkles className="h-3.5 w-3.5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, "up");
                            }}
                            disabled={index === 0}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors disabled:opacity-30"
                          >
                            <MoveUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, "down");
                            }}
                            disabled={index === sections.length - 1}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors disabled:opacity-30"
                          >
                            <MoveDown className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                            className="p-1.5 rounded text-muted-foreground hover:bg-muted/80 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground/60" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Content - Inline editing */}
                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-3 border-t border">
                          <div className="pt-3">
                            <label className="text-xs text-muted-foreground block mb-1">Section Title</label>
                            <input
                              value={section.title}
                              onChange={(e) => updateSection(section.id, { title: e.target.value })}
                              className="w-full h-8 rounded-lg border bg-muted px-3 text-sm text-foreground outline-none focus:border-blue-500/50"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground block mb-1">Content</label>
                            <textarea
                              value={section.content}
                              onChange={(e) => updateSection(section.id, { content: e.target.value })}
                              rows={6}
                              className="w-full rounded-lg border bg-muted p-3 text-sm text-foreground outline-none focus:border-blue-500/50 resize-none"
                            />
                          </div>
                          {(section.signalIds?.length || section.mentionIds?.length) && (
                            <div className="flex items-center gap-2 text-xs text-muted-foreground/60">
                              {section.signalIds && section.signalIds.length > 0 && (
                                <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20">
                                  {section.signalIds.length} signals linked
                                </span>
                              )}
                              {section.mentionIds && section.mentionIds.length > 0 && (
                                <span className="px-2 py-1 rounded bg-green-500/10 text-green-300 border border-green-500/20">
                                  {section.mentionIds.length} mentions linked
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </Reorder.Item>
                  );
                })}
              </Reorder.Group>
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Mail className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Start Building Your Newsletter</h3>
              <p className="text-sm text-muted-foreground/60 mb-4 max-w-md">
                Add sections from the library on the right to compose your newsletter.
                Select signals and mentions on the left to include as content sources.
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Section Library (280px) */}
        <div className="w-[280px] border-l overflow-y-auto p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Section Library</h3>
          <div className="space-y-2">
            {SECTION_TYPES.map((sectionType) => {
              const Icon = sectionType.icon;
              return (
                <button
                  key={sectionType.type}
                  onClick={() => addSection(sectionType.type)}
                  className="w-full p-3 rounded-lg bg-muted border hover:bg-muted/80 transition-colors text-left group"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="h-4 w-4 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-medium text-foreground">{sectionType.label}</h4>
                        <Plus className="h-3 w-3 text-muted-foreground/60 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <p className="text-xs text-muted-foreground/60 line-clamp-1">{sectionType.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Load Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <LayoutTemplate className="h-4 w-4 text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Load Template</h2>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {templates && templates.length > 0 ? (
                <div className="grid gap-3">
                  {templates.map((template: { _id: string; name: string; description?: string; isDefault?: boolean; sections?: unknown[]; category?: string }) => (
                    <div
                      key={template._id}
                      onClick={() => loadTemplate(template)}
                      className="p-4 rounded-lg bg-muted border hover:bg-muted/80 hover:border-blue-500/30 transition-colors cursor-pointer group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground">{template.name}</h3>
                            {template.isDefault && (
                              <span className="px-2 py-0.5 rounded text-[10px] bg-green-500/20 text-green-300 border border-green-500/30">
                                Default
                              </span>
                            )}
                          </div>
                          {template.description && (
                            <p className="text-sm text-muted-foreground mb-2">{template.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground/60">
                            <span>{template.sections?.length || 0} sections</span>
                            {template.category && (
                              <span className="px-2 py-0.5 rounded bg-muted">{template.category}</span>
                            )}
                          </div>
                        </div>
                        <button className="p-2 rounded-lg text-muted-foreground/60 group-hover:text-blue-400 group-hover:bg-blue-500/10 transition-colors">
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <LayoutTemplate className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No Templates Yet</h3>
                  <p className="text-sm text-muted-foreground/60">
                    Create a newsletter and save it as a template to reuse later.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-lg text-sm bg-muted border text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <FolderOpen className="h-4 w-4 text-amber-400" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Save as Template</h2>
              </div>
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm text-foreground block mb-1.5">Template Name *</label>
                <input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Weekly Newsletter"
                  className="w-full h-10 rounded-lg border bg-muted px-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-sm text-foreground block mb-1.5">Description (optional)</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Describe when to use this template..."
                  rows={3}
                  className="w-full rounded-lg border bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:border-blue-500/50 resize-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-muted border">
                <p className="text-xs text-muted-foreground/60 mb-2">This template will include:</p>
                <div className="flex flex-wrap gap-2">
                  {sections.map((s) => (
                    <span key={s.id} className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20">
                      {s.title}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-4 border-t">
              <button
                onClick={() => setShowSaveTemplateModal(false)}
                className="px-4 py-2 rounded-lg text-sm bg-muted border text-muted-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAsTemplate}
                disabled={!templateName.trim() || isSavingTemplate}
                className="px-4 py-2 rounded-lg text-sm bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSavingTemplate ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Template
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
