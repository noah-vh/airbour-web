import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new subscriber
export const create = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    source: v.string(), // "landing", "import", "api"
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Check if subscriber already exists
    const existing = await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      // If unsubscribed, reactivate
      if (existing.status === "unsubscribed") {
        await ctx.db.patch(existing._id, {
          status: "active",
          source: args.source,
        });
        return existing._id;
      }
      // Already active
      return existing._id;
    }

    // Create new subscriber
    return await ctx.db.insert("subscribers", {
      email: args.email.toLowerCase(),
      name: args.name,
      status: "active",
      source: args.source,
      tags: args.tags || [],
      createdAt: Date.now(),
    });
  },
});

// List all subscribers with optional filters
export const list = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("subscribers");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status!));
    }

    const results = await query.collect();

    if (args.limit) {
      return results.slice(0, args.limit);
    }

    return results;
  },
});

// List active subscribers only
export const listActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("subscribers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();
  },
});

// Get subscriber by email
export const getByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subscribers")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();
  },
});

// Get subscriber by ID
export const get = query({
  args: {
    id: v.id("subscribers"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Unsubscribe
export const unsubscribe = mutation({
  args: {
    email: v.optional(v.string()),
    id: v.optional(v.id("subscribers")),
  },
  handler: async (ctx, args) => {
    let subscriber;

    if (args.id) {
      subscriber = await ctx.db.get(args.id);
    } else if (args.email) {
      subscriber = await ctx.db
        .query("subscribers")
        .withIndex("by_email", (q) => q.eq("email", args.email!.toLowerCase()))
        .first();
    }

    if (!subscriber) {
      return { success: false, message: "Subscriber not found" };
    }

    await ctx.db.patch(subscriber._id, {
      status: "unsubscribed",
    });

    return { success: true };
  },
});

// Mark as bounced
export const markBounced = mutation({
  args: {
    id: v.id("subscribers"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "bounced",
    });
    return { success: true };
  },
});

// Get active subscriber count
export const getActiveCount = query({
  args: {},
  handler: async (ctx) => {
    const subscribers = await ctx.db
      .query("subscribers")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .collect();

    return subscribers.length;
  },
});

// Get subscriber stats
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("subscribers").collect();

    const stats = {
      total: all.length,
      active: 0,
      unsubscribed: 0,
      bounced: 0,
      bySource: {} as Record<string, number>,
    };

    for (const sub of all) {
      switch (sub.status) {
        case "active":
          stats.active++;
          break;
        case "unsubscribed":
          stats.unsubscribed++;
          break;
        case "bounced":
          stats.bounced++;
          break;
      }

      const source = sub.source || "unknown";
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    }

    return stats;
  },
});

// Update subscriber tags
export const updateTags = mutation({
  args: {
    id: v.id("subscribers"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      tags: args.tags,
    });
    return { success: true };
  },
});

// Bulk import subscribers
export const bulkImport = mutation({
  args: {
    subscribers: v.array(
      v.object({
        email: v.string(),
        name: v.optional(v.string()),
        tags: v.optional(v.array(v.string())),
      })
    ),
    source: v.string(),
  },
  handler: async (ctx, args) => {
    let imported = 0;
    let skipped = 0;

    for (const sub of args.subscribers) {
      const existing = await ctx.db
        .query("subscribers")
        .withIndex("by_email", (q) => q.eq("email", sub.email.toLowerCase()))
        .first();

      if (existing) {
        skipped++;
        continue;
      }

      await ctx.db.insert("subscribers", {
        email: sub.email.toLowerCase(),
        name: sub.name,
        status: "active",
        source: args.source,
        tags: sub.tags || [],
        createdAt: Date.now(),
      });
      imported++;
    }

    return { imported, skipped };
  },
});
