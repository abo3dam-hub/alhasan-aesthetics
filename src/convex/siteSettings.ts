import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

/** Get a single setting by key */
export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return result?.value ?? null;
  },
});

/** Get all settings */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("siteSettings").collect();
  },
});

/** Get the doctor/clinic settings object */
export const getDoctorSettings = query({
  args: {},
  handler: async (ctx) => {
    const result = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "doctor"))
      .first();
    return result?.value ?? null;
  },
});

/** Upsert a setting (admin only) */
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
