# Password Authentication Implementation Report

- **Date:** 2026-09-13
- **Repository:** `abo3dam-hub/alhasan-aesthetics`
- **Commit:** `ebc9c47` — `auth: replace email-OTP with email + password authentication`
- **Status:** Implemented, validated (build + lint), committed, pushed. **Not deployed.**

---

## 1. Summary

The dashboard authentication flow was migrated from **Freebuff-powered Email-OTP** to **Email + Password** using the Convex Auth **`Password`** provider (`@convex-dev/auth` v0.0.90, scrypt-hashed). The new flow supports **exactly two administrator accounts**, enforced atomically on the server. Public browsing remains unauthenticated. No email/OTP/Freebuff dependency remains in the active auth path.

This work was performed against the current repository only. The Vercel deployment and the production Convex deployment were **NOT** updated.

---

## 2. Files Changed

| File | Change |
|---|---|
| `src/convex/auth.ts` | Rewritten: registers only the `Password` provider; adds `callbacks.createOrUpdateUser` implementing the two-admin gate + `role: "admin"` on signup. Removed `emailOtp` and `Anonymous` providers. |
| `src/convex/auth/emailOtp.ts` | **Deleted.** Was the only email transport (`POST https://auth.freebuff.app/send_otp` with embedded API key `fb_email_…`). |
| `src/convex/auth.config.ts` | Removed the Freebuff-federated `customJwt` provider (issuer `https://freebuff.com`, JWKS endpoint, `applicationID: "vly-convex"`) and the `VLY_CONVEX_AUTH_ISSUER` fallback. Kept the self-hosted token-validation provider (`domain: CONVEX_SITE_URL`). |
| `src/convex/users.ts` | Removed obsolete `becomeAdmin` mutation (first-user elevation). Kept `currentUser` / `getCurrentUser`. |
| `src/pages/Auth.tsx` | Rewritten as a single email + password form with two modes: **Sign in** and **Create Admin Account**. Password inputs (`minLength=8`). Removed the "Secured by freebuff.com" footer. |
| `src/pages/Dashboard.tsx` | Removed the "Become Admin" button and its state/flow. Added a non-admin notice card. |
| `src/convex/_generated/api.d.ts` | Dropped the `auth/emailOtp` module import + `fullApi` entry. Other `_generated` files were already derived from `schema.ts`/`auth.ts`. |

Diff: **+195 / −301** across 7 files (one deleted).

---

## 3. Authentication Flow — Before vs After

### Before
1. `Auth.tsx` asked for an email → `signIn("email-otp", …)`.
2. `src/convex/auth/emailOtp.ts` generated a 6-digit code and POSTed it to **`https://auth.freebuff.app/send_otp`** with a hardcoded Freebuff API key.
3. User entered the code; Convex Auth created/verified the account.
4. Freebuff-federated `customJwt` provider in `auth.config.ts` could also authenticate users carrying a Freebuff-signed JWT.
5. First user could self-elevate to admin via `users.becomeAdmin`.

### After
1. `Auth.tsx` asks for email + password.
2. `signIn("password", { email, password, flow: "signIn" })` → Convex Auth `Password` provider verifies the scrypt hash stored in `authAccounts.secret`.
3. Registration (`flow: "signUp"`) is gated server-side: `createOrUpdateUser` counts existing password-linked admin accounts; while `< 2`, a new user is created with `role: "admin"`; at `>= 2` it throws *"Registration is closed: the two administrator accounts already exist."*
4. `RequireAuth` guards `/dashboard`; every CMS mutation remains guarded by `requireAdmin()` (`src/convex/admin.ts`) — authorization is 100% server-side.

Public (landing/procedure/consultation) pages are unauthenticated and unaffected.

---

## 4. Security & Concurrency Notes

- **Atomic gate:** `createOrUpdateUser` runs inside the **same mutation** that creates the account (`auth:store` → `createAccountFromCredentials`). The admin count read and the user insert are one transaction.
- **Count definition:** counts users with an `authAccounts` row for the `"password"` provider whose `role === "admin"` — i.e., **login-capable** admins. Legacy email-OTP-era admin rows (no password) are preserved and do not consume a slot.
- **Only two accounts ever:** every successful signup becomes an admin; after two, signups are rejected entirely. No non-admin registration path is exposed.
- **Passwords:** hashed by the provider (Scrypt). No plaintext, no credentials, no secrets in source.
- **JsKnown trade-off:** a registration race window exists only while fewer than 2 admins exist (two concurrent signups could each see 1 and both succeed, reaching the limit — never exceeding enforcement after that). The owner is advised to create both admins promptly during the initial setup window.

