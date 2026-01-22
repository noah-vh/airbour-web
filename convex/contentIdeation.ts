import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Content Drafts
export const listDrafts = query({
  args: {
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    // For now, return mock drafts
    // In production, this would query the content_drafts table
    return Array.from({ length: Math.min(limit, 8) }, (_, i) => {
      const draftIndex = offset + i + 1;
      return {
        _id: `draft_${draftIndex}`,
        title: `Content Draft ${draftIndex}`,
        content: `Mock content for draft ${draftIndex}...`,
        status: ["draft", "scheduled", "published", "archived"][draftIndex % 4],
        templateId: draftIndex % 3 === 0 ? `template_${draftIndex}` : undefined,
        scheduledAt: draftIndex % 4 === 1 ? Date.now() + 86400000 : undefined,
        publishedAt: draftIndex % 4 === 2 ? Date.now() - 86400000 : undefined,
        createdAt: Date.now() - draftIndex * 3600000,
        updatedAt: Date.now() - Math.random() * 3600000,
        wordCount: Math.floor(Math.random() * 1000) + 200,
        tags: [`tag${draftIndex}`, `category${draftIndex % 3}`],
      };
    });
  },
});

export const getDraft = query({
  args: {
    draftId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock draft details
    // In production, this would query the content_drafts table
    return {
      _id: args.draftId,
      title: "Sample Content Draft",
      content: "This is the full content of the draft with detailed text and formatting...",
      status: "draft",
      templateId: "template_1",
      metadata: {
        author: "system",
        category: "innovation",
        targetAudience: "professionals",
      },
      scheduledAt: undefined,
      publishedAt: undefined,
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
      wordCount: 450,
      tags: ["innovation", "technology", "trends"],
    };
  },
});

export const createDraft = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    templateId: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const draftId = `draft_${Date.now()}`;
    const now = Date.now();

    // For now, return mock created draft
    // In production, this would insert into content_drafts table
    return {
      _id: draftId,
      title: args.title,
      content: args.content,
      status: "draft",
      templateId: args.templateId,
      metadata: args.metadata || {},
      tags: args.tags || [],
      wordCount: args.content.split(' ').length,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const updateDraft = mutation({
  args: {
    draftId: v.string(),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    status: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // For now, return mock updated draft
    // In production, this would update the content_drafts table
    return {
      _id: args.draftId,
      title: args.title || "Updated Draft",
      content: args.content || "Updated content",
      status: args.status || "draft",
      tags: args.tags || [],
      metadata: args.metadata || {},
      wordCount: args.content ? args.content.split(' ').length : 100,
      updatedAt: now,
    };
  },
});

export const deleteDraft = mutation({
  args: {
    draftId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return success
    // In production, this would delete from content_drafts table
    return {
      deleted: true,
      draftId: args.draftId,
    };
  },
});

export const scheduleDraft = mutation({
  args: {
    draftId: v.string(),
    scheduledAt: v.number(),
  },
  handler: async (ctx, args) => {
    // For now, return mock scheduled draft
    // In production, this would update the draft status and scheduledAt
    return {
      _id: args.draftId,
      status: "scheduled",
      scheduledAt: args.scheduledAt,
      updatedAt: Date.now(),
    };
  },
});

export const unscheduleDraft = mutation({
  args: {
    draftId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock unscheduled draft
    // In production, this would update the draft status and remove scheduledAt
    return {
      _id: args.draftId,
      status: "draft",
      scheduledAt: undefined,
      updatedAt: Date.now(),
    };
  },
});

export const listScheduledDrafts = query({
  args: {
    from: v.optional(v.number()),
    to: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For now, return mock scheduled drafts
    // In production, this would query content_drafts with status="scheduled"
    return Array.from({ length: 3 }, (_, i) => ({
      _id: `scheduled_${i + 1}`,
      title: `Scheduled Draft ${i + 1}`,
      content: `Content for scheduled draft ${i + 1}...`,
      status: "scheduled",
      scheduledAt: Date.now() + (i + 1) * 86400000, // 1, 2, 3 days from now
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
    }));
  },
});

// Content Templates
export const listTemplates = query({
  args: {
    category: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    // For now, return mock templates
    // In production, this would query the content_templates table
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      _id: `template_${i + 1}`,
      name: `Content Template ${i + 1}`,
      description: `Description for template ${i + 1}`,
      category: ["blog", "social", "newsletter", "report"][i % 4],
      template: `Template content with placeholders for template ${i + 1}...`,
      variables: [`var1_${i}`, `var2_${i}`],
      isSystem: i < 2, // First 2 are system templates
      createdAt: Date.now() - (i + 1) * 86400000,
      updatedAt: Date.now() - Math.random() * 86400000,
      usageCount: Math.floor(Math.random() * 50),
    }));
  },
});

