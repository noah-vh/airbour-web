"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";

export const collectRedditManual: ReturnType<typeof action> = action({
  args: {
    subreddits: v.array(v.string()),
    sortBy: v.optional(v.string()), // "hot", "new", "top", "rising"
    timeframe: v.optional(v.string()), // "hour", "day", "week", "month", "year", "all"
    minScore: v.optional(v.number()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Mock manual Reddit collection
    const mockSignals = [];
    const subreddits = args.subreddits;
    const sortBy = args.sortBy || "hot";
    const limit = args.limit || 25;
    const minScore = args.minScore || 10;

    for (const subreddit of subreddits) {
      const postCount = Math.min(limit, Math.floor(Math.random() * 15) + 5);

      for (let i = 0; i < postCount; i++) {
        const score = minScore + Math.floor(Math.random() * 1000);
        const comments = Math.floor(Math.random() * 200);

        mockSignals.push({
          id: `reddit_manual_${Date.now()}_${subreddit}_${i}`,
          source: "reddit",
          type: "reddit_post",
          title: `r/${subreddit}: Trending Discussion ${i + 1}`,
          description: `Popular discussion from r/${subreddit} with ${score} upvotes and ${comments} comments`,
          url: `https://www.reddit.com/r/${subreddit}/comments/abc123/trending-discussion-${i + 1}/`,
          author: `u/redditor_${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          metrics: {
            score: score,
            upvoteRatio: Math.random() * 0.3 + 0.7, // 70-100%
            comments: comments,
            awards: Math.floor(Math.random() * 5),
          },
          keywords: ["reddit", subreddit, "discussion", "trending"],
          redditData: {
            subreddit: subreddit,
            postId: `abc123_${i}`,
            flair: Math.random() > 0.7 ? "Discussion" : null,
            locked: Math.random() > 0.9,
            stickied: Math.random() > 0.95,
            nsfw: false,
            sortBy: sortBy,
          },
        });
      }
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      source: "reddit",
      criteria: {
        subreddits,
        sortBy,
        timeframe: args.timeframe || "day",
        minScore,
      },
      timestamp: new Date().toISOString(),
    };
  },
});

export const collectReddit: ReturnType<typeof action> = action({
  args: {
    sourceId: v.id("sources"),
    config: v.optional(v.object({
      subreddits: v.optional(v.array(v.string())),
      sortBy: v.optional(v.string()),
      timeframe: v.optional(v.string()),
      minScore: v.optional(v.number()),
      minComments: v.optional(v.number()),
      excludeNsfw: v.optional(v.boolean()),
      keywords: v.optional(v.array(v.string())),
      excludeKeywords: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    // Mock automated Reddit collection
    const subreddits = args.config?.subreddits || ["technology", "startups", "artificial", "programming"];
    const sortBy = args.config?.sortBy || "hot";
    const minScore = args.config?.minScore || 50;
    const minComments = args.config?.minComments || 10;
    const mockSignals = [];

    for (const subreddit of subreddits) {
      const postCount = Math.floor(Math.random() * 12) + 3;

      for (let i = 0; i < postCount; i++) {
        const score = minScore + Math.floor(Math.random() * 800);
        const comments = minComments + Math.floor(Math.random() * 300);
        const isNsfw = Math.random() > 0.95;

        // Skip NSFW content if excluded
        if (args.config?.excludeNsfw && isNsfw) continue;

        const signal = {
          id: `reddit_auto_${Date.now()}_${subreddit}_${i}`,
          sourceId: args.sourceId,
          source: "reddit",
          type: "reddit_post",
          title: `r/${subreddit}: Innovation Discussion - ${score} points`,
          description: `High-engagement post from r/${subreddit} discussing emerging trends and innovations in technology`,
          url: `https://www.reddit.com/r/${subreddit}/comments/xyz789/innovation-discussion/`,
          author: `u/innovator_${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(Date.now() - Math.random() * 172800000).toISOString(), // Last 2 days
          metrics: {
            score: score,
            upvoteRatio: Math.random() * 0.2 + 0.8, // 80-100%
            comments: comments,
            awards: Math.floor(Math.random() * 8),
            crosspostCount: Math.floor(Math.random() * 3),
          },
          keywords: args.config?.keywords || ["reddit", subreddit, "technology", "innovation"],
          redditData: {
            subreddit: subreddit,
            postId: `xyz789_${i}`,
            flair: ["Discussion", "News", "Question", "Analysis"][Math.floor(Math.random() * 4)],
            locked: Math.random() > 0.95,
            stickied: Math.random() > 0.98,
            nsfw: isNsfw,
            sortBy: sortBy,
            gilded: Math.floor(Math.random() * 3),
            distinguished: Math.random() > 0.9 ? "moderator" : null,
          },
        };

        mockSignals.push(signal);
      }
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      sourceId: args.sourceId,
      timestamp: new Date().toISOString(),
      criteria: {
        subreddits,
        sortBy,
        timeframe: args.config?.timeframe || "day",
        minScore,
        minComments,
        excludeNsfw: args.config?.excludeNsfw || true,
      },
    };
  },
});