import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listSignals = query({
  args: {
    lifecycle: v.optional(v.array(v.string())),
    steep: v.optional(v.array(v.string())),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("signals");
    let signals = await query.collect();

    // Get all signal updates
    const allUpdates = await ctx.db.query("signal_updates").collect();

    // Create a map of latest updates for each signal
    const signalUpdatesMap = new Map();
    allUpdates.forEach(update => {
      const existing = signalUpdatesMap.get(update.signalId);
      if (!existing || update.createdAt > existing.createdAt) {
        signalUpdatesMap.set(update.signalId, update);
      }
    });

    // Map frontend lifecycle values to database behaviorLayer values
    // Frontend: "weak", "emerging", "growing", "mainstream", "declining"
    // Database: "positive", "negative", "neutral"
    const lifecycleMap: Record<string, string> = {
      "weak": "neutral",
      "emerging": "positive",
      "growing": "positive",
      "mainstream": "neutral",
      "declining": "negative",
    };

    // Reverse map for output (database -> frontend)
    const lifecycleReverseMap: Record<string, string> = {
      "positive": "emerging",
      "negative": "declining",
      "neutral": "weak",
    };

    // Apply lifecycle filter
    if (args.lifecycle && args.lifecycle.length > 0) {
      const dbLifecycles = args.lifecycle.map(lc => lifecycleMap[lc] || lc);
      signals = signals.filter(signal =>
        dbLifecycles.includes(signal.behaviorLayer)
      );
    }

    // Apply steep/category filter
    if (args.steep && args.steep.length > 0) {
      signals = signals.filter(signal =>
        args.steep?.some(category => signal.classificationReasoningConcise?.toLowerCase().includes(category.toLowerCase()))
      );
    }

    // Apply search filter
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      signals = signals.filter(signal => {
        const update = signalUpdatesMap.get(signal._id);
        return signal.description?.toLowerCase().includes(searchLower) ||
               signal.classificationReasoningConcise?.toLowerCase().includes(searchLower) ||
               update?.newValue?.toLowerCase().includes(searchLower);
      });
    }

    // Apply status filter (map to behaviorLayer)
    if (args.status) {
      const dbStatus = lifecycleMap[args.status] || args.status;
      signals = signals.filter(signal => signal.behaviorLayer === dbStatus);
    }

    // Apply limit
    if (args.limit) {
      signals = signals.slice(0, args.limit);
    }

    // Map database fields to frontend expected structure
    return signals.map(signal => {
      const update = signalUpdatesMap.get(signal._id);

      // Extract keywords from signal data
      const keywords = signal.keywords || signal.tags || [];

      // Map behaviorLayer to lifecycle stage
      const lifecycleReverseMap: Record<string, string> = {
        "positive": "emerging",
        "negative": "declining",
        "neutral": "weak",
      };

      return {
        _id: signal._id,
        name: update?.newValue || signal.description || "Untitled Signal",
        description: signal.classificationReasoningConcise || "",
        lifecycle: lifecycleReverseMap[signal.behaviorLayer] || signal.lifecycle || "emerging",
        steep: [signal.classifiedBy || "technological"],
        steepDriver: signal.classifiedBy || "technological",
        confidence: signal.confidence || 0.5,
        keywords: Array.isArray(keywords) ? keywords.slice(0, 5) : [],
        mentionCount: signal.mentionCount || Math.floor(Math.random() * 100) + 1,
        sourceCount: signal.sourceCount || 1,
        sentiment: signal.sentiment || 0.5,
        growth: signal.growth || (Math.random() - 0.5) * 0.2,
        createdAt: signal.createdAt || Date.now(),
        updatedAt: update?.createdAt || signal.createdAt || Date.now(),
        hasUpdate: !!update,
      };
    });
  },
});

export const getSignalStats = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("signals").collect();

    const total = signals.length;

    // Count by behaviorLayer (lifecycle)
    const byLifecycle = {
      emerging: signals.filter(s => s.behaviorLayer === "positive").length,
      growing: signals.filter(s => s.behaviorLayer === "neutral").length,
      mainstream: signals.filter(s => s.behaviorLayer === "negative").length,
      declining: 0,
    };

    // Count by classifiedBy (categories)
    const classificationCounts = signals.reduce((acc, signal) => {
      const classification = signal.classifiedBy || "unknown";
      acc[classification] = (acc[classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      byLifecycle,
      bySteep: {
        technological: classificationCounts["gemini-2.5-flash"] || 0,
        social: classificationCounts["social"] || 0,
        economic: classificationCounts["economic"] || 0,
        environmental: classificationCounts["environmental"] || 0,
        political: classificationCounts["political"] || 0,
      },
    };
  },
});

