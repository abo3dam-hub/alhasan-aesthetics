import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdmin } from "./admin";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";

/**
 * Homepage video section (Reels-style clips).
 *
 * Videos are stored as an array of records inside `siteSettings["videos"]`,
 * exactly like the other homepage CMS sections (hero, about, informationCard…).
 * Each record holds a Convex `storageId` which is resolved to a working URL
 * via `ctx.storage.getUrl()`. Uploads happen through the shared admin-gated
 * `media.generateUploadUrl` signed URL — files are never passed into mutations.
 */
export const VIDEOS_KEY = "videos";

const videoValidator = v.object({
  id: v.string(),
  storageId: v.string(),
  titleAr: v.optional(v.string()),
  titleEn: v.optional(v.string()),
  descriptionAr: v.optional(v.string()),
  descriptionEn: v.optional(v.string()),
  poster: v.optional(v.string()),
  isActive: v.boolean(),
  showOnHome: v.boolean(),
  uploadedAt: v.optional(v.number()),
  uploadedBy: v.optional(v.string()),
  fileName: v.optional(v.string()),
  size: v.optional(v.number()),
  mimeType: v.optional(v.string()),
});
export type VideoRecord = import("convex/values").Infer<typeof videoValidator>;

type AnyDb = QueryCtx["db"] | MutationCtx["db"];

function asRecords(value: unknown): VideoRecord[] {
  return Array.isArray(value) ? (value as VideoRecord[]) : [];
}

async function readVideos(db: AnyDb): Promise<{ settingId?: Id<"siteSettings">; records: VideoRecord[] }> {
  const setting = await db
    .query("siteSettings")
    .withIndex("by_key", (q) => q.eq("key", VIDEOS_KEY))
    .first();
  return { settingId: setting?._id, records: asRecords(setting?.value) };
}

async function writeVideos(db: MutationCtx["db"], settingId: Id<"siteSettings"> | undefined, records: VideoRecord[]) {
  if (settingId) {
    await db.patch(settingId, { value: records });
  } else {
    await db.insert("siteSettings", { key: VIDEOS_KEY, value: records });
  }
}

async function resolveStorageUrl(storage: QueryCtx["storage"], ref: string | undefined) {
  if (!ref) return "";
  try {
    return (await storage.getUrl(ref as Id<"_storage">)) ?? "";
  } catch {
    return "";
  }
}

/** Homepage video reel cards — only active clips flagged for the homepage. */
export const getVideos = query({
  args: {},
  handler: async (ctx) => {
    const { records } = await readVideos(ctx.db);
    const visible = records.filter((rec) => rec.isActive !== false && rec.showOnHome !== false && rec.storageId);
    return Promise.all(
      visible.map(async (rec) => ({
        ...rec,
        url: await resolveStorageUrl(ctx.storage, rec.storageId),
        posterUrl: await resolveStorageUrl(ctx.storage, rec.poster),
      })),
    );
  },
});

/** All video records with resolved URLs (admin management). */
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const { records } = await readVideos(ctx.db);
    return Promise.all(
      records.map(async (rec) => ({
        ...rec,
        url: await resolveStorageUrl(ctx.storage, rec.storageId),
        posterUrl: await resolveStorageUrl(ctx.storage, rec.poster),
      })),
    );
  },
});

/** Insert or update a video record (metadata). */
export const saveVideo = mutation({
  args: { video: videoValidator },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { settingId, records } = await readVideos(ctx.db);
    const idx = records.findIndex((rec) => rec.id === args.video.id);
    const next = { ...args.video };
    if (idx >= 0) {
      const prev = records[idx];
      records[idx] = {
        ...prev,
        ...next,
        uploadedAt: next.uploadedAt ?? prev.uploadedAt ?? Date.now(),
        uploadedBy: next.uploadedBy ?? prev.uploadedBy,
      };
    } else {
      records.push({
        ...next,
        uploadedAt: next.uploadedAt ?? Date.now(),
      });
    }
    await writeVideos(ctx.db, settingId, records);
    return args.video.id;
  },
});

/** Replace the stored file of a video (deletes the old storage object). */
export const replaceVideoFile = mutation({
  args: {
    id: v.string(),
    storageId: v.string(),
    fileName: v.optional(v.string()),
    size: v.optional(v.number()),
    mimeType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { settingId, records } = await readVideos(ctx.db);
    const idx = records.findIndex((rec) => rec.id === args.id);
    if (idx < 0) {
      throw new Error("Video not found");
    }
    const oldStorageId = records[idx].storageId;
    records[idx] = {
      ...records[idx],
      storageId: args.storageId,
      fileName: args.fileName ?? records[idx].fileName,
      size: args.size ?? records[idx].size,
      mimeType: args.mimeType ?? records[idx].mimeType,
    };
    await writeVideos(ctx.db, settingId, records);
    if (oldStorageId && oldStorageId !== args.storageId) {
      const stillUsed = records.some((rec) => rec.storageId === oldStorageId);
      if (!stillUsed) {
        try {
          await ctx.storage.delete(oldStorageId as Id<"_storage">);
        } catch {
          // File may already be gone from storage
        }
      }
    }
  },
});

/** Delete a video record and its stored file. */
export const deleteVideo = mutation({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { settingId, records } = await readVideos(ctx.db);
    const target = records.find((rec) => rec.id === args.id);
    const next = records.filter((rec) => rec.id !== args.id);
    await writeVideos(ctx.db, settingId, next);
    if (target?.storageId) {
      try {
        await ctx.storage.delete(target.storageId as Id<"_storage">);
      } catch {
        // File may already be gone from storage
      }
    }
  },
});