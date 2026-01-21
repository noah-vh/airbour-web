"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, api } from "@/lib/mockConvexTyped";
import type { Signal } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Zap,
  Target,
  Lightbulb,
  Radio
} from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

const LIFECYCLE_OPTIONS = [
  { value: "weak", label: "Weak Signal", color: "bg-gray-100 text-gray-800" },
  { value: "emerging", label: "Emerging", color: "bg-blue-100 text-blue-800" },
  { value: "growing", label: "Growing", color: "bg-yellow-100 text-yellow-800" },
  { value: "mainstream", label: "Mainstream", color: "bg-green-100 text-green-800" },
  { value: "declining", label: "Declining", color: "bg-red-100 text-red-800" },
];

const STEEP_OPTIONS = [
  { value: "social", label: "Social", icon: "👥" },
  { value: "technological", label: "Technological", icon: "🔬" },
  { value: "economic", label: "Economic", icon: "💰" },
  { value: "environmental", label: "Environmental", icon: "🌍" },
  { value: "political", label: "Political", icon: "🏛️" },
];

interface LocalSignal {
  _id: string;
  name: string;
  description: string;
  lifecycle: string;
  steep: string[];
  confidence: number;
  keywords: string[];
  mentionCount: number;
  sourceCount: number;
  sentiment: number;
  growth: number;
  createdAt: number;
  updatedAt: number;
}

