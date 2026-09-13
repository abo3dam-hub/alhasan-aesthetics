// Password-based authentication for the admin portal.
//
// ONLY TWO administrator accounts are allowed. Account creation (registration)
// is enforced server-side inside the `createOrUpdateUser` callback, which runs
// in the SAME mutation that creates the account, so the check is atomic:
//   - while fewer than MAX_ADMIN_ACCOUNTS password (login-capable) admin
//     accounts exist, a new sign-up creates an admin account;
//   - once the limit is reached, every further sign-up is rejected with
//     "Registration is closed" (no public user registration).
//
// Existing admin-role rows from the previous email-OTP era are preserved but
// have no password, so they do not count toward the two login-capable admin
// accounts and cannot sign in.
//
// Public browsing does not require authentication (landing pages are public);
// therefore the old Anonymous provider is not registered here.

import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

export const MAX_ADMIN_ACCOUNTS = 2;

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password({ id: "password" })],
  callbacks: {
    // Called only when a new account is being created (signUp) for a
    // credentials provider, inside the account-creation mutation.
    createOrUpdateUser: async (ctx, args) => {
      if (args.provider.id === "password") {
        const accounts = await ctx.db
          .query("authAccounts")
          .filter((q) => q.eq(q.field("provider"), "password"))
          .collect();
        let passwordAdmins = 0;
        for (const account of accounts) {
          const user = await ctx.db.get(account.userId);
          if (user?.role === "admin") passwordAdmins += 1;
        }
        if (passwordAdmins >= MAX_ADMIN_ACCOUNTS) {
          throw new Error(
            "Registration is closed: the two administrator accounts already exist.",
          );
        }
        if (args.existingUserId !== null) {
          return args.existingUserId;
        }
        return await ctx.db.insert("users", {
          email: args.profile.email,
          role: "admin",
        });
      }
      if (args.existingUserId !== null) {
        return args.existingUserId;
      }
      return await ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
        isAnonymous: true,
      });
    },
  },
});