"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import {
  Bell,
  MessageSquare,
  Twitter,
  Linkedin,
  Globe,
  Plus,
  Search,
  Filter,
  ExternalLink,
  Heart,
  Repeat2,
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  Star,
  Flag,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Settings,
  Hash
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";

type MentionSource = "twitter" | "linkedin" | "reddit" | "news" | "blog" | "forum";
type MentionSentiment = "positive" | "negative" | "neutral";
type MentionStatus = "new" | "reviewed" | "responded" | "ignored";

interface Mention {
  _id: string;
  content: string;
  author: string;
  authorAvatar?: string;
  authorFollowers?: number;
  source: MentionSource;
  sourceUrl: string;
  sentiment: MentionSentiment;
  status: MentionStatus;
  engagementScore: number;
  likes?: number;
  shares?: number;
  comments?: number;
  publishedAt: string;
  detectedAt: string;
  keywords: string[];
  companyMentioned: string[];
  isImportant: boolean;
}

export default function MentionsPage() {
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSource, setFilterSource] = useState<MentionSource | "all">("all");
  const [filterSentiment, setFilterSentiment] = useState<MentionSentiment | "all">("all");
  const [filterStatus, setFilterStatus] = useState<MentionStatus | "all">("all");
  const [showImportantOnly, setShowImportantOnly] = useState(false);

  // Mock data - replace with actual Convex queries
  const mentions: Mention[] = [
    {
      _id: "1",
      content: "Just discovered @YourCompany's new AI platform and I'm blown away by the user experience! The interface is so intuitive and the results are incredibly accurate. This is going to change how we approach data analysis. #AI #Innovation",
      author: "Sarah Mitchell",
      authorAvatar: "https://avatar.vercel.sh/sarah",
      authorFollowers: 12500,
      source: "twitter",
      sourceUrl: "https://twitter.com/sarahmitchell/status/123456789",
      sentiment: "positive",
      status: "new",
      engagementScore: 89,
      likes: 156,
      shares: 43,
      comments: 28,
      publishedAt: "2024-01-20T14:30:00Z",
      detectedAt: "2024-01-20T14:35:00Z",
      keywords: ["AI platform", "user experience", "data analysis"],
      companyMentioned: ["YourCompany"],
      isImportant: true
    },
    {
      _id: "2",
      content: "Has anyone tried YourCompany's solution? Looking for feedback before we make a decision for our enterprise deployment. Particularly interested in scalability and integration capabilities.",
      author: "Marcus Johnson",
      authorAvatar: "https://avatar.vercel.sh/marcus",
      authorFollowers: 8900,
      source: "linkedin",
      sourceUrl: "https://linkedin.com/in/marcus-johnson/post/987654321",
      sentiment: "neutral",
      status: "reviewed",
      engagementScore: 65,
      likes: 34,
      shares: 12,
      comments: 18,
      publishedAt: "2024-01-20T11:15:00Z",
      detectedAt: "2024-01-20T11:20:00Z",
      keywords: ["enterprise deployment", "scalability", "integration"],
      companyMentioned: ["YourCompany"],
      isImportant: true
    },
    {
      _id: "3",
      content: "YourCompany's customer support is absolutely terrible. Been waiting 3 days for a response to a critical issue. This is unacceptable for a premium service. Looking for alternatives.",
      author: "Alex Rivera",
      source: "reddit",
      sourceUrl: "https://reddit.com/r/TechSupport/post/abc123",
      sentiment: "negative",
      status: "responded",
      engagementScore: 72,
      likes: 23,
      comments: 15,
      publishedAt: "2024-01-19T16:45:00Z",
      detectedAt: "2024-01-19T17:00:00Z",
      keywords: ["customer support", "critical issue", "premium service"],
      companyMentioned: ["YourCompany"],
      isImportant: true
    },
    {
      _id: "4",
      content: "Interesting article about AI trends mentions YourCompany as one of the emerging players to watch. The market analysis seems spot on.",
      author: "TechNews Daily",
      source: "news",
      sourceUrl: "https://technews.com/ai-trends-2024",
      sentiment: "positive",
      status: "new",
      engagementScore: 45,
      publishedAt: "2024-01-20T08:00:00Z",
      detectedAt: "2024-01-20T08:30:00Z",
      keywords: ["AI trends", "emerging players", "market analysis"],
      companyMentioned: ["YourCompany"],
      isImportant: false
    },
    {
      _id: "5",
      content: "YourCompany's latest update broke our integration. The API changes weren't properly documented. Please fix this ASAP!",
      author: "DevTeam2024",
      source: "forum",
      sourceUrl: "https://forum.developers.com/thread/12345",
      sentiment: "negative",
      status: "new",
      engagementScore: 78,
      likes: 45,
      comments: 32,
      publishedAt: "2024-01-20T13:20:00Z",
      detectedAt: "2024-01-20T13:25:00Z",
      keywords: ["API changes", "integration", "documentation"],
      companyMentioned: ["YourCompany"],
      isImportant: true
    }
  ];

  // Filter mentions
  const filteredMentions = mentions.filter(mention => {
    const matchesSearch = mention.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         mention.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSource = filterSource === "all" || mention.source === filterSource;
    const matchesSentiment = filterSentiment === "all" || mention.sentiment === filterSentiment;
    const matchesStatus = filterStatus === "all" || mention.status === filterStatus;
    const matchesImportant = !showImportantOnly || mention.isImportant;

    return matchesSearch && matchesSource && matchesSentiment && matchesStatus && matchesImportant;
  });

  const getSourceIcon = (source: MentionSource) => {
    switch (source) {
      case "twitter": return <Twitter className="h-4 w-4" />;
      case "linkedin": return <Linkedin className="h-4 w-4" />;
      case "reddit": return <MessageSquare className="h-4 w-4" />;
      case "news": return <Globe className="h-4 w-4" />;
      case "blog": return <Globe className="h-4 w-4" />;
      case "forum": return <MessageSquare className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: MentionSentiment) => {
    switch (sentiment) {
      case "positive": return "bg-green-100 text-green-800 border-green-200";
      case "negative": return "bg-red-100 text-red-800 border-red-200";
      case "neutral": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: MentionStatus) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-800 border-blue-200";
      case "reviewed": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "responded": return "bg-green-100 text-green-800 border-green-200";
      case "ignored": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: MentionStatus) => {
    switch (status) {
      case "new": return <Bell className="h-4 w-4" />;
      case "reviewed": return <Eye className="h-4 w-4" />;
      case "responded": return <CheckCircle className="h-4 w-4" />;
      case "ignored": return <Clock className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  // Calculate stats
  const totalMentions = mentions.length;
  const newMentions = mentions.filter(m => m.status === "new").length;
  const positiveMentions = mentions.filter(m => m.sentiment === "positive").length;
  const negativeMentions = mentions.filter(m => m.sentiment === "negative").length;
  const avgEngagementScore = mentions.reduce((sum, m) => sum + m.engagementScore, 0) / mentions.length;

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

  const handleStatusChange = (mentionId: string, newStatus: MentionStatus) => {
    // Implement status change logic
    toast.success(`Mention marked as ${newStatus}`);
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
              Brand Mentions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Monitor and respond to mentions across social media and web platforms
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Total Mentions
                    </p>
                    <p className="text-2xl font-bold">{totalMentions}</p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-500" />
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
                      New
                    </p>
                    <p className="text-2xl font-bold text-blue-600">{newMentions}</p>
                  </div>
                  <Bell className="h-8 w-8 text-orange-500" />
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
                      Positive
                    </p>
                    <p className="text-2xl font-bold text-green-600">{positiveMentions}</p>
                  </div>
                  <Heart className="h-8 w-8 text-green-500" />
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
                      Negative
                    </p>
                    <p className="text-2xl font-bold text-red-600">{negativeMentions}</p>
                  </div>
                  <AlertCircle className="h-8 w-8 text-red-500" />
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
                      Avg. Engagement
                    </p>
                    <p className="text-2xl font-bold">{Math.round(avgEngagementScore)}</p>
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
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search mentions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={filterSource} onValueChange={(value) => setFilterSource(value as MentionSource | "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sources</SelectItem>
                    <SelectItem value="twitter">Twitter</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="reddit">Reddit</SelectItem>
                    <SelectItem value="news">News</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="forum">Forum</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterSentiment} onValueChange={(value) => setFilterSentiment(value as MentionSentiment | "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sentiment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sentiment</SelectItem>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as MentionStatus | "all")}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="responded">Responded</SelectItem>
                    <SelectItem value="ignored">Ignored</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant={showImportantOnly ? "default" : "outline"}
                  onClick={() => setShowImportantOnly(!showImportantOnly)}
                  className="px-3"
                >
                  <Star className="h-4 w-4 mr-1" />
                  Important
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mentions List */}
      <motion.div
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredMentions.map((mention) => (
          <motion.div key={mention._id} variants={itemVariants}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        {getSourceIcon(mention.source)}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {mention.author}
                          </h3>
                          {mention.authorFollowers && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {mention.authorFollowers.toLocaleString()}
                            </Badge>
                          )}
                          {mention.isImportant && (
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="capitalize">{mention.source}</span>
                          <span>•</span>
                          <span>{new Date(mention.publishedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>Engagement: {mention.engagementScore}/100</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getSentimentColor(mention.sentiment)} variant="outline">
                        {mention.sentiment}
                      </Badge>
                      <Badge className={getStatusColor(mention.status)} variant="outline">
                        {getStatusIcon(mention.status)}
                        <span className="ml-1 capitalize">{mention.status}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="pl-11">
                    <p className="text-gray-900 dark:text-white leading-relaxed">
                      {mention.content}
                    </p>
                  </div>

                  {/* Engagement Metrics */}
                  {(mention.likes || mention.shares || mention.comments) && (
                    <div className="pl-11">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {mention.likes && (
                          <div className="flex items-center gap-1">
                            <Heart className="h-4 w-4" />
                            <span>{mention.likes}</span>
                          </div>
                        )}
                        {mention.shares && (
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-4 w-4" />
                            <span>{mention.shares}</span>
                          </div>
                        )}
                        {mention.comments && (
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{mention.comments}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Keywords and Companies */}
                  <div className="pl-11 space-y-2">
                    {mention.keywords.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Keywords:</span>
                        <div className="flex flex-wrap gap-1">
                          {mention.keywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary" className="text-xs">
                              <Hash className="h-3 w-3 mr-1" />
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {mention.companyMentioned.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500">Mentions:</span>
                        <div className="flex flex-wrap gap-1">
                          {mention.companyMentioned.map((company) => (
                            <Badge key={company} variant="outline" className="text-xs">
                              {company}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pl-11 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <a
                        href={mention.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        View original
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      {mention.status === "new" && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleStatusChange(mention._id, "reviewed")}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                          <Button size="sm" onClick={() => handleStatusChange(mention._id, "responded")}>
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Respond
                          </Button>
                        </>
                      )}
                      {mention.status === "reviewed" && (
                        <Button size="sm" onClick={() => handleStatusChange(mention._id, "responded")}>
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Respond
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
                        <Flag className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredMentions.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Mentions Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchQuery || filterSource !== "all" || filterSentiment !== "all" || filterStatus !== "all" || showImportantOnly
              ? "No mentions match your current filters."
              : "No mentions have been detected yet. Check your monitoring settings."}
          </p>
          {(!searchQuery && filterSource === "all" && filterSentiment === "all" && filterStatus === "all" && !showImportantOnly) && (
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Monitoring
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}