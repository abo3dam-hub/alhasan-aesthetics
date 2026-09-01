import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("faq").withIndex("by_order").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("faq").withIndex("by_order").collect();
    return all.filter((f) => f.isActive);
  },
});

export const create = mutation({
  args: {
    questionAr: v.string(),
    questionEn: v.string(),
    answerAr: v.string(),
    answerEn: v.string(),
    category: v.optional(v.string()),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("faq", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("faq"),
    questionAr: v.optional(v.string()),
    questionEn: v.optional(v.string()),
    answerAr: v.optional(v.string()),
    answerEn: v.optional(v.string()),
    category: v.optional(v.string()),
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
  args: { id: v.id("faq") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
