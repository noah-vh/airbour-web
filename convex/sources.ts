import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listSources = query({
  args: {
    type: v.optional(v.string()),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("sources");

    // Apply filters
    if (args.type && args.type !== "all") {
      query = query.filter((q) => q.eq(q.field("type"), args.type));
    }

    if (args.status && args.status !== "all") {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    let sources = await query.collect();

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      sources = sources.filter(source =>
        source.name.toLowerCase().includes(searchLower) ||
        source.description?.toLowerCase().includes(searchLower) ||
        source.url.toLowerCase().includes(searchLower)
      );
    }

    // Apply limit
    if (args.limit) {
      sources = sources.slice(0, args.limit);
    }

    return sources;
  },
});

export const getSourceStats = query({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("sources").collect();

    const total = sources.length;
    const active = sources.filter(s => s.status === "active").length;
    const inactive = sources.filter(s => s.status === "inactive").length;
    const error = sources.filter(s => s.status === "error").length;
    const pending = sources.filter(s => s.status === "pending").length;

    const totalSignals = sources.reduce((sum, s) => sum + (s.signalCount || 0), 0);

    return {
      total,
      active,
      inactive,
      error,
      pending,
      totalSignals,
      byType: {
        rss: sources.filter(s => s.type === "rss").length,
        web: sources.filter(s => s.type === "web").length,
        social: sources.filter(s => s.type === "social").length,
        api: sources.filter(s => s.type === "api").length,
        newsletter: sources.filter(s => s.type === "newsletter").length,
      }
    };
  },
});

export const createSource = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const sourceId = await ctx.db.insert("sources", {
      name: args.name,
      type: args.type as any,
      url: args.url,
      description: args.description,
      status: "pending" as any,
      lastUpdated: new Date().toISOString(),
      signalCount: 0,
      categories: args.categories || [],
      keywords: args.keywords || [],
      isActive: args.isActive ?? true,
    });

    return sourceId;
  },
});

export const updateSource = mutation({
  args: {
    id: v.id("sources"),
    name: v.optional(v.string()),
    type: v.optional(v.string()),
    url: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    categories: v.optional(v.array(v.string())),
    keywords: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // Build update object with only defined values
    const updateData: Record<string, any> = {
      lastUpdated: new Date().toISOString(),
    };

    // Only add fields that are defined
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await ctx.db.patch(id, updateData);

    return { success: true };
  },
});

