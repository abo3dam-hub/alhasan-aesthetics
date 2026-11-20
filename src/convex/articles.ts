import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("articles").withIndex("by_order").collect();
  },
});

/** Published articles, newest first (for the public blog). */
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("articles").withIndex("by_order").collect();
    return all
      .filter((a) => a.isPublished)
      .sort((a, b) => (b.publishDate ?? 0) - (a.publishDate ?? 0));
  },
});

/** Canonical slug form: no surrounding whitespace/slashes, lowercase. */
export function normalizeSlug(raw: string): string {
  return raw.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const clean = normalizeSlug(args.slug);
    // Fast path: exact (or normalized) slug via the index.
    for (const candidate of [args.slug, clean]) {
      const hit = await ctx.db
        .query("articles")
        .withIndex("by_slug", (q) => q.eq("slug", candidate))
        .first();
      if (hit) return hit;
    }
    // Fallback: legacy rows whose stored slug carries slashes/case
    // (e.g. "/my-article/" pasted into the dashboard slug field).
    const all = await ctx.db.query("articles").collect();
    return all.find((a) => normalizeSlug(a.slug) === clean) ?? null;
  },
});

export const getById = query({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    slug: v.string(),
    titleAr: v.string(),
    titleEn: v.string(),
    excerptAr: v.string(),
    excerptEn: v.string(),
    bodyAr: v.string(),
    bodyEn: v.string(),
    coverImage: v.optional(v.string()),
    categoryAr: v.optional(v.string()),
    categoryEn: v.optional(v.string()),
    relatedProcedureSlug: v.optional(v.string()),
    seoTitleAr: v.optional(v.string()),
    seoTitleEn: v.optional(v.string()),
    seoDescriptionAr: v.optional(v.string()),
    seoDescriptionEn: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    updatedDate: v.optional(v.number()),
    readingMinutes: v.optional(v.number()),
    isPublished: v.boolean(),
    isFeatured: v.optional(v.boolean()),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Store slugs canonically no matter what the client sent (see normalizeSlug).
    return await ctx.db.insert("articles", {
      ...args,
      slug: normalizeSlug(args.slug),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("articles"),
    slug: v.optional(v.string()),
    titleAr: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    excerptAr: v.optional(v.string()),
    excerptEn: v.optional(v.string()),
    bodyAr: v.optional(v.string()),
    bodyEn: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    categoryAr: v.optional(v.string()),
    categoryEn: v.optional(v.string()),
    relatedProcedureSlug: v.optional(v.string()),
    seoTitleAr: v.optional(v.string()),
    seoTitleEn: v.optional(v.string()),
    seoDescriptionAr: v.optional(v.string()),
    seoDescriptionEn: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    publishDate: v.optional(v.number()),
    updatedDate: v.optional(v.number()),
    readingMinutes: v.optional(v.number()),
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...updates } = args;
    if (updates.slug !== undefined) {
      updates.slug = normalizeSlug(updates.slug);
    }
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});