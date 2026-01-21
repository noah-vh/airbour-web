import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const listSignals = query({
  args: {
    lifecycle: v.optional(v.array(v.string())),
    steep: v.optional(v.array(v.string())),
    search: v.optional(v.string()),
    status: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // For now, return mock data since we don't have a signals table yet
    const mockSignals = [
      {
        _id: "signal_1",
        name: "AI-Powered Autonomous Vehicles",
        description: "Self-driving cars are becoming mainstream with improved AI algorithms and sensor technology",
        lifecycle: "growing",
        steep: ["technological", "social"],
        confidence: 0.8,
        keywords: ["autonomous", "ai", "vehicles", "self-driving"],
        mentionCount: 145,
        sourceCount: 23,
        sentiment: 0.7,
        growth: 0.15,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
        tags: ["AI", "Transportation", "Innovation"],
        status: "active",
      },
      {
        _id: "signal_2",
        name: "Quantum Computing Breakthroughs",
        description: "Recent advances in quantum computing are showing practical applications in cryptography and optimization",
        lifecycle: "emerging",
        steep: ["technological", "economic"],
        confidence: 0.6,
        keywords: ["quantum", "computing", "cryptography", "breakthrough"],
        mentionCount: 89,
        sourceCount: 15,
        sentiment: 0.8,
        growth: 0.25,
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000, // 14 days ago
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
        tags: ["Quantum", "Computing", "Research"],
        status: "active",
      },
      {
        _id: "signal_3",
        name: "Sustainable Energy Storage",
        description: "Advanced battery technologies and alternative energy storage solutions are gaining traction",
        lifecycle: "mainstream",
        steep: ["environmental", "technological", "economic"],
        confidence: 0.9,
        keywords: ["battery", "energy", "storage", "sustainable"],
        mentionCount: 234,
        sourceCount: 31,
        sentiment: 0.6,
        growth: 0.08,
        createdAt: Date.now() - 21 * 24 * 60 * 60 * 1000, // 21 days ago
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
        tags: ["Energy", "Sustainability", "Innovation"],
        status: "active",
      },
    ];

    let filteredSignals = mockSignals;

    // Apply filters
    if (args.lifecycle && args.lifecycle.length > 0) {
      filteredSignals = filteredSignals.filter(signal =>
        args.lifecycle?.includes(signal.lifecycle)
      );
    }

    if (args.steep && args.steep.length > 0) {
      filteredSignals = filteredSignals.filter(signal =>
        args.steep?.some(category => signal.steep.includes(category))
      );
    }

    if (args.search) {
      const searchLower = args.search.toLowerCase();
      filteredSignals = filteredSignals.filter(signal =>
        signal.name.toLowerCase().includes(searchLower) ||
        signal.description.toLowerCase().includes(searchLower) ||
        signal.keywords.some(keyword => keyword.toLowerCase().includes(searchLower))
      );
    }

    if (args.status) {
      filteredSignals = filteredSignals.filter(signal => signal.status === args.status);
    }

    // Apply limit
    if (args.limit) {
      filteredSignals = filteredSignals.slice(0, args.limit);
    }

    return filteredSignals;
  },
});

export const getSignalStats = query({
  args: {},
  handler: async (ctx) => {
    // Mock stats data
    return {
      total: 3,
      byLifecycle: {
        emerging: 1,
        growing: 1,
        mainstream: 1,
        declining: 0,
      },
      bySteep: {
        technological: 3,
        social: 1,
        economic: 2,
        environmental: 1,
        political: 0,
      },
    };
  },
});

export const createSignal = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    lifecycle: v.string(),
    steep: v.array(v.string()),
    confidence: v.number(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would create a new signal in the database
    return {
      _id: `signal_${Date.now()}`,
      ...args,
      mentionCount: 0,
      sourceCount: 0,
      sentiment: 0,
      growth: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: "active",
    };
  },
});

export const updateSignal = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.string(),
    lifecycle: v.string(),
    steep: v.array(v.string()),
    confidence: v.number(),
    keywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would update the signal in the database
    return {
      _id: args.id,
      ...args,
      updatedAt: Date.now(),
    };
  },
});

export const deleteSignal = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would delete the signal from the database
    return { deleted: true };
  },
});

export const deleteSignals = mutation({
  args: {
    ids: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // For now, just return a success response
    // In a real implementation, this would delete multiple signals from the database
    return { deleted: args.ids.length };
  },
});