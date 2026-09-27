# Auth & Freebuff Dependency Audit Report

> **🗄️ HISTORICAL SNAPSHOT — archived.** Written 2026-09-13; reflects the project **as of that date**, not now. For the current state see `README.md`, `PROJECT-MASTER-HANDOVER.md`, and `report 9-14-26.md` (latest refresh 2026-09-18).
> **Update 2026-09-17:** the Freebuff/Email-OTP path described here is obsolete — authentication is now the Convex Auth **`Password`** provider (email + password, max two admins), deployed to production `kindly-anaconda-422`.

- **Date:** 2026-09-13
- **Scope:** Repository `abo3dam-hub/alhasan-aesthetics`
- **Audited files (read-only):** `src/convex/auth.ts`, `src/convex/auth.config.ts`, `src/convex/auth/emailOtp.ts`, `src/convex/http.ts`, `src/pages/Auth.tsx`, `src/main.tsx`, `package.json`, `vite.config.ts`, `vly-toolbar-readonly.tsx`, `src/hooks/use-auth.ts`, `src/convex/users.ts`, `src/instrumentation.tsx`, `src/lib/vly-integrations.ts`, `.env.local`

---

## 1. Executive Summary

The application authenticates users through **Convex Auth with an Email-OTP + Anonymous provider** (self-issued, self-validated JWTs). This is the only sign-in flow the UI actually exercises.

The application **also** carries a **Freebuff federated JWT provider** (`customJwt`, issuer `https://freebuff.com`) and a **hard dependency on Freebuff for OTP email delivery** (`https://auth.freebuff.app/send_otp`), plus Freebuff-related build-time and dev/preview tooling.

**Bottom line:** The only *runtime-critical* Freebuff dependency is the OTP email transport. Removing it without a replacement would lock out Dashboard access permanently. Everything else is either dormant (federated SSO), cosmetic (footer branding), build/dev tooling, or dead code.

---

## 2. File-by-File Findings

### 2.1 `src/convex/auth.ts` — Auth provider registration

```ts
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp, Anonymous],
});
```

- Registers two providers: `email-otp` (custom, see §2.3) and `Anonymous`.
- No Freebuff reference in this file.
- This is the **primary** authentication mechanism: users sign in via a 6-digit email code (or anonymously for browsing).
- **Dependency relevance:** none on Freebuff (transport lives in `emailOtp.ts`).

### 2.2 `src/convex/auth.config.ts` — CLI/runtime auth config

```ts
const freebuffIssuer = process.env.VLY_CONVEX_AUTH_ISSUER ?? "https://freebuff.com";

export default {
  providers: [
    { domain: process.env.CONVEX_SITE_URL!, applicationID: "convex" },
    {
      type: "customJwt",
      issuer: freebuffIssuer,
      jwks: `${freebuffIssuer}/api/web/.well-known/jwks.json`,
      applicationID: "vly-convex",
      algorithm: "RS256",
    },
  ],
} satisfies AuthConfig;
```

- **Provider 1 (self-hosted):** validates the project's own tokens via OIDC discovery at `${CONVEX_SITE_URL}/.well-known/openid-configuration` (served by `auth.addHttpRoutes()` in `http.ts`). The file explicitly warns **not** to convert this to `customJwt` because self-issued tokens carry no `kid` header.
- **Provider 2 (Freebuff federated):** `customJwt` with issuer `https://freebuff.com` (or `$VLY_CONVEX_AUTH_ISSUER`) and JWKS endpoint `https://freebuff.com/api/web/.well-known/jwks.json`. Any token signed by Freebuff with `applicationID: "vly-convex"` is accepted as a valid session.
- **Status: ACTIVE configuration, DORMANT usage.** The UI never initiates a Freebuff sign-in (§2.4), so in practice this only matters if a pre-issued Freebuff JWT is presented to the backend.

### 2.3 `src/convex/auth/emailOtp.ts` — Email OTP provider (RUNTIME-CRITICAL)

