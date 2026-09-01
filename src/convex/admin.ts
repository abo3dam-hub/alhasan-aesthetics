import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";

/**
 * Verify the current user has admin role.
 * Throws if not authenticated or not admin.
 * Use this at the top of any CMS mutation.
 */
export async function requireAdmin(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") {
    throw new Error("Unauthorized: admin access required");
  }
  return { userId, user };
}

/**
 * Check if current user is admin (for queries).
 * Returns null if not admin, or the user if admin.
 */
export async function getAdminUser(ctx: MutationCtx) {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user || user.role !== "admin") return null;
  return { userId, user };
}
