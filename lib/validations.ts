/**
 * Validation utilities for form inputs and data validation
 */

import { z } from "zod";
import { PRIORITIES, SENTIMENT_TYPES, USER_ROLES, SOURCE_TYPES } from "./constants";

// Base schemas
export const emailSchema = z.string().email("Please enter a valid email address");
export const urlSchema = z.string().url("Please enter a valid URL");
export const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]{10,}$/, "Please enter a valid phone number");
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

// Team member validation
export const teamMemberSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name is too long"),
  email: emailSchema,
  role: z.enum([USER_ROLES.ADMIN, USER_ROLES.MEMBER, USER_ROLES.VIEWER]),
  avatar: z.string().url().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

// Signal validation
export const signalSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description is too long"),
  category: z.string().min(2, "Category is required"),
  priority: z.enum([PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH, PRIORITIES.CRITICAL]),
  confidence: z.number().min(0).max(1, "Confidence must be between 0 and 1"),
  impact: z.number().min(0).max(10, "Impact must be between 0 and 10"),
  tags: z.array(z.string().min(1)).max(10, "Maximum 10 tags allowed"),
  sourceUrl: urlSchema.optional().or(z.literal("")),
  sourceType: z.string().optional(),
});

// Mention validation
export const mentionSchema = z.object({
  content: z.string().min(1, "Content is required").max(5000, "Content is too long"),
  url: urlSchema,
  source: z.string().min(1, "Source is required"),
  sourceType: z.enum([SOURCE_TYPES.REDDIT, SOURCE_TYPES.HACKERNEWS, SOURCE_TYPES.GITHUB, SOURCE_TYPES.UNIVERSAL, SOURCE_TYPES.RSS, SOURCE_TYPES.TWITTER]),
  sentiment: z.enum([SENTIMENT_TYPES.POSITIVE, SENTIMENT_TYPES.NEUTRAL, SENTIMENT_TYPES.NEGATIVE]),
  relevanceScore: z.number().min(0).max(1, "Relevance score must be between 0 and 1"),
});

// Content idea validation
export const contentIdeaSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000, "Description is too long"),
  platform: z.enum(["twitter", "linkedin", "instagram", "blog"]),
  contentType: z.string().min(1, "Content type is required"),
  tags: z.array(z.string().min(1)).max(10, "Maximum 10 tags allowed"),
  priority: z.number().min(1).max(10, "Priority must be between 1 and 10"),
  estimatedEffort: z.number().min(1).max(10, "Estimated effort must be between 1 and 10"),
  targetAudience: z.string().max(200, "Target audience description is too long").optional(),
});

// Source configuration validation
export const sourceConfigSchema = z.object({
  name: z.string().min(2, "Source name must be at least 2 characters").max(100, "Source name is too long"),
  type: z.enum([SOURCE_TYPES.REDDIT, SOURCE_TYPES.HACKERNEWS, SOURCE_TYPES.GITHUB, SOURCE_TYPES.UNIVERSAL, SOURCE_TYPES.RSS, SOURCE_TYPES.TWITTER]),
  isActive: z.boolean().default(true),
  config: z.object({
    // Reddit specific
    subreddit: z.string().optional(),
    sort: z.enum(["hot", "new", "top", "rising"]).optional(),

    // GitHub specific
    query: z.string().optional(),
    repo: z.string().optional(),
    repoOwner: z.string().optional(),
    repoName: z.string().optional(),

    // HackerNews specific
    category: z.enum(["new", "top", "best", "ask", "show", "jobs"]).optional(),

    // Universal/RSS specific
    url: urlSchema.optional(),
    section: z.string().optional(),
  }),
});

// Chat message validation
export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(2000, "Message is too long"),
  conversationId: z.string().optional(),
  contextSignalIds: z.array(z.string()).optional(),
  contextMentionIds: z.array(z.string()).optional(),
});

// Newsletter validation
export const newsletterSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200, "Title is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  frequency: z.enum(["daily", "weekly", "biweekly", "monthly"]),
  isActive: z.boolean().default(true),
  template: z.object({
    headerText: z.string().max(200, "Header text is too long").optional(),
    footerText: z.string().max(200, "Footer text is too long").optional(),
    includeSections: z.array(z.enum(["signals", "mentions", "trending", "insights"])),
  }),
});