```ts
async sendVerificationRequest({ identifier: email, token }) {
  await axios.post("https://auth.freebuff.app/send_otp", {
    to: email,
    otp: token,
    appName: process.env.VLY_APP_NAME || "a freebuff.com application",
  }, {
    headers: { "x-api-key": "fb_email_2crN1hqIArZP2bEfvjp5Qik4" },
  });
}
```

- 6-digit token, 15-minute `maxAge`, generated with `@oslojs/crypto/random`.
- **The ONLY email transport.** Every OTP email for Dashboard login goes through Freebuff's `send_otp` endpoint.
- Contains a **hardcoded, live Freebuff API key** (`fb_email_2crN1hqIArZP2bEfvjp5Qik4`).
- **STATUS: RUNTIME-CRITICAL.** Freebuff is the single point of failure for admin sign-in.

### 2.4 `src/convex/http.ts` — HTTP routes

- Calls `auth.addHttpRoutes(http)` (line 8) → registers the OIDC/JWKS endpoints Convex uses to validate the project's own login tokens.
- Contains the dynamic `/sitemap.xml` action (sitemap generation). No Freebuff references.
- **Dependency relevance:** none directly; this is what makes Provider 1 (self-hosted) work.

### 2.5 `src/pages/Auth.tsx` — Sign-in UI

- Uses `signIn("email-otp", formData)` for both the email step and the OTP step (lines 61, 81) via the `useAuth()` hook (`src/hooks/use-auth.ts`, which wraps `@convex-dev/auth/react`).
- On success, redirects to `/dashboard` (`redirectAfterAuth`).
- **Contains the only visible Freebuff branding** — the footer:
  ```
  Secured by freebuff.com  (link → https://freebuff.com)
  ```
  (lines 242-252). Cosmetic only; no functional effect.
- Anonymous provider is available but the UI shows only the email form.

### 2.6 `src/main.tsx` — App bootstrap

- `import '@vly-ai/integrations';` (line 1) — side-effect import of the Freebuff integrations package.
- `import { VlyToolbar } from "../vly-toolbar-readonly.tsx";` and mounts it inside a `ToolbarErrorBoundary` (which renders nothing if it crashes).
- Convex client URL:
  ```ts
  new ConvexReactClient(import.meta.env.VITE_CONVEX_URL || 'https://impartial-ladybug-881.convex.cloud')
  ```
  — production fallback points at the Convex deployment **hosted under the `freebuff` organization account** (see IMAGE-REPORT/verification docs).
- Routes wrapped in `ConvexAuthProvider`, `RequireAuth` guards `/dashboard`.
- **Dependency relevance:** Active build-level Freebuff coupling (package import + toolbar component), but both are non-fatal (toolbar is error-boundary wrapped).

### 2.7 `package.json` / `vite.config.ts` — Build tooling

- `@vly-ai/integrations` `^0.6.13` is a direct dependency (`package.json:45`).
- `vite.config.ts` uses `vlyPlugin()` in the plugin chain (`react(), vlyPlugin(), tailwindcss()`), plus a React `dedupe` workaround whose comment says it exists **because** `@vly-ai/integrations` bundles its own React copy.
- **Dependency relevance:** Active build-time coupling. Removing the package means editing BOTH the plugin list AND the dedupe rationale comment; the build must be re-verified.

### 2.8 `vly-toolbar-readonly.tsx` — Preview/dev toolbar

- Marked `DO NOT MODIFY`, wrapped in `ToolbarErrorBoundary`.
- Contains a **"publish to Freebuff"** action (`window.location.href = \`https://freebuff.com/project/${projectName}?publish=true\``, line 368).
- **Status: DEV/PREVIEW-ONLY** — a platform convenience widget, not part of the public site's content or auth flow.

### 2.9 Admin authorization (no Freebuff involvement)

