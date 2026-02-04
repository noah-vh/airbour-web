/**
 * Convex API functions for Lightweight Data Access
 * Optimized queries that return minimal data for performance
 */

import { v } from "convex/values"
import { query } from "./_generated/server"

export const getMentionsLightweight = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20
    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(limit)

    return mentions.map(mention => ({
      _id: mention._id,
      author: mention.author,
      externalId: mention.externalId,
      fetchedAt: mention.fetchedAt,
      isDuplicate: mention.isDuplicate || false,
      contentPreview: mention.content ? mention.content.substring(0, 100) + '...' : null,
      sentiment: mention.content ?
        (mention.content.includes('positive') || mention.content.includes('good') ? 0.7 :
         mention.content.includes('negative') || mention.content.includes('bad') ? 0.3 : 0.5) : 0.5
    }))
  },
})

export const getSignalsLightweight = query({
  args: {
    limit: v.optional(v.number()),
    lifecycle: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20

    const signals = args.lifecycle
      ? await ctx.db.query("signals")
          .withIndex("by_lifecycle", q => q.eq("lifecycle", args.lifecycle!))
          .take(limit)
      : await ctx.db.query("signals")
          .withIndex("by_creation")
          .order("desc")
          .take(limit)

    return signals.map(signal => ({
      _id: signal._id,
      name: signal.name,
      lifecycle: signal.lifecycle || 'discovery',
      priority: signal.priority || 'medium',
      createdAt: signal.createdAt,
      updatedAt: signal.updatedAt,
      description: signal.description ? signal.description.substring(0, 150) + '...' : null,
      mentionsCount: signal.mentionsCount || 0,
      confidence: signal.confidence || 0.5,
    }))
  },
})

export const getDashboardStatsLightweight = query({
  args: {},
  handler: async (ctx) => {
    // Get basic counts efficiently
    const [recentMentions, recentSignals, activeSources] = await Promise.all([
      ctx.db.query("raw_mentions").withIndex("by_fetchedAt").order("desc").take(100),
      ctx.db.query("signals").withIndex("by_creation").order("desc").take(50),
      ctx.db.query("sources").withIndex("by_active", q => q.eq("isActive", true)).take(20),
    ])

    // Calculate basic metrics
    const now = Date.now()
    const oneDayAgo = now - (24 * 60 * 60 * 1000)
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

    const dailyMentions = recentMentions.filter(m => m.fetchedAt && m.fetchedAt > oneDayAgo).length
    const weeklyMentions = recentMentions.filter(m => m.fetchedAt && m.fetchedAt > oneWeekAgo).length

    const signalsByLifecycle = recentSignals.reduce((acc, signal) => {
      const lifecycle = signal.lifecycle || 'discovery'
      acc[lifecycle] = (acc[lifecycle] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      mentionsCount: recentMentions.length,
      dailyMentions,
      weeklyMentions,
      signalsCount: recentSignals.length,
      signalsByLifecycle,
      activeSourcesCount: activeSources.length,
      lastUpdated: now,
    }
  },
})

export const getSourceMetricsLightweight = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_active", q => q.eq("isActive", true))
      .take(limit)

    return sources.map(source => ({
      _id: source._id,
      name: source.name,
      type: source.type,
      isActive: source.isActive,
      lastSync: source.lastSync,
      mentionsCount: source.mentionsCount || 0,
      errorCount: source.errorCount || 0,
      successRate: source.successRate || 0,
      status: source.status || 'unknown',
    }))
  },
})

export const getMentionsForNewsletterLightweight = query({
  args: {
    days: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 7
    const limit = args.limit || 50
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)

    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(limit * 2)

    const filteredMentions = mentions
      .filter(mention =>
        mention.fetchedAt &&
        mention.fetchedAt > cutoffTime &&
        !mention.isDuplicate
      )
      .slice(0, limit)

    return filteredMentions.map(mention => ({
      _id: mention._id,
      author: mention.author,
      externalId: mention.externalId,
      fetchedAt: mention.fetchedAt,
      contentPreview: mention.content ? mention.content.substring(0, 200) + '...' : null,
      sentiment: mention.content ?
        (mention.content.includes('positive') || mention.content.includes('good') ? 0.7 :
         mention.content.includes('negative') || mention.content.includes('bad') ? 0.3 : 0.5) : 0.5,
      matchConfidence: mention.matchConfidence || 'medium',
    }))
  },
})

export const getDocumentCounts = query({
  args: {},
  handler: async (ctx) => {
    // Get counts for different document types efficiently
    const [personalDocs, newsletters, contentDrafts, templates] = await Promise.all([
      ctx.db.query("personal_documents").take(1000),
      ctx.db.query("newsletters").take(200),
      ctx.db.query("content_drafts").take(500),
      ctx.db.query("content_templates").take(100),
    ])

    const now = Date.now()
    const oneDayAgo = now - (24 * 60 * 60 * 1000)
    const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

    return {
      personalDocuments: {
        total: personalDocs.length,
        recent: personalDocs.filter(doc => doc.createdAt && doc.createdAt > oneWeekAgo).length,
        daily: personalDocs.filter(doc => doc.createdAt && doc.createdAt > oneDayAgo).length,
      },
      newsletters: {
        total: newsletters.length,
        published: newsletters.filter(n => n.status === 'published').length,
        scheduled: newsletters.filter(n => n.status === 'scheduled').length,
        draft: newsletters.filter(n => n.status === 'draft').length,
      },
      contentDrafts: {
        total: contentDrafts.length,
        recent: contentDrafts.filter(draft => draft.updatedAt && draft.updatedAt > oneWeekAgo).length,
      },
      templates: {
        total: templates.length,
        active: templates.filter(t => t.isActive !== false).length,
      },
      lastUpdated: now,
    }
  },
})