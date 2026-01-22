"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import {
  Search,
  Filter,
  Calendar,
  Eye,
  Edit,
  Archive,
  FileText,
  Video,
  Image,
  Mic,
  Globe,
  Clock,
  User,
  ThumbsUp,
  Plus,
  Bookmark,
  Share2,
  BarChart3,
  TrendingUp,
  Library
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  format: "linkedin-post" | "twitter-thread" | "instagram-carousel" | "video-script" | "blog-post" | "newsletter";
  status: "draft" | "scheduled" | "published";
  content: string;
  createdAt: number;
  updatedAt: number;
  scheduledAt?: number;
  publishedAt?: number;
  author: string;
  tags: string[];
  performance?: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
}

type ViewMode = "all" | "drafts" | "scheduled" | "published";

export default function ContentLibraryPage() {
  const { isCollapsed } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Mock data - in real implementation this would come from the database
  const contentItems: ContentItem[] = [
    {
      id: "1",
      title: "The Future of AI in Healthcare",
      format: "linkedin-post",
      status: "published",
      content: "Exploring how AI is transforming healthcare delivery and patient outcomes...",
      createdAt: Date.now() - 86400000 * 7,
      updatedAt: Date.now() - 86400000 * 7,
      publishedAt: Date.now() - 86400000 * 7,
      author: "John Doe",
      tags: ["AI", "Healthcare", "Innovation"],
      performance: {
        views: 1250,
        likes: 89,
        shares: 23,
        comments: 15
      }
    },
    {
      id: "2",
      title: "5 Emerging Tech Trends to Watch",
      format: "twitter-thread",
      status: "scheduled",
      content: "A thread exploring the most promising technology trends emerging this year...",
      createdAt: Date.now() - 86400000 * 3,
      updatedAt: Date.now() - 86400000 * 3,
      scheduledAt: Date.now() + 86400000,
      author: "Jane Smith",
      tags: ["Technology", "Trends", "Future"]
    },
    {
      id: "3",
      title: "Innovation in Renewable Energy",
      format: "blog-post",
      status: "draft",
      content: "Deep dive into the latest innovations driving the renewable energy sector...",
      createdAt: Date.now() - 86400000 * 2,
      updatedAt: Date.now() - 86400000 * 1,
      author: "Mike Johnson",
      tags: ["Renewable Energy", "Innovation", "Sustainability"]
    }
  ];

  const formatIcons = {
    "linkedin-post": Globe,
    "twitter-thread": Globe,
    "instagram-carousel": Image,
    "video-script": Video,
    "blog-post": FileText,
    "newsletter": Mic
  };

  const statusColors = {
    draft: "secondary",
    scheduled: "outline",
    published: "default"
  } as const;

  const filteredContent = useMemo(() => {
    let filtered = contentItems;

    // Filter by view mode
    if (viewMode !== "all") {
      filtered = filtered.filter(item => item.status === viewMode);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.content.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query)) ||
        item.author.toLowerCase().includes(query)
      );
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item =>
        selectedTags.every(tag => item.tags.includes(tag))
      );
    }

    return filtered;
  }, [contentItems, viewMode, searchQuery, selectedTags]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    contentItems.forEach(item => {
      item.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [contentItems]);

  const contentStats = useMemo(() => {
    return {
      total: contentItems.length,
      drafts: contentItems.filter(item => item.status === "draft").length,
      scheduled: contentItems.filter(item => item.status === "scheduled").length,
      published: contentItems.filter(item => item.status === "published").length
    };
  }, [contentItems]);

  const formatDisplayName = (format: string) => {
    return format.split("-").map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const groupedContent = useMemo(() => {
    const groups: { [format: string]: ContentItem[] } = {};
    filteredContent.forEach(item => {
      if (!groups[item.format]) {
        groups[item.format] = [];
      }
      groups[item.format].push(item);
    });
    return groups;
  }, [filteredContent]);

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
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
            <Library className="h-6 w-6 text-orange-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Content Library</h1>
            <p className="text-sm text-[#a3a3a3]">Manage your content across all formats and channels</p>
          </div>
          <button className="glass bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2 transition-standard hover:bg-orange-500/20 flex items-center gap-2">
            <Plus className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-orange-300">Create Content</span>
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              whileHover={{ y: -2 }}
              className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#a3a3a3]">Total Items</p>
                  <p className="text-2xl font-bold text-[#f5f5f5]">{contentStats.total}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#a3a3a3]">Drafts</p>
                  <p className="text-2xl font-bold text-[#f5f5f5]">{contentStats.drafts}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                  <Edit className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#a3a3a3]">Scheduled</p>
                  <p className="text-2xl font-bold text-[#f5f5f5]">{contentStats.scheduled}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500/20 border border-orange-500/30">
                  <Clock className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -2 }}
              className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 transition-standard"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#a3a3a3]">Published</p>
                  <p className="text-2xl font-bold text-[#f5f5f5]">{contentStats.published}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                  <Globe className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div variants={itemVariants}>
          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-[#a3a3a3]" />
              <h3 className="text-lg font-semibold text-[#f5f5f5]">Filters & Search</h3>
            </div>

            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666]" />
                <input
                  type="text"
                  placeholder="Search content, authors, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-[#f5f5f5] placeholder:text-[#666] focus:outline-none focus:border-blue-500/30 focus:bg-white/10 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                {(["all", "drafts", "scheduled", "published"] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-standard ${
                      viewMode === mode
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-white/5 text-[#a3a3a3] border border-white/10 hover:bg-white/10 hover:text-[#f5f5f5]'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[#a3a3a3] whitespace-nowrap">Tags:</span>
                <div className="flex items-center gap-1 flex-wrap">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        if (selectedTags.includes(tag)) {
                          setSelectedTags(selectedTags.filter(t => t !== tag));
                        } else {
                          setSelectedTags([...selectedTags, tag]);
                        }
                      }}
                      className={`px-2 py-1 rounded-md text-xs font-medium transition-standard ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'bg-white/5 text-[#666] border border-white/10 hover:bg-white/10 hover:text-[#a3a3a3]'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Content Grid */}
        <motion.div variants={itemVariants} className="space-y-8">
          {Object.entries(groupedContent).map(([format, items]) => {
            const IconComponent = formatIcons[format as keyof typeof formatIcons];

            return (
              <div key={format} className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <IconComponent className="h-4 w-4 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#f5f5f5]">{formatDisplayName(format)}</h2>
                  <div className="px-2 py-1 bg-gray-500/20 text-gray-300 border border-gray-500/30 rounded-lg text-xs font-medium">
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      whileHover={{ y: -4 }}
                      className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6 hover:border-purple-500/30 transition-standard"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="font-medium text-[#f5f5f5] text-sm line-clamp-2 flex-1">{item.title}</h3>
                        <div className={`px-2 py-1 rounded-md text-xs font-medium ml-3 flex-shrink-0 ${
                          item.status === 'published'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : item.status === 'scheduled'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                        }`}>
                          {item.status}
                        </div>
                      </div>

                      <p className="text-sm text-[#a3a3a3] line-clamp-3 mb-4">
                        {item.content}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-md text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                          <User className="h-3 w-3" />
                          <span>{item.author}</span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#a3a3a3]">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {item.status === "published" && item.publishedAt
                              ? `Published ${formatDate(item.publishedAt)}`
                              : item.status === "scheduled" && item.scheduledAt
                              ? `Scheduled for ${formatDate(item.scheduledAt)}`
                              : `Updated ${formatDate(item.updatedAt)}`
                            }
                          </span>
                        </div>

                        {item.performance && (
                          <div className="flex items-center gap-4 text-xs text-[#a3a3a3] pt-3 border-t border-white/10">
                            <div className="flex items-center gap-1">
                              <Eye className="h-3 w-3 text-blue-400" />
                              <span>{item.performance.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3 text-green-400" />
                              <span>{item.performance.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Share2 className="h-3 w-3 text-purple-400" />
                              <span>{item.performance.shares}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10">
                        <button className="glass bg-blue-500/10 border border-blue-500/20 rounded-lg p-2 transition-standard hover:bg-blue-500/20">
                          <Eye className="h-4 w-4 text-blue-400" />
                        </button>
                        <button className="glass bg-green-500/10 border border-green-500/20 rounded-lg p-2 transition-standard hover:bg-green-500/20">
                          <Edit className="h-4 w-4 text-green-400" />
                        </button>
                        <button className="glass bg-purple-500/10 border border-purple-500/20 rounded-lg p-2 transition-standard hover:bg-purple-500/20">
                          <Bookmark className="h-4 w-4 text-purple-400" />
                        </button>
                        <button className="glass bg-red-500/10 border border-red-500/20 rounded-lg p-2 transition-standard hover:bg-red-500/20 ml-auto">
                          <Archive className="h-4 w-4 text-red-400" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}

          {filteredContent.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-12 text-center"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-500/20 border border-gray-500/30 mx-auto mb-6">
                <FileText className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium text-[#f5f5f5] mb-3">No content found</h3>
              <p className="text-[#a3a3a3] mb-6 max-w-md mx-auto">
                {searchQuery || selectedTags.length > 0
                  ? "Try adjusting your filters or search query to find what you're looking for."
                  : "Start creating content to build your library and see analytics."
                }
              </p>
              <button className="glass bg-orange-500/20 border border-orange-500/30 rounded-lg px-6 py-3 transition-standard hover:bg-orange-500/30 flex items-center gap-2 mx-auto">
                <Plus className="h-5 w-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Create Your First Content</span>
              </button>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}