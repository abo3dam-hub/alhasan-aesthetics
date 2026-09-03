import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./admin";

/** Generate a signed upload URL for file uploads */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/** Record an uploaded file in the media table */
export const recordUpload = mutation({
  args: {
    storageId: v.string(),
    url: v.string(),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    alt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const admin = await requireAdmin(ctx);
    return await ctx.db.insert("media", {
      ...args,
      uploadedAt: Date.now(),
      uploadedBy: admin.userId,
    });
  },
});

/** List all uploaded media (newest first) */
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("media").order("desc").collect();
  },
});

/** Get a single media item by storageId */
export const getByStorageId = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("media")
      .withIndex("by_storageId", (q) => q.eq("storageId", args.storageId))
      .first();
  },
});

/** Get the URL for a stored file */
export const getFileUrl = query({
  args: { storageId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId as any);
  },
});

/**
 * Resolve an image reference to a working URL.
 * Handles: absolute URLs, storageIds, and legacy/broken references.
 * If the input looks like a Convex storageId (no protocol prefix),
 * it resolves via ctx.storage.getUrl(). Otherwise returns as-is.
 */
export const resolveUrl = query({
  args: { ref: v.string() },
  handler: async (ctx, args) => {
    const ref = args.ref;
    if (!ref || ref === "") return "";

    // Already a full URL — return as-is
    if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) {
      return ref;
    }

    // Looks like a storageId (no protocol) — resolve via Convex storage
    try {
      const resolved = await ctx.storage.getUrl(ref as any);
      return resolved || ref;
    } catch {
      return ref;
    }
  },
});

/**
 * Resolve multiple image references at once for efficient batch loading.
 */
export const resolveUrls = query({
  args: { refs: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results: Record<string, string> = {};
    for (const ref of args.refs) {
      if (!ref || ref === "") {
        results[ref] = "";
        continue;
      }
      if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:")) {
        results[ref] = ref;
        continue;
      }
      try {
        const resolved = await ctx.storage.getUrl(ref as any);
        results[ref] = resolved || ref;
      } catch {
        results[ref] = ref;
      }
    }
    return results;
  },
});

/** Check if a media URL is referenced by any CMS content */
export const checkReferences = query({
  args: { url: v.string() },
  handler: async (ctx, args) => {
    const url = args.url;
    const refs: string[] = [];

    // Check hero image
    const hero = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "hero"))
      .first();
    if (hero?.value?.image === url) refs.push("Hero Image");

    // Check about image
    const about = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "about"))
      .first();
    if (about?.value?.image === url) refs.push("Doctor Profile");

    // Check all procedures
    const procedures = await ctx.db.query("procedures").collect();
    for (const p of procedures) {
      if (p.image === url) refs.push(`Procedure: ${p.titleEn}`);
      if (p.ogImage === url) refs.push(`Procedure OG: ${p.titleEn}`);
      if (p.beforeImage === url) refs.push(`Procedure Before: ${p.titleEn}`);
      if (p.afterImage === url) refs.push(`Procedure After: ${p.titleEn}`);
      if (p.gallery) {
        for (const gUrl of p.gallery) {
          if (gUrl === url) refs.push(`Procedure Gallery: ${p.titleEn}`);
        }
      }
    }

    // Check all before/after cases
    const cases = await ctx.db.query("beforeAfter").collect();
    for (const c of cases) {
      if (c.beforeImage === url) refs.push(`B&A Before: ${c.titleEn}`);
      if (c.afterImage === url) refs.push(`B&A After: ${c.titleEn}`);
    }

    // Check all testimonials
    const testimonials = await ctx.db.query("testimonials").collect();
    for (const t of testimonials) {
      if (t.avatar === url) refs.push(`Testimonial: ${t.nameEn}`);
    }

    // Check SEO OG image
    const seo = await ctx.db
      .query("siteSettings")
      .withIndex("by_key", (q) => q.eq("key", "seo"))
      .first();
    if (seo?.value?.ogImage === url) refs.push("Global SEO OG Image");

    // CTA section is text/design only — no image field exposed in Dashboard or public site

    return refs;
  },
});

/**
 * Repair media records that have a storageId but no usable URL.
 * Uses ctx.storage.getUrl() for reliable, canonical URL generation.
 * Idempotent — only updates records where url is empty/missing/broken.
 */
export const repairUrls = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const items = await ctx.db.query("media").collect();
    let repaired = 0;
    let skipped = 0;
    let failed = 0;
    for (const item of items) {
      const needsRepair = !item.url || item.url === "" || item.url.startsWith("blob:");
      if (needsRepair) {
        try {
          const resolved = await ctx.storage.getUrl(item.storageId as any);
          if (resolved) {
            await ctx.db.patch(item._id, { url: resolved });
            repaired++;
          } else {
            failed++;
          }
        } catch {
          failed++;
        }
      } else {
        skipped++;
      }
    }
    return `Media URL repair: ${repaired} repaired, ${skipped} already valid, ${failed} failed.`;
  },
});

/** Update media metadata (alt text) */
export const updateMedia = mutation({
  args: {
    id: v.id("media"),
    alt: v.optional(v.string()),
    name: v.optional(v.string()),
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

/** Delete a media item and its stored file */
export const remove = mutation({
  args: { id: v.id("media") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const item = await ctx.db.get(args.id);
    if (item) {
      try {
        await ctx.storage.delete(item.storageId as any);
      } catch {
        // File may already be gone from storage
      }
      await ctx.db.delete(args.id);
    }
  },
});
