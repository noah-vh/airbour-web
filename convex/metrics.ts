/**
 * Convex API functions for Metrics Management
 */

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getSignalMetrics = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("signals").collect()
    return {
      total: signals.length,
      byLifecycle: {
        weak: signals.filter(s => s.lifecycle === "weak").length,
        emerging: signals.filter(s => s.lifecycle === "emerging").length,
        growing: signals.filter(s => s.lifecycle === "growing").length,
        mainstream: signals.filter(s => s.lifecycle === "mainstream").length,
        declining: signals.filter(s => s.lifecycle === "declining").length,
      },
    }
  },
})

export const getDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    const signals = await ctx.db.query("signals").collect()
    const mentions = await ctx.db.query("raw_mentions").collect()
    return {
      totalSignals: signals.length,
      totalMentions: mentions.length,
    }
  },
})

export const getTrendingSignals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const signals = await ctx.db.query("signals").collect()
    return signals
      .sort((a, b) => (b.growth || 0) - (a.growth || 0))
      .slice(0, args.limit || 10)
  },
})

export const getRecentlyActiveSignals = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_creation")
      .order("desc")
      .take(args.limit || 10)
  },
})

export const getVelocityTrends = query({
  args: {
    days: v.optional(v.number()),
    granularity: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const days = args.days || 30
    const granularity = args.granularity || "daily" // daily, weekly, monthly
    const now = Date.now()
    const cutoffTime = now - (days * 24 * 60 * 60 * 1000)

    const [signals, mentions] = await Promise.all([
      ctx.db
        .query("signals")
        .withIndex("by_creation")
        .order("desc")
        .take(1000),
      ctx.db
        .query("raw_mentions")
        .withIndex("by_fetchedAt")
        .order("desc")
        .take(2000)
    ])

    // Filter by time period
    const recentSignals = signals.filter(s => s.createdAt && s.createdAt > cutoffTime)
    const recentMentions = mentions.filter(m => m.fetchedAt && m.fetchedAt > cutoffTime)

    // Create time buckets based on granularity
    const bucketSize = granularity === "weekly" ? 7 * 24 * 60 * 60 * 1000 :
                      granularity === "monthly" ? 30 * 24 * 60 * 60 * 1000 :
                      24 * 60 * 60 * 1000 // daily

    const buckets: Record<string, { signals: number; mentions: number; timestamp: number }> = {}

    // Initialize buckets
    for (let i = 0; i < days; i += (bucketSize / (24 * 60 * 60 * 1000))) {
      const bucketTime = now - (i * 24 * 60 * 60 * 1000)
      const bucketKey = new Date(bucketTime).toISOString().split('T')[0]
      buckets[bucketKey] = { signals: 0, mentions: 0, timestamp: bucketTime }
    }

    // Fill buckets with data
    recentSignals.forEach(signal => {
      if (signal.createdAt) {
        const bucketKey = new Date(signal.createdAt).toISOString().split('T')[0]
        if (buckets[bucketKey]) buckets[bucketKey].signals++
      }
    })

    recentMentions.forEach(mention => {
      if (mention.fetchedAt) {
        const bucketKey = new Date(mention.fetchedAt).toISOString().split('T')[0]
        if (buckets[bucketKey]) buckets[bucketKey].mentions++
      }
    })

    // Convert to array and sort
    const trends = Object.entries(buckets)
      .map(([date, data]) => ({
        date,
        ...data,
        velocity: data.signals + data.mentions, // Combined velocity score
        signalGrowthRate: 0, // Will calculate below
        mentionGrowthRate: 0
      }))
      .sort((a, b) => a.timestamp - b.timestamp)

    // Calculate growth rates
    for (let i = 1; i < trends.length; i++) {
      const prev = trends[i - 1]
      const curr = trends[i]
      curr.signalGrowthRate = prev.signals > 0 ? ((curr.signals - prev.signals) / prev.signals) * 100 : 0
      curr.mentionGrowthRate = prev.mentions > 0 ? ((curr.mentions - prev.mentions) / prev.mentions) * 100 : 0
    }

    return {
      trends,
      summary: {
        totalSignals: recentSignals.length,
        totalMentions: recentMentions.length,
        averageDailySignals: recentSignals.length / days,
        averageDailyMentions: recentMentions.length / days,
        peakDay: trends.reduce((max, day) => day.velocity > max.velocity ? day : max, trends[0]),
        period: { days, granularity }
      }
    }
  },
})

