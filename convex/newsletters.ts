/**
 * Convex API functions for Newsletter Management
 */

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const listNewsletters = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50

    const newsletters = await ctx.db
      .query("newsletters")
      .take(limit * 2) // Get more to allow for filtering

    let filteredNewsletters = newsletters

    // Filter by status if provided
    if (args.status) {
      filteredNewsletters = filteredNewsletters.filter(n => n.status === args.status)
    }

    // Filter by search term if provided
    if (args.search) {
      const searchLower = args.search.toLowerCase()
      filteredNewsletters = filteredNewsletters.filter(n =>
        (n.title && n.title.toLowerCase().includes(searchLower)) ||
        (n.subject && n.subject.toLowerCase().includes(searchLower))
      )
    }

    return filteredNewsletters
      .slice(0, limit)
      .map(newsletter => ({
        _id: newsletter._id,
        title: newsletter.title,
        subject: newsletter.subject,
        status: newsletter.status || 'draft',
        createdAt: newsletter.createdAt,
        updatedAt: newsletter.updatedAt,
        scheduledAt: newsletter.scheduledAt,
        publishedAt: newsletter.publishedAt,
        authorId: newsletter.authorId,
        recipientCount: newsletter.recipientCount || 0,
        openRate: newsletter.openRate || 0,
        clickRate: newsletter.clickRate || 0,
      }))
  },
})

export const getNewsletter = query({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    const newsletter = await ctx.db.get(args.id)
    if (!newsletter) {
      throw new Error("Newsletter not found")
    }
    return newsletter
  },
})

export const createNewsletter = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    content: v.optional(v.string()),
    template: v.optional(v.string()),
    authorId: v.string(),
    recipientGroups: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const newsletterData = {
      title: args.title,
      subject: args.subject,
      content: args.content || '',
      template: args.template || 'default',
      authorId: args.authorId,
      status: 'draft' as const,
      recipientGroups: args.recipientGroups || [],
      tags: args.tags || [],
      createdAt: now,
      updatedAt: now,
      recipientCount: 0,
      openRate: 0,
      clickRate: 0,
    }

    return await ctx.db.insert("newsletters", newsletterData)
  },
})

export const updateNewsletter = mutation({
  args: {
    id: v.id("newsletters"),
    title: v.optional(v.string()),
    subject: v.optional(v.string()),
    content: v.optional(v.string()),
    template: v.optional(v.string()),
    recipientGroups: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updateData } = args
    const now = Date.now()

    const updatePayload = {
      ...updateData,
      updatedAt: now,
    }

    // Remove undefined values
    Object.keys(updatePayload).forEach(key => {
      if (updatePayload[key as keyof typeof updatePayload] === undefined) {
        delete updatePayload[key as keyof typeof updatePayload]
      }
    })

    await ctx.db.patch(id, updatePayload)
    return await ctx.db.get(id)
  },
})

export const deleteNewsletter = mutation({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    const newsletter = await ctx.db.get(args.id)
    if (!newsletter) {
      throw new Error("Newsletter not found")
    }

    // Only allow deletion of drafts and unpublished newsletters
    if (newsletter.status === 'published') {
      throw new Error("Cannot delete published newsletters")
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})

export const scheduleNewsletter = mutation({
  args: {
    id: v.id("newsletters"),
    scheduledAt: v.number(),
    recipientGroups: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const newsletter = await ctx.db.get(args.id)
    if (!newsletter) {
      throw new Error("Newsletter not found")
    }

    if (newsletter.status !== 'draft') {
      throw new Error("Only draft newsletters can be scheduled")
    }

    const now = Date.now()
    if (args.scheduledAt <= now) {
      throw new Error("Scheduled time must be in the future")
    }

    const updateData: any = {
      status: 'scheduled',
      scheduledAt: args.scheduledAt,
      updatedAt: now,
    }

    if (args.recipientGroups) {
      updateData.recipientGroups = args.recipientGroups
      // Mock recipient count calculation
      updateData.recipientCount = args.recipientGroups.length * 100
    }

    await ctx.db.patch(args.id, updateData)
    return await ctx.db.get(args.id)
  },
})

export const unscheduleNewsletter = mutation({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    const newsletter = await ctx.db.get(args.id)
    if (!newsletter) {
      throw new Error("Newsletter not found")
    }

    if (newsletter.status !== 'scheduled') {
      throw new Error("Only scheduled newsletters can be unscheduled")
    }

    await ctx.db.patch(args.id, {
      status: 'draft',
      scheduledAt: undefined,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.id)
  },
})

export const listScheduledNewsletters = query({
  args: {
    limit: v.optional(v.number()),
    upcoming: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    const now = Date.now()

    const newsletters = await ctx.db
      .query("newsletters")
      .take(limit * 2)

    let scheduledNewsletters = newsletters.filter(n => n.status === 'scheduled')

    if (args.upcoming) {
      scheduledNewsletters = scheduledNewsletters.filter(n =>
        n.scheduledAt && n.scheduledAt > now
      )
    }

    // Sort by scheduled date
    scheduledNewsletters.sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0))

    return scheduledNewsletters.slice(0, limit).map(newsletter => ({
      _id: newsletter._id,
      title: newsletter.title,
      subject: newsletter.subject,
      scheduledAt: newsletter.scheduledAt,
      recipientCount: newsletter.recipientCount || 0,
      recipientGroups: newsletter.recipientGroups || [],
      authorId: newsletter.authorId,
      createdAt: newsletter.createdAt,
      updatedAt: newsletter.updatedAt,
    }))
  },
})

// AI Content Generation functions
export const create = mutation({
  args: {
    title: v.string(),
    subject: v.string(),
    sections: v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      content: v.string(),
      order: v.number(),
      signalIds: v.optional(v.array(v.id("signals"))),
      mentionIds: v.optional(v.array(v.id("raw_mentions"))),
      aiGenerated: v.boolean(),
      generatedAt: v.optional(v.number()),
    })),
    templateId: v.optional(v.id("newsletter_templates")),
    sourceSignalIds: v.optional(v.array(v.id("signals"))),
    sourceMentionIds: v.optional(v.array(v.id("raw_mentions"))),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const newsletterId = await ctx.db.insert("newsletters", {
      title: args.title,
      subject: args.subject,
      status: "draft",
      sections: args.sections,
      templateId: args.templateId,
      sourceSignalIds: args.sourceSignalIds || [],
      sourceMentionIds: args.sourceMentionIds || [],
      createdBy: args.createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      version: 1,
    });

    return newsletterId;
  },
});

export const update = mutation({
  args: {
    id: v.id("newsletters"),
    title: v.optional(v.string()),
    subject: v.optional(v.string()),
    status: v.optional(v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent"), v.literal("archived"))),
    sections: v.optional(v.array(v.object({
      id: v.string(),
      type: v.string(),
      title: v.string(),
      content: v.string(),
      order: v.number(),
      signalIds: v.optional(v.array(v.id("signals"))),
      mentionIds: v.optional(v.array(v.id("raw_mentions"))),
      aiGenerated: v.boolean(),
      generatedAt: v.optional(v.number()),
    }))),
    scheduledFor: v.optional(v.number()),
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

export const remove = mutation({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const get = query({
  args: { id: v.id("newsletters") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const list = query({
  args: {
    status: v.optional(v.union(v.literal("draft"), v.literal("scheduled"), v.literal("sent"), v.literal("archived"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("newsletters");

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    } else {
      query = query.withIndex("by_created");
    }

    const newsletters = await query
      .order("desc")
      .take(args.limit || 50);

    return newsletters;
  },
});