export const getTemplate = query({
  args: {
    templateId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock template details
    // In production, this would query the content_templates table
    return {
      _id: args.templateId,
      name: "Innovation Blog Post Template",
      description: "Template for writing blog posts about innovation trends",
      category: "blog",
      template: "# {{title}}\n\n{{intro}}\n\n## Key Points\n{{content}}\n\n## Conclusion\n{{conclusion}}",
      variables: ["title", "intro", "content", "conclusion"],
      isSystem: true,
      metadata: {
        author: "system",
        version: "1.0",
        targetLength: 800,
      },
      createdAt: Date.now() - 86400000 * 30,
      updatedAt: Date.now() - 86400000 * 7,
      usageCount: 25,
    };
  },
});

export const createTemplate = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    category: v.string(),
    template: v.string(),
    variables: v.array(v.string()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const templateId = `template_${Date.now()}`;
    const now = Date.now();

    // For now, return mock created template
    // In production, this would insert into content_templates table
    return {
      _id: templateId,
      name: args.name,
      description: args.description,
      category: args.category,
      template: args.template,
      variables: args.variables,
      metadata: args.metadata || {},
      isSystem: false,
      usageCount: 0,
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const initializeSystemTemplates = mutation({
  args: {},
  handler: async (ctx, args) => {
    // For now, return mock initialization result
    // In production, this would create default system templates
    const systemTemplates = [
      "Blog Post Template",
      "Social Media Post Template",
      "Newsletter Template",
      "Research Report Template"
    ];

    return {
      initialized: systemTemplates.length,
      templates: systemTemplates.map((name, i) => ({
        _id: `system_template_${i + 1}`,
        name,
        isSystem: true,
        createdAt: Date.now(),
      })),
    };
  },
});

// Content Ideas and Recommendations
export const getSignalForIdeas = query({
  args: {
    signalId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock signal with content ideas
    // In production, this would query signals and generate content suggestions
    return {
      _id: args.signalId,
      name: "AI in Healthcare",
      description: "Growing adoption of AI technologies in healthcare sector",
      contentIdeas: [
        {
          title: "The Future of AI-Powered Diagnostics",
          type: "blog",
          description: "Explore how AI is revolutionizing medical diagnostics",
          estimatedWordCount: 800,
          suggestedTemplateId: "template_1",
        },
        {
          title: "AI Healthcare Revolution",
          type: "social",
          description: "Quick insights on AI healthcare trends",
          estimatedWordCount: 150,
          suggestedTemplateId: "template_2",
        },
      ],
    };
  },
});

export const getMentionForIdeas = query({
  args: {
    mentionId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock mention with content ideas
    // In production, this would query mentions and generate content suggestions
    return {
      _id: args.mentionId,
      content: "Sample mention content about innovation trends",
      source: "Twitter",
      contentIdeas: [
        {
          title: "Response to Innovation Trends Discussion",
          type: "social",
          description: "Thoughtful response to the mention",
          estimatedWordCount: 200,
          suggestedTemplateId: "template_2",
        },
      ],
    };
  },
});

export const getRecommendedSignals = query({
  args: {
    limit: v.optional(v.number()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;

    // For now, return mock recommended signals
    // In production, this would analyze signals for content potential
    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      _id: `signal_rec_${i + 1}`,
      name: `Recommended Signal ${i + 1}`,
      description: `Description for recommended signal ${i + 1}`,
      contentPotential: Math.random() * 0.5 + 0.5, // 0.5-1.0
      trendingScore: Math.random() * 0.4 + 0.6, // 0.6-1.0
      suggestedContentTypes: ["blog", "social", "newsletter"].slice(0, i % 3 + 1),
      reasonForRecommendation: `High engagement and trending in ${args.category || "technology"}`,
    }));
  },
});