- `src/convex/users.ts`: `becomeAdmin` (lines 37-59) lets the **first** authenticated non-admin claim the `admin` role on the `users` table; subsequent attempts are rejected ("An admin already exists").
- `src/hooks/use-auth.ts`: `isAuthenticated` from `useConvexAuth`, `user` from `api.users.currentUser`.
- **Conclusion:** Admin *role* logic is entirely local to Convex. Freebuff only affects whether a user can *sign in* (via OTP email delivery).

### 2.10 Dead / unused code (no runtime effect)

- `src/instrumentation.tsx` — references `VITE_VLY_APP_ID`, `VITE_VLY_MONITORING_URL`, links to `https://freebuff.com/project/...`; **not imported anywhere**.
- `src/lib/vly-integrations.ts` — `createVlyIntegrations({ deploymentToken: process.env.VLY_INTEGRATION_KEY })`; **not imported anywhere**.
- `integrations.md` — documentation.
- Various markdown/report files reference freebuff/impartial-ladybug — documentation only.

### 2.11 Environment (`env.local`)

- `CONVEX_DEPLOYMENT=anonymous:anonymous-alhasan-aesthetics` (dev deployment used by `npx convex dev`).
- `VITE_CONVEX_URL=http://127.0.0.1:3210` (local dev).
- `VLY_CONVEX_AUTH_ISSUER=https://freebuff.com` (mirrors the code default in `auth.config.ts`; dev-only).
- Production Vercel build supplies `VITE_CONVEX_URL`; otherwise `main.tsx` falls back to the hardcoded `impartial-ladybug-881` URL.

---

## 3. Answers to the Audit Questions

1. **What authentication flow does the app currently use?**
   Email-OTP (6-digit code, 15 min) + Anonymous via Convex Auth. Self-issued JWTs, validated through OIDC discovery served by `http.ts`. Freebuff federated `customJwt` is configured but never invoked by the UI.
2. **Does Admin/Dashboard login depend on Freebuff?**
   Yes — transitively. Login is Email-OTP, and the OTP email is sent by Freebuff (`auth.freebuff.app/send_otp`). The admin *role* assignment (`users.becomeAdmin`) is fully local and does not depend on Freebuff.
3. **Does Email OTP depend on Freebuff?**
   Yes. It is the **only** email transport; there is no SMTP or other provider.
4. **Which Freebuff references are runtime-critical vs obsolete/development-only?**
   - **Runtime-critical:** `auth.freebuff.app/send_otp` (+ API key) in `emailOtp.ts`; Convex deployment hosted on the `freebuff` org account (`impartial-ladybug-881`).
   - **Active but non-fatal:** federated `customJwt` provider (dormant); `@vly-ai/integrations` import + `vlyPlugin()` (build/dev).
   - **Obsolete/optional:** Auth page "Secured by freebuff.com" footer; `VlyToolbar` + publish button; `VLY_CONVEX_AUTH_ISSUER` env; dead `instrumentation.tsx`/`vly-integrations.ts`; markdown docs.
5. **What must be replaced before Freebuff can be completely removed?**
   - Replace `emailOtp.ts` transport with a self-owned email/SMTP provider (Resend, SendGrid, etc.) and re-test sign-in.
   - Remove the `customJwt` Freebuff provider from `auth.config.ts` and the `VLY_CONVEX_AUTH_ISSUER` env.
   - Remove footer branding, `VlyToolbar`, the `@vly-ai/integrations` import and `vlyPlugin()`, and delete dead `instrumentation.tsx`/`vly-integrations.ts`; re-verify `npm run build`.
   - Migrate the Convex deployment (`impartial-ladybug-881`, org `freebuff`) to the owner's own Convex account — a separate, data-bearing migration.
6. **Would removing any dependency risk breaking the current production site?**
   - Removing the OTP transport **without replacement = production lockout** (no one can log in → nobody can use the Dashboard). Highest risk.
   - Removing the federated provider invalidates any previously issued Freebuff sessions (users re-login; low risk).
   - Removing `@vly-ai/integrations` requires build verification (plugin + dedupe); risk of build/WebContainer breakage if not tested.
   - Removing cosmetic/dead code: no production risk.

