import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Create a new content draft
export const create = mutation({
  args: {
    title: v.string(),
    contentType: v.union(
      v.literal("article"),
      v.literal("thread"),
      v.literal("post"),
      v.literal("newsletter"),
      v.literal("whitepaper"),
      v.literal("video_script"),
      v.literal("short_video_script")
    ),
    platform: v.optional(v.union(
      v.literal("linkedin"),
      v.literal("twitter"),
      v.literal("instagram"),
      v.literal("blog"),
      v.literal("medium"),
      v.literal("youtube"),
      v.literal("tiktok"),
      v.literal("youtube_shorts"),
      v.literal("ig_reels")
    )),
    stage: v.union(
      v.literal("overview"),
      v.literal("outline"),
      v.literal("content"),
      v.literal("published")
    ),
    overview: v.optional(v.object({
      hook: v.string(),
      angle: v.string(),
      description: v.string(),
      targetAudience: v.string(),
      keyMessages: v.array(v.string()),
      generatedAt: v.number(),
    })),
    outline: v.optional(v.object({
      sections: v.array(v.object({
        title: v.string(),
        keyPoints: v.array(v.string()),
        examples: v.optional(v.string()),
        estimatedLength: v.optional(v.number()),
        timestamp: v.optional(v.string()),
      })),
      structure: v.string(),
      generatedAt: v.number(),
    })),
    content: v.optional(v.object({
      fullText: v.string(),
      formattedText: v.optional(v.string()),
      wordCount: v.number(),
      characterCount: v.number(),
      estimatedReadTime: v.optional(v.number()),
      estimatedDuration: v.optional(v.number()),
      videoElements: v.optional(v.object({
        hooks: v.array(v.string()),
        bRoll: v.array(v.string()),
        captions: v.array(v.string()),
        transitions: v.array(v.string()),
      })),
      seo: v.optional(v.object({
        metaTitle: v.string(),
        metaDescription: v.string(),
        keywords: v.array(v.string()),
      })),
      generatedAt: v.number(),
    })),
    sourceSignalIds: v.array(v.id("signals")),
    sourceMentionIds: v.array(v.id("raw_mentions")),
    aiModel: v.string(),
    totalTokensUsed: v.number(),
    generationCost: v.number(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const draftId = await ctx.db.insert("content_drafts", {
      ...args,
      version: 1,
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return draftId;
  },
});

// Update an existing content draft
export const update = mutation({
  args: {
    id: v.id("content_drafts"),
    title: v.optional(v.string()),
    stage: v.optional(v.union(
      v.literal("overview"),
      v.literal("outline"),
      v.literal("content"),
      v.literal("published")
    )),
    overview: v.optional(v.object({
      hook: v.string(),
      angle: v.string(),
      description: v.string(),
      targetAudience: v.string(),
      keyMessages: v.array(v.string()),
      generatedAt: v.number(),
    })),
    outline: v.optional(v.object({
      sections: v.array(v.object({
        title: v.string(),
        keyPoints: v.array(v.string()),
        examples: v.optional(v.string()),
        estimatedLength: v.optional(v.number()),
        timestamp: v.optional(v.string()),
      })),
      structure: v.string(),
      generatedAt: v.number(),
    })),
    content: v.optional(v.object({
      fullText: v.string(),
      formattedText: v.optional(v.string()),
      wordCount: v.number(),
      characterCount: v.number(),
      estimatedReadTime: v.optional(v.number()),
      estimatedDuration: v.optional(v.number()),
      videoElements: v.optional(v.object({
        hooks: v.array(v.string()),
        bRoll: v.array(v.string()),
        captions: v.array(v.string()),
        transitions: v.array(v.string()),
      })),
      seo: v.optional(v.object({
        metaTitle: v.string(),
        metaDescription: v.string(),
        keywords: v.array(v.string()),
      })),
      generatedAt: v.number(),
    })),
    totalTokensUsed: v.optional(v.number()),
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("published"),
      v.literal("archived")
    )),
    publishedAt: v.optional(v.number()),
    publishedUrl: v.optional(v.string()),
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

// Delete a content draft
export const remove = mutation({
  args: { id: v.id("content_drafts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Get a single content draft by ID
export const get = query({
  args: { id: v.id("content_drafts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// List content drafts with optional filters
export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("draft"),
      v.literal("review"),
      v.literal("approved"),
      v.literal("published"),
      v.literal("archived")
    )),
    stage: v.optional(v.union(
      v.literal("overview"),
      v.literal("outline"),
      v.literal("content"),
      v.literal("published")
    )),
    platform: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("content_drafts");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else if (args.stage) {
      query = query.withIndex("by_stage", (q) => q.eq("stage", args.stage));
    } else if (args.platform) {
      query = query.withIndex("by_platform", (q) => q.eq("platform", args.platform));
    } else {
      query = query.withIndex("by_created");
    }

    const drafts = await query
      .order("desc")
      .take(args.limit || 50);

    return drafts;
  },
});
