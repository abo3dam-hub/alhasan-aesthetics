import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

// ─── Hero Settings ───
export const getHeroSettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "hero"))
      .first();
    return result?.value ?? null;
  },
});

// ─── About Settings ───
export const getAboutSettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "about"))
      .first();
    return result?.value ?? null;
  },
});

// ─── CTA Settings ───
export const getCTASettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "cta"))
      .first();
    return result?.value ?? null;
  },
});

// ─── Footer Settings ───
export const getFooterSettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "footer"))
      .first();
    return result?.value ?? null;
  },
});

// ─── Homepage Visibility ───
export const getHomepageSettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "homepage"))
      .first();
    return result?.value ?? null;
  },
});

// ─── SEO Settings ───
export const getSEOSettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "seo"))
      .first();
    return result?.value ?? null;
  },
});

// ─── Section Content (reusable for procedures/testimonials/faq/beforeAfter headers) ───
export const getSectionContent = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return result?.value ?? null;
  },
});

// ─── Upsert any CMS setting (admin only) ───
export const set = mutation({
  args: {
    key: v.string(),
    value: v.any(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { value: args.value });
    } else {
      await ctx.db.insert("siteSettings", {
        key: args.key,
        value: args.value,
      });
    }
  },
});
