import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

/**
 * Check and update rate limit for a specific identifier
 */
export const checkAndUpdateRateLimit = mutation({
  args: {
    identifier: v.string(),
    limit: v.number(),
    windowMs: v.number(),
  },
  handler: async (ctx, args) => {
    const { identifier, limit, windowMs } = args;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing rate limit record
    const existing = await ctx.db
      .query("rate_limit_tracking")
      .filter((q) => q.eq(q.field("identifier"), identifier))
      .first();

    if (!existing) {
      // Create new rate limit record
      await ctx.db.insert("rate_limit_tracking", {
        identifier,
        count: 1,
        windowStart: now,
        lastRequest: now,
        isBlocked: false,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    // Check if we're in a new window
    if (existing.windowStart < windowStart) {
      // Reset the window
      await ctx.db.patch(existing._id, {
        count: 1,
        windowStart: now,
        lastRequest: now,
        isBlocked: false,
      });
      return {
        allowed: true,
        remaining: limit - 1,
        resetTime: now + windowMs,
      };
    }

    // Check if limit exceeded
    if (existing.count >= limit) {
      await ctx.db.patch(existing._id, {
        lastRequest: now,
        isBlocked: true,
      });
      return {
        allowed: false,
        remaining: 0,
        resetTime: existing.windowStart + windowMs,
      };
    }

    // Increment count
    await ctx.db.patch(existing._id, {
      count: existing.count + 1,
      lastRequest: now,
      isBlocked: false,
    });

    return {
      allowed: true,
      remaining: limit - (existing.count + 1),
      resetTime: existing.windowStart + windowMs,
    };
  },
});

/**
 * Create a new rate limit tracking record
 */
export const createRateLimitTracking = mutation({
  args: {
    identifier: v.string(),
    limit: v.number(),
    windowMs: v.number(),
    metadata: v.optional(v.object({
      userAgent: v.optional(v.string()),
      ipAddress: v.optional(v.string()),
      userId: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    const { identifier, limit, windowMs, metadata } = args;
    const now = Date.now();

    const trackingId = await ctx.db.insert("rate_limit_tracking", {
      identifier,
      count: 0,
      limit,
      windowStart: now,
      windowMs,
      lastRequest: now,
      isBlocked: false,
      metadata: metadata || {},
      createdAt: now,
      updatedAt: now,
    });

    return {
      _id: trackingId,
      identifier,
      count: 0,
      limit,
      windowStart: now,
      windowMs,
      lastRequest: now,
      isBlocked: false,
      resetTime: now + windowMs,
    };
  },
});

/**
 * Get or create rate limit tracking record
 */
export const getOrCreateRateLimitTracking = mutation({
  args: {
    identifier: v.string(),
    limit: v.optional(v.number()),
    windowMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { identifier, limit = 100, windowMs = 60000 } = args; // Default: 100 requests per minute

    // Try to get existing record
    const existing = await ctx.db
      .query("rate_limit_tracking")
      .filter((q) => q.eq(q.field("identifier"), identifier))
      .first();

    if (existing) {
      return {
        _id: existing._id,
        identifier: existing.identifier,
        count: existing.count,
        limit: existing.limit || limit,
        windowStart: existing.windowStart,
        windowMs: existing.windowMs || windowMs,
        lastRequest: existing.lastRequest,
        isBlocked: existing.isBlocked,
        resetTime: existing.windowStart + (existing.windowMs || windowMs),
      };
    }

    // Create new record
    const now = Date.now();
    const trackingId = await ctx.db.insert("rate_limit_tracking", {
      identifier,
      count: 0,
      limit,
      windowStart: now,
      windowMs,
      lastRequest: now,
      isBlocked: false,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });

    return {
      _id: trackingId,
      identifier,
      count: 0,
      limit,
      windowStart: now,
      windowMs,
      lastRequest: now,
      isBlocked: false,
      resetTime: now + windowMs,
    };
  },
});

/**
 * Record token usage for AI/API services
 */
export const recordTokenUsage = mutation({
  args: {
    identifier: v.string(),
    tokensUsed: v.number(),
    service: v.optional(v.string()),
    model: v.optional(v.string()),
    operation: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identifier, tokensUsed, service, model, operation } = args;
    const now = Date.now();

    // Get or create token tracking record
    let existing = await ctx.db
      .query("rate_limit_tracking")
      .filter((q) => q.eq(q.field("identifier"), identifier))
      .filter((q) => q.eq(q.field("type"), "token_usage"))
      .first();

    if (!existing) {
      // Create new token usage record
      const trackingId = await ctx.db.insert("rate_limit_tracking", {
        identifier,
        type: "token_usage",
        count: tokensUsed,
        dailyCount: tokensUsed,
        totalCount: tokensUsed,
        windowStart: now,
        lastRequest: now,
        isBlocked: false,
        metadata: {
          service,
          model,
          lastOperation: operation,
        },
        createdAt: now,
        updatedAt: now,
      });

      return {
        _id: trackingId,
        tokensUsed,
        dailyTotal: tokensUsed,
        totalUsage: tokensUsed,
        service,
        model,
        operation,
      };
    }

    // Check if it's a new day (reset daily count)
    const lastRequestDate = new Date(existing.lastRequest || now);
    const currentDate = new Date(now);
    const isDifferentDay = lastRequestDate.getDate() !== currentDate.getDate() ||
                          lastRequestDate.getMonth() !== currentDate.getMonth() ||
                          lastRequestDate.getFullYear() !== currentDate.getFullYear();

    const newDailyCount = isDifferentDay ? tokensUsed : (existing.dailyCount || 0) + tokensUsed;
    const newTotalCount = (existing.totalCount || 0) + tokensUsed;

    // Update the record
    await ctx.db.patch(existing._id, {
      count: tokensUsed,
      dailyCount: newDailyCount,
      totalCount: newTotalCount,
      lastRequest: now,
      updatedAt: now,
      metadata: {
        ...(existing.metadata || {}),
        service,
        model,
        lastOperation: operation,
      },
    });

    return {
      _id: existing._id,
      tokensUsed,
      dailyTotal: newDailyCount,
      totalUsage: newTotalCount,
      service,
      model,
      operation,
    };
  },
});

/**
 * Reset daily count for rate limiting
 */
export const resetDailyCount = mutation({
  args: {
    identifier: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identifier, type } = args;
    const now = Date.now();

    // Build query
    let query = ctx.db.query("rate_limit_tracking");

    if (identifier) {
      query = query.filter((q) => q.eq(q.field("identifier"), identifier));
    }

    if (type) {
      query = query.filter((q) => q.eq(q.field("type"), type));
    }

    const records = await query.collect();

    // Reset daily counts for all matching records
    const updates = records.map(record =>
      ctx.db.patch(record._id, {
        dailyCount: 0,
        windowStart: now,
        isBlocked: false,
        updatedAt: now,
      })
    );

    await Promise.all(updates);

    return {
      resetCount: records.length,
      timestamp: now,
      identifier,
      type,
    };
  },
});

/**
 * Query rate limit status
 */
export const getRateLimitStatus = query({
  args: {
    identifier: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { identifier, type } = args;

    let query = ctx.db
      .query("rate_limit_tracking")
      .filter((q) => q.eq(q.field("identifier"), identifier));

    if (type) {
      query = query.filter((q) => q.eq(q.field("type"), type));
    }

    const record = await query.first();

    if (!record) {
      return {
        exists: false,
        identifier,
        type,
      };
    }

    const now = Date.now();
    const resetTime = record.windowStart + (record.windowMs || 60000);

    return {
      exists: true,
      _id: record._id,
      identifier: record.identifier,
      type: record.type,
      count: record.count,
      dailyCount: record.dailyCount,
      totalCount: record.totalCount,
      limit: record.limit,
      isBlocked: record.isBlocked,
      resetTime,
      lastRequest: record.lastRequest,
      metadata: record.metadata,
    };
  },
});

/**
 * Clean up old rate limit records
 */
export const cleanupOldRecords = mutation({
  args: {
    olderThanMs: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { olderThanMs = 7 * 24 * 60 * 60 * 1000, dryRun = false } = args; // Default: 7 days
    const cutoffTime = Date.now() - olderThanMs;

    // Find old records
    const oldRecords = await ctx.db
      .query("rate_limit_tracking")
      .filter((q) => q.lt(q.field("lastRequest"), cutoffTime))
      .collect();

    if (dryRun) {
      return {
        recordsToDelete: oldRecords.length,
        cutoffTime,
        dryRun: true,
      };
    }

    // Delete old records
    const deletions = oldRecords.map(record => ctx.db.delete(record._id));
    await Promise.all(deletions);

    return {
      deletedCount: oldRecords.length,
      cutoffTime,
      dryRun: false,
    };
  },
});