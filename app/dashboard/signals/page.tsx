"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

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

interface Signal {
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
  const signals = useQuery(api.signals.listSignals, {
    lifecycle: selectedLifecycle.length > 0 ? selectedLifecycle : undefined,
    steep: selectedSteep.length > 0 ? selectedSteep : undefined,
    search: searchTerm || undefined,
  });

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
      name: signal.name,
      description: signal.description,
      lifecycle: signal.lifecycle,
      steep: signal.steep,
      confidence: signal.confidence,
      keywords: signal.keywords,
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
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 animate-spin" />
          <span>Loading signals dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Signals Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage innovation signals across STEEP categories
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Add Signal</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Signal</DialogTitle>
                <DialogDescription>
                  Add a new innovation signal to track and monitor
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Signal Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter signal name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the signal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="lifecycle">Lifecycle Stage</Label>
                    <Select
                      value={formData.lifecycle}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, lifecycle: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lifecycle stage" />
                      </SelectTrigger>
                      <SelectContent>
                        {LIFECYCLE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="confidence">Confidence Level</Label>
                    <Input
                      id="confidence"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.confidence}
                      onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                    />
                    <div className="text-sm text-muted-foreground mt-1">
                      {formatConfidence(formData.confidence)}
                    </div>
                  </div>
                </div>
                <div>
                  <Label>STEEP Categories</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {STEEP_OPTIONS.map((option) => (
                      <div key={option.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`steep-${option.value}`}
                          checked={formData.steep.includes(option.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({
                                ...prev,
                                steep: [...prev.steep, option.value]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                steep: prev.steep.filter(s => s !== option.value)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={`steep-${option.value}`} className="flex items-center space-x-1">
                          <span>{option.icon}</span>
                          <span>{option.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="keywords"
                    value={formData.keywords.join(", ")}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k)
                    }))}
                    placeholder="Enter keywords separated by commas"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateSignal} disabled={!formData.name || !formData.lifecycle}>
                  Create Signal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Signals</p>
                <p className="text-2xl font-bold">{signalStats?.total || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emerging</p>
                <p className="text-2xl font-bold">{signalStats?.byLifecycle?.emerging || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Growing</p>
                <p className="text-2xl font-bold">{signalStats?.byLifecycle?.growing || 0}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mainstream</p>
                <p className="text-2xl font-bold">{signalStats?.byLifecycle?.mainstream || 0}</p>
              </div>
              <Target className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="search">Search Signals</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div>
              <Label>Lifecycle Stage</Label>
              <Select
                value={selectedLifecycle.length === 1 ? selectedLifecycle[0] : ""}
                onValueChange={(value) => setSelectedLifecycle(value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All stages" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All stages</SelectItem>
                  {LIFECYCLE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>STEEP Category</Label>
              <Select
                value={selectedSteep.length === 1 ? selectedSteep[0] : ""}
                onValueChange={(value) => setSelectedSteep(value ? [value] : [])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {STEEP_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Innovation Signals</CardTitle>
            {selectedSignals.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteSelected}
                className="flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete ({selectedSignals.length})</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {signals && signals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedSignals.length === signals.length && signals.length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedSignals(signals.map(s => s._id));
                        } else {
                          setSelectedSignals([]);
                        }
                      }}
                    />
                  </TableHead>
                  <TableHead>Signal</TableHead>
                  <TableHead>Lifecycle</TableHead>
                  <TableHead>STEEP</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Mentions</TableHead>
                  <TableHead>Growth</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {signals.map((signal) => {
                  const lifecycleConfig = getLifecycleConfig(signal.lifecycle);

                  return (
                    <TableRow key={signal._id}>
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
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{signal.name}</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {signal.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={lifecycleConfig.color}>
                          {lifecycleConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {signal.steep.map((category) => (
                            <span key={category} className="text-lg">
                              {getSteepIcon(category)}
                            </span>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {formatConfidence(signal.confidence)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{signal.mentionCount || 0}</span>
                          <div className="text-xs text-muted-foreground">
                            {signal.sourceCount || 0} sources
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {signal.growth > 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : signal.growth < 0 ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <Activity className="h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm">
                            {formatGrowth(signal.growth)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(signal)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSignal(signal._id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No signals found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || selectedLifecycle.length > 0 || selectedSteep.length > 0
                  ? "Try adjusting your filters or search terms"
                  : "Create your first innovation signal to get started"
                }
              </p>
              {!searchTerm && selectedLifecycle.length === 0 && selectedSteep.length === 0 && (
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Signal
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Signal Dialog */}
      {editingSignal && (
        <Dialog open={!!editingSignal} onOpenChange={() => setEditingSignal(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Signal</DialogTitle>
              <DialogDescription>
                Update the signal details and properties
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Signal Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter signal name"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the signal"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-lifecycle">Lifecycle Stage</Label>
                  <Select
                    value={formData.lifecycle}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, lifecycle: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lifecycle stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-confidence">Confidence Level</Label>
                  <Input
                    id="edit-confidence"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={formData.confidence}
                    onChange={(e) => setFormData(prev => ({ ...prev, confidence: parseFloat(e.target.value) }))}
                  />
                  <div className="text-sm text-muted-foreground mt-1">
                    {formatConfidence(formData.confidence)}
                  </div>
                </div>
              </div>
              <div>
                <Label>STEEP Categories</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {STEEP_OPTIONS.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-steep-${option.value}`}
                        checked={formData.steep.includes(option.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setFormData(prev => ({
                              ...prev,
                              steep: [...prev.steep, option.value]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              steep: prev.steep.filter(s => s !== option.value)
                            }));
                          }
                        }}
                      />
                      <Label htmlFor={`edit-steep-${option.value}`} className="flex items-center space-x-1">
                        <span>{option.icon}</span>
                        <span>{option.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-keywords">Keywords (comma-separated)</Label>
                <Input
                  id="edit-keywords"
                  value={formData.keywords.join(", ")}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    keywords: e.target.value.split(",").map(k => k.trim()).filter(k => k)
                  }))}
                  placeholder="Enter keywords separated by commas"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingSignal(null)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateSignal} disabled={!formData.name || !formData.lifecycle}>
                Update Signal
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}