---

## 5. Validation

| Check | Command | Result |
|---|---|---|
| Typecheck + production build | `npm run build` (`tsc -b && vite build`) | **PASS** |
| Lint (working tree) | `npx eslint .` | 166 errors / 18 warnings — **net-zero vs HEAD** (verified against a clean worktree at `5c85da1`) |
| Lint (touched non-Dashboard files) | `npx eslint` on `auth.ts`, `auth.config.ts`, `users.ts`, `Auth.tsx` | 0 errors |
| Removed-reference scan | grep for `email-otp`, `emailOtp`, `send_otp`, `auth.freebuff`, `freebuff`, `VLY_`, `becomeAdmin` in `src/convex|src/pages|src/main.tsx|src/hooks|src/components` | **NONE found** |

There is no automated test suite in the project (`package.json` has no `test` script).

---

## 6. Remaining Freebuff / VLY Dependencies

**Removed from the auth path (runtime):**
- `auth.freebuff.app/send_otp` + API key — file deleted.
- Freebuff `customJwt` federated provider — removed from `auth.config.ts`.
- `VLY_CONVEX_AUTH_ISSUER` usage in source — removed.

**Still present, intentionally NOT touched (out of scope — not authentication):**
- `@vly-ai/integrations` import (`src/main.tsx:1`), `vlyPlugin()` (`vite.config.ts`), `VlyToolbar` (`vly-toolbar-readonly.tsx`) — dev/preview platform tooling.
- Dead files `src/instrumentation.tsx`, `src/lib/vly-integrations.ts` (not imported anywhere).
- Local `.env.local` still lists `VLY_CONVEX_AUTH_ISSUER` (now unused; Vercel env untouched).

---

## 7. How the Two Admin Accounts Are Created

**Manual, secure step — no credentials committed.**

1. Deploy the updated Convex backend, then the Vercel frontend (below).
2. Open `https://dr-alhasan.com/auth`.
3. Click **"Don't have an account? Create one"**.
4. Register admin #1 with the clinic's chosen email and a strong password (≥ 8 chars), then repeat for admin #2.
5. The server automatically assigns `role: "admin"` to both and **closes registration** once two exist. Attempts to register a third account fail with the "Registration is closed" message.

> Important: whichever two accounts are registered first (from the moment the new frontend is live) become the admins. Create both promptly during the setup window.

---

## 8. Manual Steps Required Before the First Vercel Deployment

1. **Deploy Convex** from a logged-in machine:
   ```bash
   npx convex login   # once, if not logged in
   npx convex deploy
   ```
   This pushes the new `auth.ts` / `auth.config.ts`, registers the `password` provider, and regenerates `_generated`. Verify `auth.config.json` reflects the password-only config.
2. **Do NOT change any Vercel environment variables** (per task constraints). `VITE_CONVEX_URL` stays as-is; the now-unused Freebuff vars can be left or cleaned later.
3. **Deploy Vercel** (the standard CI/CD path) after Convex is live.
4. **Register the two admins** at `/auth` immediately after the frontend goes live (§7) before anyone else can.
5. **Sanity checks:**
   - Landing, `/procedures`, `/procedure/:slug`, `/consultation` still load (public, no auth).
   - Sign in with each admin password → `/dashboard` loads; all CMS tabs (Procedures, Homepage CMS, SEO, Settings, Media) still work (server-side `requireAdmin`).
   - Attempt a third registration → rejected.
   - `GET /sitemap.xml` still responds.

---

## 9. Risks & Notes

- **Old data preserved, not deletable logins:** existing email-OTP-era users (including the old admin row) remain in `users`, but have no password and cannot sign in. No tables or CMS data were deleted.
- **Setup-window race:** before two admins exist, registration is open to whoever arrives first. Reconciled by creating both admins immediately at go-live.
- **Sessions:** existing long-lived sessions may survive briefly after deploy; server-side `requireAdmin` still blocks non-admins from CMS mutations.
- **Not deployed:** pipeline intentionally not run — nothing here is live yet.