import type { AuthConfig } from "convex/server";

// Validates the JWTs this deployment issues for its own users (iss =
// CONVEX_SITE_URL). The deployment self-issues tokens WITHOUT a `kid` header,
// validated via OIDC discovery at `${domain}/.well-known/openid-configuration`
// (served by auth.addHttpRoutes() in convex/http.ts). Do NOT convert this entry
// to `type: "customJwt"` — that path rejects tokens without a `kid` header, so
// sign-in would silently never confirm and RequireAuth would loop at /auth.

export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;