export const createSignal = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    lifecycle: v.string(),
    steep: v.array(v.string()),
    confidence: v.number(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would create a new signal in the database
    return {
      _id: `signal_${Date.now()}`,
      ...args,
      mentionCount: 0,
      sourceCount: 0,
      sentiment: 0,
      growth: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "active",
    };
  },
});

export const updateSignal = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.string(),
    lifecycle: v.string(),
    steep: v.array(v.string()),
    confidence: v.number(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would update the signal in the database
    return {
      _id: args.id,
      ...args,
      updatedAt: Date.now(),
    };
  },
});

export const deleteSignal = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would delete the signal from the database
    return { deleted: true };
  },
});

export const deleteSignals = mutation({
  args: {
    ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would delete multiple signals from the database
    return { deleted: args.ids.length };
  },
});

export const getSignal = query({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    const signal = await ctx.db.get(args.id);
    if (!signal) {
      return null;
    }

    return {
      _id: signal._id,
      name: signal.description || "Untitled Signal",
      description: signal.classificationReasoningConcise || "",
      lifecycle: signal.behaviorLayer || "unknown",
      steep: [signal.classifiedBy || "technological"],
      confidence: signal.confidence || 0.5,
      keywords: signal.keywords || [],
      mentionCount: signal.mentionCount || 0,
      sourceCount: signal.sourceCount || 1,
      sentiment: signal.sentiment || 0.5,
      growth: signal.growth || 0,
      createdAt: signal.createdAt || Date.now(),
      updatedAt: signal.updatedAt || signal.createdAt || Date.now(),
      status: signal.status || "active",
      views: signal.views || 0,
    };
  },
});

export const searchSignals = query({
  args: {
    query: v.string(),
    filters: v.optional(v.object({
      lifecycle: v.optional(v.array(v.string())),
      steep: v.optional(v.array(v.string())),
      dateRange: v.optional(v.object({
        start: v.number(),
        end: v.number(),
      })),
    })),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let signals = await ctx.db.query("signals").collect();

    // Apply text search
    const searchLower = args.query.toLowerCase();
    signals = signals.filter(signal =>
      signal.description?.toLowerCase().includes(searchLower) ||
      signal.classificationReasoningConcise?.toLowerCase().includes(searchLower) ||
      signal.keywords?.some((keyword: string) => keyword.toLowerCase().includes(searchLower))
    );

    // Apply filters
    if (args.filters?.lifecycle) {
      signals = signals.filter(signal =>
        args.filters?.lifecycle?.includes(signal.behaviorLayer)
      );
    }

    if (args.filters?.steep) {
      signals = signals.filter(signal =>
        args.filters?.steep?.includes(signal.classifiedBy)
      );
    }

    if (args.filters?.dateRange) {
      signals = signals.filter(signal =>
        signal.createdAt >= (args.filters?.dateRange?.start || 0) &&
        signal.createdAt <= (args.filters?.dateRange?.end || Date.now())
      );
    }

    // Apply pagination
    const offset = args.offset || 0;
    const limit = args.limit || 50;
    signals = signals.slice(offset, offset + limit);

    return {
      signals: signals.map(signal => ({
        _id: signal._id,
        name: signal.description || "Untitled Signal",
        description: signal.classificationReasoningConcise || "",
        lifecycle: signal.behaviorLayer || "unknown",
        steep: [signal.classifiedBy || "technological"],
        confidence: signal.confidence || 0.5,
        keywords: signal.keywords || [],
        mentionCount: signal.mentionCount || 0,
        sourceCount: signal.sourceCount || 1,
        sentiment: signal.sentiment || 0.5,
        growth: signal.growth || 0,
        createdAt: signal.createdAt || Date.now(),
        updatedAt: signal.updatedAt || signal.createdAt || Date.now(),
      })),
      total: signals.length,
    };
  },
});

export const listSignalsForNewsletter = query({
  args: {
    limit: v.optional(v.number()),
    minConfidence: v.optional(v.number()),
    lifecycle: v.optional(v.array(v.string())),
    steep: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let signals = await ctx.db.query("signals").collect();

    // Filter by confidence
    if (args.minConfidence !== undefined) {
      const minConf = args.minConfidence;
      signals = signals.filter(signal =>
        (signal.confidence || 0) >= minConf
      );
    }

    // Filter by lifecycle
    if (args.lifecycle) {
      signals = signals.filter(signal =>
        args.lifecycle?.includes(signal.behaviorLayer)
      );
    }

    // Filter by steep
    if (args.steep) {
      signals = signals.filter(signal =>
        args.steep?.includes(signal.classifiedBy)
      );
    }

    // Sort by relevance (confidence + mention count)
    signals.sort((a, b) => {
      const scoreA = (a.confidence || 0) * 0.7 + (a.mentionCount || 0) * 0.3;
      const scoreB = (b.confidence || 0) * 0.7 + (b.mentionCount || 0) * 0.3;
      return scoreB - scoreA;
    });

    const limit = args.limit || 10;
    return signals.slice(0, limit).map(signal => ({
      _id: signal._id,
      name: signal.description || "Untitled Signal",
      description: signal.classificationReasoningConcise || "",
      lifecycle: signal.behaviorLayer || "unknown",
      steep: [signal.classifiedBy || "technological"],
      confidence: signal.confidence || 0.5,
      mentionCount: signal.mentionCount || 0,
      createdAt: signal.createdAt || Date.now(),
    }));
  },
});

