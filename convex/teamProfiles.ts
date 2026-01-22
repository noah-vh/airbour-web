import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getAllTeamProfiles = query({
  args: {
    includeInactive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("team_member_profiles");

    if (!args.includeInactive) {
      query = query.filter(q => q.eq(q.field("isActive"), true));
    }

    const profiles = await query.order("desc").collect();

    if (args.limit) {
      return profiles.slice(0, args.limit);
    }

    return profiles;
  },
});

export const getTeamProfile = query({
  args: {
    id: v.id("team_member_profiles"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getTeamProfileByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("team_member_profiles")
      .filter(q => q.eq(q.field("userId"), args.userId))
      .first();
  },
});

export const searchTeamProfiles = query({
  args: {
    searchTerm: v.string(),
    department: v.optional(v.string()),
    role: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("team_member_profiles");

    if (args.department) {
      query = query.filter(q => q.eq(q.field("department"), args.department));
    }

    if (args.role) {
      query = query.filter(q => q.eq(q.field("role"), args.role));
    }

    if (args.isActive !== undefined) {
      query = query.filter(q => q.eq(q.field("isActive"), args.isActive));
    }

    let profiles = await query.collect();

    // Apply search filter
    if (args.searchTerm) {
      const searchLower = args.searchTerm.toLowerCase();
      profiles = profiles.filter(profile =>
        profile.name?.toLowerCase().includes(searchLower) ||
        profile.email?.toLowerCase().includes(searchLower) ||
        profile.department?.toLowerCase().includes(searchLower) ||
        profile.role?.toLowerCase().includes(searchLower) ||
        profile.expertise?.some((exp: string) => exp.toLowerCase().includes(searchLower))
      );
    }

    if (args.limit) {
      profiles = profiles.slice(0, args.limit);
    }

    return profiles;
  },
});

export const createTeamProfile = mutation({
  args: {
    userId: v.string(),
    name: v.string(),
    email: v.string(),
    department: v.string(),
    role: v.string(),
    expertise: v.array(v.string()),
    bio: v.optional(v.string()),
    contentPreferences: v.optional(v.any()),
    writingStyle: v.optional(v.string()),
    targetAudience: v.optional(v.array(v.string())),
    contentTypes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profileId = await ctx.db.insert("team_member_profiles", {
      ...args,
      isActive: args.isActive ?? true,
      workDocuments: [],
      contentPerformance: {
        totalViews: 0,
        totalShares: 0,
        totalEngagement: 0,
        contentCount: 0,
        avgPerformanceScore: 0,
      },
      preferences: args.contentPreferences || {},
      joinedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return profileId;
  },
});

export const updateTeamProfile = mutation({
  args: {
    id: v.id("team_member_profiles"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    department: v.optional(v.string()),
    role: v.optional(v.string()),
    expertise: v.optional(v.array(v.string())),
    bio: v.optional(v.string()),
    contentPreferences: v.optional(v.any()),
    writingStyle: v.optional(v.string()),
    targetAudience: v.optional(v.array(v.string())),
    contentTypes: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: Date.now(),
    };

    // Only include defined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    await ctx.db.patch(id, updateData);
    return { success: true };
  },
});

export const deactivateTeamProfile = mutation({
  args: {
    id: v.id("team_member_profiles"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      isActive: false,
      deactivatedAt: Date.now(),
      deactivationReason: args.reason,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const addWorkDocument = mutation({
  args: {
    profileId: v.id("team_member_profiles"),
    documentType: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    url: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const document = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: args.documentType,
      title: args.title,
      description: args.description,
      url: args.url,
      tags: args.tags || [],
      metadata: args.metadata || {},
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedDocuments = [...(profile.workDocuments || []), document];

    await ctx.db.patch(args.profileId, {
      workDocuments: updatedDocuments,
      updatedAt: Date.now(),
    });

    return document.id;
  },
});

export const updateContentPerformance = mutation({
  args: {
    profileId: v.id("team_member_profiles"),
    views: v.optional(v.number()),
    shares: v.optional(v.number()),
    engagement: v.optional(v.number()),
    performanceScore: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    const currentPerf = profile.contentPerformance || {
      totalViews: 0,
      totalShares: 0,
      totalEngagement: 0,
      contentCount: 0,
      avgPerformanceScore: 0,
    };

    const updatedPerformance = {
      totalViews: currentPerf.totalViews + (args.views || 0),
      totalShares: currentPerf.totalShares + (args.shares || 0),
      totalEngagement: currentPerf.totalEngagement + (args.engagement || 0),
      contentCount: currentPerf.contentCount + 1,
      avgPerformanceScore: args.performanceScore !== undefined
        ? ((currentPerf.avgPerformanceScore * currentPerf.contentCount) + args.performanceScore) / (currentPerf.contentCount + 1)
        : currentPerf.avgPerformanceScore,
    };

    await ctx.db.patch(args.profileId, {
      contentPerformance: updatedPerformance,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const initializeDefaultProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    const defaultProfiles = [
      {
        userId: "system_cto",
        name: "Chief Technology Officer",
        email: "cto@company.com",
        department: "Engineering",
        role: "Executive",
        expertise: ["Technology Strategy", "Innovation", "Leadership", "Architecture"],
        bio: "Leads technology vision and innovation initiatives",
        writingStyle: "strategic",
        targetAudience: ["executives", "investors", "industry leaders"],
        contentTypes: ["thought leadership", "technical strategy", "innovation reports"],
      },
      {
        userId: "system_product",
        name: "Head of Product",
        email: "product@company.com",
        department: "Product",
        role: "Executive",
        expertise: ["Product Management", "User Experience", "Market Research", "Strategy"],
        bio: "Drives product strategy and user-centered design",
        writingStyle: "analytical",
        targetAudience: ["customers", "product managers", "designers"],
        contentTypes: ["product updates", "user research", "market analysis"],
      },
      {
        userId: "system_marketing",
        name: "Marketing Director",
        email: "marketing@company.com",
        department: "Marketing",
        role: "Director",
        expertise: ["Digital Marketing", "Content Strategy", "Brand Management", "Growth"],
        bio: "Specializes in growth marketing and brand development",
        writingStyle: "engaging",
        targetAudience: ["customers", "prospects", "partners"],
        contentTypes: ["marketing campaigns", "brand stories", "growth insights"],
      },
      {
        userId: "system_research",
        name: "Research Lead",
        email: "research@company.com",
        department: "Research",
        role: "Lead",
        expertise: ["Market Research", "Trend Analysis", "Data Science", "Innovation"],
        bio: "Conducts deep market research and trend analysis",
        writingStyle: "analytical",
        targetAudience: ["researchers", "analysts", "academics"],
        contentTypes: ["research reports", "trend analysis", "data insights"],
      },
    ];

    const created = [];

    for (const profileData of defaultProfiles) {
      // Check if profile already exists
      const existing = await ctx.db.query("team_member_profiles")
        .filter(q => q.eq(q.field("userId"), profileData.userId))
        .first();

      if (!existing) {
        const profileId = await ctx.db.insert("team_member_profiles", {
          ...profileData,
          isActive: true,
          workDocuments: [],
          contentPerformance: {
            totalViews: 0,
            totalShares: 0,
            totalEngagement: 0,
            contentCount: 0,
            avgPerformanceScore: 0,
          },
          preferences: {},
          joinedAt: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        created.push(profileId);
      }
    }

    return { created: created.length };
  },
});