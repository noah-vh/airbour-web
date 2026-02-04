"use node";

import { action, internalAction } from "../_generated/server";
import { v } from "convex/values";
import { api, internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import { Resend } from "resend";

// Initialize Resend client
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY not configured in Convex environment");
  }
  return new Resend(apiKey);
}

// Generate HTML email from newsletter sections
function generateEmailHtml(newsletter: any, baseUrl: string, subscriberId?: string): string {
  const trackingPixel = subscriberId
    ? `<img src="${baseUrl}/api/track/open?nid=${newsletter._id}&sid=${subscriberId}" width="1" height="1" style="display:none" />`
    : '';

  const sectionsHtml = newsletter.sections
    .filter((s: any) => s.content)
    .map((section: any) => {
      // Convert markdown-ish content to HTML (basic conversion)
      let html = section.content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/^\- (.*$)/gim, '<li>$1</li>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>');

      // Wrap adjacent <li> items in <ul>
      html = html.replace(/(<li>.*<\/li>)+/g, '<ul>$&</ul>');

      return `<div class="section" style="margin-bottom: 24px;">${html}</div>`;
    })
    .join('');

  const unsubscribeUrl = subscriberId
    ? `${baseUrl}/unsubscribe?sid=${subscriberId}`
    : `${baseUrl}/unsubscribe`;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${newsletter.subject || newsletter.name}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    h1 { color: #1a1a1a; font-size: 24px; }
    h2 { color: #2a2a2a; font-size: 20px; margin-top: 32px; }
    h3 { color: #3a3a3a; font-size: 16px; }
    p { margin: 16px 0; }
    ul { padding-left: 20px; }
    li { margin: 8px 0; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #eee; font-size: 12px; color: #666; }
    a { color: #0066cc; }
  </style>
</head>
<body>
  ${sectionsHtml}
  <div class="footer">
    <p>You're receiving this because you subscribed to our newsletter.</p>
    <p><a href="${unsubscribeUrl}">Unsubscribe</a></p>
  </div>
  ${trackingPixel}
</body>
</html>
  `.trim();
}

// Wrap links for click tracking
function wrapLinksForTracking(html: string, newsletterId: string, subscriberId: string, baseUrl: string): string {
  return html.replace(
    /href="(https?:\/\/[^"]+)"/g,
    (match, url) => {
      // Don't wrap unsubscribe links
      if (url.includes('/unsubscribe')) return match;
      const trackUrl = `${baseUrl}/api/track/click?nid=${newsletterId}&sid=${subscriberId}&url=${encodeURIComponent(url)}`;
      return `href="${trackUrl}"`;
    }
  );
}

// Send newsletter to all active subscribers
export const sendNewsletter: ReturnType<typeof action> = action({
  args: {
    newsletterId: v.id("newsletters"),
    testEmail: v.optional(v.string()), // For test sends
  },
  handler: async (ctx, args) => {
    const resend = getResendClient();
    const baseUrl = process.env.APP_BASE_URL || "https://airbour.vercel.app";

    // Fetch newsletter
    const newsletter = await ctx.runQuery(api.newsletters.get, {
      id: args.newsletterId,
    });

    if (!newsletter) {
      throw new Error("Newsletter not found");
    }

    // Generate base HTML
    const baseHtml = generateEmailHtml(newsletter, baseUrl);

    // If test email, send only to that address
    if (args.testEmail) {
      const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM || "Airbour <newsletter@airbour.com>",
        to: args.testEmail,
        subject: newsletter.subject || newsletter.name,
        html: baseHtml,
      });

      if (error) {
        throw new Error(`Failed to send test email: ${error.message}`);
      }

      return { success: true, testEmailSent: args.testEmail, messageId: data?.id };
    }

    // Fetch all active subscribers
    const subscribers = await ctx.runQuery(api.subscribers.listActive, {});

    if (subscribers.length === 0) {
      return { success: true, sent: 0, message: "No active subscribers" };
    }

    // Send to each subscriber with personalized tracking
    const results = await Promise.allSettled(
      subscribers.map(async (subscriber: any) => {
        let html = generateEmailHtml(newsletter, baseUrl, subscriber._id);
        html = wrapLinksForTracking(html, args.newsletterId, subscriber._id, baseUrl);

        const { data, error } = await resend.emails.send({
          from: process.env.EMAIL_FROM || "Airbour <newsletter@airbour.com>",
          to: subscriber.email,
          subject: newsletter.subject || newsletter.name,
          html,
        });

        if (error) {
          // Record bounce/failure event
          await ctx.runMutation(api.emailEvents.create, {
            subscriberId: subscriber._id,
            newsletterId: args.newsletterId,
            eventType: "failed",
            metadata: { error: error.message },
          });
          throw error;
        }

        // Record sent event
        await ctx.runMutation(api.emailEvents.create, {
          subscriberId: subscriber._id,
          newsletterId: args.newsletterId,
          eventType: "sent",
          metadata: { resendId: data?.id },
        });

        return { subscriberId: subscriber._id, messageId: data?.id };
      })
    );

    const successful = results.filter((r: PromiseSettledResult<any>) => r.status === "fulfilled").length;
    const failed = results.filter((r: PromiseSettledResult<any>) => r.status === "rejected").length;

    // Update newsletter status
    await ctx.runMutation(api.newsletters.update, {
      id: args.newsletterId,
      status: "sent",
      sentAt: Date.now(),
      deliveryStats: { sent: successful, failed },
    });

    return { success: true, sent: successful, failed };
  },
});

// Track email event (called from HTTP endpoints)
export const trackEvent: ReturnType<typeof action> = action({
  args: {
    newsletterId: v.string(),
    subscriberId: v.optional(v.string()),
    eventType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.runMutation(api.emailEvents.create, {
      subscriberId: args.subscriberId as Id<"subscribers"> | undefined,
      newsletterId: args.newsletterId as Id<"newsletters">,
      eventType: args.eventType,
      metadata: args.metadata,
    });

    return { success: true };
  },
});

// Get delivery stats for a newsletter
export const getDeliveryStats: ReturnType<typeof action> = action({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    const events = await ctx.runQuery(api.emailEvents.getByNewsletter, {
      newsletterId: args.newsletterId,
    });

    const stats = {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      failed: 0,
      uniqueOpens: new Set<string>(),
      uniqueClicks: new Set<string>(),
    };

    for (const event of events) {
      switch (event.eventType) {
        case "sent":
          stats.sent++;
          break;
        case "delivered":
          stats.delivered++;
          break;
        case "opened":
          stats.opened++;
          if (event.subscriberId) stats.uniqueOpens.add(event.subscriberId);
          break;
        case "clicked":
          stats.clicked++;
          if (event.subscriberId) stats.uniqueClicks.add(event.subscriberId);
          break;
        case "bounced":
          stats.bounced++;
          break;
        case "failed":
          stats.failed++;
          break;
      }
    }

    return {
      sent: stats.sent,
      delivered: stats.delivered,
      totalOpens: stats.opened,
      uniqueOpens: stats.uniqueOpens.size,
      totalClicks: stats.clicked,
      uniqueClicks: stats.uniqueClicks.size,
      bounced: stats.bounced,
      failed: stats.failed,
      openRate: stats.sent > 0 ? (stats.uniqueOpens.size / stats.sent) * 100 : 0,
      clickRate: stats.uniqueOpens.size > 0 ? (stats.uniqueClicks.size / stats.uniqueOpens.size) * 100 : 0,
    };
  },
});

// Internal action for scheduled sends
export const sendScheduledNewsletter: ReturnType<typeof internalAction> = internalAction({
  args: {
    newsletterId: v.id("newsletters"),
  },
  handler: async (ctx, args) => {
    // This wraps the public action for internal scheduling
    return await ctx.runAction(api.actions.emailDelivery.sendNewsletter, { newsletterId: args.newsletterId });
  },
});
