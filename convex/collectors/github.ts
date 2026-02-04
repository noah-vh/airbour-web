"use node";

import { v } from "convex/values";
import { action } from "../_generated/server";

export const collectGitHubManual: ReturnType<typeof action> = action({
  args: {
    repositories: v.array(v.string()),
    keywords: v.optional(v.array(v.string())),
    timeframe: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Mock manual GitHub collection
    const mockSignals = args.repositories.map((repo, index) => ({
      id: `github_signal_${Date.now()}_${index}`,
      source: "github",
      repository: repo,
      type: "repository_activity",
      title: `Activity in ${repo}`,
      description: `Recent developments in ${repo} repository`,
      url: `https://github.com/${repo}`,
      author: "github-user",
      createdAt: new Date().toISOString(),
      metrics: {
        stars: Math.floor(Math.random() * 1000),
        forks: Math.floor(Math.random() * 100),
        issues: Math.floor(Math.random() * 50),
      },
      keywords: args.keywords || ["github", "development"],
    }));

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      source: "github",
      timestamp: new Date().toISOString(),
    };
  },
});

export const collectGitHub: ReturnType<typeof action> = action({
  args: {
    sourceId: v.id("sources"),
    config: v.optional(v.object({
      repositories: v.optional(v.array(v.string())),
      keywords: v.optional(v.array(v.string())),
      includeIssues: v.optional(v.boolean()),
      includeReleases: v.optional(v.boolean()),
      includePRs: v.optional(v.boolean()),
    })),
  },
  handler: async (ctx, args) => {
    // Mock automated GitHub collection
    const repositories = args.config?.repositories || ["trending/repo1", "trending/repo2"];
    const mockSignals = [];

    for (const repo of repositories) {
      // Mock repository signals
      mockSignals.push({
        id: `github_auto_${Date.now()}_${Math.random()}`,
        sourceId: args.sourceId,
        source: "github",
        repository: repo,
        type: "repository_trending",
        title: `${repo} is trending`,
        description: `${repo} has gained significant activity recently`,
        url: `https://github.com/${repo}`,
        author: "github-system",
        createdAt: new Date().toISOString(),
        metrics: {
          stars: Math.floor(Math.random() * 5000),
          starGrowth: Math.floor(Math.random() * 100),
          forks: Math.floor(Math.random() * 500),
        },
        keywords: args.config?.keywords || ["trending", "github"],
      });

      // Mock issue signals if enabled
      if (args.config?.includeIssues) {
        mockSignals.push({
          id: `github_issue_${Date.now()}_${Math.random()}`,
          sourceId: args.sourceId,
          source: "github",
          repository: repo,
          type: "issue",
          title: `Important issue in ${repo}`,
          description: "High-priority issue requiring attention",
          url: `https://github.com/${repo}/issues/123`,
          author: "contributor",
          createdAt: new Date().toISOString(),
          keywords: ["issue", "bug", "feature-request"],
        });
      }
    }

    return {
      success: true,
      collected: mockSignals.length,
      signals: mockSignals,
      sourceId: args.sourceId,
      timestamp: new Date().toISOString(),
    };
  },
});