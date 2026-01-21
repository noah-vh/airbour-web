/**
 * Common TypeScript types and interfaces used across the application
 */

import { Id } from "../convex/_generated/dataModel";

// Base types
export type Priority = "low" | "medium" | "high" | "critical";
export type SignalStatus = "new" | "analyzing" | "validated" | "dismissed";
export type SentimentType = "positive" | "neutral" | "negative";
export type UserRole = "admin" | "member" | "viewer";
export type SourceType = "reddit" | "hackernews" | "github" | "universal" | "rss" | "twitter";
export type ContentPlatform = "twitter" | "linkedin" | "instagram" | "blog";
export type ContentStatus = "draft" | "approved" | "published" | "archived";
export type LLMOperationType = "classification" | "extraction" | "analysis" | "chat" | "generation";

// Team Member types
export interface TeamMember {
  _id: Id<"team_member_profiles">;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  joinedAt: number;
  lastActiveAt?: number;
  permissions?: string[];
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    push: boolean;
    mentions: boolean;
    signals: boolean;
    reports: boolean;
  };
  dashboard: {
    defaultView: "overview" | "signals" | "mentions" | "analytics";
    refreshInterval: number;
    compactMode: boolean;
  };
}

// Signal types
export interface Signal {
  _id: Id<"signals">;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  status: SignalStatus;
  confidence: number;
  impact: number;
  tags: string[];
  sourceUrl?: string;
  sourceType?: string;
  sourceMetadata?: Record<string, any>;
  assignedTo?: Id<"team_member_profiles">;
  createdAt: number;
  updatedAt: number;
  processedAt?: number;
  validatedBy?: Id<"team_member_profiles">;
  validatedAt?: number;
  dismissedBy?: Id<"team_member_profiles">;
  dismissedAt?: number;
  dismissalReason?: string;
}

// Mention types
export interface Mention {
  _id: Id<"mentions">;
  content: string;
  url: string;
  source: string;
  sourceType: SourceType;
  sentiment: SentimentType;
  relevanceScore: number;
  extractedAt: number;
  processedAt?: number;
  isProcessed: boolean;
  relatedSignal?: Id<"signals">;
  metadata?: MentionMetadata;
  tags?: string[];
  category?: string;
}

export interface MentionMetadata {
  author?: string;
  publishedAt?: number;
  engagement?: {
    likes?: number;
    shares?: number;
    comments?: number;
    views?: number;
  };
  location?: string;
  language?: string;
  customFields?: Record<string, any>;
}

// Content types
export interface ContentIdea {
  _id: Id<"content_ideas">;
  title: string;
  description: string;
  platform: ContentPlatform;
  contentType: string;
  tags: string[];
  priority: number;
  estimatedEffort: number;
  targetAudience?: string;
  generatedBy: string;
  createdAt: number;
  status: ContentStatus;
  assignedTo?: Id<"team_member_profiles">;
  scheduledFor?: number;
  publishedAt?: number;
  performance?: ContentPerformance;
}

export interface ContentPerformance {
  views?: number;
  engagements?: number;
  clicks?: number;
  shares?: number;
  comments?: number;
  reachRate?: number;
  engagementRate?: number;
}

// Source configuration types
export interface SourceConfig {
  _id: Id<"sources">;
  name: string;
  type: SourceType;
  isActive: boolean;
  config: SourceSpecificConfig;
  lastCollectionAt?: number;
  nextCollectionAt?: number;
  collectionFrequency: number;
  createdBy: Id<"team_member_profiles">;
  createdAt: number;
  updatedAt: number;
  stats?: SourceStats;
}

export type SourceSpecificConfig = {
  // Reddit
  subreddit?: string;
  sort?: "hot" | "new" | "top" | "rising";

  // GitHub
  query?: string;
  repo?: string;
  repoOwner?: string;
  repoName?: string;

  // HackerNews
  category?: "new" | "top" | "best" | "ask" | "show" | "jobs";

  // Universal/RSS
  url?: string;
  section?: string;

  // Twitter
  hashtags?: string[];
  users?: string[];
};

export interface SourceStats {
  totalMentions: number;
  mentionsThisWeek: number;
  averageRelevance: number;
  lastError?: string;
  errorCount: number;
  successRate: number;
}

// Analytics types
export interface AnalyticsData {
  signals: {
    total: number;
    new: number;
    validated: number;
    dismissed: number;
    byCategory: Record<string, number>;
    byPriority: Record<Priority, number>;
    trend: TrendData;
  };
  mentions: {
    total: number;
    processed: number;
    unprocessed: number;
    bySentiment: Record<SentimentType, number>;
    bySource: Record<string, number>;
    trend: TrendData;
  };
  team: {
    activeMembers: number;
    totalMembers: number;
    activity: ActivityData[];
  };
  performance: {
    averageProcessingTime: number;
    systemUptime: number;
    errorRate: number;
  };
}

