import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const getAdminControls = query({
  args: {},
  handler: async (ctx) => {
    // Return mock admin controls
    return [
      {
        _id: "ctrl_1",
        key: "llm_processing_enabled",
        value: true,
        type: "boolean",
        description: "Enable or disable LLM processing for signal analysis and classification",
        category: "primary",
        lastUpdatedBy: "admin",
        lastUpdatedAt: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        _id: "ctrl_2",
        key: "ai_classification_enabled",
        value: true,
        type: "boolean",
        description: "Enable automatic classification of signals using AI models",
        category: "primary",
        lastUpdatedBy: "admin",
        lastUpdatedAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        _id: "ctrl_3",
        key: "signal_enrichment_enabled",
        value: false,
        type: "boolean",
        description: "Enable automatic enrichment of signals with additional metadata",
        category: "primary",
        lastUpdatedBy: "admin",
        lastUpdatedAt: Date.now() - 30 * 60 * 1000, // 30 minutes ago
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        _id: "ctrl_4",
        key: "data_retention_days",
        value: 90,
        type: "number",
        description: "Number of days to retain signal data before archival",
        category: "secondary",
        lastUpdatedBy: "admin",
        lastUpdatedAt: Date.now() - 24 * 60 * 60 * 1000, // 24 hours ago
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
      {
        _id: "ctrl_5",
        key: "notification_webhook_enabled",
        value: true,
        type: "boolean",
        description: "Send webhook notifications for new high-confidence signals",
        category: "secondary",
        lastUpdatedBy: "admin",
        lastUpdatedAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
      },
    ];
  },
});

export const isLLMProcessingEnabled = query({
  args: {},
  handler: async (ctx) => {
    // Check if LLM processing is enabled
    // In a real implementation, this would check the database
    return true; // Mock enabled state
  },
});

export const toggleControl = mutation({
  args: {
    key: v.string(),
    adminUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return a mock toggle result
    // In a real implementation, this would toggle the control in the database
    const currentValue = args.key === "signal_enrichment_enabled" ? false : true;
    const newValue = !currentValue;

    return {
      key: args.key,
      oldValue: currentValue,
      newValue: newValue,
      updatedBy: args.adminUserId,
      updatedAt: Date.now(),
    };
  },
});

export const setControlValue = mutation({
  args: {
    key: v.string(),
    value: v.union(v.boolean(), v.string(), v.number()),
    adminUserId: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, return a mock set result
    // In a real implementation, this would set the control value in the database
    return {
      key: args.key,
      value: args.value,
      updatedBy: args.adminUserId,
      updatedAt: Date.now(),
      description: args.description,
    };
  },
});

export const initializeDefaultControls = mutation({
  args: {
    adminUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, return a success response
    // In a real implementation, this would create default controls in the database
    return {
      success: true,
      controlsCreated: 5,
      createdBy: args.adminUserId,
      createdAt: Date.now(),
    };
  },
});