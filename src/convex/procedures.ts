import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("procedures")
      .withIndex("by_order")
      .collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("procedures").withIndex("by_order").collect();
    return all.filter((p) => p.isActive);
  },
});

export const listFeatured = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("procedures").withIndex("by_order").collect();
    return all.filter((p) => p.isActive && p.isFeatured);
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("procedures")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    return results;
  },
});

export const getById = query({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("procedures")
      .withIndex("by_category", (q) => q.eq("category", args.category))
      .collect();
    return all.filter((p) => p.isActive);
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    titleAr: v.string(),
    titleEn: v.string(),
    descriptionAr: v.string(),
    descriptionEn: v.string(),
    longDescriptionAr: v.string(),
    longDescriptionEn: v.string(),
    icon: v.string(),
    category: v.string(),
    duration: v.string(),
    recovery: v.string(),
    price: v.optional(v.string()),
    image: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    beforeImage: v.optional(v.string()),      afterImage: v.optional(v.string()),
      isActive: v.boolean(),
      isFeatured: v.optional(v.boolean()),
      order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("procedures", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("procedures"),
    slug: v.optional(v.string()),
    titleAr: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    longDescriptionAr: v.optional(v.string()),
    longDescriptionEn: v.optional(v.string()),
    icon: v.optional(v.string()),
    category: v.optional(v.string()),
    duration: v.optional(v.string()),
    recovery: v.optional(v.string()),
    price: v.optional(v.string()),
    image: v.optional(v.string()),
    gallery: v.optional(v.array(v.string())),
    beforeImage: v.optional(v.string()),      afterImage: v.optional(v.string()),
      isActive: v.optional(v.boolean()),
      isFeatured: v.optional(v.boolean()),
      order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("procedures") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
