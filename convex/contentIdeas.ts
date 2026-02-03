import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new content idea
export const create = mutation({
  args: {
    format: v.string(),
    hook: v.string(),
    angle: v.string(),
    description: v.string(),
    sourceSignalIds: v.array(v.id("signals")),
    sourceMentionIds: v.array(v.id("raw_mentions")),
    relevanceScore: v.number(),
    generatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const ideaId = await ctx.db.insert("content_ideas", {
      ...args,
      status: "generated",
      createdAt: Date.now(),
    });

    return ideaId;
  },
});

// Update an existing content idea
export const update = mutation({
  args: {
    id: v.id("content_ideas"),
    status: v.optional(v.union(
      v.literal("generated"),
      v.literal("selected"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    )),
    draftId: v.optional(v.id("content_drafts")),
    selectedAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, updates);

    return id;
  },
});

// Delete a content idea
export const remove = mutation({
  args: { id: v.id("content_ideas") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get a single content idea by ID
export const get = query({
  args: { id: v.id("content_ideas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List content ideas with optional filters
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("generated"),
      v.literal("selected"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("content_ideas");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else {
      query = query.withIndex("by_created");
    }

    const ideas = await query
      .order("desc")
      .take(args.limit || 50);

    return ideas;
  },
});
