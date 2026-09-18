# Pre-Deploy Audit — Password Authentication

> **🗄️ HISTORICAL SNAPSHOT — archived.** Written 2026-09-13; reflects the project **as of that date**, not now. For the current state see `README.md`, `PROJECT-MASTER-HANDOVER.md`, and `report 9-14-26.md` (latest refresh 2026-09-18).
> **Update 2026-09-17:** the blockers noted here were resolved; password auth runs in production on `kindly-anaconda-422`.

- **Date:** 2026-09-13
- **Repository:** `abo3dam-hub/alhasan-aesthetics`
- **HEAD audited:** `e96d4e9` (`docs: add password authentication implementation report`)
- **Target production Convex deployment:** `gregarious-perch-128` (`.convex.cloud` / `.convex.site`)
- **Verdict:** **NOT READY** — the code and auth configuration are compatible, but two deployment prerequisites must be fixed/verified first (see Blockers).

---

## 1. Convex production configuration compatible with the new `Password` provider — **YES**

- `@convex-dev/auth@0.0.90` ships the `Password` provider (`src/convex/auth.ts:8,14`). It is self-contained: passwords are stored as Scrypt hashes in `authAccounts.secret`; there is **no external service and no required environment variable** for the password-only flow (verify/reset email providers, which *would* need env, are not used).
- The schema already spreads `...authTables` (`src/convex/schema.ts:1,21`), which defines `authAccounts`, `authSessions`, `authVerificationTokens`, `oauthAccounts` — the storage the password provider needs. `users.role` accepts `"admin"` via `roleValidator` (`schema.ts:17`), matching the `createOrUpdateUser` insert (`{ email, role: "admin" }`, `auth.ts:36`).
- The Convex CLI bundles `auth.config.ts` itself at deploy time (special file, alongside `schema`, `http`, `crons`); a committed `auth.config.json` is **NOT required** for this CLI generation.
- **Live evidence:** the target deployment `https://gregarious-perch-128.convex.site/.well-known/openid-configuration` returns **HTTP 200** with `issuer: https://gregarious-perch-128.convex.site`, and the restructure-era function `migration:getMigrationStatus` answers successfully on it — the deployment exists, is reachable, and runs current repo code. The old deployment `impartial-ladybug-881` also still answers (same 19-URL sitemap; identical migration payload), so both deployments have the restructured data.

## 2. `src/convex/auth.ts` ⇄ `src/convex/auth.config.ts` internal consistency — **YES**

- `auth.ts` registers only `Password({ id: "password" })` and the admin gate; `auth.config.ts` declares a single **self-issued** provider. No stale OTP/federated/customJwt references remain between the two files.
- The `createOrUpdateUser` gate counts `authAccounts` with provider `"password"` whose owning user has `role === "admin"` (`auth.ts:27-34`) and rejects signups at `MAX_ADMIN_ACCOUNTS = 2` — consistent with `users.role`.
- The config comment and code agree on the token mechanics: this deployment self-issues JWTs **without a `kid` header**, validated via OIDC discovery at `{domain}/.well-known/openid-configuration`; the `customJwt` path is explicitly (and correctly) avoided because it would reject those tokens.

## 3. `CONVEX_SITE_URL` required / correct — **YES (auto-provided, no action)**

- `CONVEX_SITE_URL` is the only server-side env referenced (`auth.config.ts:13`, `process.env.CONVEX_SITE_URL!`).
- The Convex runtime injects it server-side as the deployment's site URL — `https://<deployment>.convex.site`. The live OIDC issuer on the target deployment (`https://gregarious-perch-128.convex.site`) exactly matches what the server sees, so token signing (issuer) and validation (config domain) are consistent with **no manual override**.
- Only if the deployment were mounted behind a custom site domain would `CONVEX_SITE_URL` need an explicit value. It is not, so: **no env needed**.
- `VITE_CONVEX_SITE_URL` exists in local `.env.local` but is **not referenced anywhere in `src/`** (audited).

## 4. `VITE_CONVEX_URL` must point to `gregarious-perch-128` — **NOT confirmed / prerequisite**

- The only source reference is the fallback in `src/main.tsx:89`:
  ```ts
  import.meta.env.VITE_CONVEX_URL || 'https://impartial-ladybug-881.convex.cloud'
  ```
  The code fallback therefore still targets the **old** deployment `impartial-ladybug-881`.
- Local `.env.local` sets `VITE_CONVEX_URL` to the anonymous dev backend (`127.0.0.1:3210`) — dev-only.
- **Action:** the Vercel build must inject `VITE_CONVEX_URL=https://gregarious-perch-128.convex.cloud`. Vercel environment could not be inspected (no access, read-only). If it is not set to the new URL, the live site will continue talking to the old backend.

