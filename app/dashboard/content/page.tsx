"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Plus,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Copy,
  Download,
  X,
  Pause,
  Play,
  RefreshCw,
  Target,
  Zap,
  Activity,
  Lightbulb,
  LayoutTemplate,
  Bookmark,
  BookmarkCheck,
  PlusCircle,
  Archive
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

type ContentStatus = "draft" | "scheduled" | "published" | "archived";
type ContentType = "blog" | "social" | "newsletter" | "report";

interface ContentDraft {
  _id: string;
  title: string;
  content: string;
  status: ContentStatus;
  templateId?: string;
  scheduledAt?: number;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  tags: string[];
}

interface ContentTemplate {
  _id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  variables: string[];
  isSystem: boolean;
  metadata?: any;
  createdAt: number;
  updatedAt: number;
  usageCount: number;
}

interface ContentIdea {
  _id: string;
  title: string;
  description: string;
  type: ContentType;
  status: "saved" | "in_progress" | "completed";
  sourceSignalId?: string;
  sourceSignalName?: string;
  estimatedWordCount: number;
  priority: number;
  tags: string[];
  metadata?: any;
  createdAt: number;
  updatedAt: number;
}

export default function ContentPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("drafts");
  const [selectedDrafts, setSelectedDrafts] = useState<string[]>([]);
  const [editingDraft, setEditingDraft] = useState<ContentDraft | null>(null);
  const [editingLayoutTemplate, setEditingLayoutTemplate] = useState<ContentTemplate | null>(null);
  const [createDraftDialogOpen, setCreateDraftDialogOpen] = useState(false);
  const [createLayoutTemplateDialogOpen, setCreateLayoutTemplateDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [schedulingDraft, setSchedulingDraft] = useState<ContentDraft | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentDraft | ContentTemplate | ContentIdea | null>(null);
  const [saveIdeaDialogOpen, setSaveIdeaDialogOpen] = useState(false);

  // Form data for creating/editing drafts
  const [draftFormData, setDraftFormData] = useState({
    title: "",
    content: "",
    templateId: "",
    tags: [] as string[],
    metadata: {},
  });

  // Form data for creating/editing templates
  const [templateFormData, setLayoutTemplateFormData] = useState({
    name: "",
    description: "",
    category: "",
    template: "",
    variables: [] as string[],
    metadata: {},
  });

  // Form data for saving ideas
  const [ideaFormData, setIdeaFormData] = useState({
    title: "",
    description: "",
    type: "blog" as ContentType,
    sourceSignalId: "",
    estimatedWordCount: 500,
    priority: 3,
    tags: [] as string[],
    metadata: {},
  });

  // Scheduling form data
  const [scheduleData, setScheduleData] = useState({
    scheduledAt: "",
  });

  // Convex queries for drafts
  const drafts = useQuery(api.contentIdeation.listDrafts, {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 50,
  });

  const scheduledDrafts = useQuery(api.contentIdeation.listScheduledDrafts, {});

  // Convex queries for templates
  const templates = useQuery(api.contentIdeation.listTemplates, {
    category: statusFilter === "all" ? undefined : statusFilter,
    limit: 50,
  });

  // Convex queries for ideas
  const savedIdeas = useQuery(api.contentIdeation.listSavedIdeas, {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 50,
  });

  // Convex mutations for drafts
  const createDraft = useMutation(api.contentIdeation.createDraft);
  const updateDraft = useMutation(api.contentIdeation.updateDraft);
  const deleteDraft = useMutation(api.contentIdeation.deleteDraft);
  const scheduleDraft = useMutation(api.contentIdeation.scheduleDraft);
  const unscheduleDraft = useMutation(api.contentIdeation.unscheduleDraft);

  // Convex mutations for templates
  const createLayoutTemplate = useMutation(api.contentIdeation.createTemplate);

  // Convex mutations for ideas
  const saveIdea = useMutation(api.contentIdeation.saveIdea);
  const deleteSavedIdea = useMutation(api.contentIdeation.deleteSavedIdea);

  // Handler functions for drafts
  const handleCreateDraft = async () => {
    try {
      await createDraft({
        title: draftFormData.title,
        content: draftFormData.content,
        templateId: draftFormData.templateId || undefined,
        tags: draftFormData.tags,
        metadata: draftFormData.metadata,
      });

      toast.success("Draft created successfully");
      setCreateDraftDialogOpen(false);
      resetDraftFormData();
    } catch (error: any) {
      toast.error(`Failed to create draft: ${error.message}`);
    }
  };

  const handleUpdateDraft = async () => {
    if (!editingDraft) return;

    try {
      await updateDraft({
        draftId: editingDraft._id,
        title: draftFormData.title,
        content: draftFormData.content,
        tags: draftFormData.tags,
        metadata: draftFormData.metadata,
      });

      toast.success("Draft updated successfully");
      setEditingDraft(null);
      resetDraftFormData();
    } catch (error: any) {
      toast.error(`Failed to update draft: ${error.message}`);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    try {
      await deleteDraft({ draftId: id });
      toast.success("Draft deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete draft: ${error.message}`);
    }
  };

  const handleScheduleDraft = async () => {
    if (!schedulingDraft || !scheduleData.scheduledAt) return;

    try {
      const scheduledAt = new Date(scheduleData.scheduledAt).getTime();
      await scheduleDraft({
        draftId: schedulingDraft._id,
        scheduledAt,
      });

      toast.success("Draft scheduled successfully");
      setScheduleDialogOpen(false);
      setSchedulingDraft(null);
      resetScheduleData();
    } catch (error: any) {
      toast.error(`Failed to schedule draft: ${error.message}`);
    }
  };

  // Handler functions for templates
  const handleCreateLayoutTemplate = async () => {
    try {
      await createLayoutTemplate({
        name: templateFormData.name,
        description: templateFormData.description,
        category: templateFormData.category,
        template: templateFormData.template,
        variables: templateFormData.variables,
        metadata: templateFormData.metadata,
      });

      toast.success("LayoutTemplate created successfully");
      setCreateLayoutTemplateDialogOpen(false);
      resetLayoutTemplateFormData();
    } catch (error: any) {
      toast.error(`Failed to create template: ${error.message}`);
    }
  };

  // Handler functions for ideas
  const handleSaveIdea = async () => {
    try {
      await saveIdea({
        title: ideaFormData.title,
        description: ideaFormData.description,
        type: ideaFormData.type,
        sourceSignalId: ideaFormData.sourceSignalId || undefined,
        estimatedWordCount: ideaFormData.estimatedWordCount,
        priority: ideaFormData.priority,
        tags: ideaFormData.tags,
        metadata: ideaFormData.metadata,
      });

      toast.success("Idea saved successfully");
      setSaveIdeaDialogOpen(false);
      resetIdeaFormData();
    } catch (error: any) {
      toast.error(`Failed to save idea: ${error.message}`);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    try {
      await deleteSavedIdea({ ideaId: id });
      toast.success("Idea deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete idea: ${error.message}`);
    }
  };

  // Reset form functions
  const resetDraftFormData = () => {
    setDraftFormData({
      title: "",
      content: "",
      templateId: "",
      tags: [],
      metadata: {},
    });
  };

  const resetLayoutTemplateFormData = () => {
    setLayoutTemplateFormData({
      name: "",
      description: "",
      category: "",
      template: "",
      variables: [],
      metadata: {},
    });
  };

  const resetIdeaFormData = () => {
    setIdeaFormData({
      title: "",
      description: "",
      type: "blog",
      sourceSignalId: "",
      estimatedWordCount: 500,
      priority: 3,
      tags: [],
      metadata: {},
    });
  };

  const resetScheduleData = () => {
    setScheduleData({
      scheduledAt: "",
    });
  };

  // Helper functions
  const openEditDraftDialog = (draft: ContentDraft) => {
    setEditingDraft(draft);
    setDraftFormData({
      title: draft.title,
      content: draft.content,
      templateId: draft.templateId || "",
      tags: draft.tags,
      metadata: {},
    });
  };

  const openScheduleDialog = (draft: ContentDraft) => {
    setSchedulingDraft(draft);
    setScheduleData({
      scheduledAt: draft.scheduledAt
        ? new Date(draft.scheduledAt).toISOString().slice(0, 16)
        : "",
    });
    setScheduleDialogOpen(true);
  };

  const getStatusBadge = (status: ContentStatus) => {
    const configs = {
      draft: { color: "bg-gray-500/10 text-gray-300 border-gray-500/20", icon: FileText },
      scheduled: { color: "bg-blue-500/10 text-blue-300 border-blue-500/20", icon: Clock },
      published: { color: "bg-green-500/10 text-green-300 border-green-500/20", icon: CheckCircle },
      archived: { color: "bg-amber-500/10 text-amber-300 border-amber-500/20", icon: Archive },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
      <div className={cn("flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border", config.color)}>
        <Icon className="h-3 w-3" />
        <span className="capitalize">{status}</span>
      </div>
    );
  };

  const handleItemClick = (item: ContentDraft | ContentTemplate | ContentIdea) => {
    setSelectedItem(item);
    setSidePanelOpen(true);
  };

  // Calculate stats
  const totalDrafts = drafts?.length || 0;
  const draftCount = drafts?.filter((d: any) => d.status === "draft").length || 0;
  const scheduledCount = drafts?.filter((d: any) => d.status === "scheduled").length || 0;
  const publishedCount = drafts?.filter((d: any) => d.status === "published").length || 0;
  const totalLayoutTemplates = templates?.length || 0;
  const totalIdeas = savedIdeas?.length || 0;

  return (
    <div className="min-h-screen">
      <div className="p-8 max-w-[1400px]">
        {/* Header - Inline Stats + Actions */}
        <div className="flex items-center justify-between mb-8">
          {/* Inline Stats */}
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{totalDrafts}</span>
              <span className="text-sm text-muted-foreground">drafts</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{totalLayoutTemplates}</span>
              <span className="text-sm text-muted-foreground">templates</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{totalIdeas}</span>
              <span className="text-sm text-muted-foreground">ideas</span>
              {totalIdeas > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 ml-1" />}
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{publishedCount}</span>
              <span className="text-sm text-muted-foreground">published</span>
              {publishedCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 ml-1" />}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSaveIdeaDialogOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm"
            >
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span>Save Idea</span>
            </button>
            <button
              onClick={() => setCreateDraftDialogOpen(true)}
              className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Draft
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Filters</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search" className="text-foreground">Search Content</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="search"
                    placeholder="Search drafts, templates, ideas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted border text-foreground placeholder:text-muted-foreground/60"
                  />
                </div>
              </div>
              <div>
                <Label className="text-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-muted border text-foreground">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-background-elevated border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted">All Statuses</SelectItem>
                    <SelectItem value="draft" className="text-foreground focus:bg-muted">Draft</SelectItem>
                    <SelectItem value="scheduled" className="text-foreground focus:bg-muted">Scheduled</SelectItem>
                    <SelectItem value="published" className="text-foreground focus:bg-muted">Published</SelectItem>
                    <SelectItem value="archived" className="text-foreground focus:bg-muted">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted border">
            <TabsTrigger value="drafts" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <FileText className="h-4 w-4 mr-2" />
              Drafts
            </TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <LayoutTemplate className="h-4 w-4 mr-2" />
              LayoutTemplates
            </TabsTrigger>
            <TabsTrigger value="ideas" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Lightbulb className="h-4 w-4 mr-2" />
              Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="drafts" className="space-y-6 mt-6">
            {/* Content Drafts */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Content Drafts</h3>
                  {selectedDrafts.length > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        selectedDrafts.forEach(id => handleDeleteDraft(id));
                        setSelectedDrafts([]);
                      }}
                      className="bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete ({selectedDrafts.length})
                    </Button>
                  )}
                </div>

                {drafts && drafts.length > 0 ? (
                  <div className="space-y-4">
                    {drafts.map((draft: any) => (
                      <div
                        key={draft._id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted border hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => handleItemClick(draft)}
                      >
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={selectedDrafts.includes(draft._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedDrafts(prev => [...prev, draft._id]);
                              } else {
                                setSelectedDrafts(prev => prev.filter(id => id !== draft._id));
                              }
                            }}
                            className="border"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <FileText className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{draft.title}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground/60">
                                {draft.wordCount} words
                              </span>
                              <span className="text-xs text-muted-foreground/60">
                                Updated: {new Date(draft.updatedAt).toLocaleDateString()}
                              </span>
                              {getStatusBadge(draft.status)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditDraftDialog(draft);
                            }}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {draft.status === "draft" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                openScheduleDialog(draft);
                              }}
                              className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            >
                              <Calendar className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDraft(draft._id);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No drafts found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first content draft to get started
                    </p>
                    <Button
                      onClick={() => setCreateDraftDialogOpen(true)}
                      className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Draft
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6 mt-6">
            {/* Content LayoutTemplates */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Content LayoutTemplates</h3>
                  <Button
                    onClick={() => setCreateLayoutTemplateDialogOpen(true)}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create LayoutTemplate
                  </Button>
                </div>

                {templates && templates.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {templates.map((template: any) => (
                      <div
                        key={template._id}
                        className="p-4 rounded-lg bg-muted border hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => handleItemClick(template)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                              <LayoutTemplate className="h-4 w-4 text-blue-400" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{template.name}</h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                                  {template.category}
                                </Badge>
                                {template.isSystem && (
                                  <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                                    System
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {template.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                          <span>Used {template.usageCount} times</span>
                          <span>{template.variables.length} variables</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <LayoutTemplate className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No templates found</h3>
                    <p className="text-muted-foreground mb-4">
                      Create reusable content templates to speed up your workflow
                    </p>
                    <Button
                      onClick={() => setCreateLayoutTemplateDialogOpen(true)}
                      className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create LayoutTemplate
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ideas" className="space-y-6 mt-6">
            {/* Content Ideas */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Saved Content Ideas</h3>
                </div>

                {savedIdeas && savedIdeas.length > 0 ? (
                  <div className="space-y-4">
                    {savedIdeas.map((idea: any) => (
                      <div
                        key={idea._id}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted border hover:bg-muted/80 transition-colors cursor-pointer"
                        onClick={() => handleItemClick(idea)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                            <Lightbulb className="h-5 w-5 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{idea.title}</h4>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                                {idea.type}
                              </Badge>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={cn(
                                      "w-2 h-2 rounded-full",
                                      i < idea.priority ? "bg-amber-400" : "bg-gray-600"
                                    )}
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground/60">
                                ~{idea.estimatedWordCount} words
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              // Create draft from idea
                              setDraftFormData({
                                title: idea.title,
                                content: idea.description,
                                templateId: "",
                                tags: idea.tags,
                                metadata: {},
                              });
                              setCreateDraftDialogOpen(true);
                            }}
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                          >
                            <PlusCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteIdea(idea._id);
                            }}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Lightbulb className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No ideas saved</h3>
                    <p className="text-muted-foreground mb-4">
                      Save content ideas from signals and mentions to organize your inspiration
                    </p>
                    <Button
                      onClick={() => setSaveIdeaDialogOpen(true)}
                      className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                    >
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Save Idea
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Side Panel - Content Details */}
      {sidePanelOpen && selectedItem && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border z-50">
          <div className="p-6 h-full overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">
                {'content' in selectedItem ? 'Draft Details' :
                 'template' in selectedItem ? 'LayoutTemplate Details' : 'Idea Details'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidePanelOpen(false)}
                className="p-1.5 h-auto text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Title</h3>
                <p className="font-medium text-foreground">
                  {'title' in selectedItem ? selectedItem.title :
                   'name' in selectedItem ? selectedItem.name : 'Unknown'}
                </p>
              </div>

              {'content' in selectedItem && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Content Preview</h3>
                    <div className="p-3 rounded-lg bg-muted border max-h-40 overflow-auto">
                      <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">
                        {(selectedItem as ContentDraft).content}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Word Count</h3>
                      <span className="text-foreground">{(selectedItem as ContentDraft).wordCount}</span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                      {getStatusBadge((selectedItem as ContentDraft).status)}
                    </div>
                  </div>
                </>
              )}

              {'template' in selectedItem && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-foreground">{(selectedItem as ContentTemplate).description}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">LayoutTemplate Preview</h3>
                    <div className="p-3 rounded-lg bg-muted border max-h-32 overflow-auto">
                      <p className="text-sm text-foreground font-mono whitespace-pre-wrap">
                        {(selectedItem as ContentTemplate).template}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Variables</h3>
                    <div className="flex flex-wrap gap-1">
                      {(selectedItem as ContentTemplate).variables.map((variable) => (
                        <Badge key={variable} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {'description' in selectedItem && !('template' in selectedItem) && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
                    <p className="text-foreground">{(selectedItem as ContentIdea).description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Type</h3>
                      <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                        {(selectedItem as ContentIdea).type}
                      </Badge>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-2 h-2 rounded-full",
                              i < (selectedItem as ContentIdea).priority ? "bg-amber-400" : "bg-gray-600"
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {'tags' in selectedItem && (selectedItem as any).tags?.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {(selectedItem as any).tags.map((tag: string) => (
                      <Badge key={tag} className="bg-gray-500/20 text-gray-300 border-gray-500/30 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t">
                {'content' in selectedItem ? (
                  <Button
                    size="sm"
                    onClick={() => openEditDraftDialog(selectedItem as ContentDraft)}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Draft
                  </Button>
                ) : 'template' in selectedItem ? (
                  <Button
                    size="sm"
                    onClick={() => {
                      // Use template to create new draft
                      const template = selectedItem as ContentTemplate;
                      setDraftFormData({
                        title: `New ${template.category} content`,
                        content: template.template,
                        templateId: template._id,
                        tags: [],
                        metadata: {},
                      });
                      setCreateDraftDialogOpen(true);
                    }}
                    className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Use LayoutTemplate
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => {
                      // Create draft from idea
                      const idea = selectedItem as ContentIdea;
                      setDraftFormData({
                        title: idea.title,
                        content: idea.description,
                        templateId: "",
                        tags: idea.tags,
                        metadata: {},
                      });
                      setCreateDraftDialogOpen(true);
                    }}
                    className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Create Draft
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Draft Dialog */}
      <Dialog open={createDraftDialogOpen} onOpenChange={setCreateDraftDialogOpen}>
        <DialogContent className="max-w-2xl bg-background-elevated border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Content Draft</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Start working on a new content piece
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="draft-title" className="text-foreground">Title</Label>
              <Input
                id="draft-title"
                value={draftFormData.title}
                onChange={(e) => setDraftFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <Label htmlFor="draft-content" className="text-foreground">Content</Label>
              <Textarea
                id="draft-content"
                value={draftFormData.content}
                onChange={(e) => setDraftFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing your content..."
                rows={12}
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <Label className="text-foreground">LayoutTemplate (Optional)</Label>
              <Select value={draftFormData.templateId} onValueChange={(value) => setDraftFormData(prev => ({ ...prev, templateId: value }))}>
                <SelectTrigger className="bg-muted border text-foreground">
                  <SelectValue placeholder="Select a template (optional)" />
                </SelectTrigger>
                <SelectContent className="bg-background-elevated border">
                  <SelectItem value="" className="text-foreground focus:bg-muted">No LayoutTemplate</SelectItem>
                  {templates?.map((template: any) => (
                    <SelectItem key={template._id} value={template._id} className="text-foreground focus:bg-muted">
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDraftDialogOpen(false)}
              className="bg-muted border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateDraft}
              disabled={!draftFormData.title || !draftFormData.content}
              className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
            >
              Create Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Draft Dialog */}
      <Dialog open={!!editingDraft} onOpenChange={() => setEditingDraft(null)}>
        <DialogContent className="max-w-2xl bg-background-elevated border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Edit Content Draft</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Make changes to your content draft
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-draft-title" className="text-foreground">Title</Label>
              <Input
                id="edit-draft-title"
                value={draftFormData.title}
                onChange={(e) => setDraftFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter content title"
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <Label htmlFor="edit-draft-content" className="text-foreground">Content</Label>
              <Textarea
                id="edit-draft-content"
                value={draftFormData.content}
                onChange={(e) => setDraftFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing your content..."
                rows={12}
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingDraft(null)}
              className="bg-muted border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateDraft}
              disabled={!draftFormData.title || !draftFormData.content}
              className="bg-purple-500/20 border border-purple-500/30 text-purple-300 hover:bg-purple-500/30"
            >
              Update Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create LayoutTemplate Dialog */}
      <Dialog open={createLayoutTemplateDialogOpen} onOpenChange={setCreateLayoutTemplateDialogOpen}>
        <DialogContent className="max-w-2xl bg-background-elevated border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Create Content LayoutTemplate</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a reusable template for content creation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="template-name" className="text-foreground">LayoutTemplate Name</Label>
                <Input
                  id="template-name"
                  value={templateFormData.name}
                  onChange={(e) => setLayoutTemplateFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter template name"
                  className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
              <div>
                <Label className="text-foreground">Category</Label>
                <Select value={templateFormData.category} onValueChange={(value) => setLayoutTemplateFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="bg-muted border text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-background-elevated border">
                    <SelectItem value="blog" className="text-foreground focus:bg-muted">Blog Post</SelectItem>
                    <SelectItem value="social" className="text-foreground focus:bg-muted">Social Media</SelectItem>
                    <SelectItem value="newsletter" className="text-foreground focus:bg-muted">Newsletter</SelectItem>
                    <SelectItem value="report" className="text-foreground focus:bg-muted">Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="template-description" className="text-foreground">Description</Label>
              <Input
                id="template-description"
                value={templateFormData.description}
                onChange={(e) => setLayoutTemplateFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this template is for"
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <Label htmlFor="template-content" className="text-foreground">LayoutTemplate Content</Label>
              <Textarea
                id="template-content"
                value={templateFormData.template}
                onChange={(e) => setLayoutTemplateFormData(prev => ({ ...prev, template: e.target.value }))}
                placeholder="Use {{variable_name}} for dynamic content..."
                rows={8}
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
              <p className="text-xs text-muted-foreground/60 mt-1">
                {"Use double curly braces for variables: {{title}}, {{content}}, etc."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateLayoutTemplateDialogOpen(false)}
              className="bg-muted border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateLayoutTemplate}
              disabled={!templateFormData.name || !templateFormData.template || !templateFormData.category}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
            >
              Create LayoutTemplate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Save Idea Dialog */}
      <Dialog open={saveIdeaDialogOpen} onOpenChange={setSaveIdeaDialogOpen}>
        <DialogContent className="max-w-lg bg-background-elevated border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Save Content Idea</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Capture a content idea for future development
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="idea-title" className="text-foreground">Idea Title</Label>
              <Input
                id="idea-title"
                value={ideaFormData.title}
                onChange={(e) => setIdeaFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your content idea"
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div>
              <Label htmlFor="idea-description" className="text-foreground">Description</Label>
              <Textarea
                id="idea-description"
                value={ideaFormData.description}
                onChange={(e) => setIdeaFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your idea in detail..."
                rows={4}
                className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground">Content Type</Label>
                <Select value={ideaFormData.type} onValueChange={(value: ContentType) => setIdeaFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-muted border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-background-elevated border">
                    <SelectItem value="blog" className="text-foreground focus:bg-muted">Blog Post</SelectItem>
                    <SelectItem value="social" className="text-foreground focus:bg-muted">Social Media</SelectItem>
                    <SelectItem value="newsletter" className="text-foreground focus:bg-muted">Newsletter</SelectItem>
                    <SelectItem value="report" className="text-foreground focus:bg-muted">Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="idea-words" className="text-foreground">Est. Word Count</Label>
                <Input
                  id="idea-words"
                  type="number"
                  value={ideaFormData.estimatedWordCount}
                  onChange={(e) => setIdeaFormData(prev => ({ ...prev, estimatedWordCount: parseInt(e.target.value) || 0 }))}
                  placeholder="500"
                  className="bg-muted border text-foreground placeholder:text-muted-foreground/60"
                />
              </div>
            </div>
            <div>
              <Label className="text-foreground">Priority</Label>
              <div className="flex items-center gap-2 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setIdeaFormData(prev => ({ ...prev, priority: i + 1 }))}
                    className={cn(
                      "w-4 h-4 rounded-full transition-colors",
                      i < ideaFormData.priority ? "bg-amber-400" : "bg-gray-600 hover:bg-gray-500"
                    )}
                  />
                ))}
                <span className="text-sm text-muted-foreground ml-2">{ideaFormData.priority}/5</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSaveIdeaDialogOpen(false)}
              className="bg-muted border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveIdea}
              disabled={!ideaFormData.title || !ideaFormData.description}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
            >
              <Bookmark className="h-4 w-4 mr-2" />
              Save Idea
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Draft Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-lg bg-background-elevated border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Schedule Draft</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Set when this draft should be published
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="schedule-date" className="text-foreground">Publish Date & Time</Label>
              <Input
                id="schedule-date"
                type="datetime-local"
                value={scheduleData.scheduledAt}
                onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                className="bg-muted border text-foreground"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              className="bg-muted border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleDraft}
              disabled={!scheduleData.scheduledAt}
              className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}