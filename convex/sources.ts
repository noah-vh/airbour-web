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