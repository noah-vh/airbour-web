"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSidebar } from "@/components/dashboard/sidebar-context";
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
  Mail,
  Plus,
  Send,
  Calendar,
  Users,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  Eye,
  FileText,
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
  Activity
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

type NewsletterStatus = "draft" | "scheduled" | "published" | "failed";

interface Newsletter {
  _id: string;
  title: string;
  subject: string;
  status: NewsletterStatus;
  content?: string;
  template?: string;
  scheduledAt?: number;
  publishedAt?: number;
  recipients?: number;
  recipientCount: number;
  recipientGroups?: string[];
  openRate: number;
  clickRate: number;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  authorId: string;
}

export default function NewslettersPage() {
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedNewsletters, setSelectedNewsletters] = useState<string[]>([]);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [schedulingNewsletter, setSchedulingNewsletter] = useState<Newsletter | null>(null);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  // Form data for creating/editing newsletters
  const [formData, setFormData] = useState({
    title: "",
    subject: "",
    content: "",
    template: "default",
    recipientGroups: [] as string[],
    tags: [] as string[],
  });

  // Scheduling form data
  const [scheduleData, setScheduleData] = useState({
    scheduledAt: "",
    recipientGroups: [] as string[],
  });

  // Convex queries
  const newsletters = useQuery(api.newsletters.listNewsletters, {
    status: statusFilter === "all" ? undefined : statusFilter,
    search: searchQuery || undefined,
    limit: 50,
  });

  const scheduledNewsletters = useQuery(api.newsletters.listScheduledNewsletters, {
    upcoming: true,
    limit: 10,
  });

  // Convex mutations
  const createNewsletter = useMutation(api.newsletters.createNewsletter);
  const updateNewsletter = useMutation(api.newsletters.updateNewsletter);
  const deleteNewsletter = useMutation(api.newsletters.deleteNewsletter);
  const scheduleNewsletter = useMutation(api.newsletters.scheduleNewsletter);
  const unscheduleNewsletter = useMutation(api.newsletters.unscheduleNewsletter);

  // Handler functions
  const handleCreateNewsletter = async () => {
    try {
      await createNewsletter({
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        template: formData.template,
        recipientGroups: formData.recipientGroups,
        tags: formData.tags,
        authorId: "current-user", // Replace with actual user ID
      });

      toast.success("Newsletter created successfully");
      setCreateDialogOpen(false);
      resetFormData();
    } catch (error: any) {
      toast.error(`Failed to create newsletter: ${error.message}`);
    }
  };

  const handleUpdateNewsletter = async () => {
    if (!editingNewsletter) return;

    try {
      await updateNewsletter({
        id: editingNewsletter._id as any,
        title: formData.title,
        subject: formData.subject,
        content: formData.content,
        template: formData.template,
        recipientGroups: formData.recipientGroups,
        tags: formData.tags,
      });

      toast.success("Newsletter updated successfully");
      setEditingNewsletter(null);
      resetFormData();
    } catch (error: any) {
      toast.error(`Failed to update newsletter: ${error.message}`);
    }
  };

  const handleDeleteNewsletter = async (id: string) => {
    try {
      await deleteNewsletter({ id: id as any });
      toast.success("Newsletter deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete newsletter: ${error.message}`);
    }
  };

  const handleScheduleNewsletter = async () => {
    if (!schedulingNewsletter || !scheduleData.scheduledAt) return;

    try {
      const scheduledAt = new Date(scheduleData.scheduledAt).getTime();
      await scheduleNewsletter({
        id: schedulingNewsletter._id as any,
        scheduledAt,
        recipientGroups: scheduleData.recipientGroups,
      });

      toast.success("Newsletter scheduled successfully");
      setScheduleDialogOpen(false);
      setSchedulingNewsletter(null);
      resetScheduleData();
    } catch (error: any) {
      toast.error(`Failed to schedule newsletter: ${error.message}`);
    }
  };

  const handleUnscheduleNewsletter = async (id: string) => {
    try {
      await unscheduleNewsletter({ id: id as any });
      toast.success("Newsletter unscheduled successfully");
    } catch (error: any) {
      toast.error(`Failed to unschedule newsletter: ${error.message}`);
    }
  };

  const resetFormData = () => {
    setFormData({
      title: "",
      subject: "",
      content: "",
      template: "default",
      recipientGroups: [],
      tags: [],
    });
  };

  const resetScheduleData = () => {
    setScheduleData({
      scheduledAt: "",
      recipientGroups: [],
    });
  };

  const openEditDialog = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      title: newsletter.title,
      subject: newsletter.subject,
      content: newsletter.content || "",
      template: newsletter.template || "default",
      recipientGroups: newsletter.recipientGroups || [],
      tags: newsletter.tags || [],
    });
  };

  const openScheduleDialog = (newsletter: Newsletter) => {
    setSchedulingNewsletter(newsletter);
    setScheduleData({
      scheduledAt: newsletter.scheduledAt
        ? new Date(newsletter.scheduledAt).toISOString().slice(0, 16)
        : "",
      recipientGroups: newsletter.recipientGroups || [],
    });
    setScheduleDialogOpen(true);
  };

  const getStatusBadge = (status: NewsletterStatus) => {
    const configs = {
      draft: { color: "bg-gray-500/10 text-gray-300 border-gray-500/20", icon: FileText },
      scheduled: { color: "bg-blue-500/10 text-blue-300 border-blue-500/20", icon: Clock },
      published: { color: "bg-green-500/10 text-green-300 border-green-500/20", icon: CheckCircle },
      failed: { color: "bg-red-500/10 text-red-300 border-red-500/20", icon: AlertCircle },
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

  const handleNewsletterClick = (newsletter: Newsletter) => {
    setSelectedNewsletter(newsletter);
    setSidePanelOpen(true);
  };

  // Calculate stats
  const totalNewsletters = newsletters?.length || 0;
  const draftCount = newsletters?.filter(n => n.status === "draft").length || 0;
  const scheduledCount = newsletters?.filter(n => n.status === "scheduled").length || 0;
  const publishedCount = newsletters?.filter(n => n.status === "published").length || 0;
  const avgOpenRate = newsletters?.length ?
    (newsletters.reduce((sum, n) => sum + (n.openRate || 0), 0) / newsletters.length) : 0;

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
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Newsletter Management</h1>
              <p className="text-sm text-[#a3a3a3]">
                Create, schedule, and track newsletter campaigns
              </p>
            </div>
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Newsletter
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass bg-[#0a0a0a]/80 border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-[#f5f5f5]">{totalNewsletters}</span>
              </div>
              <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Total Newsletters</h3>
              <p className="text-xs text-[#666]">All created newsletters</p>
            </CardContent>
          </Card>

          <Card className="glass bg-[#0a0a0a]/80 border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                  <Clock className="h-4 w-4 text-yellow-400" />
                </div>
                <span className="text-2xl font-bold text-[#f5f5f5]">{scheduledCount}</span>
              </div>
              <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Scheduled</h3>
              <p className="text-xs text-[#666]">Ready to send</p>
            </CardContent>
          </Card>

          <Card className="glass bg-[#0a0a0a]/80 border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-[#f5f5f5]">{publishedCount}</span>
              </div>
              <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Published</h3>
              <p className="text-xs text-[#666]">Successfully sent</p>
            </CardContent>
          </Card>

          <Card className="glass bg-[#0a0a0a]/80 border-white/5">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-[#f5f5f5]">{Math.round(avgOpenRate * 100)}%</span>
              </div>
              <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Avg Open Rate</h3>
              <p className="text-xs text-[#666]">Across all newsletters</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="glass bg-[#0a0a0a]/80 border-white/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-[#a3a3a3]" />
                <h3 className="text-lg font-semibold text-[#f5f5f5]">Filters</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="search" className="text-[#f5f5f5]">Search Newsletters</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#666]" />
                  <Input
                    id="search"
                    placeholder="Search by title or subject..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-[#f5f5f5]">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                    <SelectItem value="all" className="text-[#f5f5f5] focus:bg-white/10">All Statuses</SelectItem>
                    <SelectItem value="draft" className="text-[#f5f5f5] focus:bg-white/10">Draft</SelectItem>
                    <SelectItem value="scheduled" className="text-[#f5f5f5] focus:bg-white/10">Scheduled</SelectItem>
                    <SelectItem value="published" className="text-[#f5f5f5] focus:bg-white/10">Published</SelectItem>
                    <SelectItem value="failed" className="text-[#f5f5f5] focus:bg-white/10">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Mail className="h-4 w-4 mr-2" />
              Newsletters
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-300">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Newsletters Table */}
            <Card className="glass bg-[#0a0a0a]/80 border-white/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#f5f5f5]">Newsletters</h3>
                  {selectedNewsletters.length > 0 && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        selectedNewsletters.forEach(id => handleDeleteNewsletter(id));
                        setSelectedNewsletters([]);
                      }}
                      className="bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete ({selectedNewsletters.length})
                    </Button>
                  )}
                </div>

                {newsletters && newsletters.length > 0 ? (
                  <div className="border border-white/5 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-white/5">
                        <TableRow className="border-white/5">
                          <TableHead className="text-[#a3a3a3] w-12">
                            <Checkbox
                              checked={selectedNewsletters.length === newsletters.length && newsletters.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedNewsletters(newsletters.map(n => n._id));
                                } else {
                                  setSelectedNewsletters([]);
                                }
                              }}
                              className="border-white/10"
                            />
                          </TableHead>
                          <TableHead className="text-[#a3a3a3]">Newsletter</TableHead>
                          <TableHead className="text-[#a3a3a3]">Status</TableHead>
                          <TableHead className="text-[#a3a3a3]">Recipients</TableHead>
                          <TableHead className="text-[#a3a3a3]">Performance</TableHead>
                          <TableHead className="text-[#a3a3a3]">Updated</TableHead>
                          <TableHead className="text-[#a3a3a3]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletters.map((newsletter) => (
                          <TableRow
                            key={newsletter._id}
                            className="border-white/5 hover:bg-white/5 cursor-pointer"
                            onClick={() => handleNewsletterClick(newsletter)}
                          >
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedNewsletters.includes(newsletter._id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedNewsletters(prev => [...prev, newsletter._id]);
                                  } else {
                                    setSelectedNewsletters(prev => prev.filter(id => id !== newsletter._id));
                                  }
                                }}
                                className="border-white/10"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-[#f5f5f5]">{newsletter.title}</p>
                                <p className="text-sm text-[#a3a3a3] line-clamp-1">
                                  {newsletter.subject}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(newsletter.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-[#666]" />
                                <span className="text-[#f5f5f5]">{newsletter.recipientCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-[#666]">Open:</span>
                                  <span className="text-green-400">{Math.round(newsletter.openRate * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-[#666]">Click:</span>
                                  <span className="text-blue-400">{Math.round(newsletter.clickRate * 100)}%</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-[#a3a3a3]">
                                {new Date(newsletter.updatedAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openEditDialog(newsletter);
                                  }}
                                  className="p-1.5 h-auto text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                {newsletter.status === "draft" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openScheduleDialog(newsletter);
                                    }}
                                    className="p-1.5 h-auto text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                                  >
                                    <Calendar className="h-4 w-4" />
                                  </Button>
                                )}
                                {newsletter.status === "scheduled" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUnscheduleNewsletter(newsletter._id);
                                    }}
                                    className="p-1.5 h-auto text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteNewsletter(newsletter._id);
                                  }}
                                  className="p-1.5 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-[#666] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#f5f5f5] mb-2">No newsletters found</h3>
                    <p className="text-[#a3a3a3] mb-4">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first newsletter to get started"
                      }
                    </p>
                    <Button
                      onClick={() => setCreateDialogOpen(true)}
                      className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Newsletter
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6 mt-6">
            {/* Scheduled Newsletters */}
            <Card className="glass bg-[#0a0a0a]/80 border-white/5">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">Upcoming Scheduled Newsletters</h3>

                {scheduledNewsletters && scheduledNewsletters.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledNewsletters.map((newsletter) => (
                      <div
                        key={newsletter._id}
                        className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-standard"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Calendar className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-[#f5f5f5]">{newsletter.title}</h4>
                            <p className="text-sm text-[#a3a3a3]">{newsletter.subject}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-[#666]">
                                Scheduled: {newsletter.scheduledAt ? new Date(newsletter.scheduledAt).toLocaleString() : 'N/A'}
                              </span>
                              <span className="text-xs text-[#666]">
                                Recipients: {newsletter.recipientCount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(newsletter)}
                            className="text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleUnscheduleNewsletter(newsletter._id)}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-[#666] mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#f5f5f5] mb-2">No scheduled newsletters</h3>
                    <p className="text-[#a3a3a3]">
                      Schedule your newsletters to automatically send them at the right time
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Side Panel - Newsletter Details */}
      {sidePanelOpen && selectedNewsletter && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#0a0a0a] border-l border-white/10 shadow-2xl z-50">
          <div className="p-6 h-full overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#f5f5f5]">Newsletter Details</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidePanelOpen(false)}
                className="p-1.5 h-auto text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Title</h3>
                <p className="font-medium text-[#f5f5f5]">{selectedNewsletter.title}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Subject Line</h3>
                <p className="text-[#f5f5f5]">{selectedNewsletter.subject}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Status</h3>
                {getStatusBadge(selectedNewsletter.status)}
              </div>

              {selectedNewsletter.content && (
                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Content Preview</h3>
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 max-h-40 overflow-auto">
                    <p className="text-sm text-[#f5f5f5] line-clamp-6">
                      {selectedNewsletter.content}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Recipients</h3>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-[#666]" />
                    <span className="text-[#f5f5f5]">{selectedNewsletter.recipientCount}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Open Rate</h3>
                  <span className="text-green-400">{Math.round(selectedNewsletter.openRate * 100)}%</span>
                </div>
              </div>

              {selectedNewsletter.scheduledAt && (
                <div>
                  <h3 className="text-sm font-medium text-[#a3a3a3] mb-2">Scheduled For</h3>
                  <p className="text-[#f5f5f5]">
                    {new Date(selectedNewsletter.scheduledAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-white/10">
                <Button
                  size="sm"
                  onClick={() => openEditDialog(selectedNewsletter)}
                  className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {selectedNewsletter.status === "draft" && (
                  <Button
                    size="sm"
                    onClick={() => openScheduleDialog(selectedNewsletter)}
                    className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
                  >
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Newsletter Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f5]">Create Newsletter</DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Create a new newsletter campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-[#f5f5f5]">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter newsletter title"
                className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-[#f5f5f5]">Subject Line</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject line"
                className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
              />
            </div>
            <div>
              <Label htmlFor="content" className="text-[#f5f5f5]">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter newsletter content"
                rows={8}
                className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
              />
            </div>
            <div>
              <Label className="text-[#f5f5f5]">Template</Label>
              <Select value={formData.template} onValueChange={(value) => setFormData(prev => ({ ...prev, template: value }))}>
                <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="default" className="text-[#f5f5f5] focus:bg-white/10">Default</SelectItem>
                  <SelectItem value="weekly" className="text-[#f5f5f5] focus:bg-white/10">Weekly</SelectItem>
                  <SelectItem value="monthly" className="text-[#f5f5f5] focus:bg-white/10">Monthly</SelectItem>
                  <SelectItem value="announcement" className="text-[#f5f5f5] focus:bg-white/10">Announcement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateNewsletter}
              disabled={!formData.title || !formData.subject}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
            >
              Create Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Newsletter Dialog */}
      <Dialog open={!!editingNewsletter} onOpenChange={() => setEditingNewsletter(null)}>
        <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f5]">Edit Newsletter</DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Update newsletter details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title" className="text-[#f5f5f5]">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter newsletter title"
                className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
              />
            </div>
            <div>
              <Label htmlFor="edit-subject" className="text-[#f5f5f5]">Subject Line</Label>
              <Input
                id="edit-subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject line"
                className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
              />
            </div>
            <div>
              <Label htmlFor="edit-content" className="text-[#f5f5f5]">Content</Label>
              <Textarea
                id="edit-content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Enter newsletter content"
                rows={8}
                className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingNewsletter(null)}
              className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateNewsletter}
              disabled={!formData.title || !formData.subject}
              className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
            >
              Update Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Newsletter Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="max-w-lg glass bg-[#0a0a0a]/95 border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-[#f5f5f5]">Schedule Newsletter</DialogTitle>
            <DialogDescription className="text-[#a3a3a3]">
              Set when this newsletter should be sent
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="scheduled-date" className="text-[#f5f5f5]">Send Date & Time</Label>
              <Input
                id="scheduled-date"
                type="datetime-local"
                value={scheduleData.scheduledAt}
                onChange={(e) => setScheduleData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                className="bg-white/5 border-white/10 text-[#f5f5f5]"
              />
            </div>
            <div>
              <Label className="text-[#f5f5f5]">Recipient Groups</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-subscribers"
                    checked={scheduleData.recipientGroups.includes("all")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setScheduleData(prev => ({ ...prev, recipientGroups: [...prev.recipientGroups, "all"] }));
                      } else {
                        setScheduleData(prev => ({ ...prev, recipientGroups: prev.recipientGroups.filter(g => g !== "all") }));
                      }
                    }}
                    className="border-white/10"
                  />
                  <Label htmlFor="all-subscribers" className="text-[#f5f5f5]">All Subscribers</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="premium-subscribers"
                    checked={scheduleData.recipientGroups.includes("premium")}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setScheduleData(prev => ({ ...prev, recipientGroups: [...prev.recipientGroups, "premium"] }));
                      } else {
                        setScheduleData(prev => ({ ...prev, recipientGroups: prev.recipientGroups.filter(g => g !== "premium") }));
                      }
                    }}
                    className="border-white/10"
                  />
                  <Label htmlFor="premium-subscribers" className="text-[#f5f5f5]">Premium Subscribers</Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setScheduleDialogOpen(false)}
              className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleNewsletter}
              disabled={!scheduleData.scheduledAt || scheduleData.recipientGroups.length === 0}
              className="bg-green-500/20 border border-green-500/30 text-green-300 hover:bg-green-500/30"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Newsletter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}