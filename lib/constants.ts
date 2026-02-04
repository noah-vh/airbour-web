/**
 * Application-wide constants
 */

export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical"
} as const;

export const SIGNAL_STATUSES = {
  NEW: "new",
  ANALYZING: "analyzing",
  VALIDATED: "validated",
  DISMISSED: "dismissed"
} as const;

export const CONTENT_PLATFORMS = {
  TWITTER: "twitter",
  LINKEDIN: "linkedin",
  INSTAGRAM: "instagram",
  BLOG: "blog"
} as const;

export const SENTIMENT_TYPES = {
  POSITIVE: "positive",
  NEUTRAL: "neutral",
  NEGATIVE: "negative"
} as const;

export const USER_ROLES = {
  ADMIN: "admin",
  MEMBER: "member",
  VIEWER: "viewer"
} as const;

export const SOURCE_TYPES = {
  REDDIT: "reddit",
  HACKERNEWS: "hackernews",
  GITHUB: "github",
  UNIVERSAL: "universal",
  RSS: "rss",
  TWITTER: "twitter"
} as const;

export const LLM_OPERATION_TYPES = {
  CLASSIFICATION: "classification",
  EXTRACTION: "extraction",
  ANALYSIS: "analysis",
  CHAT: "chat",
  GENERATION: "generation"
} as const;

export const CONTENT_STATUSES = {
  DRAFT: "draft",
  APPROVED: "approved",
  PUBLISHED: "published",
  ARCHIVED: "archived"
} as const;

// API Configuration
export const API_CONFIG = {
  OPENROUTER: {
    BASE_URL: "https://openrouter.ai/api/v1",
    MODELS: {
      CLAUDE_HAIKU: "anthropic/claude-3.5-haiku",
      CLAUDE_SONNET: "anthropic/claude-3.5-sonnet",
      GPT4_TURBO: "openai/gpt-4-turbo",
      GEMINI_PRO: "google/gemini-pro"
    },
    DEFAULT_TEMPERATURE: 0.7,
    DEFAULT_MAX_TOKENS: 2000
  },
  RATE_LIMITS: {
    CLASSIFICATION: 100, // per hour
    EXTRACTION: 50,
    ANALYSIS: 30,
    CHAT: 200,
    GENERATION: 20
  }
} as const;

// Time constants
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_PAGE: 1
} as const;

// Score ranges
export const SCORE_RANGES = {
  CONFIDENCE: { MIN: 0, MAX: 1 },
  IMPACT: { MIN: 0, MAX: 10 },
  RELEVANCE: { MIN: 0, MAX: 1 },
  PRIORITY: { MIN: 1, MAX: 10 }
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: ["image/jpeg", "image/png", "image/webp", "application/pdf", "text/csv"],
  MAX_FILES_PER_UPLOAD: 5
} as const;

// Dashboard refresh intervals (in milliseconds)
export const REFRESH_INTERVALS = {
  SIGNALS: 30 * 1000, // 30 seconds
  MENTIONS: 60 * 1000, // 1 minute
  ANALYTICS: 5 * 60 * 1000, // 5 minutes
  TEAM_STATUS: 2 * 60 * 1000 // 2 minutes
} as const;

// Color palette for charts and visualizations
// These work in both light and dark modes
export const CHART_COLORS = {
  PRIMARY: "hsl(var(--primary))",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  DANGER: "hsl(var(--destructive))",
  INFO: "#6366F1",
  NEUTRAL: "hsl(var(--muted-foreground))",
  GRADIENT_START: "hsl(var(--primary))",
  GRADIENT_END: "hsl(var(--muted))"
} as const;

// Static chart colors for libraries that need hex values
export const CHART_COLORS_STATIC = {
  PRIMARY: "#171717",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  DANGER: "#DC2626",
  INFO: "#6366F1",
  NEUTRAL: "#6B7280"
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: "Something went wrong. Please try again.",
  UNAUTHORIZED: "You don't have permission to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_FAILED: "Please check your input and try again.",
  RATE_LIMITED: "Too many requests. Please wait before trying again.",
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  API_KEY_MISSING: "API key is not configured.",
  LLM_DISABLED: "This operation is currently disabled by admin controls."
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  SAVED: "Changes saved successfully",
  DELETED: "Item deleted successfully",
  CREATED: "Item created successfully",
  UPDATED: "Item updated successfully",
  PUBLISHED: "Content published successfully",
  SENT: "Message sent successfully"
} as const;

// Feature flags
export const FEATURE_FLAGS = {
  ADVANCED_ANALYTICS: true,
  REAL_TIME_NOTIFICATIONS: true,
  EXPORT_FUNCTIONALITY: true,
  TEAM_COLLABORATION: true,
  AI_SUGGESTIONS: true,
  DARK_MODE: true
} as const;

// Analytics tracking events
export const ANALYTICS_EVENTS = {
  SIGNAL_CREATED: "signal_created",
  SIGNAL_VALIDATED: "signal_validated",
  MENTION_PROCESSED: "mention_processed",
  CONTENT_GENERATED: "content_generated",
  CHAT_MESSAGE_SENT: "chat_message_sent",
  EXPORT_INITIATED: "export_initiated",
  USER_LOGIN: "user_login",
  DASHBOARD_VIEWED: "dashboard_viewed"
} as const;

// Notification types
export const NOTIFICATION_TYPES = {
  INFO: "info",
  SUCCESS: "success",
  WARNING: "warning",
  ERROR: "error"
} as const;

// Export formats
export const EXPORT_FORMATS = {
  CSV: "csv",
  JSON: "json",
  PDF: "pdf",
  XLSX: "xlsx"
} as const;

// Search configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 50,
  DEBOUNCE_DELAY: 300 // milliseconds
} as const;

// Cron job schedules
export const CRON_SCHEDULES = {
  MENTION_PROCESSING: "0 */30 * * * *", // Every 30 minutes
  SIGNAL_ANALYSIS: "0 0 */4 * * *", // Every 4 hours
  DATA_CLEANUP: "0 0 2 * * *", // Daily at 2 AM
  ANALYTICS_AGGREGATION: "0 0 1 * * *", // Daily at 1 AM
  HEALTH_CHECK: "0 */5 * * * *" // Every 5 minutes
} as const;