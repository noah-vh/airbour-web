"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Plus,
  Search,
  Filter,
  Upload,
  Download,
  Trash2,
  Tag,
  Mail,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Eye,
  MousePointerClick,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

type SubscriberStatus = "active" | "unsubscribed" | "bounced";

interface Subscriber {
  _id: Id<"subscribers">;
  email: string;
  name?: string;
  status: SubscriberStatus;
  source: string;
  tags?: string[];
  createdAt: number;
}

interface EmailEvent {
  _id: Id<"email_events">;
  subscriberId?: Id<"subscribers">;
  newsletterId: Id<"newsletters">;
  eventType: string;
  metadata?: any;
  timestamp: number;
}

export default function SubscribersPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedSubscribers, setSelectedSubscribers] = useState<string[]>([]);
  const [sidePanelOpen, setSidePanelOpen] = useState(false);
  const [selectedSubscriber, setSelectedSubscriber] = useState<Subscriber | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [addTagDialogOpen, setAddTagDialogOpen] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [importData, setImportData] = useState<{ email: string; name?: string; tags?: string[] }[]>([]);
  const [importPreview, setImportPreview] = useState<string[][]>([]);
  const [columnMapping, setColumnMapping] = useState<{ email: number; name: number }>({ email: 0, name: 1 });

  // Convex queries
  const subscribers = useQuery(api.subscribers.list, {
    status: statusFilter === "all" ? undefined : statusFilter,
    limit: 500,
  });

  const stats = useQuery(api.subscribers.getStats, {});

  const subscriberEvents = useQuery(
    api.emailEvents.getBySubscriber,
    selectedSubscriber ? { subscriberId: selectedSubscriber._id } : "skip"
  );

  // Convex mutations
  const createSubscriber = useMutation(api.subscribers.create);
  const bulkImport = useMutation(api.subscribers.bulkImport);
  const unsubscribe = useMutation(api.subscribers.unsubscribe);
  const updateTags = useMutation(api.subscribers.updateTags);

  // Filter subscribers based on search and filters
  const filteredSubscribers = subscribers?.filter((sub: Subscriber) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!sub.email.toLowerCase().includes(query) &&
          !(sub.name?.toLowerCase().includes(query))) {
        return false;
      }
    }

    // Source filter
    if (sourceFilter !== "all" && sub.source !== sourceFilter) {
      return false;
    }

    // Tags filter
    if (selectedTags.length > 0) {
      if (!sub.tags || !selectedTags.some(tag => sub.tags?.includes(tag))) {
        return false;
      }
    }

    // Date range filter
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).getTime();
      if (sub.createdAt < startDate) return false;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).getTime() + 86400000; // End of day
      if (sub.createdAt > endDate) return false;
    }

    return true;
  }) || [];

  // Get unique tags from all subscribers
  const allTags: string[] = Array.from(
    new Set(subscribers?.flatMap((sub: Subscriber) => sub.tags || []) || [])
  ).sort() as string[];

  // Get unique sources
  const allSources: string[] = Array.from(
    new Set(subscribers?.map((sub: Subscriber) => sub.source) || [])
  ).sort() as string[];

  // Handler functions
  const handleSubscriberClick = (subscriber: Subscriber) => {
    setSelectedSubscriber(subscriber);
    setSidePanelOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const rows = lines.map(line => line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')));

      if (rows.length > 0) {
        setImportPreview(rows.slice(0, 6)); // Show first 6 rows (header + 5 data rows)

        // Auto-detect column mapping
        const header = rows[0].map(h => h.toLowerCase());
        const emailCol = header.findIndex(h => h.includes('email'));
        const nameCol = header.findIndex(h => h.includes('name'));

        setColumnMapping({
          email: emailCol >= 0 ? emailCol : 0,
          name: nameCol >= 0 ? nameCol : 1,
        });

        // Prepare import data (skip header row)
        const data = rows.slice(1).map(row => ({
          email: row[emailCol >= 0 ? emailCol : 0] || '',
          name: row[nameCol >= 0 ? nameCol : 1] || undefined,
        })).filter(d => d.email && d.email.includes('@'));

        setImportData(data);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (importData.length === 0) {
      toast.error("No valid subscribers to import");
      return;
    }

    try {
      const result = await bulkImport({
        subscribers: importData,
        source: "import",
      });
      toast.success(`Imported ${result.imported} subscribers (${result.skipped} skipped)`);
      setImportDialogOpen(false);
      setImportData([]);
      setImportPreview([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
    }
  };

  const handleBulkAddTag = async () => {
    if (!newTag.trim() || selectedSubscribers.length === 0) return;

    try {
      for (const id of selectedSubscribers) {
        const subscriber = subscribers?.find((s: Subscriber) => s._id === id);
        if (subscriber) {
          const currentTags = subscriber.tags || [];
          if (!currentTags.includes(newTag.trim())) {
            await updateTags({
              id: id as Id<"subscribers">,
              tags: [...currentTags, newTag.trim()],
            });
          }
        }
      }
      toast.success(`Added tag "${newTag}" to ${selectedSubscribers.length} subscribers`);
      setAddTagDialogOpen(false);
      setNewTag("");
      setSelectedSubscribers([]);
    } catch (error: any) {
      toast.error(`Failed to add tag: ${error.message}`);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSubscribers.length === 0) return;

    try {
      for (const id of selectedSubscribers) {
        await unsubscribe({ id: id as Id<"subscribers"> });
      }
      toast.success(`Unsubscribed ${selectedSubscribers.length} subscribers`);
      setSelectedSubscribers([]);
    } catch (error: any) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = selectedSubscribers.length > 0
      ? filteredSubscribers.filter((s: Subscriber) => selectedSubscribers.includes(s._id))
      : filteredSubscribers;

    const headers = ["Email", "Name", "Status", "Source", "Tags", "Joined"];
    const rows = dataToExport.map((sub: Subscriber) => [
      sub.email,
      sub.name || "",
      sub.status,
      sub.source,
      (sub.tags || []).join(";"),
      new Date(sub.createdAt).toISOString(),
    ]);

    const csv = [headers, ...rows].map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${dataToExport.length} subscribers`);
  };

  const getStatusBadge = (status: SubscriberStatus) => {
    const configs = {
      active: { color: "bg-green-muted text-green-400 border-green-400/20", icon: CheckCircle },
      unsubscribed: { color: "bg-gray-500/10 text-gray-300 border-gray-500/20", icon: XCircle },
      bounced: { color: "bg-red-muted text-red border-red/20", icon: AlertTriangle },
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

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "sent":
        return <Mail className="h-4 w-4 text-blue" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case "opened":
        return <Eye className="h-4 w-4 text-purple" />;
      case "clicked":
        return <MousePointerClick className="h-4 w-4 text-amber-500" />;
      case "bounced":
        return <AlertTriangle className="h-4 w-4 text-red" />;
      default:
        return <Mail className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen">
      <div className="p-6 space-y-6 h-full overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-muted border border-blue/30">
              <Users className="h-6 w-6 text-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground tracking-tight">Subscriber Management</h1>
              <p className="text-sm text-muted-foreground">
                Manage your newsletter subscribers
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setImportDialogOpen(true)}
              variant="outline"
              className="bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue/30"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subscriber
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-muted border border-blue/30">
                  <Users className="h-4 w-4 text-blue" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats?.total || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Subscribers</h3>
              <p className="text-xs text-muted-foreground">All time subscribers</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-muted border border-green-400/30">
                  <CheckCircle className="h-4 w-4 text-green-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats?.active || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Active</h3>
              <p className="text-xs text-muted-foreground">Currently subscribed</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-500/20 border border-gray-500/30">
                  <XCircle className="h-4 w-4 text-gray-400" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats?.unsubscribed || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Unsubscribed</h3>
              <p className="text-xs text-muted-foreground">Opted out</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-muted border border-red/30">
                  <AlertTriangle className="h-4 w-4 text-red" />
                </div>
                <span className="text-2xl font-bold text-foreground">{stats?.bounced || 0}</span>
              </div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Bounced</h3>
              <p className="text-xs text-muted-foreground">Invalid emails</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">Filters</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div>
                <Label htmlFor="search" className="text-foreground">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Email or name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <Label className="text-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted">All Statuses</SelectItem>
                    <SelectItem value="active" className="text-foreground focus:bg-muted">Active</SelectItem>
                    <SelectItem value="unsubscribed" className="text-foreground focus:bg-muted">Unsubscribed</SelectItem>
                    <SelectItem value="bounced" className="text-foreground focus:bg-muted">Bounced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Source */}
              <div>
                <Label className="text-foreground">Source</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="All sources" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted">All Sources</SelectItem>
                    {allSources.map((source: string) => (
                      <SelectItem key={source} value={source} className="text-foreground focus:bg-muted capitalize">
                        {source}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-foreground">Tags</Label>
                <Select
                  value={selectedTags.length > 0 ? selectedTags[0] : "all"}
                  onValueChange={(val) => setSelectedTags(val === "all" ? [] : [val])}
                >
                  <SelectTrigger className="bg-muted border-border text-foreground">
                    <SelectValue placeholder="All tags" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border border-border">
                    <SelectItem value="all" className="text-foreground focus:bg-muted">All Tags</SelectItem>
                    {allTags.map(tag => (
                      <SelectItem key={tag} value={tag} className="text-foreground focus:bg-muted">
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div>
                <Label className="text-foreground">Joined Date</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-muted border-border text-foreground text-xs"
                    placeholder="From"
                  />
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-muted border-border text-foreground text-xs"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions Toolbar */}
        {selectedSubscribers.length > 0 && (
          <Card className="bg-blue-muted border-blue/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue">
                  {selectedSubscribers.length} subscriber{selectedSubscribers.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setAddTagDialogOpen(true)}
                    className="bg-muted border-border text-foreground hover:bg-muted/80"
                  >
                    <Tag className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportCSV}
                    className="bg-muted border-border text-foreground hover:bg-muted/80"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleBulkDelete}
                    className="bg-red-muted border border-red/20 text-red hover:bg-red/20"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedSubscribers([])}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscribers Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Subscribers ({filteredSubscribers.length})
              </h3>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="bg-muted border-border text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              >
                <Download className="h-4 w-4 mr-1" />
                Export All
              </Button>
            </div>

            {filteredSubscribers.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted">
                    <TableRow className="border-border">
                      <TableHead className="text-muted-foreground w-12">
                        <Checkbox
                          checked={selectedSubscribers.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedSubscribers(filteredSubscribers.map((s: Subscriber) => s._id));
                            } else {
                              setSelectedSubscribers([]);
                            }
                          }}
                          className="border-border"
                        />
                      </TableHead>
                      <TableHead className="text-muted-foreground">Email</TableHead>
                      <TableHead className="text-muted-foreground">Name</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Source</TableHead>
                      <TableHead className="text-muted-foreground">Tags</TableHead>
                      <TableHead className="text-muted-foreground">Joined</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscribers.map((subscriber: Subscriber) => (
                      <TableRow
                        key={subscriber._id}
                        className="border-border hover:bg-muted cursor-pointer"
                        onClick={() => handleSubscriberClick(subscriber)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedSubscribers.includes(subscriber._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSubscribers(prev => [...prev, subscriber._id]);
                              } else {
                                setSelectedSubscribers(prev => prev.filter(id => id !== subscriber._id));
                              }
                            }}
                            className="border-border"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-foreground">{subscriber.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground">{subscriber.name || "-"}</span>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(subscriber.status as SubscriberStatus)}
                        </TableCell>
                        <TableCell>
                          <span className="text-muted-foreground capitalize">{subscriber.source}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {subscriber.tags && subscriber.tags.length > 0 ? (
                              subscriber.tags.slice(0, 2).map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="bg-purple-muted text-purple border-purple/20 text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                            {subscriber.tags && subscriber.tags.length > 2 && (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground border-border text-xs"
                              >
                                +{subscriber.tags.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {new Date(subscriber.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSubscriberClick(subscriber);
                              }}
                              className="p-1.5 h-auto text-muted-foreground hover:text-foreground hover:bg-muted"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {subscriber.status === "active" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  await unsubscribe({ id: subscriber._id });
                                  toast.success("Subscriber unsubscribed");
                                }}
                                className="p-1.5 h-auto text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No subscribers found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || statusFilter !== "all" || sourceFilter !== "all" || selectedTags.length > 0
                    ? "Try adjusting your filters"
                    : "Import your first subscribers to get started"
                  }
                </p>
                <Button
                  onClick={() => setImportDialogOpen(true)}
                  className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue/30"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Panel - Subscriber Details */}
      {sidePanelOpen && selectedSubscriber && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-background border-l border-border z-50">
          <div className="p-6 h-full overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Subscriber Details</h2>
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
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Email</h3>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedSubscriber.email}</span>
                  </div>
                </div>

                {selectedSubscriber.name && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Name</h3>
                    <p className="text-foreground">{selectedSubscriber.name}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Status</h3>
                  {getStatusBadge(selectedSubscriber.status as SubscriberStatus)}
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Source</h3>
                  <p className="text-foreground capitalize">{selectedSubscriber.source}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Joined</h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {new Date(selectedSubscriber.createdAt).toLocaleDateString()} at{" "}
                      {new Date(selectedSubscriber.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubscriber.tags && selectedSubscriber.tags.length > 0 ? (
                      selectedSubscriber.tags.map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="bg-purple-muted text-purple border-purple/20"
                        >
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">No tags</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity Timeline */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-medium text-foreground mb-4">Activity Timeline</h3>
                {subscriberEvents && subscriberEvents.length > 0 ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-3">
                      {subscriberEvents
                        .sort((a: { timestamp: number }, b: { timestamp: number }) => b.timestamp - a.timestamp)
                        .map((event: { _id: string; type: string; eventType: string; timestamp: number; metadata?: { type?: string; subject?: string; url?: string } }) => (
                          <div
                            key={event._id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted border border-border"
                          >
                            {getEventIcon(event.eventType)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground capitalize">{event.eventType}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(event.timestamp).toLocaleString()}
                              </p>
                              {event.metadata?.url && (
                                <div className="flex items-center gap-1 mt-1">
                                  <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-blue-400 truncate">
                                    {event.metadata.url}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="max-w-2xl bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Import Subscribers</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Upload a CSV file to import subscribers in bulk
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="csv-file" className="text-foreground">CSV File</Label>
              <Input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="bg-muted border-border text-foreground file:bg-muted file:text-foreground file:border-0"
              />
            </div>

            {importPreview.length > 0 && (
              <>
                <div>
                  <Label className="text-foreground">Column Mapping</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Column</Label>
                      <Select
                        value={columnMapping.email.toString()}
                        onValueChange={(val) => setColumnMapping(prev => ({ ...prev, email: parseInt(val) }))}
                      >
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border">
                          {importPreview[0]?.map((header, idx) => (
                            <SelectItem key={idx} value={idx.toString()} className="text-foreground focus:bg-muted">
                              {header || `Column ${idx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Name Column (optional)</Label>
                      <Select
                        value={columnMapping.name.toString()}
                        onValueChange={(val) => setColumnMapping(prev => ({ ...prev, name: parseInt(val) }))}
                      >
                        <SelectTrigger className="bg-muted border-border text-foreground">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border border-border">
                          {importPreview[0]?.map((header, idx) => (
                            <SelectItem key={idx} value={idx.toString()} className="text-foreground focus:bg-muted">
                              {header || `Column ${idx + 1}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-foreground">Preview ({importData.length} valid rows)</Label>
                  <div className="mt-2 border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted">
                        <TableRow className="border-border">
                          <TableHead className="text-muted-foreground">Email</TableHead>
                          <TableHead className="text-muted-foreground">Name</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importData.slice(0, 5).map((row, idx) => (
                          <TableRow key={idx} className="border-border">
                            <TableCell className="text-foreground">{row.email}</TableCell>
                            <TableCell className="text-muted-foreground">{row.name || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {importData.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      And {importData.length - 5} more rows...
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setImportDialogOpen(false);
                setImportData([]);
                setImportPreview([]);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="bg-muted border-border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleImport}
              disabled={importData.length === 0}
              className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue/30"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import {importData.length} Subscribers
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tag Dialog */}
      <Dialog open={addTagDialogOpen} onOpenChange={setAddTagDialogOpen}>
        <DialogContent className="bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Tag</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Add a tag to {selectedSubscribers.length} selected subscriber{selectedSubscribers.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="new-tag" className="text-foreground">Tag Name</Label>
            <Input
              id="new-tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name"
              className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddTagDialogOpen(false);
                setNewTag("");
              }}
              className="bg-muted border-border text-muted-foreground hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkAddTag}
              disabled={!newTag.trim()}
              className="bg-blue-muted border border-blue/30 text-blue hover:bg-blue/30"
            >
              <Tag className="h-4 w-4 mr-2" />
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
