"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Settings, Pause, Play } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const [adminUserId] = useState("admin-user-1"); // In real app, get from auth

  // Queries
  const adminControls = useQuery(api.adminControls.getAdminControls);
  const isLLMEnabled = useQuery(api.adminControls.isLLMProcessingEnabled);

  // Mutations
  const setControlValue = useMutation(api.adminControls.setControlValue);
  const toggleControl = useMutation(api.adminControls.toggleControl);
  const initializeControls = useMutation(api.adminControls.initializeDefaultControls);

  // Initialize controls if they don't exist
  useEffect(() => {
    if (adminControls && adminControls.length === 0) {
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
      <div className="container mx-auto p-6">
        <div className="flex items-center space-x-2">
          <Settings className="h-6 w-6 animate-spin" />
          <span>Loading admin dashboard...</span>
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
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Control system-wide settings and monitor LLM operations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {isLLMEnabled ? (
            <Badge variant="default" className="flex items-center space-x-1">
              <Play className="h-3 w-3" />
              <span>LLM Active</span>
            </Badge>
          ) : (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertTriangle className="h-3 w-3" />
              <span>LLM Paused</span>
            </Badge>
          )}
        </div>
      </div>

      {/* Master Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Primary Controls</span>
          </CardTitle>
          <CardDescription>
            Core system controls that affect LLM processing and AI operations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {primaryControls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No controls configured</p>
              <Button
                onClick={() => initializeControls({ adminUserId })}
                variant="outline"
              >
                Initialize Default Controls
              </Button>
            </div>
          ) : (
            primaryControls.map((control) => (
              <div
                key={control._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getControlIcon(Boolean(control.value))}
                  <div>
                    <h3 className="font-medium">{formatControlKey(control.key)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {control.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge variant={Boolean(control.value) ? "default" : "secondary"}>
                    {Boolean(control.value) ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch
                    checked={Boolean(control.value)}
                    onCheckedChange={() => handleToggleControl(control.key)}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Additional Controls */}
      {otherControls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Controls</CardTitle>
            <CardDescription>
              Other system settings and configuration options
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {otherControls.map((control) => (
              <div
                key={control._id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {control.type === "boolean" && getControlIcon(Boolean(control.value))}
                  <div>
                    <h3 className="font-medium">{formatControlKey(control.key)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {control.description}
                    </p>
                    {control.lastUpdatedBy && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Last updated by {control.lastUpdatedBy} at{" "}
                        {new Date(control.lastUpdatedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {control.type === "boolean" ? (
                    <>
                      <Badge variant={Boolean(control.value) ? "default" : "secondary"}>
                        {Boolean(control.value) ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={Boolean(control.value)}
                        onCheckedChange={() => handleToggleControl(control.key)}
                      />
                    </>
                  ) : (
                    <Badge variant="outline">
                      {String(control.value)}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current status of LLM operations and related services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2 p-3 border rounded">
              {isLLMEnabled ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">LLM Processing Active</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm">LLM Processing Paused</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Data Collection Active</span>
            </div>
            <div className="flex items-center space-x-2 p-3 border rounded">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">API Services Running</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>Emergency Actions</span>
          </CardTitle>
          <CardDescription>
            Critical system controls - use with caution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant="destructive"
              onClick={() => handleToggleControl("llm_processing_enabled")}
              className="flex items-center space-x-2"
            >
              <Pause className="h-4 w-4" />
              <span>Emergency Stop All LLM</span>
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                setControlValue({
                  key: "llm_processing_enabled",
                  value: true,
                  adminUserId,
                  description: "Emergency re-enable of LLM processing"
                })
              }
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>Resume All LLM</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}