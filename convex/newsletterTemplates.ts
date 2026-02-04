/**
 * Convex API functions for Newsletter Templates
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Section schema for templates
const sectionSchema = v.object({
  id: v.string(),
  type: v.string(),
  title: v.string(),
  content: v.string(),
  order: v.number(),
});

export const list = query({
  args: {
    limit: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;

    let templates = await ctx.db
      .query("newsletter_templates")
      .take(limit * 2);

    // Filter by active status unless includeInactive is true
    if (!args.includeInactive) {
      templates = templates.filter((t) => t.isActive !== false);
    }

    // Sort by default first, then by name
    templates.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      return (a.name || "").localeCompare(b.name || "");
    });

    return templates.slice(0, limit).map((template) => ({
      _id: template._id,
      name: template.name,
      description: template.description,
      sections: template.sections || [],
      isDefault: template.isDefault || false,
      isActive: template.isActive !== false,
      category: template.category,
      previewImageUrl: template.previewImageUrl,
      createdAt: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  },
});

export const get = query({
  args: { id: v.id("newsletter_templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }
    return template;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    sections: v.array(sectionSchema),
    category: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // If setting as default, unset other defaults
    if (args.isDefault) {
      const existingDefaults = await ctx.db
        .query("newsletter_templates")
        .filter((q) => q.eq(q.field("isDefault"), true))
        .collect();

      for (const template of existingDefaults) {
        await ctx.db.patch(template._id, { isDefault: false });
      }
    }

    const templateId = await ctx.db.insert("newsletter_templates", {
      name: args.name,
      description: args.description || "",
      sections: args.sections,
      category: args.category || "custom",
      isDefault: args.isDefault || false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return templateId;
  },
});

export const update = mutation({
  args: {
    id: v.id("newsletter_templates"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    sections: v.optional(v.array(sectionSchema)),
    category: v.optional(v.string()),
    isDefault: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = Date.now();

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      const existingDefaults = await ctx.db
        .query("newsletter_templates")
        .filter((q) =>
          q.and(q.eq(q.field("isDefault"), true), q.neq(q.field("_id"), id))
        )
        .collect();

      for (const template of existingDefaults) {
        await ctx.db.patch(template._id, { isDefault: false });
      }
    }

    // Remove undefined values
    const updatePayload: Record<string, any> = { updatedAt: now };
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        updatePayload[key] = value;
      }
    });

    await ctx.db.patch(id, updatePayload);
    return await ctx.db.get(id);
  },
});

export const remove = mutation({
  args: { id: v.id("newsletter_templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }

    // Soft delete by marking as inactive
    await ctx.db.patch(args.id, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

export const hardDelete = mutation({
  args: { id: v.id("newsletter_templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const duplicate = mutation({
  args: {
    id: v.id("newsletter_templates"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }

    const now = Date.now();
    const newTemplateId = await ctx.db.insert("newsletter_templates", {
      name: args.newName || `${template.name} (Copy)`,
      description: template.description,
      sections: template.sections,
      category: template.category,
      isDefault: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return newTemplateId;
  },
});

export const setDefault = mutation({
  args: { id: v.id("newsletter_templates") },
  handler: async (ctx, args) => {
    const template = await ctx.db.get(args.id);
    if (!template) {
      throw new Error("Template not found");
    }

    // Unset all other defaults
    const existingDefaults = await ctx.db
      .query("newsletter_templates")
      .filter((q) => q.eq(q.field("isDefault"), true))
      .collect();

    for (const t of existingDefaults) {
      await ctx.db.patch(t._id, { isDefault: false });
    }

    // Set this one as default
    await ctx.db.patch(args.id, {
      isDefault: true,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