// Search validation
export const searchSchema = z.object({
  query: z.string().min(2, "Search query must be at least 2 characters").max(200, "Search query is too long"),
  filters: z.object({
    dateRange: z.object({
      start: z.number().optional(),
      end: z.number().optional(),
    }).optional(),
    categories: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    priority: z.enum([PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH, PRIORITIES.CRITICAL]).optional(),
    sentiment: z.enum([SENTIMENT_TYPES.POSITIVE, SENTIMENT_TYPES.NEUTRAL, SENTIMENT_TYPES.NEGATIVE]).optional(),
  }).optional(),
  sort: z.object({
    field: z.string().default("createdAt"),
    order: z.enum(["asc", "desc"]).default("desc"),
  }).optional(),
  pagination: z.object({
    page: z.number().min(1).default(1),
    limit: z.number().min(1).max(100).default(20),
  }).optional(),
});

// Admin controls validation
export const adminControlsSchema = z.object({
  llm_classification_enabled: z.boolean().default(true),
  llm_extraction_enabled: z.boolean().default(true),
  llm_analysis_enabled: z.boolean().default(true),
  llm_chat_enabled: z.boolean().default(true),
  llm_generation_enabled: z.boolean().default(true),
  data_collection_enabled: z.boolean().default(true),
  notifications_enabled: z.boolean().default(true),
  auto_processing_enabled: z.boolean().default(true),
});

// File upload validation
export const fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  type: z.string().min(1, "File type is required"),
  size: z.number().max(10 * 1024 * 1024, "File size cannot exceed 10MB"),
});

// Export validation
export const exportSchema = z.object({
  type: z.enum(["signals", "mentions", "analytics", "team"]),
  format: z.enum(["csv", "json", "pdf", "xlsx"]),
  dateRange: z.object({
    start: z.number(),
    end: z.number(),
  }).optional(),
  filters: z.object({
    categories: z.array(z.string()).optional(),
    sources: z.array(z.string()).optional(),
    priority: z.enum([PRIORITIES.LOW, PRIORITIES.MEDIUM, PRIORITIES.HIGH, PRIORITIES.CRITICAL]).optional(),
  }).optional(),
});

/**
 * Validation helper functions
 */
export const validationHelpers = {
  /**
   * Safely parse and validate data with a schema
   */
  safeValidate: <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } => {
    try {
      const result = schema.parse(data);
      return { success: true, data: result };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.issues[0];
        return {
          success: false,
          error: firstError?.message || "Validation failed"
        };
      }
      return { success: false, error: "Validation failed" };
    }
  },

  /**
   * Get all validation errors as array
   */
  getAllErrors: (schema: z.ZodSchema, data: unknown): string[] => {
    try {
      schema.parse(data);
      return [];
    } catch (error) {
      if (error instanceof z.ZodError) {
        return error.issues.map((issue: z.ZodIssue) => `${issue.path.join(".")}: ${issue.message}`);
      }
      return ["Validation failed"];
    }
  },

  /**
   * Check if string is a valid UUID
   */
  isValidUUID: (str: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  },

  /**
   * Sanitize HTML content
   */
  sanitizeHtml: (html: string): string => {
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
      .replace(/javascript:/gi, "")
      .replace(/on\w+="[^"]*"/gi, "");
  },

  /**
   * Validate file type
   */
  isValidFileType: (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.toLowerCase().split(".").pop();
    return allowedTypes.includes(`.${extension}`);
  },

  /**
   * Validate text length with word count
   */
  validateTextLength: (text: string, minWords: number, maxWords: number): { valid: boolean; wordCount: number } => {
    const wordCount = text.trim().split(/\s+/).length;
    return {
      valid: wordCount >= minWords && wordCount <= maxWords,
      wordCount
    };
  },
};

// Type inference helpers
export type TeamMember = z.infer<typeof teamMemberSchema>;
export type Signal = z.infer<typeof signalSchema>;
export type Mention = z.infer<typeof mentionSchema>;
export type ContentIdea = z.infer<typeof contentIdeaSchema>;
export type SourceConfig = z.infer<typeof sourceConfigSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Newsletter = z.infer<typeof newsletterSchema>;
export type SearchQuery = z.infer<typeof searchSchema>;
export type AdminControls = z.infer<typeof adminControlsSchema>;
export type FileUpload = z.infer<typeof fileUploadSchema>;
export type ExportRequest = z.infer<typeof exportSchema>;