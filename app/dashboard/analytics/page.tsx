"use client";

import { Suspense } from "react";
import { useQuery, api } from "@/lib/mockConvexTyped";
import type { Signal } from "@/lib/types";
import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Loading component
function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-96">
      <div className="text-[#f5f5f5]">Loading analytics...</div>
    </div>
  );
}

// Mock MappingInterface component - replace with actual implementation
function MappingInterface({ marketSignals, engagementSignals, understandingSignals }: {
  marketSignals: MappingSignal[];
  engagementSignals: MappingSignal[];
  understandingSignals: MappingSignal[];
}) {
  return (
    <div className="p-6 space-y-6">
      <div className="glass bg-[#0a0a0a]/80 border border-white/5 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[#f5f5f5] mb-4">Innovation Mapping Interface</h3>
        <div className="grid gap-4">
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <h4 className="font-medium text-[#f5f5f5] mb-2">Market Signals ({marketSignals.length})</h4>
            <p className="text-sm text-[#a3a3a3]">Signals with lifecycle and STEEP driver data</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <h4 className="font-medium text-[#f5f5f5] mb-2">Engagement Signals ({engagementSignals.length})</h4>
            <p className="text-sm text-[#a3a3a3]">Signals with TSN layer and behavior layer data</p>
          </div>
          <div className="p-4 rounded-lg bg-white/5 border border-white/5">
            <h4 className="font-medium text-[#f5f5f5] mb-2">Understanding Signals ({understandingSignals.length})</h4>
            <p className="text-sm text-[#a3a3a3]">Signals with understanding scope data</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// MappingSignal interface for innovation-map compatibility
interface MappingSignal {
  id: number;
  signal_name: string;
  summary: string | null;
  strategic_notes: string | null;
  confidence_level: number | null;
  lifecycle: "established" | "disruptor" | "emerging" | null;
  steep_driver: "social" | "technological" | "economic" | "environmental" | "political" | null;
  tsn_layer: "tool" | "shell" | "network" | "settlement" | null;
  behavior_layer: "core" | "individual" | "community" | null;
  scope_impact: "immediate" | "extended" | "distributed" | null;
  theme_type: "ur_aggregation" | "ur_processing" | "ur_analysis" | "qol_physical" | "qol_mental" | "qol_societal" | null;
  sources: string[];
  tags: string[];
  date_added: string | null;
  last_updated: string | null;
}

// Helper to map Convex lifecycle to innovation-map lifecycle
function mapLifecycle(lifecycle: string | undefined): "established" | "disruptor" | "emerging" | null {
  if (!lifecycle) return null;
  const mapping: Record<string, "established" | "disruptor" | "emerging"> = {
    emergence: "emerging",
    growth: "disruptor",
    maturity: "established",
    decline: "established",
  };
  return mapping[lifecycle] || null;
}

// Helper to map Convex steepDriver to innovation-map steep_driver
function mapSteepDriver(steepDriver: string | undefined): "social" | "technological" | "economic" | "environmental" | "political" | null {
  if (!steepDriver) return null;
  const mapping: Record<string, "social" | "technological" | "economic" | "environmental" | "political"> = {
    society: "social",
    technology: "technological",
    economy: "economic",
    environment: "environmental",
    politics: "political",
  };
  return mapping[steepDriver] || null;
}

// Helper to map Convex tsnLayer to innovation-map tsn_layer
function mapTsnLayer(tsnLayer: string | undefined): "tool" | "shell" | "network" | "settlement" | null {
  if (!tsnLayer) return null;
  const mapping: Record<string, "tool" | "shell" | "network" | "settlement"> = {
    weak: "tool",
    moderate: "shell",
    strong: "network",
  };
  return mapping[tsnLayer] || null;
}

// Helper to map Convex behaviorLayer to innovation-map behavior_layer
function mapBehaviorLayer(behaviorLayer: string | undefined): "core" | "individual" | "community" | null {
  if (!behaviorLayer) return null;
  const mapping: Record<string, "core" | "individual" | "community"> = {
    negative: "core",
    neutral: "individual",
    positive: "community",
  };
  return mapping[behaviorLayer] || null;
}

// Helper to map Convex understandingScope to innovation-map scope_impact
function mapScopeImpact(understandingScope: string | undefined): "immediate" | "extended" | "distributed" | null {
  if (!understandingScope) return null;
  const mapping: Record<string, "immediate" | "extended" | "distributed"> = {
    narrow: "immediate",
    moderate: "extended",
    broad: "distributed",
  };
  return mapping[understandingScope] || null;
}

// Helper to derive theme_type from signal data (fallback for understanding map)
function deriveThemeType(signal: any): "ur_aggregation" | "ur_processing" | "ur_analysis" | "qol_physical" | "qol_mental" | "qol_societal" | null {
  // If we have tags or keywords that hint at theme, use them
  const tags = signal.tags || [];
  const keywords = signal.keywords || [];
  const allText = [...tags, ...keywords, signal.name || "", signal.description || ""].join(" ").toLowerCase();

  // Try to match based on content
  if (allText.includes("aggregat") || allText.includes("collect") || allText.includes("gather")) {
    return "ur_aggregation";
  }
  if (allText.includes("process") || allText.includes("transform") || allText.includes("compute")) {
    return "ur_processing";
  }
  if (allText.includes("analyz") || allText.includes("insight") || allText.includes("model")) {
    return "ur_analysis";
  }
  if (allText.includes("physical") || allText.includes("health") || allText.includes("body") || allText.includes("fitness")) {
    return "qol_physical";
  }
  if (allText.includes("mental") || allText.includes("psych") || allText.includes("wellbeing") || allText.includes("mind")) {
    return "qol_mental";
  }
  if (allText.includes("social") || allText.includes("community") || allText.includes("societal") || allText.includes("society")) {
    return "qol_societal";
  }

  // Default fallback - use processing as it's most common
  return "ur_processing";
}

// Convert Convex signal to innovation-map Signal format
function convertSignal(signal: Signal, index: number, includeTheme: boolean = false): MappingSignal {
  return {
    id: index,
    signal_name: signal.title || "",
    summary: signal.description || null,
    strategic_notes: null,
    confidence_level: signal.confidence || null,
    lifecycle: "emerging", // Default lifecycle
    steep_driver: "technological", // Default steep driver
    tsn_layer: "network", // Default TSN layer
    behavior_layer: "community", // Default behavior layer
    scope_impact: "extended", // Default scope impact
    theme_type: includeTheme ? "ur_processing" : null,
    sources: signal.source ? [signal.source] : [],
    tags: signal.tags || [],
    date_added: signal.timestamp ? new Date(signal.timestamp).toISOString() : null,
    last_updated: signal.timestamp ? new Date(signal.timestamp).toISOString() : null,
  };
}

function AnalyticsContent() {
  // Fetch all active signals
  const allSignals = useQuery<Signal[]>(api.signals.listSignals);

  if (allSignals === undefined) {
    return <LoadingScreen />;
  }

  // Filter and convert signals for each map
  const marketSignals: MappingSignal[] = allSignals
    .filter((s: Signal) => s.status === 'active')
    .map((s: Signal, i: number) => convertSignal(s, i, false));

  const engagementSignals: MappingSignal[] = allSignals
    .filter((s: Signal) => s.category && s.tags.length > 0)
    .map((s: Signal, i: number) => convertSignal(s, i, false));

  const understandingSignals: MappingSignal[] = allSignals
    .filter((s: Signal) => s.confidence > 0.5)
    .map((s: Signal, i: number) => convertSignal(s, i, true)); // Include theme_type for understanding map

  return (
    <MappingInterface
      marketSignals={marketSignals}
      engagementSignals={engagementSignals}
      understandingSignals={understandingSignals}
    />
  );
}

export default function AnalyticsPage() {
  const { isCollapsed } = useSidebar();

  return (
    <div className={cn(
      "fixed right-0 top-0 bottom-0 overflow-hidden transition-all duration-300",
      isCollapsed ? "left-16" : "left-64"
    )}>
      <Suspense fallback={<LoadingScreen />}>
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}