export const getSavedSignals = query({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For now, return empty array since we don't have saved signals implementation
    // In a real implementation, this would query a user_saved_signals table
    return [];
  },
});

export const getTrendingSignals = query({
  args: {
    timeframe: v.optional(v.string()), // "1d", "7d", "30d"
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const signals = await ctx.db.query("signals").collect();

    // Sort by growth and mention count
    const trending = signals.sort((a, b) => {
      const scoreA = (a.growth || 0) * 0.6 + (a.mentionCount || 0) * 0.4;
      const scoreB = (b.growth || 0) * 0.6 + (b.mentionCount || 0) * 0.4;
      return scoreB - scoreA;
    });

    const limit = args.limit || 10;
    return trending.slice(0, limit).map(signal => ({
      _id: signal._id,
      name: signal.description || "Untitled Signal",
      description: signal.classificationReasoningConcise || "",
      lifecycle: signal.behaviorLayer || "unknown",
      mentionCount: signal.mentionCount || 0,
      growth: signal.growth || 0,
      confidence: signal.confidence || 0.5,
      createdAt: signal.createdAt || Date.now(),
    }));
  },
});

export const getSignalsByLifecycle = query({
  args: {
    lifecycle: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const query = ctx.db.query("signals")
      .withIndex("by_lifecycle", q => q.eq("lifecycle", args.lifecycle));

    const signals = await query.collect();
    const limit = args.limit || 50;

    return signals.slice(0, limit).map(signal => ({
      _id: signal._id,
      name: signal.description || "Untitled Signal",
      description: signal.classificationReasoningConcise || "",
      lifecycle: signal.behaviorLayer || "unknown",
      confidence: signal.confidence || 0.5,
      createdAt: signal.createdAt || Date.now(),
    }));
  },
});

export const getSignalsBySteep = query({
  args: {
    steep: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const signals = await ctx.db.query("signals").collect();

    const filteredSignals = signals.filter(signal => signal.classifiedBy === args.steep);
    const limit = args.limit || 50;

    return filteredSignals.slice(0, limit).map(signal => ({
      _id: signal._id,
      name: signal.description || "Untitled Signal",
      description: signal.classificationReasoningConcise || "",
      steep: [signal.classifiedBy || "technological"],
      confidence: signal.confidence || 0.5,
      createdAt: signal.createdAt || Date.now(),
    }));
  },
});

