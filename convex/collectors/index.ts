"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

// Import individual collectors
import { collectGitHub, collectGitHubManual } from "./github";
import { collectHackerNews, collectHackerNewsManual } from "./hackernews";
import { collectProductHunt, collectProductHuntManual } from "./producthunt";
import { collectReddit, collectRedditManual } from "./reddit";
import { collectRSSNews, collectRSSNewsManual } from "./rssNews";

export const collectAllDueSources = action({
  args: {
    forceRefresh: v.optional(v.boolean()),
    sourceTypes: v.optional(v.array(v.string())),
    batchSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Mock collection of all due sources
    const forceRefresh = args.forceRefresh || false;
    const sourceTypes = args.sourceTypes || ["github", "hackernews", "producthunt", "reddit", "rss_news"];
    const batchSize = args.batchSize || 10;
    const mockResults = [];

    // Simulate finding due sources
    const dueSources = sourceTypes.map((type, index) => ({
      _id: `source_${type}_${index}` as any,
      name: `${type} Source ${index + 1}`,
      type: type,
      url: `https://api.${type}.com/feed`,
      lastCollected: forceRefresh ? null : new Date(Date.now() - Math.random() * 86400000 * 2).toISOString(),
      isActive: true,
      config: {},
    }));

    // Process sources in batches
    for (let i = 0; i < dueSources.length; i += batchSize) {
      const batch = dueSources.slice(i, i + batchSize);

      for (const source of batch) {
        try {
          let result;

          // Route to appropriate collector based on source type
          switch (source.type) {
            case "github":
              result = await ctx.runAction(collectGitHub, {
                sourceId: source._id,
                config: source.config
              });
              break;
            case "hackernews":
              result = await ctx.runAction(collectHackerNews, {
                sourceId: source._id,
                config: source.config
              });
              break;
            case "producthunt":
              result = await ctx.runAction(collectProductHunt, {
                sourceId: source._id,
                config: source.config
              });
              break;
            case "reddit":
              result = await ctx.runAction(collectReddit, {
                sourceId: source._id,
                config: source.config
              });
              break;
            case "rss_news":
              result = await ctx.runAction(collectRSSNews, {
                sourceId: source._id,
                config: source.config
              });
              break;
            default:
              result = {
                success: false,
                error: `Unknown source type: ${source.type}`,
                sourceId: source._id,
              };
          }

          mockResults.push({
            sourceId: source._id,
            sourceName: source.name,
            sourceType: source.type,
            ...result,
          });

        } catch (error) {
          mockResults.push({
            sourceId: source._id,
            sourceName: source.name,
            sourceType: source.type,
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          });
        }
      }
    }

    const successCount = mockResults.filter(r => r.success).length;
    const totalSignals = mockResults.reduce((sum, r) => sum + (r.collected || 0), 0);

    return {
      success: true,
      processed: mockResults.length,
      successful: successCount,
      failed: mockResults.length - successCount,
      totalSignalsCollected: totalSignals,
      results: mockResults,
      timestamp: new Date().toISOString(),
      batchInfo: {
        batchSize,
        totalBatches: Math.ceil(dueSources.length / batchSize),
      },
    };
  },
});

export const collectFromSource = action({
  args: {
    sourceId: v.id("sources"),
    forceRefresh: v.optional(v.boolean()),
    config: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Mock single source collection
    // In real implementation, this would fetch the source from DB
    const mockSource = {
      _id: args.sourceId,
      name: "Mock Source",
      type: "github", // Default to github for mock
      url: "https://api.github.com",
      config: args.config || {},
      lastCollected: args.forceRefresh ? null : new Date(Date.now() - 3600000).toISOString(),
    };

    try {
      let result;

      // Route to appropriate collector
      switch (mockSource.type) {
        case "github":
          result = await ctx.runAction(collectGitHub, {
            sourceId: args.sourceId,
            config: { ...mockSource.config, ...args.config },
          });
          break;
        case "hackernews":
          result = await ctx.runAction(collectHackerNews, {
            sourceId: args.sourceId,
            config: { ...mockSource.config, ...args.config },
          });
          break;
        case "producthunt":
          result = await ctx.runAction(collectProductHunt, {
            sourceId: args.sourceId,
            config: { ...mockSource.config, ...args.config },
          });
          break;
        case "reddit":
          result = await ctx.runAction(collectReddit, {
            sourceId: args.sourceId,
            config: { ...mockSource.config, ...args.config },
          });
          break;
        case "rss_news":
          result = await ctx.runAction(collectRSSNews, {
            sourceId: args.sourceId,
            config: { ...mockSource.config, ...args.config },
          });
          break;
        default:
          throw new Error(`Unsupported source type: ${mockSource.type}`);
      }

      return {
        ...result,
        sourceId: args.sourceId,
        sourceName: mockSource.name,
        sourceType: mockSource.type,
        forceRefresh: args.forceRefresh,
      };

    } catch (error) {
      return {
        success: false,
        sourceId: args.sourceId,
        sourceName: mockSource.name,
        sourceType: mockSource.type,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      };
    }
  },
});

export const collectSourceManual = action({
  args: {
    sourceType: v.string(),
    config: v.any(),
    metadata: v.optional(v.object({
      userId: v.optional(v.string()),
      sessionId: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // Mock manual collection for any source type
    try {
      let result;

      // Route to appropriate manual collector
      switch (args.sourceType) {
        case "github":
          result = await ctx.runAction(collectGitHubManual, args.config);
          break;
        case "hackernews":
          result = await ctx.runAction(collectHackerNewsManual, args.config);
          break;
        case "producthunt":
          result = await ctx.runAction(collectProductHuntManual, args.config);
          break;
        case "reddit":
          result = await ctx.runAction(collectRedditManual, args.config);
          break;
        case "rss_news":
          result = await ctx.runAction(collectRSSNewsManual, args.config);
          break;
        default:
          throw new Error(`Unsupported source type for manual collection: ${args.sourceType}`);
      }

      return {
        ...result,
        sourceType: args.sourceType,
        isManual: true,
        metadata: args.metadata,
        timestamp: new Date().toISOString(),
      };

    } catch (error) {
      return {
        success: false,
        sourceType: args.sourceType,
        isManual: true,
        error: error instanceof Error ? error.message : "Unknown error",
        metadata: args.metadata,
        timestamp: new Date().toISOString(),
      };
    }
  },
});

// Re-export individual collectors for direct access
export {
  collectGitHub,
  collectGitHubManual,
  collectHackerNews,
  collectHackerNewsManual,
  collectProductHunt,
  collectProductHuntManual,
  collectReddit,
  collectRedditManual,
  collectRSSNews,
  collectRSSNewsManual,
};