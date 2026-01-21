"use client";

import { useState } from "react";
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
  Download
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

type NewsletterStatus = "draft" | "scheduled" | "sent" | "failed";
type NewsletterType = "weekly" | "monthly" | "special" | "announcement";

interface Newsletter {
  _id: string;
  title: string;
  subject: string;
  type: NewsletterType;
  status: NewsletterStatus;
  content: string;
  scheduledDate?: string;
  sentDate?: string;
  recipients: number;
  openRate?: number;
  clickRate?: number;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  author: string;
}

export default function NewslettersPage() {
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<NewsletterStatus | "all">("all");
  const [filterType, setFilterType] = useState<NewsletterType | "all">("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null);

  // Mock data - replace with actual Convex queries
  const newsletters: Newsletter[] = [
    {
      _id: "1",
      title: "Weekly Innovation Roundup",
      subject: "🚀 This Week in Innovation - AI Breakthroughs & Startup News",
      type: "weekly",
      status: "sent",
      content: "Weekly compilation of innovation signals and industry insights...",
      sentDate: "2024-01-18T10:00:00Z",
      recipients: 1250,
      openRate: 68.5,
      clickRate: 12.3,
      createdAt: "2024-01-15T14:30:00Z",
      updatedAt: "2024-01-18T10:00:00Z",
      tags: ["innovation", "AI", "startups"],
      author: "Sarah Johnson"
    },
    {
      _id: "2",
      title: "Monthly Market Analysis",
      subject: "January Market Trends & Investment Insights",
      type: "monthly",
      status: "draft",
      content: "Comprehensive analysis of market trends and investment opportunities...",
      recipients: 850,
      createdAt: "2024-01-20T09:15:00Z",
      updatedAt: "2024-01-20T16:45:00Z",
      tags: ["market", "investment", "trends"],
      author: "Mike Chen"
    },
    {
      _id: "3",
      title: "Product Launch Announcement",
      subject: "🎉 Introducing Our New AI-Powered Analytics Platform",
      type: "announcement",
      status: "scheduled",
      content: "Exciting news about our latest product launch...",
      scheduledDate: "2024-01-25T14:00:00Z",
      recipients: 2100,
      createdAt: "2024-01-19T11:20:00Z",
      updatedAt: "2024-01-20T13:15:00Z",
      tags: ["product", "launch", "AI"],
      author: "Emily Davis"
    },
    {
      _id: "4",
      title: "Emergency Security Update",
      subject: "Important Security Notice - Action Required",
      type: "special",
      status: "failed",
      content: "Important security update information...",
      scheduledDate: "2024-01-20T12:00:00Z",
      recipients: 1800,
      createdAt: "2024-01-20T11:30:00Z",
      updatedAt: "2024-01-20T12:05:00Z",
      tags: ["security", "urgent"],
      author: "Security Team"
    }
  ];

  // Filter newsletters
  const filteredNewsletters = newsletters.filter(newsletter => {
    const matchesSearch = newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         newsletter.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || newsletter.status === filterStatus;
    const matchesType = filterType === "all" || newsletter.type === filterType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: NewsletterStatus) => {
    switch (status) {
      case "sent": return "bg-green-100 text-green-800 border-green-200";
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "draft": return "bg-gray-100 text-gray-800 border-gray-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: NewsletterStatus) => {
    switch (status) {
      case "sent": return <CheckCircle className="h-4 w-4" />;
      case "scheduled": return <Clock className="h-4 w-4" />;
      case "draft": return <Edit className="h-4 w-4" />;
      case "failed": return <AlertCircle className="h-4 w-4" />;
      default: return <Edit className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: NewsletterType) => {
    switch (type) {
      case "weekly": return "bg-purple-100 text-purple-800";
      case "monthly": return "bg-blue-100 text-blue-800";
      case "special": return "bg-orange-100 text-orange-800";
      case "announcement": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats
  const totalNewsletters = newsletters.length;
  const sentNewsletters = newsletters.filter(n => n.status === "sent").length;
  const scheduledNewsletters = newsletters.filter(n => n.status === "scheduled").length;
  const draftNewsletters = newsletters.filter(n => n.status === "draft").length;
  const avgOpenRate = newsletters
    .filter(n => n.openRate)
    .reduce((sum, n) => sum + (n.openRate || 0), 0) / newsletters.filter(n => n.openRate).length;

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
              Newsletters
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Create, manage, and track your newsletter campaigns
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Newsletter
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create New Newsletter</DialogTitle>
                  <DialogDescription>
                    Start creating your next newsletter campaign
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Newsletter Title</Label>
                    <Input placeholder="Enter newsletter title" />
                  </div>
                  <div>
                    <Label>Email Subject</Label>
                    <Input placeholder="Enter email subject line" />
                  </div>
                  <div>
                    <Label>Newsletter Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="special">Special Edition</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Recipients</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient list" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Subscribers (2,100)</SelectItem>
                        <SelectItem value="premium">Premium Members (850)</SelectItem>
                        <SelectItem value="weekly">Weekly Digest (1,250)</SelectItem>
                        <SelectItem value="partners">Partners (320)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Create & Edit
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
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
                      Total Newsletters
                    </p>
                    <p className="text-2xl font-bold">{totalNewsletters}</p>
                  </div>
                  <Mail className="h-8 w-8 text-blue-500" />
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
                      Sent
                    </p>
                    <p className="text-2xl font-bold">{sentNewsletters}</p>
                  </div>
                  <Send className="h-8 w-8 text-green-500" />
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
                      Scheduled
                    </p>
                    <p className="text-2xl font-bold">{scheduledNewsletters}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-500" />
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
                      Avg. Open Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {avgOpenRate ? `${avgOpenRate.toFixed(1)}%` : "N/A"}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-500" />
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
                    placeholder="Search newsletters..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as NewsletterStatus | "all")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as NewsletterType | "all")}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Newsletters List */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredNewsletters.map((newsletter) => (
          <motion.div key={newsletter._id} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {newsletter.title}
                          </h3>
                          <Badge className={getTypeColor(newsletter.type)} variant="secondary">
                            {newsletter.type}
                          </Badge>
                          <Badge className={getStatusColor(newsletter.status)} variant="outline">
                            {getStatusIcon(newsletter.status)}
                            <span className="ml-1 capitalize">{newsletter.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Subject:</strong> {newsletter.subject}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{newsletter.recipients.toLocaleString()} recipients</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span>By {newsletter.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {newsletter.status === "sent" && newsletter.sentDate
                                ? `Sent ${new Date(newsletter.sentDate).toLocaleDateString()}`
                                : newsletter.status === "scheduled" && newsletter.scheduledDate
                                ? `Scheduled for ${new Date(newsletter.scheduledDate).toLocaleDateString()}`
                                : `Updated ${new Date(newsletter.updatedAt).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Performance Metrics (for sent newsletters) */}
                    {newsletter.status === "sent" && (newsletter.openRate || newsletter.clickRate) && (
                      <div className="flex items-center gap-6 text-sm">
                        {newsletter.openRate && (
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4 text-green-500" />
                            <span className="font-medium">{newsletter.openRate}%</span>
                            <span className="text-gray-500">open rate</span>
                          </div>
                        )}
                        {newsletter.clickRate && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">{newsletter.clickRate}%</span>
                            <span className="text-gray-500">click rate</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {newsletter.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Tags:</span>
                        <div className="flex flex-wrap gap-1">
                          {newsletter.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {newsletter.status === "draft" && (
                      <>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    {newsletter.status === "sent" && (
                      <Button variant="ghost" size="sm">
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredNewsletters.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Mail className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Newsletters Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || filterStatus !== "all" || filterType !== "all"
              ? "No newsletters match your current filters."
              : "Get started by creating your first newsletter campaign."}
          </p>
          {(!searchQuery && filterStatus === "all" && filterType === "all") && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Newsletter
            </Button>
          )}
        </motion.div>
      )}

      {/* Quick Templates Section */}
      <motion.div
        className="mt-12"
        variants={itemVariants}
        initial="hidden"
        animate="visible"
      >
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>
              Get started quickly with pre-designed newsletter templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Calendar className="h-6 w-6 mb-2" />
                <span>Weekly Roundup</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Market Update</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Mail className="h-6 w-6 mb-2" />
                <span>Product Announcement</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}