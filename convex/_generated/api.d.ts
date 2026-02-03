/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions_analyzeDocument from "../actions/analyzeDocument.js";
import type * as actions_chat from "../actions/chat.js";
import type * as actions_classify from "../actions/classify.js";
import type * as actions_contentGeneration from "../actions/contentGeneration.js";
import type * as actions_enrichSignal from "../actions/enrichSignal.js";
import type * as actions_generateContentIdeas from "../actions/generateContentIdeas.js";
import type * as actions_generateNewsletter from "../actions/generateNewsletter.js";
import type * as actions_generatePersonalizedContent from "../actions/generatePersonalizedContent.js";
import type * as actions_newsletterGeneration from "../actions/newsletterGeneration.js";
import type * as actions_testOpenRouter from "../actions/testOpenRouter.js";
import type * as adminControls from "../adminControls.js";
import type * as chat from "../chat.js";
import type * as classificationCache from "../classificationCache.js";
import type * as collectionRuns from "../collectionRuns.js";
import type * as collectors_github from "../collectors/github.js";
import type * as collectors_hackernews from "../collectors/hackernews.js";
import type * as collectors_index from "../collectors/index.js";
import type * as collectors_producthunt from "../collectors/producthunt.js";
import type * as collectors_reddit from "../collectors/reddit.js";
import type * as collectors_rssNews from "../collectors/rssNews.js";
import type * as contentDrafts from "../contentDrafts.js";
import type * as contentIdeas from "../contentIdeas.js";
import type * as contentIdeation from "../contentIdeation.js";
import type * as diagnostics from "../diagnostics.js";
import type * as lib_rate_limiter from "../lib/rate_limiter.js";
import type * as lightweight from "../lightweight.js";
import type * as mentions from "../mentions.js";
import type * as metrics from "../metrics.js";
import type * as newsletters from "../newsletters.js";
import type * as personalDocuments from "../personalDocuments.js";
import type * as platformFormats from "../platformFormats.js";
import type * as processingJobs from "../processingJobs.js";
import type * as rateLimiter from "../rateLimiter.js";
import type * as seed_platformFormats from "../seed/platformFormats.js";
import type * as signals from "../signals.js";
import type * as sources from "../sources.js";
import type * as teamProfiles from "../teamProfiles.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "actions/analyzeDocument": typeof actions_analyzeDocument;
  "actions/chat": typeof actions_chat;
  "actions/classify": typeof actions_classify;
  "actions/contentGeneration": typeof actions_contentGeneration;
  "actions/enrichSignal": typeof actions_enrichSignal;
  "actions/generateContentIdeas": typeof actions_generateContentIdeas;
  "actions/generateNewsletter": typeof actions_generateNewsletter;
  "actions/generatePersonalizedContent": typeof actions_generatePersonalizedContent;
  "actions/newsletterGeneration": typeof actions_newsletterGeneration;
  "actions/testOpenRouter": typeof actions_testOpenRouter;
  adminControls: typeof adminControls;
  chat: typeof chat;
  classificationCache: typeof classificationCache;
  collectionRuns: typeof collectionRuns;
  "collectors/github": typeof collectors_github;
  "collectors/hackernews": typeof collectors_hackernews;
  "collectors/index": typeof collectors_index;
  "collectors/producthunt": typeof collectors_producthunt;
  "collectors/reddit": typeof collectors_reddit;
  "collectors/rssNews": typeof collectors_rssNews;
  contentDrafts: typeof contentDrafts;
  contentIdeas: typeof contentIdeas;
  contentIdeation: typeof contentIdeation;
  diagnostics: typeof diagnostics;
  "lib/rate_limiter": typeof lib_rate_limiter;
  lightweight: typeof lightweight;
  mentions: typeof mentions;
  metrics: typeof metrics;
  newsletters: typeof newsletters;
  personalDocuments: typeof personalDocuments;
  platformFormats: typeof platformFormats;
  processingJobs: typeof processingJobs;
  rateLimiter: typeof rateLimiter;
  "seed/platformFormats": typeof seed_platformFormats;
  signals: typeof signals;
  sources: typeof sources;
  teamProfiles: typeof teamProfiles;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
