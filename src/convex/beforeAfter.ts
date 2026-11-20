import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { requireAdmin } from "./admin";

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

/**
 * Public before/after feed: the curated standalone cases PLUS one case per
 * active procedure (sub-procedures included) that carries its own
 * before+after pair — so photos added on a procedure also surface in the
 * standalone Before/After section/page (Ali, 2026-11-20). Standalone cases keep their curated order
 * first; procedure-derived cases follow in procedure order. A procedure pair
 * whose two images exactly match a standalone case is not duplicated.
 */
export const listPublic = query({
  args: {},
  handler: async (ctx) => {
    const standalone = (
      await ctx.db.query("beforeAfter").withIndex("by_order").collect()
    ).filter((c) => c.isActive);
    // Sub-procedures are included too: Ali wants every procedure's pair in the
    // feed, not only top-level ones (they surface under "All" on the page).
    const procedures = (
      await ctx.db.query("procedures").withIndex("by_order").collect()
    ).filter((p) => p.isActive && p.beforeImage && p.afterImage);

    const seenPairs = new Set(
      standalone.map((c) => `${c.beforeImage}|${c.afterImage}`),
    );

    return [
      ...standalone.map((c) => ({
        _id: c._id as string,
        titleAr: c.titleAr,
        titleEn: c.titleEn,
        procedureType: c.procedureType,
        beforeImage: c.beforeImage,
        afterImage: c.afterImage,
        descriptionAr: c.descriptionAr,
        descriptionEn: c.descriptionEn,
        patientAge: c.patientAge,
        order: c.order,
        source: "case" as const,
      })),
      ...procedures
        .filter((p) => !seenPairs.has(`${p.beforeImage}|${p.afterImage}`))
        .map((p, i) => ({
          _id: `proc:${p._id}`,
          titleAr: p.titleAr,
          titleEn: p.titleEn,
          procedureType: p.slug,
          beforeImage: p.beforeImage as string,
          afterImage: p.afterImage as string,
          descriptionAr: p.descriptionAr,
          descriptionEn: p.descriptionEn,
          patientAge: undefined,
          order: 10000 + i,
          source: "procedure" as const,
        })),
    ];
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
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
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});
