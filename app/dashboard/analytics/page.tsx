"use client";

import { useSidebar } from "@/components/dashboard/sidebar-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
function convertSignal(signal: any, index: number, includeTheme: boolean = false): Signal & { metrics?: any; keywords?: string[]; _id?: any } {
  return {
    id: index,
    signal_name: signal.name || "",
    summary: signal.description || null,
    strategic_notes: signal.classificationReasoning || null,
    confidence_level: signal.confidence || null,
    lifecycle: mapLifecycle(signal.lifecycle),
    steep_driver: mapSteepDriver(signal.steepDriver),
    tsn_layer: mapTsnLayer(signal.tsnLayer),
    behavior_layer: mapBehaviorLayer(signal.behaviorLayer),
    scope_impact: mapScopeImpact(signal.understandingScope),
    theme_type: includeTheme ? deriveThemeType(signal) : null,
    sources: [],
    tags: signal.tags || [],
    date_added: signal.createdAt ? new Date(signal.createdAt).toISOString() : null,
    last_updated: signal.updatedAt ? new Date(signal.updatedAt).toISOString() : null,
    // Include additional data for info panel
    metrics: signal.metrics || null,
    keywords: signal.keywords || [],
    _id: signal._id || null,
  };
}

function AnalyticsContent() {
  // Fetch all active signals
  const allSignals = useQuery(api.signals.listSignals, {
    status: "active",
    limit: 1000,
  });

  if (allSignals === undefined) {
    return <LoadingScreen />;
  }

  // Filter and convert signals for each map
  const marketSignals: Signal[] = allSignals
    .filter((s: any) => s.lifecycle && s.steepDriver)
    .map((s: any, i: number) => convertSignal(s, i, false));

  const engagementSignals: Signal[] = allSignals
    .filter((s: any) => s.tsnLayer && s.behaviorLayer)
    .map((s: any, i: number) => convertSignal(s, i, false));

  const understandingSignals: Signal[] = allSignals
    .filter((s: any) => s.understandingScope)
    .map((s: any, i: number) => convertSignal(s, i, true)); // Include theme_type for understanding map

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