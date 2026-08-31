import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("beforeAfter").withIndex("by_order").collect();
  },
});

export const listActive = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("beforeAfter").withIndex("by_order").collect();
    return all.filter((c) => c.isActive);
  },
});

export const getByProcedure = query({
  args: { procedureType: v.string() },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("beforeAfter")
      .withIndex("by_procedure", (q) => q.eq("procedureType", args.procedureType))
      .collect();
    return all.filter((c) => c.isActive);
  },
});

export const create = mutation({
  args: {
    titleAr: v.string(),
    titleEn: v.string(),
    procedureType: v.string(),
    beforeImage: v.string(),
    afterImage: v.string(),
    descriptionAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    patientAge: v.optional(v.number()),
    isActive: v.boolean(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("beforeAfter", args);
  },
});

export const update = mutation({
  args: {
    id: v.id("beforeAfter"),
    titleAr: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    procedureType: v.optional(v.string()),
    beforeImage: v.optional(v.string()),
    afterImage: v.optional(v.string()),
    descriptionAr: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    patientAge: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("beforeAfter") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
