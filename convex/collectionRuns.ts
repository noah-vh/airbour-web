import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createCollectionRun = mutation({
  args: {
    sourceId: v.string(),
    sourceType: v.string(),
    config: v.optional(v.object({
      maxItems: v.optional(v.number()),
      sinceDate: v.optional(v.number()),
      filters: v.optional(v.object({})),
    })),
  },
  handler: async (ctx, args) => {
    const runId = `run_${Date.now()}`;
    const now = Date.now();

    // For now, return mock created collection run
    // In production, this would insert into collection_runs table
    return {
      _id: runId,
      sourceId: args.sourceId,
      sourceType: args.sourceType,
      config: args.config || {},
      status: "initiated",
      itemsCollected: 0,
      itemsProcessed: 0,
      errors: [],
      startedAt: now,
      createdAt: now,
      updatedAt: now,
      estimatedCompletion: now + 600000, // 10 minutes from now
    };
  },
});

export const updateCollectionRun = mutation({
  args: {
    runId: v.string(),
    status: v.optional(v.union(
      v.literal("initiated"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    )),
    itemsCollected: v.optional(v.number()),
    itemsProcessed: v.optional(v.number()),
    progress: v.optional(v.number()),
    errors: v.optional(v.array(v.string())),
    completedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // For now, return mock updated collection run
    // In production, this would update the collection_runs table
    return {
      _id: args.runId,
      status: args.status || "running",
      itemsCollected: args.itemsCollected || 0,
      itemsProcessed: args.itemsProcessed || 0,
      progress: args.progress || 0,
      errors: args.errors || [],
      completedAt: args.completedAt,
      updatedAt: now,
    };
  },
});

export const getCollectionRun = query({
  args: {
    runId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock collection run details
    // In production, this would query the collection_runs table
    return {
      _id: args.runId,
      sourceId: "source_123",
      sourceType: "reddit",
      status: "completed",
      itemsCollected: 150,
      itemsProcessed: 148,
      progress: 0.99,
      errors: ["Failed to process 2 items due to format issues"],
      config: {
        maxItems: 200,
        sinceDate: Date.now() - 86400000,
      },
      startedAt: Date.now() - 3600000, // 1 hour ago
      completedAt: Date.now() - 300000, // 5 minutes ago
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 300000,
      duration: 3300000, // 55 minutes
    };
  },
});

export const getLatestCollectionRun = query({
  args: {
    sourceId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock latest collection run for source
    // In production, this would query the most recent run for the sourceId
    return {
      _id: `run_latest_${args.sourceId}`,
      sourceId: args.sourceId,
      sourceType: "twitter",
      status: "running",
      itemsCollected: 45,
      itemsProcessed: 42,
      progress: 0.45,
      errors: [],
      startedAt: Date.now() - 1800000, // 30 minutes ago
      createdAt: Date.now() - 1800000,
      updatedAt: Date.now() - 60000, // 1 minute ago
      estimatedCompletion: Date.now() + 1200000, // 20 minutes from now
    };
  },
});

export const getRunningCollectionRuns = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // For now, return mock running collection runs
    // In production, this would query collection_runs where status is 'running' or 'initiated'
    return Array.from({ length: Math.min(limit, 3) }, (_, i) => ({
      _id: `run_active_${i + 1}`,
      sourceId: `source_${i + 1}`,
      sourceType: ["twitter", "reddit", "linkedin"][i % 3],
      status: i === 0 ? "running" : "initiated",
      itemsCollected: i === 0 ? 25 : 0,
      itemsProcessed: i === 0 ? 23 : 0,
      progress: i === 0 ? 0.25 : 0,
      errors: [],
      startedAt: Date.now() - (i + 1) * 600000, // Started at different times
      createdAt: Date.now() - (i + 1) * 600000,
      updatedAt: Date.now() - i * 60000,
      estimatedCompletion: Date.now() + (3 - i) * 600000,
    }));
  },
});

export const getCollectionRunHistory = query({
  args: {
    sourceId: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    // For now, return mock collection run history
    // In production, this would query collection_runs with filters and pagination
    return {
      runs: Array.from({ length: Math.min(limit, 5) }, (_, i) => {
        const runIndex = offset + i + 1;
        const isCompleted = Math.random() > 0.3;

        return {
          _id: `run_history_${runIndex}`,
          sourceId: args.sourceId || `source_${runIndex % 3 + 1}`,
          sourceType: ["twitter", "reddit", "linkedin"][runIndex % 3],
          status: isCompleted ? "completed" : (Math.random() > 0.5 ? "failed" : "cancelled"),
          itemsCollected: isCompleted ? Math.floor(Math.random() * 200) + 50 : Math.floor(Math.random() * 50),
          itemsProcessed: isCompleted ? Math.floor(Math.random() * 190) + 45 : Math.floor(Math.random() * 40),
          progress: isCompleted ? 1.0 : Math.random() * 0.8,
          errors: isCompleted ? [] : ["Mock error message"],
          startedAt: Date.now() - runIndex * 3600000, // 1 hour intervals
          completedAt: isCompleted ? Date.now() - runIndex * 3600000 + 1800000 : undefined,
          createdAt: Date.now() - runIndex * 3600000,
          updatedAt: Date.now() - runIndex * 3600000 + (isCompleted ? 1800000 : 900000),
          duration: isCompleted ? 1800000 : undefined, // 30 minutes if completed
        };
      }),
      total: 50, // Mock total count
      hasMore: offset + limit < 50,
    };
  },
});