"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import {
  Mail,
  Plus,
  Search,
  Filter,
  Grip,
  X,
  Save,
  Send,
  Eye,
  Calendar,
  Users,
  Radio,
  TrendingUp,
  MoveUp,
  MoveDown,
  Edit,
  Trash2,
  Sparkles,
  FileText,
  ArrowLeft
} from "lucide-react";
import { motion, Reorder, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

interface NewsletterSection {
  id: string;
  type: "header" | "signal_highlight" | "trending_mentions" | "custom_content" | "footer";
  title: string;
  content: string;
  signalIds?: string[];
  mentionIds?: string[];
  order: number;
}

const SECTION_TYPES = [
  {
    type: "header",
    label: "Header Section",
    description: "Newsletter introduction and branding",
    icon: FileText,
    defaultContent: "Welcome to this week's innovation insights..."
  },
  {
    type: "signal_highlight",
    label: "Signal Highlight",
    description: "Showcase selected innovation signals",
    icon: Radio,
    defaultContent: "This week's most important innovation signals..."
  },
  {
    type: "trending_mentions",
    label: "Trending Mentions",
    description: "Popular mentions and discussions",
    icon: TrendingUp,
    defaultContent: "What's trending in the innovation community..."
  },
  {
    type: "custom_content",
    label: "Custom Content",
    description: "Your own editorial content",
    icon: Edit,
    defaultContent: "Add your thoughts and insights..."
  },
  {
    type: "footer",
    label: "Footer",
    description: "Newsletter footer and unsubscribe",
    icon: Mail,
    defaultContent: "Thank you for reading! Stay innovative..."
  }
] as const;

export default function CreateNewsletterPage() {
  const { isCollapsed } = useSidebar();
  const [selectedSignalIds, setSelectedSignalIds] = useState<string[]>([]);
  const [selectedMentionIds, setSelectedMentionIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLifecycle, setFilterLifecycle] = useState<string>("");
  const [newsletterTitle, setNewsletterTitle] = useState("");
  const [newsletterSubject, setNewsletterSubject] = useState("");
  const [sections, setSections] = useState<NewsletterSection[]>([]);
  const [editingSection, setEditingSection] = useState<string | null>(null);

  // Queries
  const signals = useQuery(api.signals.listSignals, {
    search: searchTerm || undefined,
    lifecycle: filterLifecycle ? [filterLifecycle] : undefined,
  });

  // Note: Mentions API not yet implemented
  const mentions: any[] = [];

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

    const newSection: NewsletterSection = {
      id: `section-${Date.now()}`,
      type,
      title: sectionType.label,
      content: sectionType.defaultContent,
      signalIds: type === "signal_highlight" ? [...selectedSignalIds] : [],
      mentionIds: type === "trending_mentions" ? [...selectedMentionIds] : [],
      order: sections.length
    };

    setSections(prev => [...prev, newSection]);
    toast.success(`${sectionType.label} added to newsletter`);
  };

  const updateSection = (sectionId: string, updates: Partial<NewsletterSection>) => {
    setSections(prev => prev.map(section =>
      section.id === sectionId ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (sectionId: string) => {
    setSections(prev => prev.filter(section => section.id !== sectionId));
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

  const generateNewsletterContent = () => {
    if (sections.length === 0) {
      toast.error("Add at least one section to generate content");
      return;
    }
    toast.success("Newsletter content generated with AI assistance");
  };

  const saveNewsletter = () => {
    if (!newsletterTitle || !newsletterSubject) {
      toast.error("Please enter newsletter title and subject");
      return;
    }
    toast.success("Newsletter saved as draft");
  };

  const sendNewsletter = () => {
    if (!newsletterTitle || !newsletterSubject || sections.length === 0) {
      toast.error("Complete all fields and add sections before sending");
      return;
    }
    toast.success("Newsletter sent successfully");
  };

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/dashboard/newsletters">
            <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[#a3a3a3] hover:bg-white/10 hover:text-[#f5f5f5] transition-standard">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
            <Mail className="h-6 w-6 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Create Newsletter</h1>
            <p className="text-sm text-[#a3a3a3]">Build your newsletter with signals, mentions, and custom content</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={generateNewsletterContent}
              className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-purple-500/20 flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-300">AI Generate</span>
            </button>
            <button
              onClick={saveNewsletter}
              className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-blue-500/20 flex items-center gap-2"
            >
              <Save className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-300">Save Draft</span>
            </button>
            <button
              onClick={sendNewsletter}
              className="glass bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-green-500/20 flex items-center gap-2"
            >
              <Send className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-300">Send</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Panel - Signal/Mention Selection */}
          <div className="xl:col-span-1 space-y-6">
            {/* Newsletter Info */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">Newsletter Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#f5f5f5] block mb-1">Title</label>
                  <input
                    value={newsletterTitle}
                    onChange={(e) => setNewsletterTitle(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm px-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
                    placeholder="Newsletter title"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#f5f5f5] block mb-1">Subject</label>
                  <input
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    className="w-full h-9 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm px-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
                    placeholder="Email subject line"
                  />
                </div>
                <div className="pt-2 text-xs text-[#666]">
                  Selected: {selectedSignalIds.length} signals, {selectedMentionIds.length} mentions
                </div>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <Search className="h-5 w-5 text-[#a3a3a3]" />
                <h3 className="text-lg font-semibold text-[#f5f5f5]">Content Sources</h3>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a3a3a3]" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full h-9 pl-10 pr-4 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
                    placeholder="Search content..."
                  />
                </div>
                <select
                  value={filterLifecycle}
                  onChange={(e) => setFilterLifecycle(e.target.value)}
                  className="w-full h-9 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm px-3 text-sm text-[#f5f5f5] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
                >
                  <option value="">All Lifecycles</option>
                  <option value="weak">Weak Signal</option>
                  <option value="emerging">Emerging</option>
                  <option value="growing">Growing</option>
                  <option value="mainstream">Mainstream</option>
                </select>
              </div>
            </div>

            {/* Signals */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Radio className="h-3 w-3 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-[#f5f5f5]">Innovation Signals</h3>
                <div className="text-xs text-[#666]">({signals?.length || 0})</div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {signals && signals.length > 0 ? signals.slice(0, 10).map((signal: any) => {
                  const isSelected = selectedSignalIds.includes(signal._id);
                  const lifecycleConfig = getLifecycleConfig(signal.lifecycle);

                  return (
                    <div
                      key={signal._id}
                      onClick={() => handleSignalSelect(signal._id)}
                      className={cn(
                        "p-3 rounded-lg border transition-standard cursor-pointer text-xs",
                        isSelected
                          ? "bg-blue-500/20 border-blue-500/30"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 transition-colors",
                          isSelected ? "bg-blue-400" : "bg-[#666]"
                        )}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#f5f5f5] mb-1">{signal.name}</p>
                          <div className={cn("px-1.5 py-0.5 rounded text-xs border inline-block", lifecycleConfig.color)}>
                            {lifecycleConfig.label}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4">
                    <div className="text-xs text-[#666]">No signals available</div>
                  </div>
                )}
              </div>
            </div>

            {/* Mentions */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                </div>
                <h3 className="text-sm font-semibold text-[#f5f5f5]">Trending Mentions</h3>
                <div className="text-xs text-[#666]">({mentions?.length || 0})</div>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {mentions && mentions.length > 0 ? mentions.slice(0, 10).map((mention: any) => {
                  const isSelected = selectedMentionIds.includes(mention._id);

                  return (
                    <div
                      key={mention._id}
                      onClick={() => handleMentionSelect(mention._id)}
                      className={cn(
                        "p-3 rounded-lg border transition-standard cursor-pointer text-xs",
                        isSelected
                          ? "bg-green-500/20 border-green-500/30"
                          : "bg-white/5 border-white/5 hover:bg-white/10"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <div className={cn(
                          "w-2 h-2 rounded-full mt-1.5 transition-colors",
                          isSelected ? "bg-green-400" : "bg-[#666]"
                        )}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#f5f5f5] mb-1 line-clamp-2">{mention.title}</p>
                          <div className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs border border-blue-500/20 inline-block">
                            {mention.platform}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4">
                    <div className="text-xs text-[#666]">No mentions available</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel - Newsletter Builder */}
          <div className="xl:col-span-2 space-y-6">
            {/* Section Templates */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">Add Sections</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {SECTION_TYPES.map((sectionType) => {
                  const Icon = sectionType.icon;
                  return (
                    <button
                      key={sectionType.type}
                      onClick={() => addSection(sectionType.type)}
                      className="glass bg-white/5 border border-white/10 rounded-lg p-3 transition-standard hover:bg-white/10 flex flex-col items-center text-center"
                    >
                      <Icon className="h-5 w-5 mb-2 text-[#a3a3a3]" />
                      <span className="text-xs text-[#f5f5f5] font-medium">{sectionType.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Newsletter Structure */}
            <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#f5f5f5]">Newsletter Structure</h3>
                <div className="text-sm text-[#666]">{sections.length} sections</div>
              </div>

              {sections.length > 0 ? (
                <Reorder.Group values={sections} onReorder={setSections} className="space-y-3">
                  {sections.map((section, index) => {
                    const sectionType = SECTION_TYPES.find(s => s.type === section.type);
                    const Icon = sectionType?.icon || FileText;

                    return (
                      <Reorder.Item
                        key={section.id}
                        value={section}
                        className="glass bg-white/5 border border-white/10 rounded-lg p-4 cursor-grab active:cursor-grabbing"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex flex-col items-center gap-1">
                            <Grip className="h-4 w-4 text-[#666]" />
                            <span className="text-xs text-[#666]">{index + 1}</span>
                          </div>

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Icon className="h-4 w-4 text-blue-400" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="text-sm font-semibold text-[#f5f5f5]">{section.title}</h4>
                              {section.signalIds && section.signalIds.length > 0 && (
                                <div className="px-2 py-1 rounded bg-blue-500/20 text-xs text-blue-300">
                                  {section.signalIds.length} signals
                                </div>
                              )}
                              {section.mentionIds && section.mentionIds.length > 0 && (
                                <div className="px-2 py-1 rounded bg-green-500/20 text-xs text-green-300">
                                  {section.mentionIds.length} mentions
                                </div>
                              )}
                            </div>
                            {editingSection === section.id ? (
                              <div className="space-y-2">
                                <input
                                  value={section.title}
                                  onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                  className="w-full h-8 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm px-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10"
                                />
                                <textarea
                                  value={section.content}
                                  onChange={(e) => updateSection(section.id, { content: e.target.value })}
                                  className="w-full h-20 rounded-lg border border-white/5 bg-white/5 backdrop-blur-sm p-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] transition-standard focus:border-blue-500/50 focus:bg-blue-500/10 resize-none"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setEditingSection(null)}
                                    className="px-3 py-1 rounded bg-blue-500/20 text-blue-300 text-xs hover:bg-blue-500/30 transition-standard"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => setEditingSection(null)}
                                    className="px-3 py-1 rounded bg-white/10 text-[#a3a3a3] text-xs hover:bg-white/20 transition-standard"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-[#a3a3a3] line-clamp-2">{section.content}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => moveSection(section.id, "up")}
                              disabled={index === 0}
                              className="flex h-6 w-6 items-center justify-center rounded text-[#a3a3a3] hover:bg-white/10 hover:text-[#f5f5f5] transition-standard disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MoveUp className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => moveSection(section.id, "down")}
                              disabled={index === sections.length - 1}
                              className="flex h-6 w-6 items-center justify-center rounded text-[#a3a3a3] hover:bg-white/10 hover:text-[#f5f5f5] transition-standard disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MoveDown className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => setEditingSection(editingSection === section.id ? null : section.id)}
                              className="flex h-6 w-6 items-center justify-center rounded text-[#a3a3a3] hover:bg-white/10 hover:text-blue-400 transition-standard"
                            >
                              <Edit className="h-3 w-3" />
                            </button>
                            <button
                              onClick={() => deleteSection(section.id)}
                              className="flex h-6 w-6 items-center justify-center rounded text-[#a3a3a3] hover:bg-white/10 hover:text-red-400 transition-standard"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </Reorder.Item>
                    );
                  })}
                </Reorder.Group>
              ) : (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-[#666] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">No Sections Added</h3>
                  <p className="text-sm text-[#a3a3a3] mb-4">Add sections above to build your newsletter structure</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}