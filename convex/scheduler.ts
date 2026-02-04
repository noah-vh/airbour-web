/**
 * Internal scheduler functions for autonomous newsletter operations
 * Called by cron jobs defined in crons.ts
 */

import { internalMutation, internalQuery, internalAction } from "./_generated/server";
import { internal, api } from "./_generated/api";
import { v } from "convex/values";

// Process scheduled newsletters that are due to be sent
export const processScheduledNewsletters: ReturnType<typeof internalMutation> = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesFromNow = now + 5 * 60 * 1000;

    // Find newsletters scheduled for the next 5 minutes
    const scheduledNewsletters = await ctx.db
      .query("newsletters")
      .withIndex("by_scheduled")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "scheduled"),
          q.lte(q.field("scheduledFor"), fiveMinutesFromNow),
          q.gte(q.field("scheduledFor"), now - 60 * 1000) // Within 1 minute window
        )
      )
      .collect();

    const results = [];

    for (const newsletter of scheduledNewsletters) {
      // Check if newsletter has content
      const hasContent = newsletter.sections?.some((s: any) => s.content && s.content.trim().length > 0);

      if (!hasContent) {
        // Auto-generate content before sending
        await ctx.scheduler.runAfter(0, internal.scheduler.autoGenerateAndSend, {
          newsletterId: newsletter._id,
        });
        results.push({ newsletterId: newsletter._id, action: "generating" });
      } else {
        // Send directly
        await ctx.scheduler.runAfter(0, internal.scheduler.sendNewsletterInternal, {
          newsletterId: newsletter._id,
        });
        results.push({ newsletterId: newsletter._id, action: "sending" });
      }
    }

    return { processed: results.length, results };
  },
});

// Auto-generate content and then send
export const autoGenerateAndSend: ReturnType<typeof internalAction> = internalAction({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    // Generate content using the existing newsletter generation action
    await ctx.runAction(api.actions.newsletterGeneration.generateFullNewsletter, {
      newsletterId: args.newsletterId,
    });

    // Then send the newsletter
    await ctx.runAction(api.actions.emailDelivery.sendNewsletter, {
      newsletterId: args.newsletterId,
    });

    return { success: true };
  },
});

// Send newsletter (internal wrapper)
export const sendNewsletterInternal: ReturnType<typeof internalAction> = internalAction({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    return await ctx.runAction(api.actions.emailDelivery.sendNewsletter, {
      newsletterId: args.newsletterId,
    });
  },
});

// Collect signals from all active sources
export const collectAllSignals: ReturnType<typeof internalMutation> = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all active sources
    const sources = await ctx.db
      .query("sources")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();

    const results = [];

    for (const source of sources) {
      // Schedule collection for each source type
      // This triggers the existing signal collection infrastructure
      await ctx.scheduler.runAfter(0, internal.scheduler.collectFromSource, {
        sourceId: source._id,
        sourceType: source.type,
      });
      results.push({ sourceId: source._id, type: source.type });
    }

    // Also create a collection run record
    await ctx.db.insert("collection_runs", {
      startedAt: Date.now(),
      status: "running",
      sourcesTriggered: results.length,
    });

    return { triggered: results.length, sources: results };
  },
});

// Collect from a specific source (placeholder - integrates with existing collectors)
export const collectFromSource: ReturnType<typeof internalMutation> = internalMutation({
  args: {
    sourceId: v.id("sources"),
    sourceType: v.string(),
  },
  handler: async (ctx, args) => {
    // This would integrate with existing signal collectors
    // For now, just log the attempt
    const source = await ctx.db.get(args.sourceId);

    if (!source) {
      return { success: false, error: "Source not found" };
    }

    // Update source last collected timestamp
    await ctx.db.patch(args.sourceId, {
      lastCollectedAt: Date.now(),
    });

    return { success: true, sourceType: args.sourceType };
  },
});

// Aggregate email metrics from events
export const aggregateMetrics: ReturnType<typeof internalMutation> = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get newsletters that were sent in the last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

    const sentNewsletters = await ctx.db
      .query("newsletters")
      .withIndex("by_status", (q) => q.eq("status", "sent"))
      .collect();

    const recentNewsletters = sentNewsletters.filter(
      (n) => n.sentAt && n.sentAt > sevenDaysAgo
    );

    let updated = 0;

    for (const newsletter of recentNewsletters) {
      // Get all events for this newsletter
      const events = await ctx.db
        .query("email_events")
        .withIndex("by_newsletter", (q) => q.eq("newsletterId", newsletter._id))
        .collect();

      // Calculate metrics
      const metrics = {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
      };

      const uniqueOpens = new Set<string>();
      const uniqueClicks = new Set<string>();

      for (const event of events) {
        switch (event.eventType) {
          case "sent":
            metrics.sent++;
            break;
          case "delivered":
            metrics.delivered++;
            break;
          case "opened":
            metrics.opened++;
            if (event.subscriberId) uniqueOpens.add(event.subscriberId);
            break;
          case "clicked":
            metrics.clicked++;
            if (event.subscriberId) uniqueClicks.add(event.subscriberId);
            break;
          case "bounced":
            metrics.bounced++;
            break;
        }
      }

      const openRate = metrics.sent > 0 ? (uniqueOpens.size / metrics.sent) * 100 : 0;
      const clickRate = uniqueOpens.size > 0 ? (uniqueClicks.size / uniqueOpens.size) * 100 : 0;

      // Update newsletter with computed metrics
      await ctx.db.patch(newsletter._id, {
        openRate: Math.round(openRate * 10) / 10,
        clickRate: Math.round(clickRate * 10) / 10,
        recipientCount: metrics.sent,
        deliveryStats: {
          sent: metrics.sent,
          delivered: metrics.delivered,
          opened: uniqueOpens.size,
          clicked: uniqueClicks.size,
          bounced: metrics.bounced,
        },
      });

      updated++;
    }

    return { updated, newsletters: recentNewsletters.length };
  },
});

// Get due newsletters (query for debugging)
export const getDueNewsletters = internalQuery({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const fiveMinutesFromNow = now + 5 * 60 * 1000;

    return await ctx.db
      .query("newsletters")
      .withIndex("by_scheduled")
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "scheduled"),
          q.lte(q.field("scheduledFor"), fiveMinutesFromNow)
        )
      )
      .collect();
  },
});
