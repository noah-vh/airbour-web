"use node";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";
import Stripe from "stripe";

// Initialize Stripe client
function getStripeClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY not configured in Convex environment");
  }
  return new Stripe(secretKey, {
    apiVersion: "2026-01-28.clover" as Stripe.LatestApiVersion,
  });
}

// Price IDs for each plan (to be configured in Stripe Dashboard)
const PRICE_IDS = {
  starter: process.env.STRIPE_STARTER_PRICE_ID || "price_starter",
  pro: process.env.STRIPE_PRO_PRICE_ID || "price_pro",
};

// Create a Stripe Checkout Session for subscription
export const createCheckoutSession: ReturnType<typeof action> = action({
  args: {
    organizationId: v.id("organizations"),
    priceId: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripeClient();

    // Get the organization
    const organization = await ctx.runQuery(api.organizations.get, {
      id: args.organizationId,
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Check if organization already has a Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      // Create a new Stripe customer
      const customer = await stripe.customers.create({
        metadata: {
          organizationId: args.organizationId,
        },
      });
      customerId = customer.id;

      // Update organization with Stripe customer ID
      await ctx.runMutation(api.organizations.update, {
        id: args.organizationId,
        stripeCustomerId: customerId,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: args.priceId,
          quantity: 1,
        },
      ],
      success_url: args.successUrl,
      cancel_url: args.cancelUrl,
      metadata: {
        organizationId: args.organizationId,
      },
      subscription_data: {
        metadata: {
          organizationId: args.organizationId,
        },
      },
    });

    return {
      sessionId: session.id,
      url: session.url,
    };
  },
});

// Create a Stripe Customer Portal session for managing billing
export const createPortalSession: ReturnType<typeof action> = action({
  args: {
    organizationId: v.id("organizations"),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const stripe = getStripeClient();

    // Get the organization
    const organization = await ctx.runQuery(api.organizations.get, {
      id: args.organizationId,
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!organization.stripeCustomerId) {
      throw new Error("Organization does not have a Stripe customer ID");
    }

    // Create portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: args.returnUrl,
    });

    return {
      url: session.url,
    };
  },
});

// Handle subscription created event from webhook
export const handleSubscriptionCreated: ReturnType<typeof action> = action({
  args: {
    stripeSubscriptionId: v.string(),
    stripeCustomerId: v.string(),
    organizationId: v.string(),
    priceId: v.string(),
  },
  handler: async (ctx, args) => {
    // Determine plan from price ID
    let plan = "free";
    if (args.priceId === PRICE_IDS.starter || args.priceId.includes("starter")) {
      plan = "starter";
    } else if (args.priceId === PRICE_IDS.pro || args.priceId.includes("pro")) {
      plan = "pro";
    }

    // Update organization with subscription details
    await ctx.runMutation(api.organizations.update, {
      id: args.organizationId as any,
      stripeSubscriptionId: args.stripeSubscriptionId,
      stripeCustomerId: args.stripeCustomerId,
      plan,
    });

    return { success: true, plan };
  },
});

// Handle subscription updated event from webhook
export const handleSubscriptionUpdated: ReturnType<typeof action> = action({
  args: {
    stripeSubscriptionId: v.string(),
    status: v.string(),
    priceId: v.optional(v.string()),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // If we have organizationId, update directly
    if (args.organizationId) {
      // Determine plan from price ID
      let plan = "free";
      if (args.priceId) {
        if (args.priceId === PRICE_IDS.starter || args.priceId.includes("starter")) {
          plan = "starter";
        } else if (args.priceId === PRICE_IDS.pro || args.priceId.includes("pro")) {
          plan = "pro";
        }
      }

      // Handle subscription status changes
      if (args.status === "active" || args.status === "trialing") {
        await ctx.runMutation(api.organizations.update, {
          id: args.organizationId as any,
          stripeSubscriptionId: args.stripeSubscriptionId,
          plan,
        });
      } else if (args.status === "canceled" || args.status === "unpaid" || args.status === "past_due") {
        // Downgrade to free plan on cancellation or payment issues
        await ctx.runMutation(api.organizations.update, {
          id: args.organizationId as any,
          plan: "free",
        });
      }
    }

    return { success: true, status: args.status };
  },
});

// Handle subscription deleted event from webhook
export const handleSubscriptionDeleted: ReturnType<typeof action> = action({
  args: {
    stripeSubscriptionId: v.string(),
    organizationId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.organizationId) {
      // Downgrade organization to free plan
      await ctx.runMutation(api.organizations.update, {
        id: args.organizationId as any,
        plan: "free",
        stripeSubscriptionId: undefined,
      });
    }

    return { success: true };
  },
});

// Get current subscription status for an organization
export const getSubscriptionStatus: ReturnType<typeof action> = action({
  args: {
    organizationId: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    const stripe = getStripeClient();

    const organization = await ctx.runQuery(api.organizations.get, {
      id: args.organizationId,
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    if (!organization.stripeSubscriptionId) {
      return {
        status: "none",
        plan: organization.plan || "free",
        subscription: null,
      };
    }

    try {
      const subscription = await stripe.subscriptions.retrieve(
        organization.stripeSubscriptionId
      ) as any;

      return {
        status: subscription.status,
        plan: organization.plan || "free",
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodStart: subscription.current_period_start,
          currentPeriodEnd: subscription.current_period_end,
        },
      };
    } catch (error) {
      console.error("Failed to retrieve subscription:", error);
      return {
        status: "error",
        plan: organization.plan || "free",
        subscription: null,
      };
    }
  },
});
