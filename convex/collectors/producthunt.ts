"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";

export const collectProductHuntManual = action({
  args: {
    categories: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    timeframe: v.optional(v.string()), // "today", "week", "month"
    minVotes: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Mock manual Product Hunt collection
    const mockSignals = [];
    const categories = args.categories || ["tech", "ai", "productivity"];
    const timeframe = args.timeframe || "today";
    const productCount = Math.floor(Math.random() * 15) + 5;

    for (let i = 0; i < productCount; i++) {
      const votes = (args.minVotes || 0) + Math.floor(Math.random() * 500);
      const category = categories[Math.floor(Math.random() * categories.length)];

      mockSignals.push({
        id: `ph_manual_${Date.now()}_${i}`,
        source: "producthunt",
        type: "product_launch",
        title: `${category.toUpperCase()} Product: Innovative Tool ${i + 1}`,
        description: `Revolutionary ${category} product launching on Product Hunt with strong community support`,
        url: `https://www.producthunt.com/posts/innovative-tool-${i + 1}`,
        author: `maker_${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        metrics: {
          votes: votes,
          comments: Math.floor(Math.random() * 50),
          rank: i + 1,
          featured: args.featured ? Math.random() > 0.7 : false,
        },
        keywords: ["producthunt", category, "launch", "startup"],
        phData: {
          productId: Math.floor(Math.random() * 100000),
          category: category,
          tagline: `The best ${category} tool you've been waiting for`,
          makerCount: Math.floor(Math.random() * 5) + 1,
          featured: args.featured ? Math.random() > 0.7 : false,
        },
      });
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      source: "producthunt",
      timeframe: timeframe,
      timestamp: new Date().toISOString(),
    };
  },
});

export const collectProductHunt = action({
  args: {
    sourceId: v.id("sources"),
    config: v.optional(v.object({
      categories: v.optional(v.array(v.string())),
      minVotes: v.optional(v.number()),
      featuredOnly: v.optional(v.boolean()),
      includeMakers: v.optional(v.boolean()),
      timeRange: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Mock automated Product Hunt collection
    const categories = args.config?.categories || ["tech", "ai", "productivity", "design"];
    const minVotes = args.config?.minVotes || 20;
    const featuredOnly = args.config?.featuredOnly || false;
    const mockSignals = [];

    // Generate products for each category
    for (const category of categories) {
      const productCount = featuredOnly ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 8) + 3;

      for (let i = 0; i < productCount; i++) {
        const votes = minVotes + Math.floor(Math.random() * 300);
        const isFeatured = featuredOnly || Math.random() > 0.6;

        // Skip if featuredOnly is true but product is not featured
        if (featuredOnly && !isFeatured) continue;

        const signal = {
          id: `ph_auto_${Date.now()}_${category}_${i}`,
          sourceId: args.sourceId,
          source: "producthunt",
          type: "product_launch",
          title: `${category} Launch: Next-Gen Innovation ${i + 1}`,
          description: `Trending ${category} product with ${votes} votes and strong maker community engagement`,
          url: `https://www.producthunt.com/posts/next-gen-innovation-${i + 1}`,
          author: `maker_${Math.floor(Math.random() * 1000)}`,
          createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          metrics: {
            votes: votes,
            comments: Math.floor(Math.random() * 80),
            rank: i + 1,
            featured: isFeatured,
          },
          keywords: ["producthunt", category, "innovation", "startup"],
          phData: {
            productId: Math.floor(Math.random() * 100000),
            category: category,
            tagline: `Revolutionary ${category} solution for modern teams`,
            makerCount: Math.floor(Math.random() * 8) + 1,
            featured: isFeatured,
            hunterCount: Math.floor(Math.random() * 10) + 1,
          },
        };

        // Add maker information if requested
        if (args.config?.includeMakers) {
          signal.phData.makers = Array.from({ length: signal.phData.makerCount }, (_, j) => ({
            id: Math.floor(Math.random() * 10000),
            name: `Maker ${j + 1}`,
            headline: `${category} expert and innovator`,
          }));
        }

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
        categories,
        minVotes,
        featuredOnly,
        timeRange: args.config?.timeRange || "week",
      },
    };
  },
});