export interface TrendData {
  labels: string[];
  values: number[];
  change: number; // percentage change from previous period
  direction: "up" | "down" | "stable";
}

export interface ActivityData {
  userId: Id<"team_member_profiles">;
  userName: string;
  signalsCreated: number;
  signalsValidated: number;
  contentGenerated: number;
  lastActiveAt: number;
}

// Chat types
export interface ChatConversation {
  _id: Id<"chat_conversations">;
  title?: string;
  participantId: Id<"team_member_profiles">;
  createdAt: number;
  updatedAt: number;
  messageCount: number;
  lastMessage?: string;
}

export interface ChatMessage {
  _id: Id<"chat_messages">;
  conversationId: Id<"chat_conversations">;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  contextSignals?: Id<"signals">[];
  contextMentions?: Id<"mentions">[];
  modelUsed?: string;
  tokensUsed?: number;
  cost?: number;
}

// Newsletter types
export interface Newsletter {
  _id: Id<"newsletters">;
  title: string;
  description?: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly";
  isActive: boolean;
  template: NewsletterTemplate;
  subscribers: NewsletterSubscriber[];
  createdBy: Id<"team_member_profiles">;
  createdAt: number;
  updatedAt: number;
  lastSentAt?: number;
  nextSendAt?: number;
}

export interface NewsletterTemplate {
  headerText?: string;
  footerText?: string;
  includeSections: ("signals" | "mentions" | "trending" | "insights")[];
  styling?: {
    primaryColor?: string;
    fontFamily?: string;
    layout?: "compact" | "expanded";
  };
}

export interface NewsletterSubscriber {
  email: string;
  subscribeAt: number;
  isActive: boolean;
  preferences?: {
    frequency?: "daily" | "weekly" | "biweekly" | "monthly";
    sections?: string[];
  };
}

// LLM Usage types
export interface LLMUsage {
  _id: Id<"llm_usage">;
  operationType: LLMOperationType;
  model: string;
  tokensUsed: number;
  cost: number;
  userId?: Id<"team_member_profiles">;
  timestamp: number;
  successful: boolean;
  errorMessage?: string;
}

// Admin types
export interface AdminControls {
  _id: Id<"admin_controls">;
  llm_classification_enabled: boolean;
  llm_extraction_enabled: boolean;
  llm_analysis_enabled: boolean;
  llm_chat_enabled: boolean;
  llm_generation_enabled: boolean;
  data_collection_enabled: boolean;
  notifications_enabled: boolean;
  auto_processing_enabled: boolean;
  updatedBy: Id<"team_member_profiles">;
  updatedAt: number;
}

// Search types
export interface SearchQuery {
  query: string;
  filters?: {
    dateRange?: { start?: number; end?: number };
    categories?: string[];
    sources?: string[];
    priority?: Priority;
    sentiment?: SentimentType;
    status?: SignalStatus;
  };
  sort?: {
    field: string;
    order: "asc" | "desc";
  };
  pagination?: {
    page: number;
    limit: number;
  };
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Export types
export interface ExportRequest {
  type: "signals" | "mentions" | "analytics" | "team";
  format: "csv" | "json" | "pdf" | "xlsx";
  dateRange?: { start: number; end: number };
  filters?: Record<string, any>;
  requestedBy: Id<"team_member_profiles">;
  requestedAt: number;
}

export interface ExportJob {
  _id: Id<"export_jobs">;
  request: ExportRequest;
  status: "pending" | "processing" | "completed" | "failed";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  error?: string;
  completedAt?: number;
}

// Notification types
export interface Notification {
  _id: Id<"notifications">;
  userId: Id<"team_member_profiles">;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  actionUrl?: string;
  actionLabel?: string;
  isRead: boolean;
  createdAt: number;
  readAt?: number;
  relatedEntityId?: string;
  relatedEntityType?: "signal" | "mention" | "content";
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: number;
}

// Utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Form types
export type FormState<T> = {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isSubmitting: boolean;
  isDirty: boolean;
  isValid: boolean;
};

// Filter and sort types
export type SortOrder = "asc" | "desc";
export type FilterOperator = "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "gte" | "lt" | "lte" | "in" | "notIn";

export interface Filter<T = any> {
  field: keyof T;
  operator: FilterOperator;
  value: any;
}

export interface SortConfig<T = any> {
  field: keyof T;
  order: SortOrder;
}