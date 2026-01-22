import { type FunctionReference, anyApi } from "convex/server";
import { type GenericId as Id } from "convex/values";

export const api: PublicApiType = anyApi as unknown as PublicApiType;
export const internal: InternalApiType = anyApi as unknown as InternalApiType;

export type PublicApiType = {
  adminControls: {
    getAdminControls: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    isLLMProcessingEnabled: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    toggleControl: FunctionReference<
      "mutation",
      "public",
      { adminUserId: string; key: string },
      any
    >;
    setControlValue: FunctionReference<
      "mutation",
      "public",
      {
        adminUserId: string;
        description?: string;
        key: string;
        value: boolean | string | number;
      },
      any
    >;
    initializeDefaultControls: FunctionReference<
      "mutation",
      "public",
      { adminUserId: string },
      any
    >;
  };
  signals: {
    listSignals: FunctionReference<
      "query",
      "public",
      {
        lifecycle?: Array<string>;
        limit?: number;
        search?: string;
        status?: string;
        steep?: Array<string>;
      },
      any
    >;
    getSignalStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    createSignal: FunctionReference<
      "mutation",
      "public",
      {
        confidence: number;
        description: string;
        keywords: Array<string>;
        lifecycle: string;
        name: string;
        steep: Array<string>;
      },
      any
    >;
    updateSignal: FunctionReference<
      "mutation",
      "public",
      {
        confidence: number;
        description: string;
        id: string;
        keywords: Array<string>;
        lifecycle: string;
        name: string;
        steep: Array<string>;
      },
      any
    >;
    deleteSignal: FunctionReference<"mutation", "public", { id: string }, any>;
    deleteSignals: FunctionReference<
      "mutation",
      "public",
      { ids: Array<string> },
      any
    >;
  };
  sources: {
    listSources: FunctionReference<
      "query",
      "public",
      { limit?: number; search?: string; status?: string; type?: string },
      any
    >;
    getSourceStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    createSource: FunctionReference<
      "mutation",
      "public",
      {
        categories?: Array<string>;
        description?: string;
        isActive?: boolean;
        keywords?: Array<string>;
        name: string;
        type: string;
        url: string;
      },
      any
    >;
    updateSource: FunctionReference<
      "mutation",
      "public",
      {
        categories?: Array<string>;
        description?: string;
        id: Id<"sources">;
        isActive?: boolean;
        keywords?: Array<string>;
        name?: string;
        status?: string;
        type?: string;
        url?: string;
      },
      any
    >;
    deleteSource: FunctionReference<
      "mutation",
      "public",
      { id: Id<"sources"> },
      any
    >;
    refreshSource: FunctionReference<
      "mutation",
      "public",
      { id: Id<"sources"> },
      any
    >;
    refreshAllSources: FunctionReference<
      "mutation",
      "public",
      Record<string, never>,
      any
    >;
  };
  mentions: {
    listMentions: FunctionReference<
      "query",
      "public",
      { limit?: number; search?: string },
      any
    >;
    getMention: FunctionReference<
      "query",
      "public",
      { id: Id<"raw_mentions"> },
      any
    >;
    getMentionById: FunctionReference<"query", "public", { id: string }, any>;
    getProcessed: FunctionReference<"query", "public", { limit?: number }, any>;
    createRawMention: FunctionReference<
      "mutation",
      "public",
      {
        author?: string;
        content?: string;
        contentHash?: string;
        externalId?: string;
        fetchedAt?: number;
        isDuplicate?: boolean;
        matchConfidence?: string;
      },
      any
    >;
    deleteMention: FunctionReference<
      "mutation",
      "public",
      { id: Id<"raw_mentions"> },
      any
    >;
  };
  metrics: {
    getSignalMetrics: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getDashboardStats: FunctionReference<
      "query",
      "public",
      Record<string, never>,
      any
    >;
    getTrendingSignals: FunctionReference<
      "query",
      "public",
      { limit?: number },
      any
    >;
    getRecentlyActiveSignals: FunctionReference<
      "query",
      "public",
      { limit?: number },
      any
    >;
  };
};
export type InternalApiType = {};
