import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new platform format
export const create = mutation({
  args: {
    platform: v.string(),
    constraints: v.object({
      maxCharacters: v.optional(v.number()),
      maxDuration: v.optional(v.number()),
      maxLines: v.optional(v.number()),
      maxHashtags: v.optional(v.number()),
      supportsMarkdown: v.boolean(),
      supportsHtml: v.boolean(),
      supportsVideo: v.boolean(),
      aspectRatio: v.optional(v.string()),
    }),
    styleGuidelines: v.object({
      tone: v.string(),
      formality: v.string(),
      emojiUsage: v.string(),
      hashtagStrategy: v.string(),
      callToActionStyle: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    const formatId = await ctx.db.insert("platform_formats", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return formatId;
  },
});

// Update an existing platform format
export const update = mutation({
  args: {
    id: v.id("platform_formats"),
    constraints: v.optional(v.object({
      maxCharacters: v.optional(v.number()),
      maxDuration: v.optional(v.number()),
      maxLines: v.optional(v.number()),
      maxHashtags: v.optional(v.number()),
      supportsMarkdown: v.boolean(),
      supportsHtml: v.boolean(),
      supportsVideo: v.boolean(),
      aspectRatio: v.optional(v.string()),
    })),
    styleGuidelines: v.optional(v.object({
      tone: v.string(),
      formality: v.string(),
      emojiUsage: v.string(),
      hashtagStrategy: v.string(),
      callToActionStyle: v.string(),
    })),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

// Delete a platform format
export const remove = mutation({
  args: { id: v.id("platform_formats") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get a single platform format by ID
export const get = query({
  args: { id: v.id("platform_formats") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get platform format by platform name
export const getByPlatform = query({
  args: { platform: v.string() },
  handler: async (ctx, args) => {
    const format = await ctx.db
      .query("platform_formats")
      .withIndex("by_platform", (q) => q.eq("platform", args.platform))
      .first();

    return format;
  },
});

// List all platform formats
export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("platform_formats");

    const formats = await query.collect();

    if (args.activeOnly) {
      return formats.filter((f) => f.isActive);
    }

    return formats;
  },
});
