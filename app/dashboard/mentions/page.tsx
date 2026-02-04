"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import {
  Bell,
  MessageSquare,
  Twitter,
  Linkedin,
  Globe,
  Search,
  ExternalLink,
  Heart,
  Repeat2,
  TrendingUp,
  BarChart3,
  Users,
  Star,
  Flag,
  Eye,
  AlertCircle,
  CheckCircle,
  Clock,
  Hash,
  Sparkles,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

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

  // Calculate stats
  const totalMentions = mentions.length;
  const newMentions = mentions.filter(m => m.status === "new").length;
  const positiveMentions = mentions.filter(m => m.sentiment === "positive").length;
  const negativeMentions = mentions.filter(m => m.sentiment === "negative").length;
  const avgEngagementScore = mentions.reduce((sum, m) => sum + m.engagementScore, 0) / mentions.length;

  const handleStatusChange = (mentionId: string, newStatus: MentionStatus) => {
    toast.success(`Mention marked as ${newStatus}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div className="min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-8 max-w-[1400px]"
      >
        {/* Header - Stats + Actions */}
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-8">
          {/* Compact Stats */}
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{totalMentions}</span>
              <span className="text-sm text-muted-foreground">mentions</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-blue-500">{newMentions}</span>
              <span className="text-sm text-muted-foreground">new</span>
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 ml-1 animate-pulse" />
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-emerald-500">{positiveMentions}</span>
              <span className="text-sm text-muted-foreground">positive</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-red-500">{negativeMentions}</span>
              <span className="text-sm text-muted-foreground">negative</span>
            </div>
            <div className="h-8 w-px bg-black/[0.06]" />
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-light text-foreground">{Math.round(avgEngagementScore)}</span>
              <span className="text-sm text-muted-foreground">avg engagement</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard/signals">
              <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-black/[0.06] hover:border-black/[0.12] transition-colors text-sm">
                <BarChart3 className="h-4 w-4 text-purple-500" />
                <span>Signals</span>
              </button>
            </Link>
            <Link href="/dashboard/content-ideation">
              <button className="bg-[#1C1C1C] text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-[#2C2C2C] transition-colors flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Create Content
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-black/[0.04] p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search mentions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-full bg-gray-50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Source Filter */}
            <div className="flex items-center gap-1">
              {["all", "twitter", "linkedin", "reddit", "news"].map((source) => (
                <button
                  key={source}
                  onClick={() => setFilterSource(source as MentionSource | "all")}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    filterSource === source
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-white border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
                  )}
                >
                  {source === "all" ? "All" : source.charAt(0).toUpperCase() + source.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-black/[0.06]" />

            {/* Sentiment Filter */}
            <div className="flex items-center gap-1">
              {(["all", "positive", "negative", "neutral"] as const).map((sentiment) => (
                <button
                  key={sentiment}
                  onClick={() => setFilterSentiment(sentiment)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                    filterSentiment === sentiment
                      ? sentiment === "positive" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        sentiment === "negative" ? "bg-red-50 text-red-600 border-red-200" :
                        sentiment === "neutral" ? "bg-gray-100 text-gray-600 border-gray-200" :
                        "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-white border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
                  )}
                >
                  {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
                </button>
              ))}
            </div>

            <div className="h-6 w-px bg-black/[0.06]" />

            {/* Important Toggle */}
            <button
              onClick={() => setShowImportantOnly(!showImportantOnly)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                showImportantOnly
                  ? "bg-amber-50 text-amber-600 border-amber-200"
                  : "bg-white border-black/[0.06] text-muted-foreground hover:border-black/[0.12]"
              )}
            >
              <Star className="h-3 w-3" />
              Important
            </button>

            {/* Clear Filters */}
            {(filterSource !== "all" || filterSentiment !== "all" || filterStatus !== "all" || searchQuery || showImportantOnly) && (
              <button
                onClick={() => {
                  setFilterSource("all");
                  setFilterSentiment("all");
                  setFilterStatus("all");
                  setSearchQuery("");
                  setShowImportantOnly(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        </motion.div>

        {/* Mentions List */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-foreground">Brand Mentions</h2>
            <span className="text-sm text-muted-foreground">{filteredMentions.length} mentions</span>
          </div>

          <div className="space-y-3">
            {filteredMentions.length > 0 ? (
              filteredMentions.map((mention) => (
                <div
                  key={mention._id}
                  className="bg-white rounded-2xl border border-black/[0.04] p-5 hover:border-black/[0.08] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon Box */}
                    <div className={cn(
                      "h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      mention.sentiment === "positive" ? "bg-emerald-50" :
                      mention.sentiment === "negative" ? "bg-red-50" : "bg-gray-50"
                    )}>
                      <span className={
                        mention.sentiment === "positive" ? "text-emerald-500" :
                        mention.sentiment === "negative" ? "text-red-500" : "text-gray-500"
                      }>
                        {getSourceIcon(mention.source)}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{mention.author}</span>
                        {mention.authorFollowers && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {mention.authorFollowers.toLocaleString()}
                          </span>
                        )}
                        {mention.isImportant && (
                          <Star className="h-3.5 w-3.5 text-amber-500 fill-current" />
                        )}
                        <span className="text-xs text-muted-foreground capitalize">{mention.source}</span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(mention.publishedAt).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-foreground mb-3">{mention.content}</p>

                      {/* Engagement */}
                      {(mention.likes || mention.shares || mention.comments) && (
                        <div className="flex items-center gap-4 mb-3 text-xs text-muted-foreground">
                          {mention.likes && (
                            <span className="flex items-center gap-1">
                              <Heart className="h-3 w-3" />
                              {mention.likes}
                            </span>
                          )}
                          {mention.shares && (
                            <span className="flex items-center gap-1">
                              <Repeat2 className="h-3 w-3" />
                              {mention.shares}
                            </span>
                          )}
                          {mention.comments && (
                            <span className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              {mention.comments}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {mention.engagementScore}/100
                          </span>
                        </div>
                      )}

                      {/* Keywords */}
                      {mention.keywords.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {mention.keywords.map((keyword) => (
                            <span key={keyword} className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 border border-blue-100">
                              <Hash className="h-3 w-3 inline mr-0.5" />
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-end gap-2">
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                        mention.sentiment === "positive" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        mention.sentiment === "negative" ? "bg-red-50 text-red-600 border-red-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      )}>
                        {mention.sentiment}
                      </span>

                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-xs font-medium border flex items-center gap-1",
                        mention.status === "new" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        mention.status === "responded" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        "bg-gray-50 text-gray-600 border-gray-200"
                      )}>
                        {mention.status === "new" && <Bell className="h-3 w-3" />}
                        {mention.status === "reviewed" && <Eye className="h-3 w-3" />}
                        {mention.status === "responded" && <CheckCircle className="h-3 w-3" />}
                        {mention.status}
                      </span>

                      <div className="flex items-center gap-1 mt-2">
                        <a
                          href={mention.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-colors"
                          title="View original"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                        {mention.status === "new" && (
                          <>
                            <button
                              onClick={() => handleStatusChange(mention._id, "reviewed")}
                              className="p-2 rounded-lg text-muted-foreground hover:text-amber-500 hover:bg-amber-50 transition-colors"
                              title="Mark reviewed"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(mention._id, "responded")}
                              className="p-2 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-50 transition-colors"
                              title="Mark responded"
                            >
                              <MessageSquare className="h-4 w-4" />
                            </button>
                          </>
                        )}
                        <button
                          className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Flag"
                        >
                          <Flag className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-black/[0.04] py-16 text-center">
                <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
                  <Bell className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">No mentions found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  {searchQuery || filterSource !== "all" || filterSentiment !== "all" || filterStatus !== "all" || showImportantOnly
                    ? "Try adjusting your filters"
                    : "Mentions will appear here as they're detected"
                  }
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Status */}
        <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-black/[0.06]">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Mention monitoring active
            </span>
            <span>•</span>
            <span>Last scan 5m ago</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
