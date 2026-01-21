"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, api } from "@/lib/mockConvexTyped";
import type { AdminControl } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { AlertTriangle, CheckCircle, Settings, Pause, Play, Shield } from "lucide-react";
import { toast } from "sonner";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const [adminUserId] = useState("admin-user-1"); // In real app, get from auth
  const { isCollapsed } = useSidebar();

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

  const getControlByKey = (key: string) => {
    return adminControls?.find(control => control.key === key);
  };

  const formatControlKey = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getControlIcon = (enabled: boolean) => {
    return enabled ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Pause className="h-4 w-4 text-orange-500" />
    );
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
                    {getControlIcon(Boolean(control.value))}
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
                    {control.type === "boolean" && getControlIcon(Boolean(control.value))}
                    <div>
                      <h3 className="font-medium text-[#f5f5f5]">{formatControlKey(control.key)}</h3>
                      <p className="text-sm text-[#a3a3a3]">
                        {control.description}
                      </p>
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
                      <div className="px-2 py-1 rounded text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20">
                        {String(control.value)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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