export const getSentimentDistribution = query({
  args: {
    limit: v.optional(v.number()),
    days: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 500
    const days = args.days || 7
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)

    const mentions = await ctx.db
      .query("raw_mentions")
      .withIndex("by_fetchedAt")
      .order("desc")
      .take(limit)

    const recentMentions = mentions.filter(m => m.fetchedAt && m.fetchedAt > cutoffTime)

    // Analyze sentiment based on content (simple heuristic)
    const sentimentAnalysis = recentMentions.map(mention => {
      if (!mention.content) return { sentiment: "neutral", confidence: 0.5 }

      const content = mention.content.toLowerCase()
      const positiveWords = ["good", "great", "excellent", "amazing", "positive", "love", "best", "fantastic", "wonderful"]
      const negativeWords = ["bad", "terrible", "awful", "hate", "worst", "negative", "disappointing", "frustrating"]

      const positiveCount = positiveWords.filter(word => content.includes(word)).length
      const negativeCount = negativeWords.filter(word => content.includes(word)).length

      let sentiment = "neutral"
      let confidence = 0.5

      if (positiveCount > negativeCount) {
        sentiment = "positive"
        confidence = Math.min(0.9, 0.5 + (positiveCount * 0.1))
      } else if (negativeCount > positiveCount) {
        sentiment = "negative"
        confidence = Math.min(0.9, 0.5 + (negativeCount * 0.1))
      }

      return { sentiment, confidence }
    })

    // Calculate distribution
    const distribution = {
      positive: sentimentAnalysis.filter(s => s.sentiment === "positive").length,
      neutral: sentimentAnalysis.filter(s => s.sentiment === "neutral").length,
      negative: sentimentAnalysis.filter(s => s.sentiment === "negative").length
    }

    const total = distribution.positive + distribution.neutral + distribution.negative
    const percentages = {
      positive: total > 0 ? (distribution.positive / total) * 100 : 0,
      neutral: total > 0 ? (distribution.neutral / total) * 100 : 0,
      negative: total > 0 ? (distribution.negative / total) * 100 : 0
    }

    // Calculate average confidence
    const avgConfidence = sentimentAnalysis.reduce((sum, s) => sum + s.confidence, 0) / sentimentAnalysis.length

    return {
      distribution,
      percentages,
      total,
      avgConfidence: avgConfidence || 0.5,
      period: { days },
      trendDirection: percentages.positive > percentages.negative ? "positive" :
                     percentages.negative > percentages.positive ? "negative" : "neutral"
    }
  },
})

