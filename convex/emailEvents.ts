import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create an email event
export const create = mutation({
  args: {
    subscriberId: v.optional(v.id("subscribers")),
    newsletterId: v.id("newsletters"),
    eventType: v.string(), // "sent", "delivered", "opened", "clicked", "bounced", "failed"
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("email_events", {
      subscriberId: args.subscriberId,
      newsletterId: args.newsletterId,
      eventType: args.eventType,
      metadata: args.metadata,
      timestamp: Date.now(),
    });
  },
});

// Get all events for a newsletter
export const getByNewsletter = query({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("email_events")
      .withIndex("by_newsletter", (q) => q.eq("newsletterId", args.newsletterId))
      .collect();
  },
});

// Get events for a subscriber
export const getBySubscriber = query({
  args: {
    subscriberId: v.id("subscribers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("email_events")
      .withIndex("by_subscriber", (q) => q.eq("subscriberId", args.subscriberId))
      .collect();
  },
});

// Get events by type
export const getByType = query({
  args: {
    eventType: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("email_events")
      .withIndex("by_type", (q) => q.eq("eventType", args.eventType))
      .collect();

    if (args.limit) {
      return results.slice(0, args.limit);
    }
    return results;
  },
});

// Record open event (idempotent - only records first open per subscriber/newsletter combo)
export const recordOpen = mutation({
  args: {
    newsletterId: v.id("newsletters"),
    subscriberId: v.id("subscribers"),
  },
  handler: async (ctx, args) => {
    // Check if already opened
    const existing = await ctx.db
      .query("email_events")
      .withIndex("by_newsletter", (q) => q.eq("newsletterId", args.newsletterId))
      .filter((q) =>
        q.and(
          q.eq(q.field("subscriberId"), args.subscriberId),
          q.eq(q.field("eventType"), "opened")
        )
      )
      .first();

    if (existing) {
      // Update timestamp for repeat opens (for analytics)
      return existing._id;
    }

    return await ctx.db.insert("email_events", {
      subscriberId: args.subscriberId,
      newsletterId: args.newsletterId,
      eventType: "opened",
      timestamp: Date.now(),
    });
  },
});

// Record click event
export const recordClick = mutation({
  args: {
    newsletterId: v.id("newsletters"),
    subscriberId: v.id("subscribers"),
    url: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("email_events", {
      subscriberId: args.subscriberId,
      newsletterId: args.newsletterId,
      eventType: "clicked",
      metadata: { url: args.url },
      timestamp: Date.now(),
    });
  },
});

// Get aggregated stats for a newsletter
export const getNewsletterStats = query({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("email_events")
      .withIndex("by_newsletter", (q) => q.eq("newsletterId", args.newsletterId))
      .collect();

    const stats = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
    };

    const uniqueOpens = new Set<string>();
    const uniqueClicks = new Set<string>();

    for (const event of events) {
      switch (event.eventType) {
        case "sent":
          stats.sent++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "opened":
          stats.opened++;
          if (event.subscriberId) uniqueOpens.add(event.subscriberId);
          break;
        case "clicked":
          stats.clicked++;
          if (event.subscriberId) uniqueClicks.add(event.subscriberId);
          break;
        case "bounced":
          stats.bounced++;
          break;
        case "failed":
          stats.failed++;
          break;
      }
    }

    return {
      ...stats,
      uniqueOpens: uniqueOpens.size,
      uniqueClicks: uniqueClicks.size,
      openRate: stats.sent > 0 ? ((uniqueOpens.size / stats.sent) * 100).toFixed(1) : "0",
      clickRate: uniqueOpens.size > 0 ? ((uniqueClicks.size / uniqueOpens.size) * 100).toFixed(1) : "0",
    };
  },
});

// Get recent events (for dashboard)
export const getRecent = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    const events = await ctx.db.query("email_events").order("desc").take(limit);
    return events;
  },
});
