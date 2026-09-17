import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

/** Non-crypto stable key derived from an IP address. The raw IP is never
 *  persisted — we only keep this hash to reuse/refresh the country cache. */
export function hashIp(ip: string): string {
  let h = 5381;
  for (let i = 0; i < ip.length; i++) {
    h = ((h << 5) + h + ip.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export const insertVisit = mutation({
  args: {
    path: v.string(),
    locale: v.optional(v.string()),
    country: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("pageVisits", {
      path: args.path,
      locale: args.locale,
      country: args.country,
      sessionId: args.sessionId,
      ts: Date.now(),
    });
  },
});

export const saveIpCache = mutation({
  args: { ipHash: v.string(), country: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ipCountryCache")
      .withIndex("by_ipHash", (q) => q.eq("ipHash", args.ipHash))
      .first();
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    if (existing) {
      await ctx.db.patch(existing._id, { country: args.country, expiresAt });
    } else {
      await ctx.db.insert("ipCountryCache", {
        ipHash: args.ipHash,
        country: args.country,
        expiresAt,
      });
    }
  },
});

export const getIpCache = query({
  args: { ipHash: v.string() },
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("ipCountryCache")
      .withIndex("by_ipHash", (q) => q.eq("ipHash", args.ipHash))
      .first();
    if (!entry || entry.expiresAt < Date.now()) return null;
    return entry.country ?? null;
  },
});

/** Maintenance helper: remove recorded visits for a given path (e.g. test
 *  data). Internal only — cannot be called from the client. */
export const purgePath = internalMutation({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("pageVisits")
      .filter((q) => q.eq(q.field("path"), args.path))
      .collect();
    for (const row of rows) await ctx.db.delete(row._id);
    return { deleted: rows.length };
  },
});

export const getStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const range = args.days ?? 30;
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    const from = now - range * dayInMs;

    const visits = await ctx.db
      .query("pageVisits")
      .filter((q) => q.gte(q.field("ts"), from))
      .collect();

    const dayStart = new Date(now).setHours(0, 0, 0, 0);
    const weekAgo = now - 7 * dayInMs;

    const today = visits.filter((v) => v.ts >= dayStart).length;
    const last7 = visits.filter((v) => v.ts >= weekAgo).length;
    const total = visits.length;

    const sessions = new Set<string>();
    for (const v of visits) {
      if (v.sessionId) sessions.add(v.sessionId);
    }

    const pageCounts = new Map<string, number>();
    for (const v of visits) {
      pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
    }
    const topPages = [...pageCounts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const countryCounts = new Map<string, number>();
    for (const v of visits) {
      const c = v.country || "Unknown";
      countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
    }
    const countries = [...countryCounts.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count);

    const series: { day: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const start = dayStart - i * dayInMs;
      const end = start + dayInMs;
      const count = visits.filter((v) => v.ts >= start && v.ts < end).length;
      series.push({ day: new Date(start).toISOString().slice(0, 10), count });
    }

    return {
      total,
      today,
      last7,
      uniqueSessions: sessions.size,
      topPages,
      countries,
      series,
    };
  },
});