export default function SignalsDashboard() {
  const { isCollapsed } = useSidebar();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLifecycle, setSelectedLifecycle] = useState<string[]>([]);
  const [selectedSteep, setSelectedSteep] = useState<string[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingSignal, setEditingSignal] = useState<Signal | null>(null);
  const [selectedSignals, setSelectedSignals] = useState<string[]>([]);

  // Form state for creating/editing signals
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    lifecycle: "",
    steep: [] as string[],
    confidence: 0.5,
    keywords: [] as string[],
  });

  // Queries
  const signals = useQuery<Signal[]>(api.signals.listSignals);
  const signalStats = useQuery(api.signals.getSignalStats);

  // Mutations
  const createSignal = useMutation(api.signals.createSignal);
  const updateSignal = useMutation(api.signals.updateSignal);
  const deleteSignal = useMutation(api.signals.deleteSignal);
  const deleteSignals = useMutation(api.signals.deleteSignals);

  const handleCreateSignal = async () => {
    try {
      await createSignal({
        name: formData.name,
        description: formData.description,
        lifecycle: formData.lifecycle,
        steep: formData.steep,
        confidence: formData.confidence,
        keywords: formData.keywords,
      });

      toast.success("Signal created successfully");
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to create signal: ${error.message}`);
    }
  };

  const handleUpdateSignal = async () => {
    if (!editingSignal) return;

    try {
      await updateSignal({
        id: editingSignal._id as any,
        name: formData.name,
        description: formData.description,
        lifecycle: formData.lifecycle,
        steep: formData.steep,
        confidence: formData.confidence,
        keywords: formData.keywords,
      });

      toast.success("Signal updated successfully");
      setEditingSignal(null);
      resetForm();
    } catch (error: any) {
      toast.error(`Failed to update signal: ${error.message}`);
    }
  };

  const handleDeleteSignal = async (signalId: string) => {
    try {
      await deleteSignal({ id: signalId as any });
      toast.success("Signal deleted successfully");
    } catch (error: any) {
      toast.error(`Failed to delete signal: ${error.message}`);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSignals.length === 0) return;

    try {
      await deleteSignals({ ids: selectedSignals as any });
      toast.success(`${selectedSignals.length} signals deleted successfully`);
      setSelectedSignals([]);
    } catch (error: any) {
      toast.error(`Failed to delete signals: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      lifecycle: "",
      steep: [],
      confidence: 0.5,
      keywords: [],
    });
  };

  const openEditDialog = (signal: Signal) => {
    setEditingSignal(signal);
    setFormData({
      name: signal.title,
      description: signal.description,
      lifecycle: signal.status,
      steep: signal.tags,
      confidence: signal.confidence,
      keywords: signal.tags,
    });
  };

  const getLifecycleConfig = (lifecycle: string) => {
    return LIFECYCLE_OPTIONS.find(opt => opt.value === lifecycle) || LIFECYCLE_OPTIONS[0];
  };

  const getSteepIcon = (steep: string) => {
    const config = STEEP_OPTIONS.find(opt => opt.value === steep);
    return config?.icon || "📊";
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? "+" : "";
    return `${sign}${Math.round(growth * 100)}%`;
  };

  if (signals === undefined || signalStats === undefined) {
    return (
      <div className={cn(
        "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
        isCollapsed ? "left-16" : "left-64"
      )}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 animate-spin text-blue-400" />
            <span className="text-[#f5f5f5]">Loading signals dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
              <Radio className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Signals Dashboard</h1>
              <p className="text-sm text-[#a3a3a3]">
                Monitor and manage innovation signals across STEEP categories
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-standard">
                  <Plus className="h-4 w-4" />
                  <span className="text-sm font-medium">Add Signal</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-[#f5f5f5]">Create New Signal</DialogTitle>
                  <DialogDescription className="text-[#a3a3a3]">
                    Add a new innovation signal to track and monitor
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-[#f5f5f5]">Signal Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter signal name"
                      className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description" className="text-[#f5f5f5]">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the signal"
                      className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="lifecycle" className="text-[#f5f5f5]">Lifecycle Stage</Label>
                      <Select
                        value={formData.lifecycle}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, lifecycle: value }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                          <SelectValue placeholder="Select lifecycle stage" />
                        </SelectTrigger>
                        <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                          {LIFECYCLE_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-[#f5f5f5] focus:bg-white/10">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="confidence" className="text-[#f5f5f5]">Confidence Level</Label>
                      <Input
                        id="confidence"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.confidence}
                        onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                        className="bg-white/5 border-white/10"
                      />
                      <div className="text-sm text-[#a3a3a3] mt-1">
                        {formatConfidence(formData.confidence)}
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSignal}
                    disabled={!formData.name || !formData.lifecycle}
                    className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
                  >
                    Create Signal
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-500/30">
                <Activity className="h-4 w-4 text-blue-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signals?.length || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Total Signals</h3>
            <p className="text-xs text-[#666]">All tracked signals</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/20 border border-green-500/30">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signals?.filter(s => s.status === 'active').length || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Emerging</h3>
            <p className="text-xs text-[#666]">Early stage signals</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500/20 border border-yellow-500/30">
                <Zap className="h-4 w-4 text-yellow-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signals?.filter(s => s.category).length || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Growing</h3>
            <p className="text-xs text-[#666]">Gaining momentum</p>
          </div>

          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-5 transition-standard hover:bg-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 border border-purple-500/30">
                <Target className="h-4 w-4 text-purple-400" />
              </div>
              <span className="text-2xl font-bold text-[#f5f5f5]">{signals?.filter(s => s.confidence > 0.8).length || 0}</span>
            </div>
            <h3 className="text-sm font-medium text-[#a3a3a3] mb-1">Mainstream</h3>
            <p className="text-xs text-[#666]">Established trends</p>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-[#a3a3a3]" />
            <h3 className="text-lg font-semibold text-[#f5f5f5]">Filters</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search" className="text-[#f5f5f5]">Search Signals</Label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#666]" />
                <Input
                  id="search"
                  placeholder="Search by name or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
            </div>

            <div>
              <Label className="text-[#f5f5f5]">Lifecycle Stage</Label>
              <Select
                value={selectedLifecycle.length === 1 ? selectedLifecycle[0] : ""}
                onValueChange={(value) => setSelectedLifecycle(value ? [value] : [])}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="" className="text-[#f5f5f5] focus:bg-white/10">All stages</SelectItem>
                  {LIFECYCLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[#f5f5f5] focus:bg-white/10">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[#f5f5f5]">STEEP Category</Label>
              <Select
                value={selectedSteep.length === 1 ? selectedSteep[0] : ""}
                onValueChange={(value) => setSelectedSteep(value ? [value] : [])}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-[#f5f5f5]">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="glass bg-[#0a0a0a]/95 border border-white/10">
                  <SelectItem value="" className="text-[#f5f5f5] focus:bg-white/10">All categories</SelectItem>
                  {STEEP_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-[#f5f5f5] focus:bg-white/10">
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Signals Table */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#f5f5f5]">Innovation Signals</h3>
            {selectedSignals.length > 0 && (
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-standard"
              >
                <Trash2 className="h-4 w-4" />
                <span className="text-sm font-medium">Delete ({selectedSignals.length})</span>
              </button>
            )}
          </div>

          {signals && signals.length > 0 ? (
            <div className="border border-white/5 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5">
                    <TableHead className="text-[#a3a3a3] w-12">
                      <Checkbox
                        checked={selectedSignals.length === signals.length && signals.length > 0}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedSignals(signals.map(s => s._id));
                          } else {
                            setSelectedSignals([]);
                          }
                        }}
                        className="border-white/10"
                      />
                    </TableHead>
                    <TableHead className="text-[#a3a3a3]">Signal</TableHead>
                    <TableHead className="text-[#a3a3a3]">Lifecycle</TableHead>
                    <TableHead className="text-[#a3a3a3]">STEEP</TableHead>
                    <TableHead className="text-[#a3a3a3]">Confidence</TableHead>
                    <TableHead className="text-[#a3a3a3]">Mentions</TableHead>
                    <TableHead className="text-[#a3a3a3]">Growth</TableHead>
                    <TableHead className="text-[#a3a3a3]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {signals.map((signal) => {
                    const lifecycleConfig = getLifecycleConfig(signal.status);

                    return (
                      <TableRow key={signal._id} className="border-white/5 hover:bg-white/5">
                        <TableCell>
                          <Checkbox
                            checked={selectedSignals.includes(signal._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedSignals(prev => [...prev, signal._id]);
                              } else {
                                setSelectedSignals(prev => prev.filter(id => id !== signal._id));
                              }
                            }}
                            className="border-white/10"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-[#f5f5f5]">{signal.title}</p>
                            <p className="text-sm text-[#a3a3a3] line-clamp-2">
                              {signal.description}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                            {lifecycleConfig.label}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            {signal.tags.map((category) => (
                              <span key={category} className="text-lg">
                                {getSteepIcon(category)}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="px-2 py-1 rounded text-xs font-medium bg-green-500/10 text-green-300 border border-green-500/20">
                            {formatConfidence(signal.confidence)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-[#f5f5f5]">{Math.floor(signal.relevance * 10) || 0}</span>
                            <div className="text-xs text-[#666]">
                              1 source
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {signal.relevance > 0.5 ? (
                              <TrendingUp className="h-4 w-4 text-green-400" />
                            ) : signal.relevance < 0.3 ? (
                              <TrendingDown className="h-4 w-4 text-red-400" />
                            ) : (
                              <Activity className="h-4 w-4 text-[#666]" />
                            )}
                            <span className="text-sm text-[#f5f5f5]">
                              {signal.relevance > 0.5 ? "↗ Growing" : signal.relevance < 0.3 ? "↘ Declining" : "→ Stable"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openEditDialog(signal)}
                              className="p-1.5 rounded text-[#a3a3a3] hover:text-[#f5f5f5] hover:bg-white/5 transition-standard"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSignal(signal._id)}
                              className="p-1.5 rounded text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-standard"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-[#666] mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#f5f5f5] mb-2">No signals found</h3>
              <p className="text-[#a3a3a3] mb-4">
                {searchTerm || selectedLifecycle.length > 0 || selectedSteep.length > 0
                  ? "Try adjusting your filters or search terms"
                  : "Create your first innovation signal to get started"
                }
              </p>
              {!searchTerm && selectedLifecycle.length === 0 && selectedSteep.length === 0 && (
                <button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-standard"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Signal
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Signal Dialog */}
      {editingSignal && (
        <Dialog open={!!editingSignal} onOpenChange={() => setEditingSignal(null)}>
          <DialogContent className="max-w-2xl glass bg-[#0a0a0a]/95 border border-white/10">
            <DialogHeader>
              <DialogTitle className="text-[#f5f5f5]">Edit Signal</DialogTitle>
              <DialogDescription className="text-[#a3a3a3]">
                Update the signal details and properties
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name" className="text-[#f5f5f5]">Signal Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter signal name"
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
              <div>
                <Label htmlFor="edit-description" className="text-[#f5f5f5]">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the signal"
                  className="bg-white/5 border-white/10 text-[#f5f5f5] placeholder:text-[#666]"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingSignal(null)}
                className="bg-white/5 border-white/10 text-[#a3a3a3] hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdateSignal}
                disabled={!formData.name || !formData.lifecycle}
                className="bg-blue-500/20 border border-blue-500/30 text-blue-300 hover:bg-blue-500/30"
              >
                Update Signal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}