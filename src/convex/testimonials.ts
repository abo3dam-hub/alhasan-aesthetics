import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("testimonials").withIndex("by_order").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("testimonials").withIndex("by_order").collect();
    return all.filter((t) => t.isActive);
  },
});

export const create = mutation({
  args: {
    nameAr: v.string(),
    nameEn: v.string(),
    textAr: v.string(),
    textEn: v.string(),
    rating: v.number(),
    procedureType: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("testimonials", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("testimonials"),
    nameAr: v.optional(v.string()),
    nameEn: v.optional(v.string()),
    textAr: v.optional(v.string()),
    textEn: v.optional(v.string()),
    rating: v.optional(v.number()),
    procedureType: v.optional(v.string()),
    avatar: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
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
  args: { id: v.id("testimonials") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