## 5. Environment variables for the first `npx convex deploy` — **DANGER in `.env.local`**

- `.env.local` contains `CONVEX_DEPLOYMENT=` (currently the anonymous deployment). If this file is present on the machine that runs the deploy, the CLI can target the anonymous deployment instead of production `gregarious-perch-128`.
  - **Fix before deploying:** delete the `CONVEX_DEPLOYMENT` line from `.env.local` (or set it to the real deployment name) on the deploy machine.
- `convex.json` contains **no project identifier**, and the CLI schema no longer carries a `project` field — project/deployment linkage lives in the gitignored `.convex/local` state (present on disk). The deploy machine must already be logged in and linked to the project that owns `gregarious-perch-128`; otherwise `npx convex deploy` will prompt interactively to create/select a project.
- No other environment variable is required for the first `convex deploy`.

## 6. Remaining authentication dependency on Freebuff — **NONE in the auth path**

- Removed in `ebc9c47`: `emailOtp.ts` (transport + embedded API key), Freebuff `customJwt` provider, Freebuff footer.
- Remaining VLY/Freebuff surface is **dev & preview tooling only**, none of it authentication:
  - `src/main.tsx:1,5,121` — `@vly-ai/integrations` import + `<VlyToolbar />` (read-only toolbar).
  - `src/instrumentation.tsx`, `src/lib/vly-integrations.ts` — dead/unused (error-monitoring helpers, `VITE_VLY_*`).
  - `.env.local` — unused `VLY_CONVEX_AUTH_ISSUER` and `VITE_VLY_*` keys.
- Grep across `src/` (excluding `_generated`) found **no** `auth.freebuff`, `send_otp`, `emailOtp`, or auth-related VLY references.

## 7. Deployment order: Convex first, then Vercel — **YES, correct**

1. **Convex** must learn the password provider + admin gate and be able to issue/verify sessions before any frontend uses them; `requireAdmin` guards the CMS server-side regardless.
2. **Then Vercel** (which builds from pushed code) must call the new backend.
3. **Then register the two administrator accounts immediately** (registration stays open until 2 exist).

Additional ordering caveat: `npx convex deploy` regenerates `_generated`. If it differs from the committed files, **commit those regen diffs before/with the Vercel deploy** so the shipped frontend matches the deployed backend.

## 8. Blockers

| # | Severity | Blocker | Fix |
|---|---|---|---|
| B1 | **MUST-FIX** | `.env.local` sets `CONVEX_DEPLOYMENT` to the anonymous deployment → first `npx convex deploy` may push to the wrong target | Remove / correct `CONVEX_DEPLOYMENT` in `.env.local` on the deploy machine |
| B2 | **MUST-VERIFY** | `VITE_CONVEX_URL` must be `https://gregarious-perch-128.convex.cloud` in the Vercel build env; source fallback still points to the old deployment | Set `VITE_CONVEX_URL` in Vercel to the new deployment before frontend deploy |
| B3 | **VERIFY** | Deploy machine must be logged in and linked to the project owning `gregarious-perch-128` (`convex.json` has no project id; state is in local `.convex/local`) | `npx convex login`; confirm project link on first deploy |
| B4 | **ACTION (post-deploy)** | Registration is open until two admins exist | Create both admin accounts at `/auth` immediately after go-live |
| B5 | Minor | Pushed code keeps an unused `VLY_CONVEX_AUTH_ISSUER` in local `.env.local` | Optional cleanup; no effect on deploy |

No code or config change is required for Convex-side compatibility — the password auth is deploy-ready.

---

## Summary

- **Verdict:** NOT READY (fix B1, confirm B2/B3, then deploy).
- **Blockers:** B1 (`.env.local` `CONVEX_DEPLOYMENT` override) — must fix; B2 (Vercel `VITE_CONVEX_URL`) — must set/verify; B3 (project link on deploy machine) — verify; B4 — create the 2 admins right after go-live.
- **Required environment variable names (no values):** `CONVEX_DEPLOYMENT` (deploy machine, neutralize/override), `VITE_CONVEX_URL` (Vercel, must equal the new deployment URL). `CONVEX_SITE_URL` is auto-injected server-side and does **not** need to be set (only if a custom site domain were introduced).
- **Deployment order:** (1) Convex deploy → (2) commit any regenerated `_generated` → (3) Vercel (with `VITE_CONVEX_URL` set) → (4) register the two admins at `/auth`.
- **Manual steps:** `npx convex login` (once); fix `.env.local`; run `npx convex deploy`; confirm Vercel env var; create both admin accounts at `/auth` immediately; sanity-check public pages, admin sign-in, third-registration rejection, `/sitemap.xml`.