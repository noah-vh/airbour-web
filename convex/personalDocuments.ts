/**
 * Convex API functions for Personal Documents Management
 */

import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const getDocumentsByTeamMember = query({
  args: {
    teamMemberId: v.string(),
    limit: v.optional(v.number()),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50

    const documents = await ctx.db
      .query("personal_documents")
      .take(limit * 2)

    let filteredDocs = documents.filter(doc => doc.teamMemberId === args.teamMemberId)

    if (args.type) {
      filteredDocs = filteredDocs.filter(doc => doc.type === args.type)
    }

    return filteredDocs
      .slice(0, limit)
      .map(doc => ({
        _id: doc._id,
        title: doc.title,
        type: doc.type,
        status: doc.status || 'draft',
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        tags: doc.tags || [],
        expertiseAreas: doc.expertiseAreas || [],
        contentPreview: doc.content ? doc.content.substring(0, 200) + '...' : null,
        processingStatus: doc.processingStatus || 'pending',
        insights: doc.insights ? Object.keys(doc.insights).length : 0,
      }))
  },
})

export const getDocument = query({
  args: { id: v.id("personal_documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id)
    if (!document) {
      throw new Error("Document not found")
    }
    return document
  },
})

export const searchDocuments = query({
  args: {
    query: v.string(),
    teamMemberId: v.optional(v.string()),
    limit: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    expertiseAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50
    const searchLower = args.query.toLowerCase()

    const documents = await ctx.db
      .query("personal_documents")
      .take(limit * 3) // Get more to allow for filtering

    let filteredDocs = documents.filter(doc =>
      (doc.title && doc.title.toLowerCase().includes(searchLower)) ||
      (doc.content && doc.content.toLowerCase().includes(searchLower)) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchLower))
    )

    if (args.teamMemberId) {
      filteredDocs = filteredDocs.filter(doc => doc.teamMemberId === args.teamMemberId)
    }

    if (args.tags && args.tags.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        doc.tags && args.tags!.some(tag => doc.tags.includes(tag))
      )
    }

    if (args.expertiseAreas && args.expertiseAreas.length > 0) {
      filteredDocs = filteredDocs.filter(doc =>
        doc.expertiseAreas && args.expertiseAreas!.some(area => doc.expertiseAreas.includes(area))
      )
    }

    return filteredDocs
      .slice(0, limit)
      .map(doc => ({
        _id: doc._id,
        title: doc.title,
        type: doc.type,
        teamMemberId: doc.teamMemberId,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        tags: doc.tags || [],
        expertiseAreas: doc.expertiseAreas || [],
        contentPreview: doc.content ? doc.content.substring(0, 200) + '...' : null,
        processingStatus: doc.processingStatus || 'pending',
        relevanceScore: Math.random() * 0.5 + 0.5, // Mock relevance scoring
      }))
  },
})

export const getInsightsByType = query({
  args: {
    documentId: v.id("personal_documents"),
    insightType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.documentId)
    if (!document || !document.insights) {
      return []
    }

    const insights = document.insights

    if (args.insightType) {
      return insights[args.insightType] || []
    }

    // Return all insights categorized by type
    return Object.entries(insights).map(([type, data]) => ({
      type,
      data,
      count: Array.isArray(data) ? data.length : 1,
    }))
  },
})

export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    type: v.string(),
    teamMemberId: v.string(),
    tags: v.optional(v.array(v.string())),
    expertiseAreas: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const now = Date.now()

    const documentData = {
      title: args.title,
      content: args.content,
      type: args.type,
      teamMemberId: args.teamMemberId,
      status: 'draft' as const,
      tags: args.tags || [],
      expertiseAreas: args.expertiseAreas || [],
      metadata: args.metadata || {},
      processingStatus: 'pending' as const,
      createdAt: now,
      updatedAt: now,
      summary: args.content.substring(0, 300) + '...', // Auto-generate basic summary
      wordCount: args.content.split(/\s+/).length,
    }

    return await ctx.db.insert("personal_documents", documentData)
  },
})

export const updateProcessingStatus = mutation({
  args: {
    id: v.id("personal_documents"),
    status: v.string(),
    error: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updateData: any = {
      processingStatus: args.status,
      updatedAt: Date.now(),
    }

    if (args.error) {
      updateData.processingError = args.error
    } else if (args.status === 'completed') {
      // Clear any previous errors
      updateData.processingError = undefined
    }

    await ctx.db.patch(args.id, updateData)
    return await ctx.db.get(args.id)
  },
})

