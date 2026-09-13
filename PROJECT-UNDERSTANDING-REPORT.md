# PROJECT-UNDERSTANDING-REPORT.md

# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

**Deep Codebase Onboarding Report**

- Generated: September 13, 2026
- Repository: https://github.com/abo3dam-hub/alhasan-aesthetics
- Production URL: https://dralhasan-three.vercel.app/
- Canonical/SEO Domain: https://dr-alhasan.com
- Branch: `main`
- Project path: `/teamspace/studios/this_studio/projects/alhasan-aesthetics`

**Scope:** Read-only deep codebase audit. No code modified. All findings verified directly against source files. Earlier audit reports were cross-checked against the actual code and classified.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Tech Stack](#2-tech-stack)
3. [Architecture](#3-architecture)
4. [Database Schema](#4-database-schema)
5. [Backend — Convex API Surface](#5-backend--convex-api-surface)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Frontend Routes & Pages](#7-frontend-routes--pages)
8. [Image System](#8-image-system)
9. [CMS System](#9-cms-system)
10. [Internationalization (i18n)](#10-internationalization-i18n)
11. [SEO & Structured Data](#11-seo--structured-data)
12. [Known Bugs / Issues / Security / Technical Debt](#12-known-bugs--issues--security--technical-debt)
13. [Documentation Audit](#13-documentation-audit)
14. [Confidence](#14-confidence)

---

## 1. Project Summary

Bilingual (Arabic-primary RTL / English-secondary) marketing website + admin CMS for a plastic surgery practice.

- Fully client-rendered SPA with a Convex backend (database, auth, storage, serverless functions).
- Consultations are WhatsApp deep-links — **no data is stored** for consultations (intentional).
- All content is CMS-driven: procedures, before/after cases, testimonials, FAQ, homepage sections, SEO settings, doctor info, media library.
- Admin CMS lives in the authenticated `/dashboard` route.
- Legacy booking/messages/notifications systems were fully removed in a previous phase.

---

## 2. Tech Stack

### Frontend
- React 19 + TypeScript 5.9
- Vite 7 (`@vitejs/plugin-react`), build = `tsc -b && vite build`
- Tailwind CSS v4 via `@tailwindcss/vite`, `tw-animate-css`
- React Router 7 (`react-router`)
- framer-motion (animations), lucide-react (icons)
- react-hook-form + zod (forms/validation), sonner (toasts), input-otp
- shadcn/ui (new-york style) with ~60 Radix primitives
- `@convex-dev/auth` ^0.0.90 (Email OTP + Anonymous)

### Backend
- Convex (convex ^1.30.0)
- `@convex-dev/auth` — passwordless Email OTP via Freebuff
- Convex storage for all images

### Tooling
- `bun` — package manager (bun.lock)
- Scripts: `dev`, `build`, `lint` (eslint), `format` (prettier), `preview`
- **No test script; no test files exist** (confirmed by grep)

### Monitoring / Integrations
- `@vly-ai/integrations` imported in `src/main.tsx`; `VlyToolbar` mounted inside `ToolbarErrorBoundary`
- `@zumer/snapdom` used by the read-only `vly-toolbar-readonly.tsx`
- `src/instrumentation.tsx` exists but `InstrumentationProvider` is **not** in the render tree (dead code)

### Unused Dependencies (confirmed no imports in source)
`recharts`, `hono`, `next-themes`, `react-resizable-panels`, `react-day-picker`

---

## 3. Architecture

### Frontend Bootstrapping (`src/main.tsx`)
`ConvexAuthProvider` → `I18nProvider` → `BrowserRouter`
- All page components are `React.lazy()` (ADR-5 — code splitting)
- `VlyToolbar` wrapped in `ToolbarErrorBoundary`

### Backend (`src/convex/`)
- All server logic in `src/convex/*.ts`
- Public reads via queries; **every CMS write behind `requireAdmin(ctx)`**
- **KV pattern (ADR-2):** homepage CMS content stored as JSON objects in the `siteSettings` table under string keys
- `schemaValidation: false` (`src/convex/schema.ts:125`) — do NOT enable without ensuring existing data conforms (CRITICAL invariant)

### Data Flow
UI → Convex query/mutation → tables → reactive updates.
Images: upload → Convex `storageId` → `ResolvedImage` resolves via `api.media.resolveUrl / resolveUrls`.

### Vite Config Notes
- `manualChunks` for chunking; react dedupe
- **`server.hmr: false`** — Freebuff requires dev server HMR disabled (CRITICAL invariant)
- `VITE_CONVEX_URL || 'https://impartial-ladybug-881.convex.cloud'` — hardcoded fallback (TD-3)

---

## 4. Database Schema (7 tables — `src/convex/schema.ts`)

| Table | Key Fields | Indices |
|---|---|---|
| `users` | Auth managed; `role` ∈ `admin\|user\|member`, `tokenIdentifier` | — |
| `procedures` | `slug`, `nameAr/En`, `category`, `descriptionAr/En`, `longDescriptionAr/En`, `duration`, `recovery`, `price?`, `icon`, `image`, `gallery[]`, `beforeImage`, `afterImage`, `isActive`, `isFeatured`, `order`, `seoTitleAr/En`, `seoDescriptionAr/En`, `ogImage`, `createdAt` | `by_slug`, `by_category`, `by_order` |
| `beforeAfter` | `titleAr/En`, `procedureType`, `beforeImage`, `afterImage`, `descriptionAr/En`, `patientAge`, `isActive`, `order` | `by_procedure`, `by_order` |
| `testimonials` | `nameAr/En`, `textAr/En`, `rating`, `procedureType`, `avatar`, `isActive`, `order` | `by_order` |
| `faq` | `questionAr/En`, `answerAr/En`, `category`, `isActive`, `order` | `by_order`, `by_category` |
| `media` | `storageId` (canonical), `url` (legacy/empty), `name`, `type`, `size`, `alt?`, `uploadedAt`, `uploadedBy` | `by_storageId` |
| `siteSettings` | `key`, `value` (**`v.any()`**) | `by_key` |

`siteSettings` keys in use: `hero`, `about`, `cta`, `footer`, `homepage`, `seo`, `doctor`, plus per-section content keys (`procedures`, `testimonials`, `faq`, `beforeAfter`, …).

---

## 5. Backend — Convex API Surface (verified by grep)

### `procedures.ts`
`list`, `listActive`, `listFeatured`, `getBySlug`, `getById`, `getByCategory`, `create` (full arg validator incl. gallery/before/after/SEO/OG fields + `requireAdmin`), `update`, `remove`

### `beforeAfter.ts` / `testimonials.ts` / `faq.ts`
`list`, `listActive`, `create`, `update`, `remove` (all mutations call `requireAdmin`)

### `siteSettings.ts`
`get`, `list`, `getDoctorSettings`, `set` (upsert)

### `homepageSettings.ts`
`getHeroSettings`, `getAboutSettings`, `getCTASettings`, `getFooterSettings`, `getHomepageSettings`, `getSEOSettings`, `getSectionContent`, `set` (upsert; `requireAdmin`, `v.any` value)

### `media.ts`
`generateUploadUrl`, `recordUpload`, `list` (public), `getByStorageId`, `getFileUrl`, `resolveUrl`, `resolveUrls`, `checkReferences`, `diagnostic`, `repairUrls`, `updateMedia`, `remove`

### `seed.ts`
`seedProcedures`, `seedHomepageSettings`, `seedAll`

### `users.ts`
`currentUser`, `getCurrentUser`, `becomeAdmin` (first user becomes admin if none exists, else throws)

### `http.ts`
`/sitemap.xml` dynamic route + `auth.addHttpRoutes(http)`

### `notifications.ts`
**Deprecated stub only** (`// DEPRECATED - Notifications table removed.`)

---

## 6. Authentication & Authorization

- **Email OTP** via Freebuff — `src/convex/auth/emailOtp.ts`. **API key hardcoded:** `fb_email_2crN1hqIArZP2bEfvjp5Qik4` (in Convex server function; not exposed to browser).
- **`src/convex/auth.config.ts`** — has **two** JWT providers (Convex self-issued + Freebuff federated). CRITICAL: do NOT change the Convex entry to `type: "customJwt"`.
- **`requireAdmin(ctx)`** on **all** CMS mutations — the sole server-side authorization gate (CRITICAL invariant).
- **`becomeAdmin`** promotes only the first user (when no admin exists) — no secret required. After that there is **no UI path** to promote additional admins (TD-9).
- `RequireAuth` guards `/dashboard` (redirects to `/auth`).
- No rate limiting on OTP attempts. Auth page UI is English-only (TD-10).

---

## 7. Frontend Routes & Pages

All routes lazy-loaded (`src/main.tsx`):

| Route | Page | Notes |
|---|---|---|
| `/`, `/ar`, `/en` | `Landing` | All three render Landing; i18n is state-based, not URL-based |
| `/auth` | `Auth` | Email OTP login/signup (English-only UI) |
| `/dashboard` | `Dashboard` | `RequireAuth` guard; monolithic 1683-line admin CMS |
| `/procedures` | `ProceduresPage` | Public listing |
| `/procedure/:slug` | `ProcedureDetail` | **Note:** `/procedure/…`, NOT `/procedures/…` |
| `/contact` | `ContactPage` | Contact info + form + WhatsApp |
| `/before-after` | `BeforeAfterPage` | Gallery with before/after slider |
| `/consultation` | `ConsultationPage` | WhatsApp consultation form (no storage) |
| `*` | `NotFound` | 404 |

### Landing Section Order
Hero → About → Procedures → BeforeAfter → Testimonials → FAQ → Contact → CTA → Footer
- Section rendering driven by `getHomepageSettings` visibility flags
- Dynamic SEO applied from `getSEOSettings` (title, meta description, og:image)

### Dashboard (`src/pages/Dashboard.tsx`, 1683 lines — TD-1)
Overview/stats + CMS health check + Become Admin · Homepage CMS (`HomepageCMSTab.tsx`, 9 sections incl. visibility) · Procedures · Before & After · Testimonials · FAQ · Media (upload list + `ImageUpload` drag-drop: JPEG/PNG/WebP/GIF ≤5MB, multiple) · SEO (`SEOTab` → `GlobalSEOEditor`) · Settings (incl. WhatsApp number field) · Seed buttons (procedures / CMS / full)

---

## 8. Image System

- **Canonical image reference = `storageId`** (CRITICAL invariant). `media.url` is legacy and empty for new uploads.
- **`resolveUrl` priority** (`src/convex/media.ts:85`):
  1. empty → `""`
  2. data URI → as-is
  3. plain storageId → `ctx.storage.getUrl(storageId)`
  4. URL containing `/api/storage/<id>` → extract + resolve
  5. URL matching a media record → resolve via its storageId
  6. valid URL without storageId → as-is
  7. unresolvable → `""`
- **Frontend:** `ResolvedImage` (loading=`undefined`, storage-missing=`""`), `use-image-url`, `use-resolved-media`, `MediaSelector`, dashboard `MediaDiagnostics`.
- All public CMS images use `object-cover` (intentional, per user feedback after object-fill revert).
- `checkReferences` / `diagnostic` / `repairUrls` exist for maintenance.
- Multiple hardened-fix commits + `IMAGE-REPORT*.md` walkthroughs; **production browser verification still pending** (BUG-1).

---

## 9. CMS System

- **Homepage CMS:** `HomepageCMSTab` edits per-section JSON stored in `siteSettings`; `homepageSettings.set` upserts via `v.any()`.
- **Header content** for procedures/testimonials/FAQ/beforeAfter sections handled via `getSectionContent(key)`.
- **Global SEO** (`SEOTab`): `siteTitleAr/En`, `metaDescriptionAr/En`, `ogImage`, `canonicalBase` (default `https://dr-alhasan.com`).
- **Per-procedure SEO** (title/description/OG) + `gallery` + `beforeImage`/`afterImage` fully implemented.
- **Doctor settings** via `getDoctorSettings` (phone, email, addresses AR/EN, WhatsApp, social links) — used across Contact/Footer/Navbar.
- **Hero/CTA image fields are intentionally unused** (text/design only) — do not add image pickers there (CRITICAL invariant).

---

## 10. Internationalization (i18n)

- `src/i18n/index.tsx`: `I18nProvider`, `useI18n` hook.
- Locale persisted in `localStorage`; default `ar`.
- `toggleLocale` flips `document.documentElement` `lang`/`dir` (RTL for Arabic).
- Locales `ar.json` / `en.json` share the `Translations` type (`src/i18n/types.ts`).
- **Language is context/state-based, not URL-based** (ADR-3). `/ar` and `/en` are just Landing routes.

---

## 11. SEO & Structured Data

- **Static base (`index.html`):** Physician JSON-LD (aggregateRating 5 / reviewCount 100, procedure list, Damascus + Dubai addresses), OG/Twitter tags (image `/assets/1.jpg`), canonical `https://dr-alhasan.com/`.
- **Runtime CMS SEO** overrides title / meta description / og:image on Landing and ProcedureDetail.
- **ProcedureDetail** emits Person/Physician + BreadcrumbList JSON-LD from CMS data (verified at `ProcedureDetail.tsx:338-360`).
- **FAQ / MedicalOrganization JSON-LD** rendered via `dangerouslySetInnerHTML` from CMS data — **no sanitization** (security note).
- **Sitemap:** dynamic `/sitemap.xml` in `src/convex/http.ts` (`DOMAIN = https://dr-alhasan.com`, `Cache-Control: public, max-age=3600, s-maxage=3600`); static fallback `public/sitemap.xml` + `robots.txt`.

---

## 12. Known Bugs / Issues / Security / Technical Debt

### Verified Bugs
1. **Sitemap checks wrong field** — `src/convex/http.ts:54` uses `proc.active !== false`, but the field is `isActive`. The `listActive` query already filters inactive, so this is a no-op — wrong API contract in code + docs (BUG-3).
2. **Seed slug mismatch** — `ConsultationPage` fallback slugs (`blepharoplasty`, `face-neck-lift`, …) differ from `seed.ts` slugs (`upper-lower-eyelid-lift`, …) (TD-2).
3. **Hardcoded dev Convex URL** — fallback in `src/main.tsx` (`'https://impartial-ladybug-881.convex.cloud'`) (TD-3).

### Security Notes
- **Hardcoded OTP API key** in `src/convex/auth/emailOtp.ts` (server-only).
- **First-user-admin self-promotion** — `becomeAdmin` with no secret; one-shot by design.
- **`dangerouslySetInnerHTML` JSON-LD** without sanitization (Landing, FAQ) — CMS injection surface.
- Media `list` is a **public** query — consistent with invariant (public reads, admin-only writes).
- No server-side validation beyond schema (`schemaValidation: false`). Zod installed but unused on mutations.

### Technical Debt
- **TD-1** Dashboard monolith (`Dashboard.tsx`, 1683 lines, 9+ inline tab components).
- **TD-2** Duplicate seed data (`seedAll` vs `seedProcedures` slugs differ).
- **TD-3** Hardcoded Convex URL fallback.
- **TD-4** Hardcoded API key.
- **TD-5** Unused dependencies.
- **TD-6** `notifications.ts` dead file.
- **TD-7** No migrations.
- **TD-8** Legacy `media.url` field / dual resolution logic.
- **TD-9** `becomeAdmin` one-shot, no `promoteUser`.
- **TD-10** Auth page English-only.
- **TD-11** `schemaValidation: false`.

### Dead / Unused Code (verified)
| Item | Status |
|---|---|
| `src/convex/notifications.ts` | Dead (deprecated stub) |
| `src/components/LogoDropdown.tsx` | Unused (imported nowhere) |
| `src/instrumentation.tsx` | `InstrumentationProvider` not in render tree |
| `recharts`, `hono`, `next-themes`, `react-resizable-panels`, `react-day-picker` | Unused deps |
| `src/components/ui/index.ts` | Registry only, not imported |

### Stats
- **Tests:** none · **CI/CD:** none · **TODO/FIXME/HACK:** none found
- Placeholder phone `+966 XX XXX XXXX` in ContactPage / Dashboard / Footer / Contact / seed

---

## 13. Documentation Audit

| Document | Date | Verdict |
|---|---|---|
| `PROJECT-MASTER-HANDOVER.md` | Sep 12, 2026 | **Accurate** — matches verified code (TD/bugs/dead-code/security/invariants/ADRs/handoff all confirmed) |
| `README.md` | — | Minor discrepancy: claims editable hero image; code shows hero image fields intentionally unused |
| `AUDIT-REPORT.md` | Sep 1, 2026 | **Outdated** — claims homepage/SEO/media CMS missing and gallery images not in procedure form (all now implemented) |
| `IMAGE-REPORT*.md` | earlier | Investigation walkthrough of image-system fixes (root cause: loading-state conflation) |

---

## 14. Confidence

- **High** — Tech stack, routes, data model, backend API surface, auth, i18n, image pipeline, CMS, SEO: all directly read from source + verified by grep; consistent with the Sep-12 handover doc.
- **Medium** — Vercel project settings, Convex production deployment, Freebuff email delivery, WhatsApp number accuracy, image display in production (browser verification pending), identity data in static JSON-LD.

---

*End of report. No code changed as part of this audit.*