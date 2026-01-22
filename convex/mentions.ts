/**
 * Convex API functions for Mentions Management
 */

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const listMentions = query({
  args: {
    limit: v.optional(v.number()),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let mentionsQuery = ctx.db.query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")

    const mentions = await mentionsQuery.take(args.limit || 50)
    return mentions.map(mention => ({
      ...mention,
      sentiment: mention.content ?
        (mention.content.includes('positive') || mention.content.includes('good') ? 0.7 :
         mention.content.includes('negative') || mention.content.includes('bad') ? 0.3 : 0.5) : 0.5
    }))
  },
})

export const getMention = query({
  args: { id: v.id("raw_mentions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

export const getMentionById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("raw_mentions")
      .filter(q => q.eq(q.field("externalId"), args.id))
      .first()
  },
})

export const getProcessed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(args.limit || 50)
    return mentions.filter(m => m.isDuplicate !== true)
  },
})

export const createRawMention = mutation({
  args: {
    author: v.optional(v.string()),
    content: v.optional(v.string()),
    contentHash: v.optional(v.string()),
    externalId: v.optional(v.string()),
    fetchedAt: v.optional(v.number()),
    isDuplicate: v.optional(v.boolean()),
    matchConfidence: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("raw_mentions", {
      ...args,
      fetchedAt: args.fetchedAt || Date.now(),
    })
  },
})

export const deleteMention = mutation({
  args: { id: v.id("raw_mentions") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id)
  },
})

export const getMentionsBySignal = query({
  args: { signalId: v.id("signals") },
  handler: async (ctx, args) => {
    // For now, return empty array as this would require proper signal-mention linking
    return []
  },
})

export const getUnprocessed = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(args.limit || 50)
    return mentions.filter(m => m.isDuplicate === undefined || m.isDuplicate === false)
  },
})

export const markAsDuplicate = mutation({
  args: {
    id: v.id("raw_mentions"),
    duplicateOfMentionId: v.optional(v.id("raw_mentions"))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isDuplicate: true,
      duplicateOfMentionId: args.duplicateOfMentionId
    })
  },
})

export const markMentionProcessed = mutation({
  args: {
    id: v.id("raw_mentions"),
    processed: v.optional(v.boolean())
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      processed: args.processed !== undefined ? args.processed : true
    })
  },
})

export const updateMentionContent = mutation({
  args: {
    id: v.id("raw_mentions"),
    content: v.optional(v.string()),
    author: v.optional(v.string()),
    matchConfidence: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args
    await ctx.db.patch(id, updates)
  },
})