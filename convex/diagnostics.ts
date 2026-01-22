/**
 * Convex API functions for Diagnostics and System Health
 */

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const findLargeMentions = query({
  args: {
    sizeThreshold: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.sizeThreshold || 10000 // 10KB default
    const limit = args.limit || 50

    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(limit * 2) // Get more to filter

    const largeMentions = mentions
      .filter(mention => {
        const contentSize = (mention.content?.length || 0) +
                           (mention.author?.length || 0) +
                           (mention.externalId?.length || 0)
        return contentSize > threshold
      })
      .slice(0, limit)
      .map(mention => ({
        _id: mention._id,
        externalId: mention.externalId,
        author: mention.author,
        contentSize: (mention.content?.length || 0),
        totalSize: (mention.content?.length || 0) +
                   (mention.author?.length || 0) +
                   (mention.externalId?.length || 0),
        fetchedAt: mention.fetchedAt,
      }))

    return largeMentions
  },
})

export const scanMentionSizes = query({
  args: {
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const batchSize = args.batchSize || 100

    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(batchSize)

    let totalSize = 0
    let averageSize = 0
    let maxSize = 0
    let minSize = Infinity
    const sizeBuckets = {
      small: 0,    // < 1KB
      medium: 0,   // 1KB - 10KB
      large: 0,    // 10KB - 100KB
      xlarge: 0,   // > 100KB
    }

    mentions.forEach(mention => {
      const mentionSize = (mention.content?.length || 0) +
                         (mention.author?.length || 0) +
                         (mention.externalId?.length || 0)

      totalSize += mentionSize
      maxSize = Math.max(maxSize, mentionSize)
      minSize = Math.min(minSize, mentionSize)

      // Categorize by size
      if (mentionSize < 1000) sizeBuckets.small++
      else if (mentionSize < 10000) sizeBuckets.medium++
      else if (mentionSize < 100000) sizeBuckets.large++
      else sizeBuckets.xlarge++
    })

    averageSize = mentions.length > 0 ? totalSize / mentions.length : 0

    return {
      scannedCount: mentions.length,
      totalSize,
      averageSize: Math.round(averageSize),
      maxSize,
      minSize: minSize === Infinity ? 0 : minSize,
      sizeBuckets,
      recommendations: {
        shouldClean: sizeBuckets.xlarge > 0 || sizeBuckets.large > mentions.length * 0.1,
        estimatedSavings: sizeBuckets.xlarge * 50000 + sizeBuckets.large * 25000,
      }
    }
  },
})

export const cleanOversizedMentions = mutation({
  args: {
    sizeThreshold: v.optional(v.number()),
    dryRun: v.optional(v.boolean()),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const threshold = args.sizeThreshold || 100000 // 100KB default
    const dryRun = args.dryRun || false
    const batchSize = args.batchSize || 50

    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(batchSize * 2)

    const oversizedMentions = mentions.filter(mention => {
      const totalSize = (mention.content?.length || 0) +
                       (mention.author?.length || 0) +
                       (mention.externalId?.length || 0)
      return totalSize > threshold
    }).slice(0, batchSize)

    const cleanupResults = {
      found: oversizedMentions.length,
      cleaned: 0,
      errors: 0,
      totalSizeFreed: 0,
      dryRun,
    }

    for (const mention of oversizedMentions) {
      try {
        const originalSize = (mention.content?.length || 0)

        if (!dryRun) {
          // Truncate content to reasonable size
          const truncatedContent = mention.content ?
            mention.content.substring(0, Math.min(5000, mention.content.length)) +
            (mention.content.length > 5000 ? '... [truncated]' : '') :
            mention.content

          await ctx.db.patch(mention._id, {
            content: truncatedContent,
            _cleanedAt: Date.now(),
            _originalSize: originalSize,
          })
        }

        cleanupResults.cleaned++
        cleanupResults.totalSizeFreed += Math.max(0, originalSize - 5000)
      } catch (error) {
        cleanupResults.errors++
        console.error(`Failed to clean mention ${mention._id}:`, error)
      }
    }

    return cleanupResults
  },
})