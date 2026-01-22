"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, api } from "@/lib/mockConvexTyped";
import type { AdminControl } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Settings, Pause, Play, Shield, Save, RefreshCw, Hash, Type } from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [adminUserId] = useState("admin-user-1"); // In real app, get from auth
  const { isCollapsed } = useSidebar();
  const [editingValues, setEditingValues] = useState<Record<string, string | number>>({}); // Track editing values
  const [savingControls, setSavingControls] = useState<Set<string>>(new Set()); // Track saving states

  // Queries
  const adminControls = useQuery<AdminControl[]>(api.adminControls.getAdminControls);
  const isLLMEnabled = useQuery<boolean>(api.adminControls.isLLMProcessingEnabled);

  // Mutations
  const setControlValue = useMutation(api.adminControls.setControlValue);
  const toggleControl = useMutation(api.adminControls.toggleControl);
  const initializeControls = useMutation(api.adminControls.initializeDefaultControls);

  // Initialize controls if they don't exist
  useEffect(() => {
    if (adminControls && Array.isArray(adminControls) && adminControls.length === 0) {
      initializeControls({ adminUserId })
        .then(() => {
          toast.success("Admin controls initialized");
        })
        .catch((error) => {
          toast.error("Failed to initialize controls: " + error.message);
        });
    }
  }, [adminControls, initializeControls, adminUserId]);

  const handleToggleControl = async (key: string) => {
    try {
      const result = await toggleControl({ key, adminUserId });
      toast.success(`${key} ${result.newValue ? "enabled" : "disabled"}`);
    } catch (error: any) {
      toast.error(`Failed to toggle ${key}: ${error.message}`);
    }
  };

  const handleEditValue = (key: string, value: string | number) => {
    setEditingValues(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveValue = async (key: string, type: "number" | "string") => {
    const editValue = editingValues[key];
    if (editValue === undefined) return;

    setSavingControls(prev => new Set([...prev, key]));

    try {
      let value: string | number = editValue;
      if (type === "number") {
        const numValue = Number(editValue);
        if (isNaN(numValue)) {
          toast.error("Please enter a valid number");
          return;
        }
        value = numValue;
      }

      await setControlValue({
        key,
        value,
        adminUserId,
        description: `Updated ${formatControlKey(key)} to ${value}`
      });

      // Remove from editing state after successful save
      setEditingValues(prev => {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      });

      toast.success(`${formatControlKey(key)} updated successfully`);
    } catch (error: any) {
      toast.error(`Failed to update ${key}: ${error.message}`);
    } finally {
      setSavingControls(prev => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const getEditingValue = (control: AdminControl) => {
    return editingValues[control.key] !== undefined
      ? editingValues[control.key]
      : control.value;
  };

  const isEditing = (key: string) => editingValues[key] !== undefined;
  const isSaving = (key: string) => savingControls.has(key);

  const getControlByKey = (key: string) => {
    return adminControls?.find(control => control.key === key);
  };

  const formatControlKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getControlIcon = (control: AdminControl) => {
    if (control.type === "boolean") {
      return control.value ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <Pause className="h-4 w-4 text-orange-500" />
      );
    } else if (control.type === "number") {
      return <Hash className="h-4 w-4 text-blue-400" />;
    } else {
      return <Type className="h-4 w-4 text-purple-400" />;
    }
  };

  if (adminControls === undefined) {
    return (
      <div className={cn(
        "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
        isCollapsed ? "left-16" : "left-64"
      )}>
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <Settings className="h-6 w-6 animate-spin text-blue-400" />
            <span className="text-[#f5f5f5]">Loading admin dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  const primaryControls = adminControls?.filter(control =>
    ['llm_processing_enabled', 'ai_classification_enabled', 'signal_enrichment_enabled'].includes(control.key)
  ) || [];

  const otherControls = adminControls?.filter(control =>
    !['llm_processing_enabled', 'ai_classification_enabled', 'signal_enrichment_enabled'].includes(control.key)
  ) || [];

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-auto transition-all duration-300 bg-[#0a0a0a]",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20 border border-red-500/30">
              <Shield className="h-6 w-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-[#f5f5f5] tracking-tight">Admin Dashboard</h1>
              <p className="text-sm text-[#a3a3a3]">
                Control system-wide settings and monitor LLM operations
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {isLLMEnabled ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20">
                <Play className="h-3 w-3 text-green-400" />
                <span className="text-sm font-medium text-green-300">LLM Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <AlertTriangle className="h-3 w-3 text-red-400" />
                <span className="text-sm font-medium text-red-300">LLM Paused</span>
              </div>
            )}
          </div>
        </div>

        {/* Master Controls */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-5 w-5 text-[#a3a3a3]" />
            <h3 className="text-lg font-semibold text-[#f5f5f5]">Primary Controls</h3>
          </div>
          <p className="text-sm text-[#a3a3a3] mb-6">
            Core system controls that affect LLM processing and AI operations
          </p>
          <div className="space-y-4">
            {primaryControls.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-[#a3a3a3] mb-4">No controls configured</p>
                <button
                  onClick={() => initializeControls({ adminUserId })}
                  className="px-4 py-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 hover:bg-blue-500/20 transition-standard"
                >
                  Initialize Default Controls
                </button>
              </div>
            ) : (
              primaryControls.map((control) => (
                <div
                  key={control._id}
                  className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5 transition-standard hover:bg-white/10"
                >
                  <div className="flex items-center space-x-3">
                    {getControlIcon(control)}
                    <div>
                      <h3 className="font-medium text-[#f5f5f5]">{formatControlKey(control.key)}</h3>
                      <p className="text-sm text-[#a3a3a3]">
                        {control.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      Boolean(control.value)
                        ? "bg-green-500/10 text-green-300 border border-green-500/20"
                        : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                    )}>
                      {Boolean(control.value) ? "Enabled" : "Disabled"}
                    </div>
                    <Switch
                      checked={Boolean(control.value)}
                      onCheckedChange={() => handleToggleControl(control.key)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Additional Controls */}
        {otherControls.length > 0 && (
          <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">Additional Controls</h3>
            <p className="text-sm text-[#a3a3a3] mb-6">
              Other system settings and configuration options
            </p>
            <div className="space-y-4">
              {otherControls.map((control) => (
                <div
                  key={control._id}
                  className="flex items-center justify-between p-4 border border-white/5 rounded-lg bg-white/5 transition-standard hover:bg-white/10"
                >
                  <div className="flex items-center space-x-3">
                    {getControlIcon(control)}
                    <div>
                      <h3 className="font-medium text-[#f5f5f5]">{formatControlKey(control.key)}</h3>
                      <p className="text-sm text-[#a3a3a3]">
                        {control.description}
                      </p>
                      {control.type !== "boolean" && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {control.type}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    {control.type === "boolean" ? (
                      <>
                        <div className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          Boolean(control.value)
                            ? "bg-green-500/10 text-green-300 border border-green-500/20"
                            : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                        )}>
                          {Boolean(control.value) ? "Enabled" : "Disabled"}
                        </div>
                        <Switch
                          checked={Boolean(control.value)}
                          onCheckedChange={() => handleToggleControl(control.key)}
                        />
                      </>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Input
                          type={control.type === "number" ? "number" : "text"}
                          value={String(getEditingValue(control))}
                          onChange={(e) => handleEditValue(control.key, control.type === "number" ? e.target.value : e.target.value)}
                          className="w-32 h-8 text-sm"
                          placeholder={`Enter ${control.type}`}
                          disabled={isSaving(control.key)}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSaveValue(control.key, control.type as "number" | "string")}
                          disabled={!isEditing(control.key) || isSaving(control.key)}
                          className="h-8 px-2"
                        >
                          {isSaving(control.key) ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Control Categories Overview */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">Control Categories</h3>
          <p className="text-sm text-[#a3a3a3] mb-6">
            Overview of control types and their current status
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-white/5 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[#f5f5f5]">Boolean Controls</h4>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </div>
              <p className="text-sm text-[#a3a3a3] mb-2">Toggle switches for on/off settings</p>
              <div className="text-xs text-blue-300">
                {adminControls?.filter(c => c.type === "boolean").length || 0} controls
              </div>
            </div>
            <div className="p-4 border border-white/5 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[#f5f5f5]">Numeric Controls</h4>
                <Hash className="h-4 w-4 text-blue-400" />
              </div>
              <p className="text-sm text-[#a3a3a3] mb-2">Input fields for numerical values</p>
              <div className="text-xs text-blue-300">
                {adminControls?.filter(c => c.type === "number").length || 0} controls
              </div>
            </div>
            <div className="p-4 border border-white/5 rounded-lg bg-white/5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-[#f5f5f5]">Text Controls</h4>
                <Type className="h-4 w-4 text-purple-400" />
              </div>
              <p className="text-sm text-[#a3a3a3] mb-2">Input fields for text values</p>
              <div className="text-xs text-blue-300">
                {adminControls?.filter(c => c.type === "string").length || 0} controls
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-[#f5f5f5] mb-2">System Status</h3>
          <p className="text-sm text-[#a3a3a3] mb-6">
            Current status of LLM operations and related services
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 border border-white/5 rounded-lg bg-white/5">
              {isLLMEnabled ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-400" />
                  <span className="text-sm text-[#f5f5f5]">LLM Processing Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-[#f5f5f5]">LLM Processing Paused</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-3 p-4 border border-white/5 rounded-lg bg-white/5">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-[#f5f5f5]">Data Collection Active</span>
            </div>
            <div className="flex items-center space-x-3 p-4 border border-white/5 rounded-lg bg-white/5">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-[#f5f5f5]">API Services Running</span>
            </div>
          </div>
        </div>

        {/* Batch Operations */}
        <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="h-5 w-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-[#f5f5f5]">Batch Operations</h3>
          </div>
          <p className="text-sm text-[#a3a3a3] mb-6">
            Perform operations on multiple controls at once
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const enableControls = ['ai_classification_enabled', 'signal_enrichment_enabled'];
                Promise.all(enableControls.map(key =>
                  setControlValue({ key, value: true, adminUserId, description: `Batch enable ${key}` })
                )).then(() => {
                  toast.success('AI features enabled');
                }).catch((error) => {
                  toast.error('Failed to enable AI features: ' + error.message);
                });
              }}
              className="flex items-center justify-center gap-2 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 transition-standard"
            >
              <Play className="h-4 w-4" />
              <span className="font-medium">Enable All AI Features</span>
            </button>
            <button
              onClick={() => {
                const disableControls = ['ai_classification_enabled', 'signal_enrichment_enabled'];
                Promise.all(disableControls.map(key =>
                  setControlValue({ key, value: false, adminUserId, description: `Batch disable ${key}` })
                )).then(() => {
                  toast.success('AI features disabled');
                }).catch((error) => {
                  toast.error('Failed to disable AI features: ' + error.message);
                });
              }}
              className="flex items-center justify-center gap-2 p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 hover:bg-orange-500/20 transition-standard"
            >
              <Pause className="h-4 w-4" />
              <span className="font-medium">Disable All AI Features</span>
            </button>
          </div>
        </div>

        {/* Emergency Actions */}
        <div className="glass bg-[#0a0a0a]/80 border border-red-500/20 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-lg font-semibold text-red-300">Emergency Actions</h3>
          </div>
          <p className="text-sm text-[#a3a3a3] mb-6">
            Critical system controls - use with caution
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => handleToggleControl("llm_processing_enabled")}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 hover:bg-red-500/20 transition-standard"
            >
              <Pause className="h-4 w-4" />
              <span className="text-sm font-medium">Emergency Stop All LLM</span>
            </button>
            <button
              onClick={() =>
                setControlValue({
                  key: "llm_processing_enabled",
                  value: true,
                  adminUserId,
                  description: "Emergency re-enable of LLM processing"
                })
              }
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 text-green-300 hover:bg-green-500/20 transition-standard"
            >
              <Play className="h-4 w-4" />
              <span className="text-sm font-medium">Resume All LLM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}