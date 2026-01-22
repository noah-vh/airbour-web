/**
 * Convex Database Schema - Minimal Working Schema
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

  // Use v.any() for all other existing tables to avoid validation errors
  processing_jobs: defineTable(v.any()),
  collection_runs: defineTable(v.any()),
  classification_cache: defineTable(v.any()),
  admin_controls: defineTable(v.any()).index("by_key", ["key"]),
  user_settings: defineTable(v.any()),
  newsletters: defineTable(v.any()),
  content_drafts: defineTable(v.any()),
  content_templates: defineTable(v.any()),
  saved_content_ideas: defineTable(v.any()),
  team_member_profiles: defineTable(v.any()),
  chat_conversations: defineTable(v.any()),
  personal_documents: defineTable(v.any()),
  personalized_content_templates: defineTable(v.any()),
  gemini_model_config: defineTable(v.any()),
  rate_limit_tracking: defineTable(v.any()),
  signal_metrics: defineTable(v.any()),
})