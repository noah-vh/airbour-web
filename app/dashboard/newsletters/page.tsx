"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail,
  Plus,
  Calendar,
  Users,
  BarChart3,
  Edit,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  Pause,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedNewsletters, setSelectedNewsletters] = useState<string[]>([]);

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
  const deleteNewsletter = useMutation(api.newsletters.deleteNewsletter);
  const unscheduleNewsletter = useMutation(api.newsletters.unscheduleNewsletter);

  const handleDeleteNewsletter = async (id: string) => {
    try {
      await deleteNewsletter({ id: id as any });
      toast.success("Newsletter deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete newsletter: ${error.message}`);
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

  const handleRowClick = (newsletterId: string) => {
    router.push(`/dashboard/newsletters/${newsletterId}/edit`);
  };

  // Calculate stats
  const totalNewsletters = newsletters?.length || 0;
  const scheduledCount = newsletters?.filter((n: any) => n.status === "scheduled").length || 0;
  const publishedCount = newsletters?.filter((n: any) => n.status === "published").length || 0;
  const avgOpenRate = newsletters?.length ?
    (newsletters.reduce((sum: number, n: any) => sum + (n.openRate || 0), 0) / newsletters.length) : 0;

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6 h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Mail className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Newsletter Management</h1>
              <p className="text-sm text-muted-foreground">
                Create, schedule, and track newsletter campaigns
              </p>
            </div>
          </div>
          <Link href="/dashboard/newsletters/create">
            <Button className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Create Newsletter
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                  <Mail className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{totalNewsletters}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Newsletters</h3>
              <p className="text-xs text-muted-foreground/60">All created newsletters</p>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 border border-amber-500/30">
                  <Clock className="h-4 w-4 text-amber-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{scheduledCount}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Scheduled</h3>
              <p className="text-xs text-muted-foreground/60">Ready to send</p>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{publishedCount}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Published</h3>
              <p className="text-xs text-muted-foreground/60">Successfully sent</p>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                  <BarChart3 className="h-4 w-4 text-purple-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{Math.round(avgOpenRate * 100)}%</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Avg Open Rate</h3>
              <p className="text-xs text-muted-foreground/60">Across all newsletters</p>
            </CardContent>
          </Card>
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
                <Label htmlFor="search" className="text-foreground">Search Newsletters</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                  <Input
                    id="search"
                    placeholder="Search by title or subject..."
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
                    <SelectItem value="failed" className="text-foreground focus:bg-muted">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted border">
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
            <Card className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Newsletters</h3>
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
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow className="border-b">
                          <TableHead className="text-muted-foreground w-12">
                            <Checkbox
                              checked={selectedNewsletters.length === newsletters.length && newsletters.length > 0}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedNewsletters(newsletters.map((n: any) => n._id));
                                } else {
                                  setSelectedNewsletters([]);
                                }
                              }}
                              className="border-border"
                            />
                          </TableHead>
                          <TableHead className="text-muted-foreground">Newsletter</TableHead>
                          <TableHead className="text-muted-foreground">Status</TableHead>
                          <TableHead className="text-muted-foreground">Recipients</TableHead>
                          <TableHead className="text-muted-foreground">Performance</TableHead>
                          <TableHead className="text-muted-foreground">Updated</TableHead>
                          <TableHead className="text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {newsletters.map((newsletter: any) => (
                          <TableRow
                            key={newsletter._id}
                            className="border-b hover:bg-muted cursor-pointer"
                            onClick={() => handleRowClick(newsletter._id)}
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
                                className="border-border"
                              />
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-medium text-foreground">{newsletter.title}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">
                                  {newsletter.subject}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(newsletter.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground/60" />
                                <span className="text-foreground">{newsletter.recipientCount}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground/60">Open:</span>
                                  <span className="text-green-400">{Math.round(newsletter.openRate * 100)}%</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-muted-foreground/60">Click:</span>
                                  <span className="text-blue-400">{Math.round(newsletter.clickRate * 100)}%</span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {new Date(newsletter.updatedAt).toLocaleDateString()}
                              </span>
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center space-x-2">
                                <Link href={`/dashboard/newsletters/${newsletter._id}/edit`}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="p-1.5 h-auto text-muted-foreground hover:text-foreground hover:bg-muted"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </Link>
                                {newsletter.status === "scheduled" && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleUnscheduleNewsletter(newsletter._id)}
                                    className="p-1.5 h-auto text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                  >
                                    <Pause className="h-4 w-4" />
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDeleteNewsletter(newsletter._id)}
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
                    <Mail className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No newsletters found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery || statusFilter !== "all"
                        ? "Try adjusting your filters"
                        : "Create your first newsletter to get started"
                      }
                    </p>
                    <Link href="/dashboard/newsletters/create">
                      <Button className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Newsletter
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-6 mt-6">
            {/* Scheduled Newsletters */}
            <Card className="bg-card border">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Upcoming Scheduled Newsletters</h3>

                {scheduledNewsletters && scheduledNewsletters.length > 0 ? (
                  <div className="space-y-4">
                    {scheduledNewsletters.map((newsletter: any) => (
                      <div
                        key={newsletter._id}
                        onClick={() => handleRowClick(newsletter._id)}
                        className="flex items-center justify-between p-4 rounded-lg bg-muted border hover:bg-muted/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                            <Calendar className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <h4 className="font-medium text-foreground">{newsletter.title}</h4>
                            <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground/60">
                                Scheduled: {newsletter.scheduledAt ? new Date(newsletter.scheduledAt).toLocaleString() : 'N/A'}
                              </span>
                              <span className="text-xs text-muted-foreground/60">
                                Recipients: {newsletter.recipientCount}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <Link href={`/dashboard/newsletters/${newsletter._id}/edit`}>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
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
                    <Calendar className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">No scheduled newsletters</h3>
                    <p className="text-muted-foreground">
                      Schedule your newsletters to automatically send them at the right time
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
