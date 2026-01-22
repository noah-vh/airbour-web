import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getByHash = query({
  args: {
    hash: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock cached classification result
    // In production, this would query the classification_cache table by hash
    return {
      _id: `cache_${args.hash}`,
      hash: args.hash,
      result: {
        classification: "technological",
        confidence: 0.85,
        reasoning: "Mock classification result for hash " + args.hash,
      },
      hitCount: Math.floor(Math.random() * 10) + 1,
      createdAt: Date.now() - Math.random() * 86400000 * 7,
      lastAccessedAt: Date.now() - Math.random() * 3600000,
      expiresAt: Date.now() + 86400000 * 30, // 30 days from now
    };
  },
});

export const getByCacheKey = query({
  args: {
    cacheKey: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock cached classification result
    // In production, this would query the classification_cache table by cache key
    return {
      _id: `cache_key_${args.cacheKey}`,
      cacheKey: args.cacheKey,
      result: {
        classification: "social",
        confidence: 0.78,
        reasoning: "Mock classification result for cache key " + args.cacheKey,
      },
      hitCount: Math.floor(Math.random() * 15) + 1,
      createdAt: Date.now() - Math.random() * 86400000 * 14,
      lastAccessedAt: Date.now() - Math.random() * 7200000,
      expiresAt: Date.now() + 86400000 * 30,
    };
  },
});

export const store = mutation({
  args: {
    hash: v.optional(v.string()),
    cacheKey: v.optional(v.string()),
    result: v.object({
      classification: v.string(),
      confidence: v.number(),
      reasoning: v.string(),
    }),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const expiresAt = args.expiresAt || (now + 86400000 * 30); // 30 days default

    // For now, return mock stored cache entry
    // In production, this would insert into classification_cache table
    return {
      _id: `cache_${now}`,
      hash: args.hash,
      cacheKey: args.cacheKey,
      result: args.result,
      hitCount: 0,
      createdAt: now,
      lastAccessedAt: now,
      expiresAt,
    };
  },
});

export const incrementHitCount = mutation({
  args: {
    cacheId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // For now, return mock updated cache entry
    // In production, this would increment hitCount and update lastAccessedAt
    return {
      _id: args.cacheId,
      hitCount: Math.floor(Math.random() * 20) + 2, // Mock incremented count
      lastAccessedAt: now,
      updatedAt: now,
    };
  },
});

export const cleanupExpired = mutation({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100;
    const now = Date.now();

    // For now, return mock cleanup result
    // In production, this would delete expired cache entries
    const deletedCount = Math.floor(Math.random() * batchSize / 2);

    return {
      deletedCount,
      processedAt: now,
      nextCleanupAt: now + 86400000, // 24 hours from now
    };
  },
});