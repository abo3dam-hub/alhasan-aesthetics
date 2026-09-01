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
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("media", {
      ...args,
      uploadedBy: (await requireAdmin(ctx)).userId,
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
