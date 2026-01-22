import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const checkAndUpdateRateLimit = mutation({
  args: {
    source: v.string(),
    endpoint: v.string(),
    requestsPerHour: v.number(),
    tokensPerDay: v.optional(v.number()),
    requestTokens: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const hourStart = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000);
    const dayStart = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);

    const trackingId = `${args.source}:${args.endpoint}`;

    // Get existing rate limit tracking
    const existing = await ctx.db.query("rate_limit_tracking")
      .filter(q => q.eq(q.field("trackingId"), trackingId))
      .first();

    if (!existing) {
      // Create new tracking record
      await ctx.db.insert("rate_limit_tracking", {
        trackingId,
        source: args.source,
        endpoint: args.endpoint,
        hourlyCount: 1,
        dailyCount: 1,
        dailyTokens: args.requestTokens || 0,
        hourStart,
        dayStart,
        lastRequest: now,
        requestsPerHour: args.requestsPerHour,
        tokensPerDay: args.tokensPerDay || 0,
        createdAt: now,
        updatedAt: now,
      });

      return {
        allowed: true,
        hourlyRemaining: args.requestsPerHour - 1,
        dailyTokensRemaining: (args.tokensPerDay || 0) - (args.requestTokens || 0),
        resetHour: hourStart + (60 * 60 * 1000),
        resetDay: dayStart + (24 * 60 * 60 * 1000),
      };
    }

    // Reset counters if time periods have passed
    let { hourlyCount, dailyCount, dailyTokens } = existing;

    if (existing.hourStart < hourStart) {
      hourlyCount = 0;
    }

    if (existing.dayStart < dayStart) {
      dailyCount = 0;
      dailyTokens = 0;
    }

    // Check limits
    const wouldExceedHourly = hourlyCount + 1 > args.requestsPerHour;
    const wouldExceedTokens = args.tokensPerDay &&
      (dailyTokens + (args.requestTokens || 0)) > args.tokensPerDay;

    if (wouldExceedHourly || wouldExceedTokens) {
      return {
        allowed: false,
        hourlyRemaining: args.requestsPerHour - hourlyCount,
        dailyTokensRemaining: (args.tokensPerDay || 0) - dailyTokens,
        resetHour: hourStart + (60 * 60 * 1000),
        resetDay: dayStart + (24 * 60 * 60 * 1000),
        reason: wouldExceedHourly ? "hourly_limit" : "token_limit",
      };
    }

    // Update counters
    await ctx.db.patch(existing._id, {
      hourlyCount: hourlyCount + 1,
      dailyCount: dailyCount + 1,
      dailyTokens: dailyTokens + (args.requestTokens || 0),
      hourStart: Math.max(existing.hourStart, hourStart),
      dayStart: Math.max(existing.dayStart, dayStart),
      lastRequest: now,
      updatedAt: now,
    });

    return {
      allowed: true,
      hourlyRemaining: args.requestsPerHour - hourlyCount - 1,
      dailyTokensRemaining: (args.tokensPerDay || 0) - dailyTokens - (args.requestTokens || 0),
      resetHour: hourStart + (60 * 60 * 1000),
      resetDay: dayStart + (24 * 60 * 60 * 1000),
    };
  },
});

export const createRateLimitTracking = mutation({
  args: {
    source: v.string(),
    endpoint: v.string(),
    requestsPerHour: v.number(),
    tokensPerDay: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const hourStart = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000);
    const dayStart = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);

    const trackingId = `${args.source}:${args.endpoint}`;

    const id = await ctx.db.insert("rate_limit_tracking", {
      trackingId,
      source: args.source,
      endpoint: args.endpoint,
      hourlyCount: 0,
      dailyCount: 0,
      dailyTokens: 0,
      hourStart,
      dayStart,
      lastRequest: null,
      requestsPerHour: args.requestsPerHour,
      tokensPerDay: args.tokensPerDay || 0,
      createdAt: now,
      updatedAt: now,
    });

    return id;
  },
});

export const recordTokenUsage = mutation({
  args: {
    source: v.string(),
    endpoint: v.string(),
    tokens: v.number(),
  },
  handler: async (ctx, args) => {
    const trackingId = `${args.source}:${args.endpoint}`;

    const existing = await ctx.db.query("rate_limit_tracking")
      .filter(q => q.eq(q.field("trackingId"), trackingId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        dailyTokens: existing.dailyTokens + args.tokens,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const resetDailyCount = mutation({
  args: {
    source: v.optional(v.string()),
    endpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const dayStart = Math.floor(now / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000);

    let query = ctx.db.query("rate_limit_tracking");

    if (args.source) {
      query = query.filter(q => q.eq(q.field("source"), args.source));
    }

    if (args.endpoint) {
      query = query.filter(q => q.eq(q.field("endpoint"), args.endpoint));
    }

    const trackingRecords = await query.collect();

    for (const record of trackingRecords) {
      await ctx.db.patch(record._id, {
        dailyCount: 0,
        dailyTokens: 0,
        dayStart,
        updatedAt: now,
      });
    }

    return { reset: trackingRecords.length };
  },
});

export const setupNewsSources = mutation({
  args: {},
  handler: async (ctx) => {
    const newsSources = [
      { source: "techcrunch", endpoint: "rss", requestsPerHour: 60, tokensPerDay: 50000 },
      { source: "hackernews", endpoint: "api", requestsPerHour: 100, tokensPerDay: 30000 },
      { source: "reddit", endpoint: "api", requestsPerHour: 60, tokensPerDay: 40000 },
      { source: "github", endpoint: "api", requestsPerHour: 5000, tokensPerDay: 100000 },
      { source: "arxiv", endpoint: "rss", requestsPerHour: 120, tokensPerDay: 75000 },
      { source: "mit_news", endpoint: "rss", requestsPerHour: 60, tokensPerDay: 25000 },
      { source: "wired", endpoint: "rss", requestsPerHour: 60, tokensPerDay: 35000 },
      { source: "verge", endpoint: "rss", requestsPerHour: 60, tokensPerDay: 35000 },
    ];

    const created = [];

    for (const source of newsSources) {
      const trackingId = `${source.source}:${source.endpoint}`;

      // Check if already exists
      const existing = await ctx.db.query("rate_limit_tracking")
        .filter(q => q.eq(q.field("trackingId"), trackingId))
        .first();

      if (!existing) {
        const id = await ctx.db.insert("rate_limit_tracking", {
          trackingId,
          source: source.source,
          endpoint: source.endpoint,
          hourlyCount: 0,
          dailyCount: 0,
          dailyTokens: 0,
          hourStart: Math.floor(Date.now() / (60 * 60 * 1000)) * (60 * 60 * 1000),
          dayStart: Math.floor(Date.now() / (24 * 60 * 60 * 1000)) * (24 * 60 * 60 * 1000),
          lastRequest: null,
          requestsPerHour: source.requestsPerHour,
          tokensPerDay: source.tokensPerDay,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        created.push(id);
      }
    }

    return { created: created.length };
  },
});

export const getRateLimitStatus = query({
  args: {
    source: v.optional(v.string()),
    endpoint: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("rate_limit_tracking");

    if (args.source) {
      query = query.filter(q => q.eq(q.field("source"), args.source));
    }

    if (args.endpoint) {
      query = query.filter(q => q.eq(q.field("endpoint"), args.endpoint));
    }

    const records = await query.collect();

    return records.map(record => ({
      ...record,
      hourlyRemaining: Math.max(0, record.requestsPerHour - record.hourlyCount),
      dailyTokensRemaining: Math.max(0, record.tokensPerDay - record.dailyTokens),
    }));
  },
});