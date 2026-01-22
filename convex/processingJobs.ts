import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createProcessingJob = mutation({
  args: {
    type: v.string(),
    status: v.string(),
    sourceId: v.optional(v.id("sources")),
    signalId: v.optional(v.id("signals")),
    parameters: v.optional(v.any()),
    priority: v.optional(v.number()),
    scheduledFor: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const jobId = await ctx.db.insert("processing_jobs", {
      ...args,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      startedAt: null,
      completedAt: null,
      failedAt: null,
      errorMessage: null,
      retryCount: 0,
      maxRetries: 3,
      progress: 0,
      result: null,
    });

    return jobId;
  },
});

export const updateProcessingJob = mutation({
  args: {
    id: v.id("processing_jobs"),
    status: v.optional(v.string()),
    progress: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    result: v.optional(v.any()),
    retryCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    const updateData: Record<string, any> = {
      ...updates,
      updatedAt: Date.now(),
    };

    // Set timestamps based on status
    if (updates.status === "running" && !updates.result) {
      updateData.startedAt = Date.now();
    } else if (updates.status === "completed") {
      updateData.completedAt = Date.now();
    } else if (updates.status === "failed") {
      updateData.failedAt = Date.now();
    }

    await ctx.db.patch(id, updateData);
    return { success: true };
  },
});

export const getProcessingJob = query({
  args: {
    id: v.id("processing_jobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getLatestActiveJob = query({
  args: {
    type: v.optional(v.string()),
    sourceId: v.optional(v.id("sources")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("processing_jobs");

    if (args.type) {
      query = query.filter(q => q.eq(q.field("type"), args.type));
    }

    if (args.sourceId) {
      query = query.filter(q => q.eq(q.field("sourceId"), args.sourceId));
    }

    const jobs = await query
      .filter(q => q.neq(q.field("status"), "completed"))
      .filter(q => q.neq(q.field("status"), "failed"))
      .filter(q => q.neq(q.field("status"), "cancelled"))
      .order("desc")
      .first();

    return jobs;
  },
});

export const getRunningProcessingJobs = query({
  args: {
    type: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("processing_jobs")
      .filter(q => q.eq(q.field("status"), "running"));

    if (args.type) {
      query = query.filter(q => q.eq(q.field("type"), args.type));
    }

    const jobs = await query.order("desc").collect();

    if (args.limit) {
      return jobs.slice(0, args.limit);
    }

    return jobs;
  },
});

export const getProcessingJobHistory = query({
  args: {
    type: v.optional(v.string()),
    sourceId: v.optional(v.id("sources")),
    limit: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("processing_jobs");

    if (args.type) {
      query = query.filter(q => q.eq(q.field("type"), args.type));
    }

    if (args.sourceId) {
      query = query.filter(q => q.eq(q.field("sourceId"), args.sourceId));
    }

    if (args.status) {
      query = query.filter(q => q.eq(q.field("status"), args.status));
    }

    const jobs = await query.order("desc").collect();

    if (args.limit) {
      return jobs.slice(0, args.limit);
    }

    return jobs;
  },
});

export const hasActiveProcessingJob = query({
  args: {
    type: v.string(),
    sourceId: v.optional(v.id("sources")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("processing_jobs")
      .filter(q => q.eq(q.field("type"), args.type));

    if (args.sourceId) {
      query = query.filter(q => q.eq(q.field("sourceId"), args.sourceId));
    }

    const activeJob = await query
      .filter(q => q.or(
        q.eq(q.field("status"), "pending"),
        q.eq(q.field("status"), "running")
      ))
      .first();

    return !!activeJob;
  },
});

export const cancelProcessingJob = mutation({
  args: {
    id: v.id("processing_jobs"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "cancelled",
      errorMessage: args.reason || "Job cancelled by user",
      updatedAt: Date.now(),
      failedAt: Date.now(),
    });

    return { success: true };
  },
});