import { mutation } from "../_generated/server";

export const seedPlatformFormats = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db.query("platform_formats").first();
    if (existing) {
      console.log("Platform formats already seeded");
      return { message: "Already seeded", count: 0 };
    }

    const platformConfigs = [
      {
        platform: "linkedin",
        constraints: {
          maxCharacters: 3000,
          maxHashtags: 5,
          supportsMarkdown: false,
          supportsHtml: false,
          supportsVideo: false,
        },
        styleGuidelines: {
          tone: "professional",
          formality: "formal",
          emojiUsage: "minimal",
          hashtagStrategy: "end",
          callToActionStyle: "subtle_professional",
        },
      },
      {
        platform: "twitter",
        constraints: {
          maxCharacters: 280,
          supportsMarkdown: false,
          supportsHtml: false,
          supportsVideo: false,
        },
        styleGuidelines: {
          tone: "conversational",
          formality: "informal",
          emojiUsage: "moderate",
          hashtagStrategy: "inline",
          callToActionStyle: "direct",
        },
      },
      {
        platform: "instagram",
        constraints: {
          maxCharacters: 2200,
          maxHashtags: 30,
          supportsMarkdown: false,
          supportsHtml: false,
          supportsVideo: true,
          aspectRatio: "1:1",
        },
        styleGuidelines: {
          tone: "casual",
          formality: "informal",
          emojiUsage: "frequent",
          hashtagStrategy: "end",
          callToActionStyle: "friendly",
        },
      },
      {
        platform: "tiktok",
        constraints: {
          maxDuration: 180,
          maxCharacters: 2200,
          aspectRatio: "9:16",
          supportsMarkdown: false,
          supportsHtml: false,
          supportsVideo: true,
        },
        styleGuidelines: {
          tone: "energetic",
          formality: "very_informal",
          emojiUsage: "frequent",
          hashtagStrategy: "end",
          callToActionStyle: "urgent",
        },
      },
      {
        platform: "youtube_shorts",
        constraints: {
          maxDuration: 60,
          aspectRatio: "9:16",
          supportsMarkdown: false,
          supportsHtml: false,
          supportsVideo: true,
        },
        styleGuidelines: {
          tone: "energetic",
          formality: "informal",
          emojiUsage: "moderate",
          hashtagStrategy: "description",
          callToActionStyle: "direct",
        },
      },
      {
        platform: "ig_reels",
        constraints: {
          maxDuration: 90,
          aspectRatio: "9:16",
          supportsMarkdown: false,
          supportsHtml: false,
          supportsVideo: true,
        },
        styleGuidelines: {
          tone: "engaging",
          formality: "informal",
          emojiUsage: "frequent",
          hashtagStrategy: "caption",
          callToActionStyle: "friendly",
        },
      },
      {
        platform: "youtube",
        constraints: {
          maxDuration: 3600,
          aspectRatio: "16:9",
          supportsMarkdown: false,
          supportsHtml: true,
          supportsVideo: true,
        },
        styleGuidelines: {
          tone: "informative",
          formality: "semi_formal",
          emojiUsage: "minimal",
          hashtagStrategy: "description",
          callToActionStyle: "educational",
        },
      },
      {
        platform: "blog",
        constraints: {
          supportsMarkdown: true,
          supportsHtml: true,
          supportsVideo: false,
        },
        styleGuidelines: {
          tone: "informative",
          formality: "formal",
          emojiUsage: "minimal",
          hashtagStrategy: "none",
          callToActionStyle: "subtle",
        },
      },
      {
        platform: "medium",
        constraints: {
          supportsMarkdown: true,
          supportsHtml: true,
          supportsVideo: false,
        },
        styleGuidelines: {
          tone: "thoughtful",
          formality: "semi_formal",
          emojiUsage: "minimal",
          hashtagStrategy: "tags",
          callToActionStyle: "conversational",
        },
      },
    ];

    let count = 0;
    for (const config of platformConfigs) {
      await ctx.db.insert("platform_formats", {
        ...config,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      count++;
    }

    return { message: `Seeded ${count} platform formats`, count };
  },
});
