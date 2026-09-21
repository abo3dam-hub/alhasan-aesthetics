import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * App-level rate limiting for admin sign-in, keyed by email address.
 *
 * Enforced cooperatively by the Auth page:
 *   1. getLoginStatus(email)  — checked BEFORE calling signIn;
 *   2. recordFailedAttempt    — called when signIn throws (bad credentials);
 *   3. resetLoginAttempts     — called after a successful sign-in.
 *
 * This is defense-in-depth against brute-force/repeated-password attempts on
 * the two administrator accounts. It cannot limit the Convex backend itself
 * (no IP is available inside queries), but it makes on-line guessing
 * impractical and prevents accidental lockouts from retrying the wrong
 * password.
 */

export const MAX_ATTEMPTS = 5;
export const WINDOW_MS = 15 * 60 * 1000;
export const LOCK_MS = 15 * 60 * 1000;

/** For a given email, return whether sign-in is currently blocked. */
export const getLoginStatus = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email) return { blocked: false, retryAfterMs: 0, attemptsLeft: MAX_ATTEMPTS };

    const doc = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!doc) return { blocked: false, retryAfterMs: 0, attemptsLeft: MAX_ATTEMPTS };

    const now = Date.now();
    if (doc.lockedUntil && doc.lockedUntil > now) {
      return {
        blocked: true,
        retryAfterMs: doc.lockedUntil - now,
        attemptsLeft: 0,
      };
    }

    // Window expired — treat as a clean slate
    if (doc.firstAttemptAt + WINDOW_MS < now) {
      return { blocked: false, retryAfterMs: 0, attemptsLeft: MAX_ATTEMPTS };
    }

    return {
      blocked: false,
      retryAfterMs: 0,
      attemptsLeft: Math.max(0, MAX_ATTEMPTS - doc.count),
    };
  },
});

/** Record one failed sign-in attempt for an email. */
export const recordFailedAttempt = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email) return;

    const now = Date.now();
    const doc = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (!doc) {
      await ctx.db.insert("loginAttempts", {
        email,
        count: 1,
        firstAttemptAt: now,
        lastAttemptAt: now,
      });
      return;
    }

    // Start a fresh window if the old one expired
    const inWindow = doc.firstAttemptAt + WINDOW_MS >= now;
    const nextCount = inWindow ? doc.count + 1 : 1;
    const lockedUntil =
      nextCount >= MAX_ATTEMPTS ? now + LOCK_MS : doc.lockedUntil;

    await ctx.db.patch(doc._id, {
      count: nextCount,
      firstAttemptAt: inWindow ? doc.firstAttemptAt : now,
      lastAttemptAt: now,
      lockedUntil,
    });
  },
});

/** Reset the attempt counter (called after a successful sign-in). */
export const resetLoginAttempts = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    if (!email) return;
    const doc = await ctx.db
      .query("loginAttempts")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (doc) {
      await ctx.db.delete(doc._id);
    }
  },
});