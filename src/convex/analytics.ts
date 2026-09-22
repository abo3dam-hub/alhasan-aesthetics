import { internalMutation, internalQuery, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./admin";

/** Non-crypto stable key derived from an IP address. The raw IP is never
 *  persisted — we only keep this hash to reuse/refresh the country cache. */
export function hashIp(ip: string): string {
  let h = 5381;
  for (let i = 0; i < ip.length; i++) {
    h = ((h << 5) + h + ip.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

export const insertVisit = internalMutation({
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

export const insertEvent = internalMutation({
  args: {
    type: v.string(),
    label: v.string(),
    path: v.optional(v.string()),
    locale: v.optional(v.string()),
    country: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analyticsEvents", {
      type: args.type,
      label: args.label,
      path: args.path,
      locale: args.locale,
      country: args.country,
      sessionId: args.sessionId,
      ts: Date.now(),
    });
  },
});

export const saveIpCache = internalMutation({
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

export const getIpCache = internalQuery({
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

/** Maintenance helper: remove recorded visits and events for a given path
 *  (e.g. test data). Internal only — cannot be called from the client. */
export const purgePath = internalMutation({
  args: { path: v.string() },
  handler: async (ctx, args) => {
    const visits = await ctx.db
      .query("pageVisits")
      .filter((q) => q.eq(q.field("path"), args.path))
      .collect();
    for (const row of visits) await ctx.db.delete(row._id);

    const events = await ctx.db
      .query("analyticsEvents")
      .filter((q) => q.eq(q.field("path"), args.path))
      .collect();
    for (const row of events) await ctx.db.delete(row._id);

    return { deletedVisits: visits.length, deletedEvents: events.length };
  },
});

export const getStats = query({
  args: { days: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
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

    const events = await ctx.db
      .query("analyticsEvents")
      .filter((q) => q.gte(q.field("ts"), from))
      .collect();

    const eventTypeCounts = new Map<string, number>();
    const eventActionCounts = new Map<string, { type: string; label: string; count: number }>();
    for (const e of events) {
      eventTypeCounts.set(e.type, (eventTypeCounts.get(e.type) ?? 0) + 1);
      const key = `${e.type}::${e.label}`;
      const existing = eventActionCounts.get(key);
      if (existing) existing.count += 1;
      else eventActionCounts.set(key, { type: e.type, label: e.label, count: 1 });
    }
    const eventsByType = [...eventTypeCounts.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);
    const topActions = [...eventActionCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      total,
      today,
      last7,
      uniqueSessions: sessions.size,
      topPages,
      countries,
      series,
      events: {
        total: events.length,
        byType: eventsByType,
        top: topActions,
      },
    };
  },
});