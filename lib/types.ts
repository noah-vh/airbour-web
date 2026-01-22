// Type definitions for mock data
export interface Source {
  _id: string;
  name: string;
  url: string;
  type: string;
  status: string;
  credibility: number;
  lastCrawled: number;
  signalsFound: number;
}

export interface TeamProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  phone?: string;
  location?: string;
  joinDate?: string;
  bio?: string;
  avatarUrl?: string;
  isActive: boolean;
  primaryExpertise: string[];
  communicationStyle: {
    tone: string;
    formality: string;
    preferredFormats?: string[];
  };
}

export interface DocumentStats {
  totalDocuments: number;
  completedThisMonth: number;
  averageConfidence: number;
}

export interface PersonalDocument {
  _id: string;
  title: string;
  type: string;
  status: string;
  lastUpdated: string;
  confidenceScore: number;
}

export interface Newsletter {
  _id: string;
  title: string;
  status: string;
  sentDate: string;
  openRate: number;
  clickRate: number;
  subscribers: number;
}

export interface Mention {
  _id: string;
  content: string;
  source: string;
  url: string;
  sentiment: number;
  timestamp: number;
  relevance: number;
}

export interface AdminControl {
  _id: string;
  key: string;
  label?: string;
  description: string;
  type: "boolean" | "number" | "string";
  value: boolean | number | string;
  category: string;
  order?: number;
  lastUpdatedBy?: string;
  lastUpdatedAt?: number;
  createdAt?: number;
}

export interface Signal {
  _id: string;
  title: string;
  description: string;
  source: string;
  url: string;
  relevance: number;
  confidence: number;
  timestamp: number;
  status: "active" | "inactive" | "archived";
  category: string;
  tags: string[];
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  meta?: any;
}

export class ApiError extends Error {
  code?: string;
  status?: number;
  data?: any;

  constructor(code: string = "UNKNOWN", message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = data?.status;
    this.data = data;
  }
}

export interface SearchQuery {
  query: string;
  filters?: Record<string, any>;
  page?: number;
  limit?: number;
}

export interface FormState<T = Record<string, any>> {
  isSubmitting: boolean;
  errors: Partial<Record<keyof T, string>>;
  data: T;
  isDirty?: boolean;
  isValid?: boolean;
}