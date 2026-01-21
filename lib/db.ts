/**
 * Database utility functions for common operations
 */

import { v } from "convex/values";
import { Id } from "../convex/_generated/dataModel";

/**
 * Common database schemas used across the application
 */
export const schemas = {
  teamMember: v.object({
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("admin"), v.literal("member"), v.literal("viewer")),
    avatar: v.optional(v.string()),
    isActive: v.boolean(),
    joinedAt: v.number(),
  }),

  signal: v.object({
    title: v.string(),
    description: v.string(),
    category: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(v.literal("new"), v.literal("analyzing"), v.literal("validated"), v.literal("dismissed")),
    confidence: v.number(),
    impact: v.number(),
    tags: v.array(v.string()),
    sourceUrl: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }),

  mention: v.object({
    content: v.string(),
    url: v.string(),
    source: v.string(),
    sourceType: v.string(),
    sentiment: v.union(v.literal("positive"), v.literal("neutral"), v.literal("negative")),
    relevanceScore: v.number(),
    extractedAt: v.number(),
    processedAt: v.optional(v.number()),
    isProcessed: v.boolean(),
    metadata: v.optional(v.object({
      author: v.optional(v.string()),
      publishedAt: v.optional(v.number()),
      engagement: v.optional(v.object({
        likes: v.optional(v.number()),
        shares: v.optional(v.number()),
        comments: v.optional(v.number()),
      })),
    })),
  }),

  contentIdea: v.object({
    title: v.string(),
    description: v.string(),
    platform: v.union(v.literal("twitter"), v.literal("linkedin"), v.literal("instagram"), v.literal("blog")),
    contentType: v.string(),
    tags: v.array(v.string()),
    priority: v.number(),
    estimatedEffort: v.number(),
    targetAudience: v.optional(v.string()),
    generatedBy: v.string(),
    createdAt: v.number(),
    status: v.union(v.literal("draft"), v.literal("approved"), v.literal("published"), v.literal("archived")),
  }),
};

/**
 * Common validation functions
 */
export const validators = {
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  isValidId: <T extends string>(id: string): id is Id<T> => {
    return typeof id === "string" && id.length > 0;
  },

  sanitizeString: (str: string): string => {
    return str.trim().replace(/[<>]/g, "");
  },

  validatePriority: (priority: string): boolean => {
    return ["low", "medium", "high", "critical"].includes(priority);
  },

  validateStatus: (status: string): boolean => {
    return ["new", "analyzing", "validated", "dismissed"].includes(status);
  },
};

/**
 * Common query helpers
 */
export const queryHelpers = {
  /**
   * Build pagination parameters
   */
  buildPagination: (page: number = 1, limit: number = 20) => {
    const offset = (page - 1) * limit;
    return { offset, limit };
  },

  /**
   * Build date range filter
   */
  buildDateRange: (startDate?: number, endDate?: number) => {
    const range: { gte?: number; lte?: number } = {};
    if (startDate) range.gte = startDate;
    if (endDate) range.lte = endDate;
    return range;
  },

  /**
   * Build text search filter
   */
  buildTextSearch: (query: string) => {
    return query.toLowerCase().trim();
  },

  /**
   * Build sort parameters
   */
  buildSort: (sortBy: string = "createdAt", order: "asc" | "desc" = "desc") => {
    return { field: sortBy, order };
  },
};

/**
 * Error handling utilities
 */
export const errorHandlers = {
  /**
   * Handle database operation errors
   */
  handleDbError: (error: any, operation: string) => {
    console.error(`Database error in ${operation}:`, error);

    if (error.message?.includes("not found")) {
      throw new Error(`Resource not found for ${operation}`);
    }

    if (error.message?.includes("permission")) {
      throw new Error(`Permission denied for ${operation}`);
    }

    if (error.message?.includes("validation")) {
      throw new Error(`Validation failed for ${operation}: ${error.message}`);
    }

    throw new Error(`Database operation failed: ${operation}`);
  },

  /**
   * Validate required fields
   */
  validateRequired: (data: Record<string, any>, requiredFields: string[]) => {
    const missing = requiredFields.filter(field =>
      data[field] === undefined || data[field] === null || data[field] === ""
    );

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(", ")}`);
    }
  },
};

/**
 * Common aggregation helpers
 */
export const aggregationHelpers = {
  /**
   * Calculate average from array of numbers
   */
  average: (numbers: number[]): number => {
    if (numbers.length === 0) return 0;
    return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  },

  /**
   * Group items by a key
   */
  groupBy: <T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> => {
    return items.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  /**
   * Calculate percentile
   */
  percentile: (numbers: number[], p: number): number => {
    if (numbers.length === 0) return 0;
    const sorted = [...numbers].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * (p / 100)) - 1;
    return sorted[Math.max(0, index)];
  },
};

/**
 * Time utilities for database operations
 */
export const timeUtils = {
  /**
   * Get start of day timestamp
   */
  startOfDay: (timestamp: number = Date.now()): number => {
    const date = new Date(timestamp);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  },

  /**
   * Get end of day timestamp
   */
  endOfDay: (timestamp: number = Date.now()): number => {
    const date = new Date(timestamp);
    date.setHours(23, 59, 59, 999);
    return date.getTime();
  },

  /**
   * Get timestamp N days ago
   */
  daysAgo: (days: number): number => {
    return Date.now() - (days * 24 * 60 * 60 * 1000);
  },

  /**
   * Get timestamp for start of week
   */
  startOfWeek: (timestamp: number = Date.now()): number => {
    const date = new Date(timestamp);
    const day = date.getDay();
    const diff = date.getDate() - day;
    const sunday = new Date(date.setDate(diff));
    sunday.setHours(0, 0, 0, 0);
    return sunday.getTime();
  },
};