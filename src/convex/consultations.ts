import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("consultations").collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived"),
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("consultations")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("consultations", {
      ...args,
      status: "new",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("consultations"),
    status: v.union(
      v.literal("new"),
      v.literal("read"),
      v.literal("replied"),
      v.literal("archived"),
    ),
    reply: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("consultations") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