export const updateWithAnalysisResults = mutation({
  args: {
    id: v.id("personal_documents"),
    insights: v.any(),
    summary: v.optional(v.string()),
    extractedTags: v.optional(v.array(v.string())),
    extractedExpertiseAreas: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id)
    if (!document) {
      throw new Error("Document not found")
    }

    const updateData: any = {
      insights: args.insights,
      processingStatus: 'completed',
      updatedAt: Date.now(),
    }

    if (args.summary) {
      updateData.summary = args.summary
    }

    if (args.extractedTags) {
      // Merge with existing tags, avoiding duplicates
      const allTags = [...(document.tags || []), ...args.extractedTags]
      updateData.tags = [...new Set(allTags)]
    }

    if (args.extractedExpertiseAreas) {
      // Merge with existing expertise areas
      const allAreas = [...(document.expertiseAreas || []), ...args.extractedExpertiseAreas]
      updateData.expertiseAreas = [...new Set(allAreas)]
    }

    await ctx.db.patch(args.id, updateData)
    return await ctx.db.get(args.id)
  },
})

export const deleteDocument = mutation({
  args: { id: v.id("personal_documents") },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id)
    if (!document) {
      throw new Error("Document not found")
    }

    await ctx.db.delete(args.id)
    return { success: true }
  },
})

export const addTags = mutation({
  args: {
    id: v.id("personal_documents"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id)
    if (!document) {
      throw new Error("Document not found")
    }

    const existingTags = document.tags || []
    const newTags = [...new Set([...existingTags, ...args.tags])]

    await ctx.db.patch(args.id, {
      tags: newTags,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.id)
  },
})

export const removeTags = mutation({
  args: {
    id: v.id("personal_documents"),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const document = await ctx.db.get(args.id)
    if (!document) {
      throw new Error("Document not found")
    }

    const existingTags = document.tags || []
    const filteredTags = existingTags.filter((tag: string) => !args.tags.includes(tag))

    await ctx.db.patch(args.id, {
      tags: filteredTags,
      updatedAt: Date.now(),
    })

    return await ctx.db.get(args.id)
  },
})

export const getDocumentStats = query({
  args: {
    teamMemberId: v.optional(v.string()),
    days: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const days = args.days || 30
    const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000)

    const documents = await ctx.db
      .query("personal_documents")
      .take(1000)

    let filteredDocs = documents

    if (args.teamMemberId) {
      filteredDocs = filteredDocs.filter(doc => doc.teamMemberId === args.teamMemberId)
    }

    const recentDocs = filteredDocs.filter(doc =>
      doc.createdAt && doc.createdAt > cutoffTime
    )

    const typeStats = filteredDocs.reduce((acc, doc) => {
      const type = doc.type || 'unknown'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusStats = filteredDocs.reduce((acc, doc) => {
      const status = doc.processingStatus || 'pending'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalDocuments: filteredDocs.length,
      recentDocuments: recentDocs.length,
      averageWordCount: filteredDocs.reduce((sum, doc) => sum + (doc.wordCount || 0), 0) / filteredDocs.length,
      typeBreakdown: typeStats,
      processingStats: statusStats,
      period: `${days} days`,
    }
  },
})

export const getAvailableTags = query({
  args: {
    teamMemberId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 100

    const documents = await ctx.db
      .query("personal_documents")
      .take(1000)

    let filteredDocs = documents

    if (args.teamMemberId) {
      filteredDocs = filteredDocs.filter(doc => doc.teamMemberId === args.teamMemberId)
    }

    const tagCounts = filteredDocs.reduce((acc, doc) => {
      const tags = doc.tags || []
      tags.forEach((tag: string) => {
        acc[tag] = (acc[tag] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const sortedTags = Object.entries(tagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))

    return sortedTags
  },
})

export const getAvailableExpertiseAreas = query({
  args: {
    teamMemberId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50

    const documents = await ctx.db
      .query("personal_documents")
      .take(1000)

    let filteredDocs = documents

    if (args.teamMemberId) {
      filteredDocs = filteredDocs.filter(doc => doc.teamMemberId === args.teamMemberId)
    }

    const areaCounts = filteredDocs.reduce((acc, doc) => {
      const areas = doc.expertiseAreas || []
      areas.forEach((area: string) => {
        acc[area] = (acc[area] || 0) + 1
      })
      return acc
    }, {} as Record<string, number>)

    const sortedAreas = Object.entries(areaCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([area, count]) => ({ area, count }))

    return sortedAreas
  },
})