export const getTagAnalysis = query({
  args: {
    limit: v.optional(v.number()),
    minCount: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    const minCount = args.minCount || 2

    const signals = await ctx.db.query("signals").collect()

    // Extract and count tags from signals
    const tagCounts: Record<string, { count: number; signalIds: string[]; categories: string[] }> = {}

    signals.forEach(signal => {
      // Extract tags from different sources
      const tags: string[] = []

      // From classificationReasoningConcise (extract keywords)
      if (signal.classificationReasoningConcise) {
        const keywords = signal.classificationReasoningConcise
          .toLowerCase()
          .match(/\b\w+\b/g) || []
        tags.push(...keywords.filter((w: string) => w.length > 3))
      }

      // From description
      if (signal.description) {
        const keywords = signal.description
          .toLowerCase()
          .match(/\b\w+\b/g) || []
        tags.push(...keywords.filter((w: string) => w.length > 3))
      }

      // Process tags
      tags.forEach(tag => {
        const normalizedTag = tag.toLowerCase().trim()
        if (normalizedTag.length > 2) {
          if (!tagCounts[normalizedTag]) {
            tagCounts[normalizedTag] = {
              count: 0,
              signalIds: [],
              categories: []
            }
          }
          tagCounts[normalizedTag].count++
          tagCounts[normalizedTag].signalIds.push(signal._id)

          // Add category if available
          if (signal.classifiedBy && !tagCounts[normalizedTag].categories.includes(signal.classifiedBy)) {
            tagCounts[normalizedTag].categories.push(signal.classifiedBy)
          }
        }
      })
    })

    // Filter and sort tags
    const filteredTags = Object.entries(tagCounts)
      .filter(([_tag, data]) => data.count >= minCount)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, limit)
      .map(([tag, data]) => ({
        tag,
        count: data.count,
        frequency: (data.count / signals.length) * 100,
        signalIds: data.signalIds,
        categories: data.categories,
        trending: data.count > 5 // Simple trending logic
      }))

    // Analyze tag relationships
    const tagRelationships: Record<string, string[]> = {}
    filteredTags.forEach(tagData => {
      const relatedTags = filteredTags
        .filter(other => other.tag !== tagData.tag)
        .filter(other => {
          const commonSignals = other.signalIds.filter(id => tagData.signalIds.includes(id))
          return commonSignals.length > 0
        })
        .slice(0, 5)
        .map(other => other.tag)

      tagRelationships[tagData.tag] = relatedTags
    })

    return {
      tags: filteredTags,
      relationships: tagRelationships,
      summary: {
        totalUniqueTags: Object.keys(tagCounts).length,
        totalSignalsAnalyzed: signals.length,
        averageTagsPerSignal: filteredTags.length > 0 ?
          filteredTags.reduce((sum, t) => sum + t.count, 0) / signals.length : 0,
        mostPopularTag: filteredTags[0]?.tag || null,
        trendingTagsCount: filteredTags.filter(t => t.trending).length
      }
    }
  },
})

export const getSourceMetrics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 20

    const [sources, mentions] = await Promise.all([
      ctx.db.query("sources").take(limit),
      ctx.db.query("raw_mentions").take(1000)
    ])

    // Calculate metrics for each source
    const sourceMetrics = sources.map(source => {
      const sourceMentions = mentions.filter(m =>
        m.source === source.name ||
        m.externalId?.includes(source.name) ||
        m.author?.includes(source.name)
      )

      const now = Date.now()
      const oneDayAgo = now - (24 * 60 * 60 * 1000)
      const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000)

      const recentMentions = sourceMentions.filter(m => m.fetchedAt && m.fetchedAt > oneWeekAgo)
      const dailyMentions = sourceMentions.filter(m => m.fetchedAt && m.fetchedAt > oneDayAgo)

      const avgContentLength = sourceMentions.length > 0 ?
        sourceMentions.reduce((sum, m) => sum + (m.content?.length || 0), 0) / sourceMentions.length : 0

      return {
        sourceId: source._id,
        name: source.name,
        type: source.type,
        isActive: source.isActive,
        totalMentions: sourceMentions.length,
        weeklyMentions: recentMentions.length,
        dailyMentions: dailyMentions.length,
        avgContentLength: Math.round(avgContentLength),
        lastSync: source.lastSync,
        errorCount: source.errorCount || 0,
        successRate: source.successRate || 0,
        velocity: dailyMentions.length, // mentions per day
        health: source.isActive && (source.errorCount || 0) < 5 ? "healthy" : "needs_attention"
      }
    })

    return {
      sources: sourceMetrics.sort((a, b) => b.totalMentions - a.totalMentions),
      summary: {
        totalSources: sources.length,
        activeSources: sources.filter(s => s.isActive).length,
        totalMentions: sourceMetrics.reduce((sum, s) => sum + s.totalMentions, 0),
        avgMentionsPerSource: sourceMetrics.length > 0 ?
          sourceMetrics.reduce((sum, s) => sum + s.totalMentions, 0) / sourceMetrics.length : 0,
        healthySources: sourceMetrics.filter(s => s.health === "healthy").length
      }
    }
  },
})