export const deleteSource = mutation({
  args: {
    id: v.id("sources"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const refreshSource = mutation({
  args: {
    id: v.id("sources"),
  },
  handler: async (ctx, args) => {
    // Update the source's last updated timestamp and set status to pending
    await ctx.db.patch(args.id, {
      status: "pending",
      lastUpdated: new Date().toISOString(),
    });

    // In a real implementation, this would trigger the actual data collection
    // For now, we just set it to pending. The status would be updated by a separate process
    return { success: true };
  },
});

export const refreshAllSources = mutation({
  args: {},
  handler: async (ctx) => {
    const sources = await ctx.db.query("sources")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Update all active sources to pending
    for (const source of sources) {
      await ctx.db.patch(source._id, {
        status: "pending",
        lastUpdated: new Date().toISOString(),
      });
    }

    return { refreshed: sources.length };
  },
});

export const getSource = query({
  args: {
    id: v.id("sources"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getSourcesDueForCollection = query({
  args: {
    intervalHours: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const intervalHours = args.intervalHours || 24;
    const cutoffTime = Date.now() - (intervalHours * 60 * 60 * 1000);

    let query = ctx.db.query("sources")
      .filter(q => q.eq(q.field("isActive"), true));

    const sources = await query.collect();

    // Filter sources that haven't been updated recently
    const dueForCollection = sources.filter(source => {
      const lastUpdated = new Date(source.lastUpdated).getTime();
      return lastUpdated < cutoffTime;
    });

    const limit = args.limit || 50;
    return dueForCollection.slice(0, limit);
  },
});

export const getSourcesByUser = query({
  args: {
    userId: v.string(),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("sources");

    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }

    const sources = await query.collect();

    // Filter by user if userId tracking was implemented
    // For now, return all sources as placeholder
    const limit = args.limit || 50;
    return sources.slice(0, limit);
  },
});

export const getSourceHealthStats = query({
  args: {
    timeframe: v.optional(v.string()), // "24h", "7d", "30d"
  },
  handler: async (ctx, args) => {
    const sources = await ctx.db.query("sources").collect();

    const now = Date.now();
    let cutoffTime = now - (24 * 60 * 60 * 1000); // Default 24h

    switch (args.timeframe) {
      case "7d":
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
    }

    const recentSources = sources.filter(source => {
      const lastUpdated = new Date(source.lastUpdated).getTime();
      return lastUpdated >= cutoffTime;
    });

    const healthyCount = recentSources.filter(s => s.status === "active").length;
    const errorCount = recentSources.filter(s => s.status === "error").length;
    const stalledCount = sources.filter(source => {
      const lastUpdated = new Date(source.lastUpdated).getTime();
      return lastUpdated < cutoffTime && source.isActive;
    }).length;

    return {
      total: sources.length,
      healthy: healthyCount,
      errors: errorCount,
      stalled: stalledCount,
      healthPercentage: sources.length > 0 ? Math.round((healthyCount / sources.length) * 100) : 0,
      avgSignalsPerSource: sources.length > 0
        ? Math.round(sources.reduce((sum, s) => sum + (s.signalCount || 0), 0) / sources.length)
        : 0,
    };
  },
});

export const toggleSource = mutation({
  args: {
    id: v.id("sources"),
  },
  handler: async (ctx, args) => {
    const source = await ctx.db.get(args.id);
    if (!source) {
      throw new Error("Source not found");
    }

    await ctx.db.patch(args.id, {
      isActive: !source.isActive,
      status: !source.isActive ? "pending" : "inactive",
      lastUpdated: new Date().toISOString(),
    });

    return { success: true, isActive: !source.isActive };
  },
});

export const updateSourceHealth = mutation({
  args: {
    id: v.id("sources"),
    healthScore: v.number(),
    errorCount: v.optional(v.number()),
    lastError: v.optional(v.string()),
    successfulCollections: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...healthData } = args;

    await ctx.db.patch(id, {
      ...healthData,
      lastHealthCheck: new Date().toISOString(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateSourceCoverage = mutation({
  args: {
    id: v.id("sources"),
    signalCount: v.number(),
    coverageScore: v.optional(v.number()),
    topicsCovered: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { id, ...coverageData } = args;

    await ctx.db.patch(id, {
      signalCount: coverageData.signalCount,
      coverageScore: coverageData.coverageScore,
      topicsCovered: coverageData.topicsCovered,
      lastCoverageUpdate: new Date().toISOString(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const updateRateLimitCounters = mutation({
  args: {
    id: v.id("sources"),
    requestsToday: v.number(),
    requestsThisHour: v.number(),
    tokensUsed: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...rateLimitData } = args;

    await ctx.db.patch(id, {
      ...rateLimitData,
      lastRateLimitUpdate: new Date().toISOString(),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const createUniversalSource = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    categories: v.array(v.string()),
    keywords: v.array(v.string()),
    collectionFrequency: v.optional(v.string()), // "hourly", "daily", "weekly"
    isGlobal: v.boolean(),
    priority: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const sourceId = await ctx.db.insert("sources", {
      name: args.name,
      type: args.type as any,
      url: args.url,
      description: args.description,
      categories: args.categories,
      keywords: args.keywords,
      collectionFrequency: args.collectionFrequency || "daily",
      isGlobal: args.isGlobal,
      priority: args.priority || 1,
      status: "pending" as any,
      isActive: true,
      signalCount: 0,
      healthScore: 1.0,
      coverageScore: 0,
      requestsToday: 0,
      requestsThisHour: 0,
      tokensUsed: 0,
      lastUpdated: new Date().toISOString(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return sourceId;
  },
});

export const updateUniversalSourceAnalysis = mutation({
  args: {
    id: v.id("sources"),
    analysisResult: v.object({
      qualityScore: v.number(),
      relevanceScore: v.number(),
      freshnessScore: v.number(),
      uniquenessScore: v.number(),
      recommendedFrequency: v.string(),
      topTopics: v.array(v.string()),
      sentimentTrend: v.number(),
    }),
  },
  handler: async (ctx, args) => {
    const { qualityScore, relevanceScore, freshnessScore, uniquenessScore } = args.analysisResult;

    // Calculate overall coverage score
    const overallScore = (qualityScore + relevanceScore + freshnessScore + uniquenessScore) / 4;

    await ctx.db.patch(args.id, {
      coverageScore: overallScore,
      qualityMetrics: args.analysisResult,
      collectionFrequency: args.analysisResult.recommendedFrequency,
      topicsCovered: args.analysisResult.topTopics,
      lastAnalysis: new Date().toISOString(),
      updatedAt: Date.now(),
    });

    return { success: true, overallScore };
  },
});