---

## 4. Future Model of Dependency Classification

### ACTIVE
| Item | Location | Freebuff? | Impact |
|---|---|---|---|
| Email OTP transport (the ONLY one) | `src/convex/auth/emailOtp.ts:18-36` | ✅ | Critical — admin sign-in |
| Convex backend hosting | `src/main.tsx:89` (fallback `impartial-ladybug-881`) | ✅ (org account) | Critical — whole site |
| `@vly-ai/integrations` import + plugin | `src/main.tsx:1`, `vite.config.ts:1,9` | ✅ | Build/runtime coupling |
| Federated `customJwt` provider (dormant) | `src/convex/auth.config.ts:25-31` | ✅ | Token validation path |
| Self-hosted Convex Auth (email-otp + anonymous) | `src/convex/auth.ts`, `src/convex/http.ts:8` | ❌ | Primary sign-in |
| Admin authorization | `src/convex/users.ts:37-59` | ❌ | Local only |

### OBSOLETE / OPTIONAL
| Item | Location | Why |
|---|---|---|
| "Secured by freebuff.com" footer | `src/pages/Auth.tsx:242-252` | Cosmetic |
| `VlyToolbar` + freebuff publish button | `vly-toolbar-readonly.tsx:265,368` | Dev/preview tool |
| `VLY_CONVEX_AUTH_ISSUER` | `.env.local` | Mirrors code default |
| `src/instrumentation.tsx` | — | Not imported (dead) |
| `src/lib/vly-integrations.ts` | — | Not imported (dead) |
| `integrations.md` + report mentions | — | Documentation |

---

## 5. Risks

1. **Single point of failure (HIGH):** Freebuff outage/deprecation → OTP emails never sent → no admin can sign in; `becomeAdmin` is unreachable and every future admin claim is blocked.
2. **Secret exposure (MEDIUM):** A live Freebuff API key is hardcoded in source (`emailOtp.ts:29`). It is already in the git history.
3. **Hosting lock-in (MEDIUM):** Production Convex is under the `freebuff` organization account; "full removal" of Freebuff requires re-hosting/migrating the deployment and all CMS data.
4. **Session invalidation (LOW):** Removing the federated provider invalidates any pre-issued Freebuff JWT sessions.
5. **Build coupling (LOW if tested):** `vlyPlugin()` and React dedupe exist because of `@vly-ai/integrations`; removal must be build-verified.

---

## 6. Recommended Next Step (action plan for total removal)

1. **Replace OTP transport first** — reimplement `sendVerificationRequest` in `src/convex/auth/emailOtp.ts` with a self-owned email provider, preserving the `Email` provider and OTP UX. Test sign-in end-to-end **before** any other change.
2. **Remove federated provider** — delete the `customJwt` member from `auth.config.ts` providers; remove `VLY_CONVEX_AUTH_ISSUER`.
3. **Remove frontend Freebuff surface** — footer link, `VlyToolbar` + `vly-toolbar-readonly.tsx`, `import '@vly-ai/integrations'`, `vlyPlugin()`, dead `instrumentation.tsx`/`vly-integrations.ts`; update React `dedupe` comment; run `npm run build` + `npm run lint`.
4. **Verify the public site** — Landing, Procedures, Dashboard login, and sitemap all still work after deploy.
5. **Migrate Convex hosting (separate effort)** — move `impartial-ladybug-881` to the owner's own Convex account and migrate CMS data (`procedures`, `users`, `siteSettings`, `media`, `testimonials`, `faq`, `beforeAfter`).

**Desired end state:** zero references to `freebuff`, `auth.freebuff.app`, `VLY_*`, `vly`, or `impartial-ladybug-881` in source, env, and build config; admin auth and email delivery fully self-hosted.