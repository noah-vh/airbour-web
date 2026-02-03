/**
 * Convex Database Schema
 */

import { defineSchema, defineTable } from "convex/server"
import { v } from "convex/values"

export default defineSchema({
  signals: defineTable(v.any())
    .index("by_lifecycle", ["lifecycle"])
    .index("by_creation", ["createdAt"])
    .searchIndex("search_name", {
      searchField: "name",
      filterFields: ["lifecycle"],
    }),

  raw_mentions: defineTable(v.any())
    .index("by_author", ["author"])
    .index("by_fetchedAt", ["fetchedAt"]),

  signal_updates: defineTable(v.any())
    .index("by_signal", ["signalId"])
    .index("by_createdAt", ["createdAt"]),

  sources: defineTable(v.any())
    .index("by_type", ["type"])
    .index("by_active", ["isActive"]),

  processing_jobs: defineTable(v.any()),
  collection_runs: defineTable(v.any()),
  classification_cache: defineTable(v.any()),
  admin_controls: defineTable(v.any()).index("by_key", ["key"]),
  user_settings: defineTable(v.any()),
  team_member_profiles: defineTable(v.any()),
  chat_conversations: defineTable(v.any()),
  personal_documents: defineTable(v.any()),
  personalized_content_templates: defineTable(v.any()),
  gemini_model_config: defineTable(v.any()),
  rate_limit_tracking: defineTable(v.any()),
  signal_metrics: defineTable(v.any()),
  content_templates: defineTable(v.any()),
  saved_content_ideas: defineTable(v.any()),

  // AI Content Generation Tables (using v.any() for backward compatibility)
  newsletters: defineTable(v.any())
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"])
    .index("by_scheduled", ["scheduledFor"]),

  newsletter_templates: defineTable(v.any())
    .index("by_active", ["isActive"])
    .index("by_default", ["isDefault"]),

  content_drafts: defineTable(v.any())
    .index("by_status", ["status"])
    .index("by_stage", ["stage"])
    .index("by_type", ["contentType"])
    .index("by_platform", ["platform"])
    .index("by_created", ["createdAt"]),

  content_ideas: defineTable({
    format: v.string(),
    hook: v.string(),
    angle: v.string(),
    description: v.string(),

    sourceSignalIds: v.array(v.id("signals")),
    sourceMentionIds: v.array(v.id("raw_mentions")),

    status: v.union(
      v.literal("generated"),
      v.literal("selected"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("rejected")
    ),

    relevanceScore: v.number(),
    draftId: v.optional(v.id("content_drafts")),

    generatedBy: v.string(),
    createdAt: v.number(),
    selectedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  platform_formats: defineTable({
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

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_platform", ["platform"]),

  // Newsletter SaaS - Subscriber Management
  subscribers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    status: v.string(), // "active", "unsubscribed", "bounced"
    source: v.string(), // "landing", "import", "api"
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // Newsletter SaaS - Email Engagement Tracking
  email_events: defineTable({
    subscriberId: v.optional(v.id("subscribers")),
    newsletterId: v.id("newsletters"),
    eventType: v.string(), // "sent", "delivered", "opened", "clicked", "bounced"
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  })
    .index("by_newsletter", ["newsletterId"])
    .index("by_type", ["eventType"])
    .index("by_subscriber", ["subscriberId"]),
})