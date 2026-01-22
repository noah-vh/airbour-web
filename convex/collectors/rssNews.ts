"use node";
import { v } from "convex/values";
import { action } from "../_generated/server";

export const collectRSSNewsManual = action({
  args: {
    feedUrls: v.array(v.string()),
    keywords: v.optional(v.array(v.string())),
    maxAge: v.optional(v.number()), // hours
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Mock manual RSS News collection
    const mockSignals = [];
    const feedUrls = args.feedUrls;
    const limit = args.limit || 50;
    const maxAge = args.maxAge || 24;

    for (const feedUrl of feedUrls) {
      const feedName = feedUrl.split('/').find(part => part.includes('.')) || 'news-feed';
      const itemCount = Math.min(limit, Math.floor(Math.random() * 20) + 5);

      for (let i = 0; i < itemCount; i++) {
        const ageHours = Math.random() * maxAge;
        const publishedAt = new Date(Date.now() - ageHours * 3600000);

        mockSignals.push({
          id: `rss_manual_${Date.now()}_${i}`,
          source: "rss_news",
          type: "news_article",
          title: `Breaking: Technology Innovation Report ${i + 1}`,
          description: `Latest developments in technology and innovation sector from ${feedName}`,
          url: `https://${feedName}/articles/tech-innovation-${i + 1}`,
          author: `${feedName} Editorial Team`,
          createdAt: publishedAt.toISOString(),
          metrics: {
            readTime: Math.floor(Math.random() * 10) + 2, // 2-12 minutes
            wordCount: Math.floor(Math.random() * 2000) + 500,
          },
          keywords: args.keywords || ["technology", "innovation", "news"],
          rssData: {
            feedUrl: feedUrl,
            feedTitle: feedName,
            guid: `${feedUrl}/guid/${Date.now()}_${i}`,
            categories: ["Technology", "Innovation", "Business"],
            pubDate: publishedAt.toISOString(),
            enclosure: Math.random() > 0.8 ? {
              url: `https://${feedName}/images/article-${i}.jpg`,
              type: "image/jpeg",
              length: Math.floor(Math.random() * 500000) + 100000,
            } : null,
          },
        });
      }
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      source: "rss_news",
      criteria: {
        feedCount: feedUrls.length,
        maxAge,
        limit,
      },
      timestamp: new Date().toISOString(),
    };
  },
});

export const collectRSSNews = action({
  args: {
    sourceId: v.id("sources"),
    config: v.optional(v.object({
      feedUrls: v.optional(v.array(v.string())),
      categories: v.optional(v.array(v.string())),
      keywords: v.optional(v.array(v.string())),
      excludeKeywords: v.optional(v.array(v.string())),
      maxAge: v.optional(v.number()),
      minWordCount: v.optional(v.number()),
      language: v.optional(v.string()),
    })),
  },
  handler: async (ctx, args) => {
    // Mock automated RSS News collection
    const feedUrls = args.config?.feedUrls || [
      "https://techcrunch.com/feed/",
      "https://www.wired.com/feed/",
      "https://arstechnica.com/feed/",
      "https://venturebeat.com/feed/",
    ];
    const categories = args.config?.categories || ["Technology", "Innovation", "Startups"];
    const maxAge = args.config?.maxAge || 12; // hours
    const minWordCount = args.config?.minWordCount || 300;
    const mockSignals = [];

    for (const feedUrl of feedUrls) {
      const feedDomain = new URL(feedUrl).hostname;
      const feedName = feedDomain.replace('www.', '').split('.')[0];
      const articleCount = Math.floor(Math.random() * 15) + 5;

      for (let i = 0; i < articleCount; i++) {
        const ageHours = Math.random() * maxAge;
        const publishedAt = new Date(Date.now() - ageHours * 3600000);
        const wordCount = minWordCount + Math.floor(Math.random() * 1500);
        const category = categories[Math.floor(Math.random() * categories.length)];

        const signal = {
          id: `rss_auto_${Date.now()}_${feedName}_${i}`,
          sourceId: args.sourceId,
          source: "rss_news",
          type: "news_article",
          title: `${category}: Revolutionary Breakthrough in Tech Industry`,
          description: `Comprehensive analysis of emerging trends and breakthrough innovations in ${category.toLowerCase()} sector`,
          url: `${feedUrl.replace('/feed/', '')}/article-${Date.now()}-${i}`,
          author: `${feedName} Newsroom`,
          createdAt: publishedAt.toISOString(),
          metrics: {
            readTime: Math.ceil(wordCount / 200), // ~200 words per minute
            wordCount: wordCount,
            engagement: Math.floor(Math.random() * 100),
          },
          keywords: args.config?.keywords || ["technology", "innovation", category.toLowerCase()],
          rssData: {
            feedUrl: feedUrl,
            feedTitle: `${feedName} - ${category} News`,
            guid: `${feedUrl}/guid/${Date.now()}_${i}`,
            categories: [category, "Technology", "News"],
            pubDate: publishedAt.toISOString(),
            language: args.config?.language || "en",
            enclosure: Math.random() > 0.6 ? {
              url: `https://${feedDomain}/images/tech-${i}.jpg`,
              type: "image/jpeg",
              length: Math.floor(Math.random() * 800000) + 200000,
            } : null,
            summary: `Breaking news in ${category.toLowerCase()}: Industry experts discuss the implications of recent technological advances`,
          },
        };

        // Filter by exclude keywords if specified
        if (args.config?.excludeKeywords) {
          const hasExcludedKeyword = args.config.excludeKeywords.some(keyword =>
            signal.title.toLowerCase().includes(keyword.toLowerCase()) ||
            signal.description.toLowerCase().includes(keyword.toLowerCase())
          );
          if (hasExcludedKeyword) continue;
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
        feedCount: feedUrls.length,
        categories,
        maxAge,
        minWordCount,
        language: args.config?.language || "en",
      },
    };
  },
});