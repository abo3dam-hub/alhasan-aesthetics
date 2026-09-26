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
/* ─── Service API tokens (read-only automation) ────────────────────────────
 * One-time registration of a token *hash* for a named automation client
 * (e.g. the morning briefing cron). The plaintext token is never stored
 * here — only its SHA-256 hex digest. Internal only. */

/** Register (or rotate) the token hash for a named service client. */
export const registerServiceToken = internalMutation({
  args: {
    name: v.string(),
    tokenHash: v.string(), // lowercase hex SHA-256 of the bearer token
    scope: v.string(), // e.g. "briefing-analytics"
  },
  handler: async (ctx, args) => {
    if (!/^[0-9a-f]{64}$/.test(args.tokenHash)) {
      throw new Error("tokenHash must be a 64-char lowercase hex SHA-256");
    }
    const existing = await ctx.db
      .query("serviceTokens")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        tokenHash: args.tokenHash,
        scope: args.scope,
        createdAt: Date.now(),
      });
      return { rotated: true };
    }
    await ctx.db.insert("serviceTokens", {
      name: args.name,
      tokenHash: args.tokenHash,
      scope: args.scope,
      createdAt: Date.now(),
    });
    return { rotated: false };
  },
});

/** Look up the stored token hash for a named service client. Internal only —
 *  the comparison itself happens in the HTTP layer (constant-time). */
export const getServiceTokenHash = internalQuery({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("serviceTokens")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .first();
    if (!row) return null;
    return { tokenHash: row.tokenHash, scope: row.scope };
  },
});

/* ─── Briefing analytics (Europe/Berlin day bucketing) ───────────────────── */

/** Convert a wall-clock time in a named IANA zone to a UTC epoch-ms. */
function zonedTimeToUtc(
  year: number,
  month: number, // 1-12
  day: number, // Date.UTC-style overflow is tolerated
  hour: number,
  minute: number,
  timeZone: string,
): number {
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(new Date(guess))) parts[p.type] = p.value;
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );
  return guess - (asUtc - guess);
}

/** Resolve which UTC window "day" means. Accepts an explicit YYYY-MM-DD
 *  (interpreted in Europe/Berlin); defaults to yesterday in Europe/Berlin. */
function resolveBriefingDay(day: string | undefined): {
  dayIso: string;
  start: number;
  end: number;
} {
  const berlinParts = (ms: number) => {
    const out: Record<string, string> = {};
    for (const p of new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Berlin",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(ms))) {
      if (p.type !== "literal") out[p.type] = p.value;
    }
    return {
      y: Number(out.year),
      m: Number(out.month),
      d: Number(out.day),
    };
  };

  if (day !== undefined) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
    if (!m) throw new Error("day must be YYYY-MM-DD");
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (mo < 1 || mo > 12 || d < 1 || d > 31) throw new Error("day must be YYYY-MM-DD");
    return {
      dayIso: day,
      start: zonedTimeToUtc(y, mo, d, 0, 0, "Europe/Berlin"),
      end: zonedTimeToUtc(y, mo, d + 1, 0, 0, "Europe/Berlin"),
    };
  }

  const now = Date.now();
  const t = berlinParts(now);
  const todayStart = zonedTimeToUtc(t.y, t.m, t.d, 0, 0, "Europe/Berlin");
  const start = todayStart - 24 * 60 * 60 * 1000;
  const y = berlinParts(start);
  const dayIso = `${y.y}-${String(y.m).padStart(2, "0")}-${String(y.d).padStart(2, "0")}`;
  return { dayIso, start, end: todayStart };
}

/** The exact numbers the morning briefing needs for one Berlin day.
 *  Internal only — exposed to automation solely through the token-gated
 *  HTTP endpoint in http.ts. Read-only: no writes, no other data. */
export const getBriefingStats = internalQuery({
  args: { day: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const { dayIso, start, end } = resolveBriefingDay(args.day);

    const visits = await ctx.db
      .query("pageVisits")
      .withIndex("by_ts", (q) => q.gte("ts", start).lt("ts", end))
      .collect();

    const events = await ctx.db
      .query("analyticsEvents")
      .withIndex("by_ts", (q) => q.gte("ts", start).lt("ts", end))
      .collect();

    const sessions = new Set<string>();
    for (const v of visits) if (v.sessionId) sessions.add(v.sessionId);

    const pageCounts = new Map<string, number>();
    for (const v of visits) pageCounts.set(v.path, (pageCounts.get(v.path) ?? 0) + 1);
    const topPages = [...pageCounts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const countryCounts = new Map<string, number>();
    for (const v of visits) {
      const c = v.country || "Unknown";
      countryCounts.set(c, (countryCounts.get(c) ?? 0) + 1);
    }
    const topCountries = [...countryCounts.entries()]
      .map(([country, count]) => ({ country, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const countType = (type: string) => events.filter((e) => e.type === type).length;

    return {
      day: dayIso,
      timezone: "Europe/Berlin",
      visits: visits.length,
      uniqueVisitors: sessions.size,
      whatsappClicks: countType("whatsapp"),
      ctaClicks: countType("cta"),
      topPages,
      topCountries,
    };
  },
});
