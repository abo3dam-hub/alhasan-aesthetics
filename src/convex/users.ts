import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { requireAdmin } from "./admin";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 * Usage: const signedInUser = await ctx.runQuery(api.authHelpers.currentUser);
 * THIS FUNCTION IS READ-ONLY. DO NOT MODIFY.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);

    if (user === null) {
      return null;
    }

    return user;
  },
});/**
 * Use this function internally to get the current user data. Remember to handle the null user case.
 * @param ctx 
 * @returns 
 */
export const getCurrentUser = async (ctx: QueryCtx) => {
  const userId = await getAuthUserId(ctx);
  if (userId === null) {
    return null;
  }
  return await ctx.db.get(userId);
};

/**
 * Public admin listing of user accounts. Admin-only.
 */
export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("users").order("asc").collect();
  },
});

/**
 * Promote an existing account to admin. Admin-only.
 * Fails with a clear error if the email is not a known account.
 */
export const promoteUser = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const email = args.email.trim().toLowerCase();
    if (!email) {
      throw new Error("Email is required.");
    }

    const userDoc = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (!userDoc) {
      throw new Error(`No account found for "${email}".`);
    }

    await ctx.db.patch(userDoc._id, { role: "admin" });
    return userDoc;
  },
});
