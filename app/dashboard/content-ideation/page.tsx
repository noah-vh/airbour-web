"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import {
  Search,
  Lightbulb,
  FileEdit,
  CheckCircle2,
  ArrowRight,
  X,
  FolderOpen,
  Save,
  Sparkles,
  Brain,
  Zap,
  Target,
  Clock,
  BarChart3,
  PlusCircle,
  Filter,
  Radio,
  TrendingUp,
  MessageSquare,
  Twitter,
  Linkedin,
  Globe,
  Heart,
  Repeat2,
  Users,
  Star,
  Hash,
  ExternalLink,
  List,
  AlignLeft,
  Settings,
  Eye,
  Bookmark,
  Edit3,
  Calendar,
  MapPin,
  Building,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ContentIdea {
  id: string;
  format: string;
  hook: string;
  angle: string;
  description: string;
  suggestedStructure?: any;
  outline?: any;
  signalIds?: string[];
  mentionIds?: string[];
  overview?: string;
  fullOutline?: string;
  fullContent?: string;
}

type LeftPanelTab = "signals" | "mentions";
type RightPanelTab = "overview" | "outline" | "content";
type ContentType = "article" | "thread" | "post" | "newsletter" | "whitepaper";

export default function ContentIdeationPage() {
  const { isCollapsed } = useSidebar();
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>("signals");
  const [rightPanelTab, setRightPanelTab] = useState<RightPanelTab>("overview");
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([]);
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);
  const [contentIdeas, setContentIdeas] = useState<ContentIdea[]>([]);
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null);
  const [currentContentType, setCurrentContentType] = useState<ContentType>("article");
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("");
  const [selectedSignalForView, setSelectedSignalForView] = useState<any | null>(null);
  const [showSignalPopup, setShowSignalPopup] = useState(false);

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    search: searchTerm || undefined,
    lifecycle: filterLifecycle ? [filterLifecycle] : undefined,
  });

  // Note: Mentions API not yet implemented
  const mentions: any[] = [];

  // Animation variants
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
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const handleIdeaSelect = (ideaId: string) => {
    setSelectedIdeaId(ideaId);
    setRightPanelTab("overview");
  };

  const selectedIdea = contentIdeas.find(idea => idea.id === selectedIdeaId);

  const handleSignalSelect = (signalId: string) => {
    setSelectedSignalIds(prev =>
      prev.includes(signalId)
        ? prev.filter(id => id !== signalId)
        : [...prev, signalId]
    );
  };

  const handleMentionSelect = (mentionId: string) => {
    setSelectedMentionIds(prev =>
      prev.includes(mentionId)
        ? prev.filter(id => id !== mentionId)
        : [...prev, mentionId]
    );
  };

  const generateIdeas = () => {
    if (selectedSignalIds.length === 0 && selectedMentionIds.length === 0) {
      toast.error("Please select at least one signal or mention to generate ideas");
      return;
    }

    // Generate content ideas based on selected signals and mentions
    const newIdeas: ContentIdea[] = [];
    const contentTypes: ContentType[] = ['article', 'thread', 'post', 'newsletter', 'whitepaper'];

    for (let i = 0; i < Math.max(selectedSignalIds.length * 2, 3); i++) {
      const selectedSignal = selectedSignalIds[i % selectedSignalIds.length] ? signals?.find((s: any) => s._id === selectedSignalIds[i % selectedSignalIds.length]) : null;
      const selectedMention = selectedMentionIds[i % selectedMentionIds.length] ? mentions?.find((m: any) => m._id === selectedMentionIds[i % selectedMentionIds.length]) : null;

      const contentType = contentTypes[i % contentTypes.length];
      const hooks = [
        `"The future of ${selectedSignal?.name || 'innovation'} is happening faster than you think..."`,
        `"What if I told you that ${selectedSignal?.name || 'technology'} could revolutionize business?"`,
        `"Here's why industry leaders are paying attention to ${selectedSignal?.name || 'emerging trends'}..."`,
        `"The data is clear: innovation trends are reshaping entire industries..."`,
        `"Three things you need to know about ${selectedSignal?.name || 'disruptive technology'} right now..."`
      ];

      const angles = [
        'Industry disruption perspective',
        'Practical implementation guide',
        'Future implications analysis',
        'Market opportunity assessment',
        'Risk and benefit analysis'
      ];

      newIdeas.push({
        id: `idea-${i + 1}`,
        format: contentType.charAt(0).toUpperCase() + contentType.slice(1),
        hook: hooks[i % hooks.length],
        angle: angles[i % angles.length],
        description: `Create ${contentType} content that explores ${selectedSignal?.name || 'innovation trends'} ${selectedMention ? `in relation to ${selectedMention.title}` : 'and its implications'}.`,
        signalIds: selectedSignal ? [selectedSignal._id] : [],
        mentionIds: selectedMention ? [selectedMention._id] : [],
        overview: `This ${contentType} will explore the emerging trends around ${selectedSignal?.name || 'innovation'} and its potential impact on industry practices. We'll analyze current market dynamics, identify key opportunities, and provide actionable insights for business leaders.`,
        fullOutline: `1. Introduction: The ${selectedSignal?.name || 'innovation'} Revolution\n2. Current Market Landscape\n3. Key Industry Players and Their Strategies\n4. Future Implications and Opportunities\n5. Actionable Next Steps for Organizations\n6. Conclusion: Preparing for the Future`,
        fullContent: ''
      });
    }

    setContentIdeas(newIdeas);
    toast.success(`Generated ${newIdeas.length} content ideas!`);
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

  const renderLeftPanel = () => {
    return (
      <div className="space-y-4">
        {/* Left Panel Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setLeftPanelTab("signals")}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-standard flex items-center justify-center gap-2",
              leftPanelTab === "signals"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
            )}
          >
            <Radio className="h-4 w-4" />
            Signals
          </button>
          <button
            onClick={() => setLeftPanelTab("mentions")}
            className={cn(
              "flex-1 px-4 py-2 rounded-md text-sm font-medium transition-standard flex items-center justify-center gap-2",
              leftPanelTab === "mentions"
                ? "bg-green-500/20 text-green-300 border border-green-500/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
            )}
          >
            <TrendingUp className="h-4 w-4" />
            Mentions
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
              placeholder={`Search ${leftPanelTab}...`}
            />
          </div>
          {leftPanelTab === "signals" && (
            <select
              value={filterLifecycle}
              onChange={(e) => setFilterLifecycle(e.target.value)}
              className="w-full glass bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f5f5f5] transition-standard hover:bg-white/10"
            >
              <option value="">All Lifecycles</option>
              <option value="weak">Weak Signal</option>
              <option value="emerging">Emerging</option>
              <option value="growing">Growing</option>
              <option value="mainstream">Mainstream</option>
            </select>
          )}
        </div>

        {/* Selection Summary */}
        <div className="glass bg-white/5 border border-white/10 rounded-lg p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-[#f5f5f5]">Selected:</span>
            {(selectedSignalIds.length > 0 || selectedMentionIds.length > 0) && (
              <button
                onClick={generateIdeas}
                className="glass bg-purple-500/10 border border-purple-500/20 rounded-md px-3 py-1 transition-standard hover:bg-purple-500/20 flex items-center gap-1"
              >
                <Sparkles className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-purple-300">Generate Ideas</span>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs text-blue-300">
              {selectedSignalIds.length} signals
            </div>
            <div className="px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-xs text-green-300">
              {selectedMentionIds.length} mentions
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="space-y-1.5 max-h-[calc(100vh-380px)] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
          {leftPanelTab === "signals" && signals && signals.length > 0 ? signals.map((signal: any) => {
            const isSelected = selectedSignalIds.includes(signal._id);
            const lifecycleConfig = getLifecycleConfig(signal.lifecycle);

            return (
              <div
                key={signal._id}
                className={cn(
                  "group p-2 rounded-lg border transition-standard relative",
                  isSelected
                    ? "bg-blue-500/20 border-blue-500/30 ring-1 ring-blue-500/50"
                    : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20"
                )}
              >
                {/* Selection Checkbox */}
                <div
                  onClick={() => handleSignalSelect(signal._id)}
                  className="absolute top-1.5 left-1.5 cursor-pointer"
                >
                  <div className={cn(
                    "w-4 h-4 rounded border-2 transition-all flex items-center justify-center",
                    isSelected
                      ? "bg-blue-500 border-blue-500"
                      : "border-[#666] hover:border-blue-400"
                  )}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="ml-5 pr-6">
                  <div className="flex items-start justify-between mb-0.5">
                    <h3 className="text-sm font-medium text-[#f5f5f5] line-clamp-1 pr-2">{signal.name}</h3>
                  </div>
                  <p className="text-xs text-[#a3a3a3] mb-1.5 line-clamp-2">{signal.description}</p>

                  {/* Compact Metadata */}
                  <div className="flex items-center gap-2 mb-1.5 text-xs flex-wrap">
                    <div className="flex items-center gap-0.5">
                      <BarChart3 className="h-2.5 w-2.5 text-orange-400" />
                      <span className="text-orange-300 font-medium">{Math.round((signal.confidence || 0.5) * 100)}%</span>
                    </div>
                    <div className="w-px h-3 bg-white/10"></div>
                    <div className="flex items-center gap-0.5">
                      <Building className="h-2.5 w-2.5 text-[#666]" />
                      <span className="text-[#a3a3a3] truncate max-w-[50px]">{signal.industry || 'Tech'}</span>
                    </div>
                    <div className="w-px h-3 bg-white/10"></div>
                    <div className="flex items-center gap-0.5">
                      <MapPin className="h-2.5 w-2.5 text-[#666]" />
                      <span className="text-[#a3a3a3] truncate max-w-[45px]">{signal.region || 'Global'}</span>
                    </div>
                    <div className="w-px h-3 bg-white/10"></div>
                    <div className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5 text-[#666]" />
                      <span className="text-[#666]">
                        {signal.createdAt ? new Date(signal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                  </div>

                  {/* Tags and Lifecycle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 flex-wrap">
                      <div className={cn("px-1.5 py-0.5 rounded text-xs border", lifecycleConfig.color)}>
                        {lifecycleConfig.label}
                      </div>
                      {signal.tags && signal.tags.length > 0 && (
                        <div className="px-1.5 py-0.5 rounded bg-purple-500/20 text-xs text-purple-300 border border-purple-500/20">
                          {signal.tags[0]}
                        </div>
                      )}
                      {signal.tags && signal.tags.length > 1 && (
                        <div className="text-xs text-[#666]">+{signal.tags.length - 1}</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* View More Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedSignalForView(signal);
                    setShowSignalPopup(true);
                  }}
                  className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity glass bg-white/10 border border-white/20 rounded-md px-1.5 py-0.5 text-xs text-[#f5f5f5] hover:bg-white/20 flex items-center gap-1"
                >
                  <Eye className="h-2.5 w-2.5" />
                  <span className="hidden sm:inline">View</span>
                </button>
              </div>
            );
          }) : leftPanelTab === "mentions" && mentions && mentions.length > 0 ? mentions.map((mention: any) => {
            const isSelected = selectedMentionIds.includes(mention._id);

            return (
              <div
                key={mention._id}
                onClick={() => handleMentionSelect(mention._id)}
                className={cn(
                  "p-3 rounded-lg border transition-standard cursor-pointer",
                  isSelected
                    ? "bg-green-500/20 border-green-500/30"
                    : "bg-white/5 border-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full mt-2 transition-colors",
                    isSelected ? "bg-green-400" : "bg-[#666]"
                  )}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#f5f5f5] mb-1 truncate">{mention.title}</p>
                    <p className="text-xs text-[#a3a3a3] mb-2 line-clamp-2">{mention.content}</p>
                    <div className="flex items-center gap-1">
                      <div className="px-1.5 py-0.5 rounded bg-blue-500/20 text-xs text-blue-300 border border-blue-500/20">
                        {mention.platform}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-8">
              <div className="text-sm text-[#666]">
                No {leftPanelTab} available
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderRightPanel = () => {
    return (
      <div className="space-y-4">
        {/* Right Panel Tabs */}
        <div className="flex space-x-1 bg-white/5 backdrop-blur-sm rounded-lg p-1">
          <button
            onClick={() => setRightPanelTab("overview")}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-standard flex items-center justify-center gap-2",
              rightPanelTab === "overview"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
            )}
          >
            <Eye className="h-4 w-4" />
            Overview
          </button>
          <button
            onClick={() => setRightPanelTab("outline")}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-standard flex items-center justify-center gap-2",
              rightPanelTab === "outline"
                ? "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
            )}
          >
            <List className="h-4 w-4" />
            Outline
          </button>
          <button
            onClick={() => setRightPanelTab("content")}
            className={cn(
              "flex-1 px-3 py-2 rounded-md text-sm font-medium transition-standard flex items-center justify-center gap-2",
              rightPanelTab === "content"
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
            )}
          >
            <Edit3 className="h-4 w-4" />
            Content
          </button>
        </div>

        {/* Content Type Selector */}
        <div className="glass bg-white/5 border border-white/10 rounded-lg p-3">
          <label className="text-sm font-medium text-[#f5f5f5] block mb-2">Content Type</label>
          <select
            value={currentContentType}
            onChange={(e) => setCurrentContentType(e.target.value as ContentType)}
            className="w-full glass bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-[#f5f5f5] transition-standard hover:bg-white/10"
          >
            <option value="article">Article</option>
            <option value="thread">Twitter Thread</option>
            <option value="post">LinkedIn Post</option>
            <option value="newsletter">Newsletter Section</option>
            <option value="whitepaper">White Paper</option>
          </select>
        </div>

        {/* Main Content Area */}
        <div className="flex-1">
          {contentIdeas.length === 0 ? (
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30 mx-auto mb-4">
                <Lightbulb className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">Generate Content Ideas</h3>
              <p className="text-sm text-[#a3a3a3] mb-4">Select signals and mentions from the left panel, then generate content ideas to begin your workflow.</p>
            </div>
          ) : !selectedIdea ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">Generated Content Ideas</h3>
              {contentIdeas.map((idea) => (
                <div
                  key={idea.id}
                  onClick={() => handleIdeaSelect(idea.id)}
                  className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4 transition-standard hover:bg-white/5 cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                      <Brain className="h-4 w-4 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-[#f5f5f5] mb-1">{idea.format}</h4>
                      <p className="text-xs text-[#a3a3a3] mb-2 line-clamp-2">{idea.description}</p>
                      <div className="text-xs text-purple-300">{idea.angle}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {rightPanelTab === "overview" && (
                <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                      <Eye className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#f5f5f5]">{selectedIdea.format} Overview</h3>
                      <p className="text-sm text-[#a3a3a3]">High-level content strategy and approach</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-sm font-medium text-[#f5f5f5] block mb-2">Content Hook:</span>
                      <p className="text-sm text-[#a3a3a3]">{selectedIdea.hook}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-sm font-medium text-[#f5f5f5] block mb-2">Angle & Approach:</span>
                      <p className="text-sm text-[#a3a3a3]">{selectedIdea.angle}</p>
                    </div>
                    <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                      <span className="text-sm font-medium text-[#f5f5f5] block mb-2">Overview:</span>
                      <textarea
                        className="w-full h-32 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm p-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-purple-500/50 focus:bg-purple-500/10 resize-none"
                        placeholder="Describe the overall strategy and approach for this content..."
                        defaultValue={selectedIdea.overview}
                      />
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === "outline" && (
                <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
                      <List className="h-4 w-4 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#f5f5f5]">{selectedIdea.format} Outline</h3>
                      <p className="text-sm text-[#a3a3a3]">Structure and key points for your content</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#f5f5f5] block mb-2">Content Outline</label>
                      <textarea
                        className="w-full h-64 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm p-4 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-orange-500/50 focus:bg-orange-500/10 resize-none"
                        placeholder="1. Introduction\n2. Main Point 1\n3. Main Point 2\n4. Conclusion..."
                        defaultValue={selectedIdea.fullOutline}
                      />
                    </div>
                    <div className="flex justify-between">
                      <button className="glass bg-white/5 border border-white/10 rounded-lg px-4 py-2 transition-standard hover:bg-white/10 flex items-center gap-2">
                        <Save className="h-4 w-4 text-[#a3a3a3]" />
                        <span className="text-sm text-[#f5f5f5]">Save Outline</span>
                      </button>
                      <button className="glass bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-orange-500/20 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-orange-400" />
                        <span className="text-sm text-orange-300">AI Enhance</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {rightPanelTab === "content" && (
                <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                      <Edit3 className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#f5f5f5]">{selectedIdea.format} Content</h3>
                      <p className="text-sm text-[#a3a3a3]">Write and refine your final content</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-[#f5f5f5] block mb-2">Content Title</label>
                      <input
                        className="w-full h-10 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm px-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
                        placeholder="Enter your content title..."
                        defaultValue={selectedIdea.hook}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-[#f5f5f5] block mb-2">Full Content</label>
                      <textarea
                        className="w-full h-80 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm p-4 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10 resize-none"
                        placeholder="Start writing your content here...\n\nTip: Use the outline from the previous step as your guide."
                        defaultValue={selectedIdea.fullContent}
                      />
                    </div>
                    <div className="flex justify-between">
                      <button className="glass bg-white/5 border border-white/10 rounded-lg px-4 py-2 transition-standard hover:bg-white/10 flex items-center gap-2">
                        <Save className="h-4 w-4 text-[#a3a3a3]" />
                        <span className="text-sm text-[#f5f5f5]">Save Draft</span>
                      </button>
                      <button className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-blue-500/20 flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-300">AI Enhance</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-hidden transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="h-full flex flex-col"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 p-6 border-b border-white/5">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Brain className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Content Ideation</h1>
            <p className="text-sm text-[#a3a3a3]">Transform signals and mentions into compelling content ideas</p>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg px-4 py-2 transition-standard hover:bg-white/5 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-[#f5f5f5]">Analytics</span>
            </button>
            <button
              onClick={() => setShowLibrary(!showLibrary)}
              className="glass bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-green-500/20 flex items-center gap-2"
            >
              <FolderOpen className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">Content Library</span>
            </button>
          </div>
        </motion.div>

        {/* Two Panel Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Signals/Mentions */}
          <motion.div
            variants={itemVariants}
            className="w-1/3 border-r border-white/5 p-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
          >
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              {renderLeftPanel()}
            </div>
          </motion.div>

          {/* Right Panel - Content Workflow */}
          <motion.div
            variants={itemVariants}
            className="flex-1 p-6 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={rightPanelTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {renderRightPanel()}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>

      {/* Signal Detail Popup */}
      <AnimatePresence>
        {showSignalPopup && selectedSignalForView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSignalPopup(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass bg-[#0a0a0a]/95 border border-white/10 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <Radio className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-[#f5f5f5]">{selectedSignalForView.name}</h2>
                    <p className="text-sm text-[#a3a3a3]">Innovation Signal Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSignalPopup(false)}
                  className="glass bg-white/5 border border-white/10 rounded-lg p-2 transition-standard hover:bg-white/10"
                >
                  <X className="h-5 w-5 text-[#f5f5f5]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <h3 className="text-lg font-medium text-[#f5f5f5] mb-3">Description</h3>
                  <p className="text-sm text-[#a3a3a3] leading-relaxed">
                    {selectedSignalForView.description || 'No detailed description available for this signal.'}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="h-4 w-4 text-orange-400" />
                      <span className="text-sm font-medium text-orange-300">Confidence</span>
                    </div>
                    <div className="text-lg font-semibold text-[#f5f5f5]">
                      {Math.round((selectedSignalForView.confidence || 0.5) * 100)}%
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-1">
                      {selectedSignalForView.confidence > 0.8 ? 'High confidence' : selectedSignalForView.confidence > 0.5 ? 'Medium confidence' : 'Low confidence'}
                    </div>
                  </div>

                  <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-medium text-blue-300">Timeline</span>
                    </div>
                    <div className="text-sm font-semibold text-[#f5f5f5]">
                      {getLifecycleConfig(selectedSignalForView.lifecycle).label}
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-1">
                      Added {selectedSignalForView.createdAt ? new Date(selectedSignalForView.createdAt).toLocaleDateString() : 'Unknown'}
                    </div>
                  </div>

                  <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building className="h-4 w-4 text-green-400" />
                      <span className="text-sm font-medium text-green-300">Industry</span>
                    </div>
                    <div className="text-sm font-semibold text-[#f5f5f5]">
                      {selectedSignalForView.industry || 'Technology'}
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-1">
                      Primary sector
                    </div>
                  </div>

                  <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-300">Region</span>
                    </div>
                    <div className="text-sm font-semibold text-[#f5f5f5]">
                      {selectedSignalForView.region || 'Global'}
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-1">
                      Geographic scope
                    </div>
                  </div>

                  <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-4 w-4 text-red-400" />
                      <span className="text-sm font-medium text-red-300">Impact</span>
                    </div>
                    <div className="text-sm font-semibold text-[#f5f5f5]">
                      {selectedSignalForView.impact || 'Medium'}
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-1">
                      Expected disruption
                    </div>
                  </div>

                  <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-yellow-300">Velocity</span>
                    </div>
                    <div className="text-sm font-semibold text-[#f5f5f5]">
                      {selectedSignalForView.velocity || 'Moderate'}
                    </div>
                    <div className="text-xs text-[#a3a3a3] mt-1">
                      Rate of change
                    </div>
                  </div>
                </div>

                {/* Tags */}
                {selectedSignalForView.tags && selectedSignalForView.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-[#f5f5f5] mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSignalForView.tags.map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-full bg-purple-500/20 text-xs text-purple-300 border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {selectedSignalForView.sources && selectedSignalForView.sources.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-[#f5f5f5] mb-3 flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Sources
                    </h3>
                    <div className="space-y-2">
                      {selectedSignalForView.sources.map((source: any, index: number) => (
                        <div key={index} className="glass bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            <span className="text-sm font-medium text-[#f5f5f5]">{source.title || `Source ${index + 1}`}</span>
                          </div>
                          <p className="text-xs text-[#a3a3a3] mb-2">{source.description || 'No description available'}</p>
                          {source.url && (
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Source
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis */}
                {selectedSignalForView.analysis && (
                  <div>
                    <h3 className="text-lg font-medium text-[#f5f5f5] mb-3 flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Analysis
                    </h3>
                    <div className="glass bg-white/5 border border-white/10 rounded-lg p-4">
                      <p className="text-sm text-[#a3a3a3] leading-relaxed">
                        {selectedSignalForView.analysis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        handleSignalSelect(selectedSignalForView._id);
                        setShowSignalPopup(false);
                      }}
                      className={cn(
                        "glass border rounded-lg px-4 py-2 transition-standard flex items-center gap-2",
                        selectedSignalIds.includes(selectedSignalForView._id)
                          ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                          : "bg-white/5 border-white/10 text-[#f5f5f5] hover:bg-white/10"
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {selectedSignalIds.includes(selectedSignalForView._id) ? 'Selected' : 'Select Signal'}
                    </button>
                    <button className="glass bg-white/5 border border-white/10 rounded-lg px-4 py-2 transition-standard hover:bg-white/10 flex items-center gap-2">
                      <Bookmark className="h-4 w-4 text-[#a3a3a3]" />
                      <span className="text-sm text-[#f5f5f5]">Save to Library</span>
                    </button>
                  </div>
                  <button className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-purple-500/20 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-purple-300">Generate Ideas</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}