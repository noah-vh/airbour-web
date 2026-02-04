"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

export const collectHackerNewsManual: ReturnType<typeof action> = action({
  args: {
    storyTypes: v.array(v.string()), // ["top", "new", "best", "ask", "show"]
    limit: v.optional(v.number()),
    keywords: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Mock manual Hacker News collection
    const mockSignals = [];
    const storyTypes = args.storyTypes;
    const limit = args.limit || 10;

    for (const storyType of storyTypes) {
      for (let i = 0; i < Math.min(limit, 5); i++) {
        mockSignals.push({
          id: `hn_manual_${Date.now()}_${storyType}_${i}`,
          source: "hackernews",
          type: `hn_${storyType}`,
          title: `${storyType.toUpperCase()} HN Story: Innovative Technology Breakthrough ${i + 1}`,
          description: `A compelling story from Hacker News ${storyType} section about emerging technology trends`,
          url: `https://news.ycombinator.com/item?id=${Math.floor(Math.random() * 1000000)}`,
          author: `hn_user_${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          metrics: {
            score: Math.floor(Math.random() * 500),
            comments: Math.floor(Math.random() * 100),
            rank: i + 1,
          },
          keywords: args.keywords || ["hackernews", "technology", "startup"],
          hnData: {
            storyId: Math.floor(Math.random() * 1000000),
            storyType: storyType,
            descendants: Math.floor(Math.random() * 100),
          },
        });
      }
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      source: "hackernews",
      timestamp: new Date().toISOString(),
    };
  },
});

export const collectHackerNews: ReturnType<typeof action> = action({
  args: {
    sourceId: v.id("sources"),
    config: v.optional(v.object({
      storyTypes: v.optional(v.array(v.string())),
      minScore: v.optional(v.number()),
      maxAge: v.optional(v.number()), // hours
      keywords: v.optional(v.array(v.string())),
      excludeKeywords: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // Mock automated Hacker News collection
    const storyTypes = args.config?.storyTypes || ["top", "best"];
    const minScore = args.config?.minScore || 50;
    const mockSignals = [];

    for (const storyType of storyTypes) {
      // Generate mock stories that meet criteria
      const storyCount = Math.floor(Math.random() * 10) + 5;

      for (let i = 0; i < storyCount; i++) {
        const score = minScore + Math.floor(Math.random() * 200);
        const age = Math.random() * (args.config?.maxAge || 24);

        mockSignals.push({
          id: `hn_auto_${Date.now()}_${storyType}_${i}`,
          sourceId: args.sourceId,
          source: "hackernews",
          type: `hn_${storyType}`,
          title: `HN ${storyType}: AI/Tech Innovation Story ${i + 1}`,
          description: `High-scoring story from Hacker News about technology innovation and emerging trends`,
          url: `https://news.ycombinator.com/item?id=${Math.floor(Math.random() * 1000000)}`,
          author: `hn_user_${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(Date.now() - age * 3600000).toISOString(),
          metrics: {
            score: score,
            comments: Math.floor(Math.random() * 150),
            rank: i + 1,
          },
          keywords: args.config?.keywords || ["hackernews", "technology", "innovation"],
          hnData: {
            storyId: Math.floor(Math.random() * 1000000),
            storyType: storyType,
            descendants: Math.floor(Math.random() * 150),
            time: Math.floor((Date.now() - age * 3600000) / 1000),
          },
        });
      }
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      sourceId: args.sourceId,
      timestamp: new Date().toISOString(),
      criteria: {
        storyTypes,
        minScore,
        maxAge: args.config?.maxAge || 24,
      },
    };
  },
});