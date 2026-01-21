"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ThumbsUp
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

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Library</h1>
          <p className="text-muted-foreground">
            Manage your content across all formats and channels
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>Create Content</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{contentStats.total}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{contentStats.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{contentStats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{contentStats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center space-x-2">
          {(["all", "drafts", "scheduled", "published"] as ViewMode[]).map(mode => (
            <Button
              key={mode}
              variant={viewMode === mode ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode(mode)}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center space-x-1">
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {Object.entries(groupedContent).map(([format, items]) => {
          const IconComponent = formatIcons[format as keyof typeof formatIcons];

          return (
            <div key={format} className="space-y-4">
              <div className="flex items-center space-x-2">
                <IconComponent className="h-5 w-5" />
                <h2 className="text-xl font-semibold">{formatDisplayName(format)}</h2>
                <Badge variant="outline" className="text-xs">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-sm line-clamp-2">{item.title}</CardTitle>
                        <Badge variant={statusColors[item.status]} className="text-xs ml-2 flex-shrink-0">
                          {item.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {item.content}
                      </p>

                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map(tag => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <User className="h-3 w-3 mr-1" />
                          {item.author}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {item.status === "published" && item.publishedAt
                            ? `Published ${formatDate(item.publishedAt)}`
                            : item.status === "scheduled" && item.scheduledAt
                            ? `Scheduled for ${formatDate(item.scheduledAt)}`
                            : `Updated ${formatDate(item.updatedAt)}`
                          }
                        </div>

                        {item.performance && (
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground pt-2 border-t">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {item.performance.views}
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {item.performance.likes}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-end space-x-2 mt-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Archive className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}

        {filteredContent.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No content found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedTags.length > 0
                ? "Try adjusting your filters or search query."
                : "Start creating content to see it here."
              }
            </p>
            <Button>Create Your First Content</Button>
          </div>
        )}
      </div>
    </div>
  );
}