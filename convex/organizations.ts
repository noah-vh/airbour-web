import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

/**
 * Create a new organization
 */
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    ownerId: v.string(),
    plan: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if slug already exists
    const existing = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()

    if (existing) {
      throw new Error(`Organization with slug "${args.slug}" already exists`)
    }

    const organizationId = await ctx.db.insert("organizations", {
      name: args.name,
      slug: args.slug,
      ownerId: args.ownerId,
      plan: args.plan,
      createdAt: Date.now(),
    })

    return organizationId
  },
})

/**
 * Get an organization by ID
 */
export const get = query({
  args: {
    id: v.id("organizations"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id)
  },
})

/**
 * Get an organization by slug
 */
export const getBySlug = query({
  args: {
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first()
  },
})

/**
 * Get all organizations owned by a user
 */
export const getByOwner = query({
  args: {
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("organizations")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect()
  },
})

/**
 * Update an organization
 */
export const update = mutation({
  args: {
    id: v.id("organizations"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    plan: v.optional(v.string()),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args

    // Remove undefined values
    const cleanUpdates: Record<string, string> = {}
    for (const [key, value] of Object.entries(updates)) {
      if (value !== undefined) {
        cleanUpdates[key] = value
      }
    }

    // If updating slug, check it doesn't already exist
    if (cleanUpdates.slug) {
      const existing = await ctx.db
        .query("organizations")
        .withIndex("by_slug", (q) => q.eq("slug", cleanUpdates.slug))
        .first()

      if (existing && existing._id !== id) {
        throw new Error(`Organization with slug "${cleanUpdates.slug}" already exists`)
      }
    }

    await ctx.db.patch(id, cleanUpdates)

    return await ctx.db.get(id)
  },
})

/**
 * List all organizations
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("organizations").collect()
  },
})