export const getRelatedSignals = query({
  args: {
    signalId: v.id("signals"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const signal = await ctx.db.get(args.signalId);
    if (!signal) {
      return [];
    }

    let signals = await ctx.db.query("signals").collect();

    // Filter out the current signal
    signals = signals.filter(s => s._id !== args.signalId);

    // Find related signals based on classification or keywords
    const related = signals.filter(s =>
      s.classifiedBy === signal.classifiedBy ||
      s.behaviorLayer === signal.behaviorLayer ||
      (signal.keywords && s.keywords?.some((keyword: string) =>
        signal.keywords.includes(keyword)
      ))
    );

    const limit = args.limit || 5;
    return related.slice(0, limit).map(signal => ({
      _id: signal._id,
      name: signal.description || "Untitled Signal",
      description: signal.classificationReasoningConcise || "",
      lifecycle: signal.behaviorLayer || "unknown",
      confidence: signal.confidence || 0.5,
    }));
  },
});

export const updateSignalDescription = mutation({
  args: {
    id: v.id("signals"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      classificationReasoningConcise: args.description,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const archiveSignal = mutation({
  args: {
    id: v.id("signals"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "archived",
      archivedAt: Date.now(),
      archiveReason: args.reason,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const restoreSignal = mutation({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "active",
      archivedAt: null,
      archiveReason: null,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const mergeSignals = mutation({
  args: {
    primaryId: v.id("signals"),
    secondaryIds: v.array(v.id("signals")),
    newDescription: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const primary = await ctx.db.get(args.primaryId);
    if (!primary) {
      throw new Error("Primary signal not found");
    }

    // Update primary signal
    if (args.newDescription) {
      await ctx.db.patch(args.primaryId, {
        classificationReasoningConcise: args.newDescription,
        updatedAt: Date.now(),
      });
    }

    // Mark secondary signals as merged
    for (const secondaryId of args.secondaryIds) {
      await ctx.db.patch(secondaryId, {
        status: "merged",
        mergedInto: args.primaryId,
        mergedAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const toggleSaveSignal = mutation({
  args: {
    signalId: v.id("signals"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, just return success
    // In a real implementation, this would manage a user_saved_signals table
    return { success: true, saved: true };
  },
});

export const incrementViewCount = mutation({
  args: {
    id: v.id("signals"),
  },
  handler: async (ctx, args) => {
    const signal = await ctx.db.get(args.id);
    if (signal) {
      await ctx.db.patch(args.id, {
        views: (signal.views || 0) + 1,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const updateSignalMetrics = mutation({
  args: {
    id: v.id("signals"),
    mentionCount: v.optional(v.number()),
    sourceCount: v.optional(v.number()),
    sentiment: v.optional(v.number()),
    growth: v.optional(v.number()),
    confidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...metrics } = args;

    const updateData: Record<string, any> = {
      updatedAt: Date.now(),
    };

    // Only update provided metrics
    Object.entries(metrics).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[key] = value;
      }
    });

    await ctx.db.patch(id, updateData);
    return { success: true };
  },
});

export const recalculateAllSignalMetrics = mutation({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("signals").collect();

    for (const signal of signals) {
      // Recalculate metrics based on current data
      const updatedMetrics = {
        mentionCount: Math.floor(Math.random() * 100) + 1, // Placeholder logic
        growth: (Math.random() - 0.5) * 0.2,
        sentiment: Math.random(),
        updatedAt: Date.now(),
      };

      await ctx.db.patch(signal._id, updatedMetrics);
    }

    return { recalculated: signals.length };
  },
});

export const listSignalUpdates = query({
  args: {
    signalId: v.optional(v.id("signals")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.signalId) {
      const query = ctx.db.query("signal_updates")
        .withIndex("by_signal", (q) => q.eq("signalId", args.signalId!))
        .order("desc");

      if (args.limit) {
        return await query.take(args.limit);
      }
      return await query.collect();
    } else {
      const query = ctx.db.query("signal_updates")
        .order("desc");

      if (args.limit) {
        return await query.take(args.limit);
      }
      return await query.collect();
    }
  },
});

export const listSignalsWithUpdates = query({
  args: {
    lifecycle: v.optional(v.array(v.string())),
    steep: v.optional(v.array(v.string())),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("signals");
    let signals = await query.collect();

    // Get all signal updates
    const allUpdates = await ctx.db.query("signal_updates").collect();

    // Create a map of latest updates for each signal
    const signalUpdatesMap = new Map();
    allUpdates.forEach(update => {
      const existing = signalUpdatesMap.get(update.signalId);
      if (!existing || update.createdAt > existing.createdAt) {
        signalUpdatesMap.set(update.signalId, update);
      }
    });

    // Apply filters (same as original listSignals)
    if (args.lifecycle && args.lifecycle.length > 0) {
      signals = signals.filter(signal =>
        args.lifecycle?.includes(signal.behaviorLayer)
      );
    }

    if (args.steep && args.steep.length > 0) {
      signals = signals.filter(signal =>
        args.steep?.some(category => signal.classificationReasoningConcise?.toLowerCase().includes(category.toLowerCase()))
      );
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      signals = signals.filter(signal => {
        const update = signalUpdatesMap.get(signal._id);
        return signal.description?.toLowerCase().includes(searchLower) ||
               signal.classificationReasoningConcise?.toLowerCase().includes(searchLower) ||
               update?.title?.toLowerCase().includes(searchLower) ||
               update?.description?.toLowerCase().includes(searchLower);
      });
    }

    if (args.status) {
      signals = signals.filter(signal => signal.behaviorLayer === args.status);
    }

    if (args.limit) {
      signals = signals.slice(0, args.limit);
    }

    // Map with signal updates
    return signals.map(signal => {
      const update = signalUpdatesMap.get(signal._id);
      return {
        _id: signal._id,
        name: update?.title || signal.description || "Untitled Signal",
        description: update?.description || signal.classificationReasoningConcise || "",
        lifecycle: signal.behaviorLayer || "unknown",
        steep: [signal.classifiedBy || "technological"],
        confidence: signal.confidence || 0.5,
        keywords: [],
        mentionCount: Math.floor(Math.random() * 100) + 1,
        sourceCount: 1,
        sentiment: 0.5,
        growth: (Math.random() - 0.5) * 0.2,
        createdAt: signal.createdAt || Date.now(),
        updatedAt: update?.createdAt || signal.createdAt || Date.now(),
        hasUpdate: !!update,
      };
    });
  },
});