export const getRecommendedSignalsInternal = query({
  args: {
    limit: v.optional(v.number()),
    threshold: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Internal function for advanced signal recommendations
    const limit = args.limit || 20;
    const threshold = args.threshold || 0.7;

    return Array.from({ length: Math.min(limit, 8) }, (_, i) => ({
      _id: `signal_internal_${i + 1}`,
      name: `Internal Signal ${i + 1}`,
      score: Math.random() * 0.3 + threshold,
      factors: {
        engagement: Math.random(),
        novelty: Math.random(),
        relevance: Math.random(),
        momentum: Math.random(),
      },
      contentOpportunities: Math.floor(Math.random() * 5) + 1,
    }));
  },
});

// Saved Ideas
export const listSavedIdeas = query({
  args: {
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    const offset = args.offset || 0;

    // For now, return mock saved ideas
    // In production, this would query the saved_content_ideas table
    return Array.from({ length: Math.min(limit, 6) }, (_, i) => {
      const ideaIndex = offset + i + 1;
      return {
        _id: `idea_${ideaIndex}`,
        title: `Saved Content Idea ${ideaIndex}`,
        description: `Description for saved idea ${ideaIndex}`,
        type: ["blog", "social", "newsletter"][ideaIndex % 3],
        status: ["saved", "in_progress", "completed"][ideaIndex % 3],
        sourceSignalId: `signal_${ideaIndex}`,
        estimatedWordCount: Math.floor(Math.random() * 1000) + 300,
        priority: Math.floor(Math.random() * 5) + 1,
        tags: [`tag${ideaIndex}`, `category${ideaIndex % 2}`],
        createdAt: Date.now() - ideaIndex * 3600000,
        updatedAt: Date.now() - Math.random() * 3600000,
      };
    });
  },
});

export const getSavedIdea = query({
  args: {
    ideaId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return mock saved idea details
    // In production, this would query the saved_content_ideas table
    return {
      _id: args.ideaId,
      title: "Comprehensive Content Idea",
      description: "Detailed description of the content idea with full context",
      type: "blog",
      status: "saved",
      sourceSignalId: "signal_123",
      sourceSignalName: "AI in Healthcare",
      content: "Detailed content outline and notes...",
      estimatedWordCount: 750,
      priority: 4,
      tags: ["ai", "healthcare", "innovation"],
      metadata: {
        targetAudience: "professionals",
        difficulty: "intermediate",
        keywords: ["artificial intelligence", "medical technology"],
      },
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 3600000,
    };
  },
});

export const saveIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(),
    sourceSignalId: v.optional(v.string()),
    sourceMentionId: v.optional(v.string()),
    estimatedWordCount: v.optional(v.number()),
    priority: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    const ideaId = `idea_${Date.now()}`;
    const now = Date.now();

    // For now, return mock saved idea
    // In production, this would insert into saved_content_ideas table
    return {
      _id: ideaId,
      title: args.title,
      description: args.description,
      type: args.type,
      status: "saved",
      sourceSignalId: args.sourceSignalId,
      sourceMentionId: args.sourceMentionId,
      estimatedWordCount: args.estimatedWordCount || 500,
      priority: args.priority || 3,
      tags: args.tags || [],
      metadata: args.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
  },
});

export const deleteSavedIdea = mutation({
  args: {
    ideaId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return success
    // In production, this would delete from saved_content_ideas table
    return {
      deleted: true,
      ideaId: args.ideaId,
    };
  },
});