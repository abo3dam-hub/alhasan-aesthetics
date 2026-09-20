# PROJECT-MASTER-HANDOVER.md

# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

**Complete Technical Handover Document**

Generated: September 12, 2026
Repository: https://github.com/abo3dam-hub/alhasan-aesthetics
Production URL: https://www.dralhasanalsaiem.com/ (custom domain wired in Vercel; auto-deployed from `main`)

---

## ⚠️ CURRENT STATUS — refreshed 2026-09-18 (supersedes any conflicting detail below)

> This document was generated on **2026-09-12**. Everything below is still largely accurate for structure, but the following facts have changed. Where the body conflicts with this block, **this block is authoritative**.

- **Git HEAD:** `0be1cb1` (`feat: branded OG card generator, blog card share buttons, WebP assets, JSON-LD logo fix`), branch `main`, clean and pushed.
- **Authentication:** migrated from Email-OTP/Anonymous to the Convex Auth **`Password`** provider (scrypt-hashed, email + password). Exactly **two admin accounts** are enforced atomically; the old Freebuff/OTP dependency is no longer in the active auth path. Any Email-OTP/Anonymous/Freebuff wording below is historical.
- **Production Convex deployment:** `kindly-anaconda-422` (not `gregarious-perch-128`, which was a prior target/dev slug). HTTP-effecting actions are served on `https://kindly-anaconda-422.convex.site`.
- **Admin Dashboard:** now **11 tabs** — Overview, Analytics, Homepage CMS, Procedures, Before & After, Testimonials, FAQ, Articles, SEO, Settings, Media.
- **Admin Dashboard structure (refactored 2026-09-19, `dc29c4e`):** `src/pages/Dashboard.tsx` is now a thin shell (~48 lines) — auth/session, active-tab state, sign-out, layout, tab mounting. Each tab is its own component in `src/components/dashboard/`: `DashboardOverviewTab`, `DashboardAnalyticsTab`, `DashboardProceduresTab` (incl. `ProcedureForm`), `DashboardBeforeAfterTab`, `DashboardTestimonialsTab`, `DashboardFaqTab`, `DashboardSettingsTab`, `DashboardMediaTab` (incl. upload widget); `HomepageCMSTab`, `ArticlesTab`, `SEOTab` were already separate. The shell/nav live in `DashboardLayout` + `DashboardNav`; shared helpers in `dashboard-utils.ts` (`swapOrder` / `OrderableItem`). **TD-1 resolved.**
- **New feature — Blog:** bilingual (AR/EN) patient-education articles at `/blog` and `/blog/:slug`. CMS-driven (Dashboard → **Articles**), with cover + OG images, SEO fields, `Article`/`NewsArticle` JSON-LD, sitemap inclusion, and `seed.seedArticles`. See README → "Blog (Articles)".
- **New feature — Branded OG share-card generator:** `src/convex/og_image.tsx` (a Convex `"use node"` **action**, not a query) renders 1200×630 PNG share cards with Satori + `@resvg/resvg-wasm` at **request time**; `/og-image?slug=…` serves them with a 1-day cache. Because Convex sandboxes block the filesystem, `harfbuzzjs` (Arabic shaping, pinned by satori) is **patched via patch-package** to load its wasm from jsDelivr — the patch lives at `patches/harfbuzzjs+0.10.0.patch` and is re-applied by `postinstall`. Convex actions return the PNG as an `ArrayBuffer` (not `Uint8Array`, which Convex rejects).
- **New feature — crawler meta shell (`/og-meta`):** `middleware.ts` on the Vercel edge serves an HTML shell with `og:image` = `/og-image?slug=…` to bot user agents (Twitterbot, WhatsApp, etc.); human UAs receive the SPA. The edge also **proxies `/og-image` itself on the production domain** (same origin as the shared URL) and forwards the crawler's `Accept-Language`, so previews are served from `dralhasanalsaiem.com` and Arabic devices get Arabic cards. This is what makes article links unfurl as branded previews.
- **New feature — Share buttons:** blog-list cards + article pages include a share button (`CardShareButton` / article share): native Web Share API → clipboard copy fallback; tracked as a `share` analytics event.
- **New feature — Visit Analytics:** in-DB page-view + visitor-country tracking. Tables `pageVisits` and `ipCountryCache`; module `src/convex/analytics.ts` (`insertVisit`, `saveIpCache`, `getIpCache`, `getStats`, `purgePath`); HTTP endpoints `/trackVisit` (POST + OPTIONS) and `/sitemap.xml`; client tracker `src/components/AnalyticsTracker.tsx`. No third-party analytics and no raw IP stored (hashed then discarded). See README → "Visit Analytics".
- **Image performance:** static brand assets now ship as optimized **WebP** (`assets/*.webp`, generated with `sharp`) via `<picture>` in `BrandMark.tsx` (navbar, footer, timeline logo, About); the About image uses `srcSet`/`sizes`. JSON-LD organization logo URL fixed to `https://dralhasanalsaiem.com/assets/3.jpg`.
- **Typography:** current fonts are **Cairo** (Arabic body) + **El Messiri** (Arabic headings) + Inter + Playfair Display — not Noto Kufi.
- **UX polish added:** champagne scroll-progress bar, card hover glow, button sheen, section title underline, image shimmer placeholders, film-grain overlay, animated hero scroll hint, two-cards-per-row grids at all breakpoints, flip-style homepage before/after cards, and a responsive 2×2 footer layout on mobile.
- **Environment variables:** `VITE_CONVEX_URL` (required) and `VITE_CONVEX_SITE_URL` (optional; auto-derived from `.convex.cloud` → `.convex.site`). `JWT_PRIVATE_KEY` / `JWKS` remain server-side secrets. Note: `CONVEX_SITE_URL` is not yet set on the deployment — `http.ts` falls back to the hardcoded `https://kindly-anaconda-422.convex.site`, which works.
- **Build health:** `tsc` clean, ESLint **0 errors / 26 benign warnings**, `vite build` green; entry chunk ≈342 KB (gzip ≈104 KB).
- **Domain:** the real domain **`dralhasanalsaiem.com`** is now fully wired in Vercel and is **live in production** — all canonical/OG/JSON-LD/sitemap/robots references point at it (superseding the placeholder `dr-alhasan.com`, which is not registered in DNS). Verified: `curl -A "Twitterbot" https://dralhasanalsaiem.com/blog/<slug>` returns the `/og-meta` shell whose `og:image` resolves to a valid 1200×630 PNG.
- **Infra notes:** `package.json` has a `postinstall: patch-package` script (do not remove). `src/convex/_generated` is gitignored (only `api.d.ts` is tracked) — regenerate with `npx convex dev --once` / deploy.
- **Canonical reference:** for the most current, self-contained overview read `README.md`; for the latest session log read `report 9-14-26.md`.

---

## Table of Contents

1. [Project Identity](#1-project-identity)
2. [Project Structure](#2-project-structure)
3. [Architecture](#3-architecture)
4. [Technology Stack & Dependencies](#4-technology-stack--dependencies)
5. [Routing](#5-routing)
6. [Database Schema](#6-database-schema)
7. [Backend — Convex Functions](#7-backend--convex-functions)
8. [Authentication & Authorization](#8-authentication--authorization)
9. [Frontend Pages & Components](#9-frontend-pages--components)
10. [User Flows](#10-user-flows)
11. [Data Flow](#11-data-flow)
12. [Image System](#12-image-system)
13. [CMS System](#13-cms-system)
14. [Internationalization (i18n)](#14-internationalization-i18n)
15. [UI / Design System](#15-ui--design-system)
16. [External Services & Integrations](#16-external-services--integrations)
17. [Environment Variables](#17-environment-variables)
18. [Build / Run / Deployment](#18-build--run--deployment)
19. [SEO & Structured Data](#19-seo--structured-data)
20. [State Management](#20-state-management)
21. [Business Logic](#21-business-logic)
22. [Technical Debt](#22-technical-debt)
23. [Known Bugs & Issues](#23-known-bugs--issues)
24. [Dead / Unused / Suspicious Code](#24-dead--unused--suspicious-code)
25. [Security Audit](#25-security-audit)
26. [What Is Actually Complete](#26-what-is-actually-complete)
27. [CRITICAL INVARIANTS](#27-critical-invariants)
28. [Architecture Decision Records](#28-architecture-decision-records)
29. [HANDOFF FOR NEXT AI AGENT](#29-handoff-for-next-ai-agent)
30. [DOCUMENTATION AUDIT](#30-documentation-audit)

---

## 1. Project Identity

**Name:** Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website
**Purpose:** Bilingual (Arabic/English) marketing website + admin CMS for a plastic surgery practice
**Languages:** Arabic (RTL, primary), English (LTR, secondary)
**Design Theme:** Light Glassmorphism — translucent panels, blur, warm ivory/charcoal/champagne palette
**Primary Domain:** https://www.dralhasanalsaiem.com (configured in SEO sitemap, canonical/OG/JSON-LD)

---

## 2. Project Structure

```
/
├── index.html                          # SPA entry, static SEO meta, structured data (Physician JSON-LD)
├── package.json                        # Dependencies & scripts
├── components.json                     # shadcn/ui config (new-york style)
├── public/
│   ├── assets/1.jpg                    # Doctor photo (static fallback)
│   ├── assets/2.jpg                    # Static asset
│   ├── assets/3.jpg                    # Doctor logo (Navbar/Footer static fallback)
│   ├── assets/4.jpg                    # Static asset
│   ├── logo.svg                        # SVG logo
│   ├── manifest.webmanifest            # PWA manifest
│   ├── robots.txt                      # Robots file
│   └── sitemap.xml                     # Static sitemap fallback
├── src/
│   ├── main.tsx                        # App entry: ConvexAuthProvider, I18nProvider, BrowserRouter, Routes
│   ├── index.css                       # Tailwind + Glassmorphism theme variables + glass utility classes
│   ├── instrumentation.tsx             # Freebuff runtime error boundary + error dialog
│   ├── vite-env.d.ts                   # Vite types
│   ├── types/global.d.ts               # Window.navigateToAuth type declaration
│   ├── assets/logo.svg                 # Logo asset
│   ├── lib/
│   │   ├── utils.ts                    # cn() helper (clsx + tailwind-merge)
│   │   └── vly-integrations.ts         # Freebuff integrations config
│   ├── i18n/
│   │   ├── index.tsx                   # I18nProvider, useI18n hook, locale state (localStorage)
│   │   └── types.ts                    # Translations type from ar.json
│   ├── locales/
│   │   ├── ar.json                     # Arabic translations
│   │   └── en.json                     # English translations
│   ├── convex/                         # Backend — all Convex server functions
│   │   ├── schema.ts                   # Database schema definition
│   │   ├── auth.ts                     # Convex Auth setup (Email OTP + Anonymous)
│   │   ├── auth.config.ts              # JWT providers config (Convex + Freebuff federated)
│   │   ├── auth/emailOtp.ts            # Email OTP provider implementation
│   │   ├── admin.ts                    # requireAdmin() + getAdminUser() helpers
│   │   ├── users.ts                    # currentUser query, becomeAdmin mutation
│   │   ├── procedures.ts              # Procedures CRUD
│   │   ├── beforeAfter.ts             # Before & After CRUD
│   │   ├── testimonials.ts            # Testimonials CRUD
│   │   ├── faq.ts                     # FAQ CRUD
│   │   ├── siteSettings.ts            # Key-value settings (get, set, getDoctorSettings)
│   │   ├── homepageSettings.ts         # Homepage CMS settings queries (hero, about, CTA, etc.)
│   │   ├── media.ts                   # Media: upload, resolve, diagnostics, repair
│   │   ├── seed.ts                    # Seed data mutations (procedures, settings, testimonials, FAQ)
│   │   ├── http.ts                    # HTTP routes (dynamic sitemap.xml)
│   │   └── notifications.ts           # DEPRECATED — file is empty/comment only
│   ├── components/
│   │   ├── ui/                        # shadcn/ui components (~60 files)
│   │   ├── sections/                  # Homepage section components
│   │   │   ├── Hero.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Procedures.tsx
│   │   │   ├── BeforeAfter.tsx
│   │   │   ├── Testimonials.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Contact.tsx
│   │   │   └── CTA.tsx
│   │   ├── dashboard/                 # Admin dashboard sub-tabs
│   │   │   ├── HomepageCMSTab.tsx
│   │   │   └── SEOTab.tsx
│   │   ├── GlassNavbar.tsx            # Top navigation bar
│   │   ├── Footer.tsx                 # Site footer
│   │   ├── RequireAuth.tsx            # Auth guard (redirects to /auth)
│   │   ├── ResolvedImage.tsx          # Universal image renderer (URL or storageId)
│   │   ├── MediaSelector.tsx          # Media library picker for CMS fields
│   │   ├── ImageUpload.tsx            # Image upload component
│   │   ├── MediaDiagnostics.tsx       # Debug: shows media storage health
│   │   └── LogoDropdown.tsx           # Logo dropdown (home/sign out)
│   ├── pages/
│   │   ├── Landing.tsx                # Homepage (all sections with visibility toggle)
│   │   ├── Auth.tsx                   # Email OTP login/signup
│   │   ├── Dashboard.tsx              # Admin CMS shell (~50 lines; tabs live in components/dashboard/)
│   │   ├── ProceduresPage.tsx         # Public procedures listing page
│   │   ├── ProcedureDetail.tsx        # Individual procedure detail page
│   │   ├── ContactPage.tsx            # Public contact page
│   │   ├── BeforeAfterPage.tsx        # Before & After gallery with slider
│   │   ├── ConsultationPage.tsx       # WhatsApp consultation form
│   │   └── NotFound.tsx               # 404 page
│   └── hooks/
│       ├── use-auth.ts                # useAuth hook (wraps Convex auth)
│       ├── use-upload.ts              # useImageUpload hook (upload to Convex storage)
│       ├── use-resolved-media.ts      # useResolvedMedia (batch URL resolution)
│       ├── use-image-url.ts           # useImageUrl (single/batch resolution hooks)
│       └── use-mobile.ts              # useIsMobile (responsive breakpoint)
```

---

## 3. Architecture

### Overall Pattern

**Serverless full-stack architecture:**
- **Frontend:** React SPA (Vite) served as static files
- **Backend:** Convex (serverless functions — queries, mutations, actions)
- **Database:** Convex database (NoSQL document store)
- **Storage:** Convex file storage (images)
- **Auth:** Convex Auth (Email OTP + Anonymous)

### Architecture Layers

```
┌─────────────────────────────────────────┐
│              Browser (SPA)              │
│  React 19 + React Router v7            │
│  Tailwind CSS v4 + Glassmorphism        │
│  Framer Motion (animations)            │
│  shadcn/ui (component library)         │
├─────────────────────────────────────────┤
│         Convex React Client             │
│  useQuery / useMutation (reactive)     │
│  ConvexAuthProvider (session)          │
├─────────────────────────────────────────┤
│          Convex Backend                 │
│  Queries (read)  Mutations (write)     │
│  HTTP Actions (sitemap, auth routes)   │
│  Auth (Email OTP, Anonymous)           │
│  Storage (file upload/download)        │
├─────────────────────────────────────────┤
│        Convex Database (NoSQL)          │
│  users, procedures, beforeAfter,       │
│  testimonials, faq, media,             │
│  siteSettings                          │
├─────────────────────────────────────────┤
│        Convex Storage                   │
│  Binary file storage for images        │
└─────────────────────────────────────────┘
```

### Key Architectural Points

1. **No traditional REST API.** All data flows through Convex queries/mutations.
2. **Reactive data:** Convex queries are live subscriptions. UI updates automatically when data changes.
3. **No separate backend server.** Convex IS the backend.
4. **No external database.** Convex provides its own database.
5. **No separate file storage.** Convex provides built-in file storage.
6. **No CI/CD pipeline.** Deployment is managed by Freebuff/Vercel.

---

## 4. Technology Stack & Dependencies

### Core Framework
| Dependency | Version | Purpose |
|---|---|---|
| `react` | ^19.2.0 | UI framework |
| `react-dom` | ^19.2.0 | DOM rendering |
| `vite` | ^7.2.6 | Build tool + dev server |
| `typescript` | ~5.9.3 | Type system |
| `convex` | ^1.30.0 | Backend, database, storage, auth |
| `react-router` | ^7.10.0 | Client-side routing |

### UI / Styling
| Dependency | Version | Purpose |
|---|---|---|
| `tailwindcss` | ^4.1.17 | CSS utility framework |
| `@tailwindcss/vite` | ^4.1.17 | Tailwind Vite plugin |
| `tw-animate-css` | ^1.4.0 | Animation utilities |
| `framer-motion` | ^12.23.25 | Declarative animations |
| `lucide-react` | ^0.555.0 | Icon library |
| `@radix-ui/*` | various | Headless UI primitives (shadcn/ui) |
| `class-variance-authority` | ^0.7.1 | Component variants |
| `clsx` | ^2.1.1 | Conditional class joining |
| `tailwind-merge` | ^3.4.0 | Tailwind class deduplication |

### Form / Validation
| Dependency | Version | Purpose |
|---|---|---|
| `react-hook-form` | ^7.67.0 | Form state management |
| `@hookform/resolvers` | ^5.2.2 | Schema validation resolvers |
| `zod` | ^4.1.13 | Schema validation |

### Data / Auth
| Dependency | Version | Purpose |
|---|---|---|
| `@convex-dev/auth` | ^0.0.90 | Convex authentication (Email OTP + Anonymous) |
| `@oslojs/crypto` | ^1.0.1 | Crypto utilities for OTP generation |

### Utilities
| Dependency | Version | Purpose |
|---|---|---|
| `date-fns` | ^4.1.0 | Date formatting |
| `axios` | ^1.13.2 | HTTP client (used only in email OTP to call Freebuff API) |
| `sonner` | ^2.0.7 | Toast notifications |
| `cmdk` | ^1.1.1 | Command palette |
| `embla-carousel-react` | ^8.6.0 | Carousel engine |
| `recharts` | ^2.15.4 | Charts (available but not actively used in current pages) |
| `hono` | ^4.10.7 | HTTP framework (available, not directly used in project code) |
| `next-themes` | ^0.4.6 | Theme switching (available, not actively used — single theme) |
| `vaul` | ^1.1.2 | Drawer component |
| `react-intersection-observer` | ^10.0.0 | Scroll-triggered animations |
| `react-resizable-panels` | ^3.0.6 | Resizable panels |
| `input-otp` | ^1.4.2 | OTP input component |
| `react-day-picker` | 9.13.0 | Calendar component |
| `@zumer/snapdom` | ^2.0.1 | DOM snapshot (for screenshot features) |
| `@jridgewell/trace-mapping` | ^0.3.31 | Source map tracing |
| `@vly-ai/integrations` | ^0.6.13 | Freebuff platform integrations |

### Dev Dependencies
| Dependency | Purpose |
|---|---|
| `@vitejs/plugin-react` | Vite React plugin |
| `eslint` + plugins | Linting |
| `prettier` | Code formatting |
| `typescript-eslint` | TS ESLint parser |

---

## 5. Routing

### Route Table

| Route | Component | Auth | Purpose |
|---|---|---|---|
| `/` | `Landing` | Public | Homepage (all sections) |
| `/ar` | `Landing` | Public | Homepage (Arabic — via i18n locale) |
| `/en` | `Landing` | Public | Homepage (English — via i18n locale) |
| `/procedures` | `ProceduresPage` | Public | All procedures listing |
| `/procedure/:slug` | `ProcedureDetail` | Public | Individual procedure detail |
| `/contact` | `ContactPage` | Public | Contact page |
| `/before-after` | `BeforeAfterPage` | Public | Before & After gallery |
| `/consultation` | `ConsultationPage` | Public | WhatsApp consultation form |
| `/auth` | `AuthPage` | Public | Login/signup (Email OTP) |
| `/dashboard` | `Dashboard` | **Admin** | Admin CMS dashboard |
| `*` | `NotFound` | Public | 404 page |

### Routing Architecture

- **React Router v7** with `BrowserRouter`
- **Lazy loading** via `React.lazy()` + `Suspense` for all route components
- **No file-based routing** — all routes defined in `src/main.tsx`
- **Auth protection** via `RequireAuth` wrapper on `/dashboard`
- **Auth redirect:** Unauthenticated users are redirected to `/auth?returnTo=<path>`
- **Post-auth redirect:** After login, navigates to `returnTo` param or `/dashboard`
- **No `/ar/procedures` or `/en/procedures` routes** — language is controlled by the `I18nProvider` context via `localStorage("locale")`, not by URL segments. The `/ar` and `/en` routes only render the Landing page and simply set the locale.

### Route Loading Flow

```
Browser requests URL
    ↓
React Router matches route
    ↓
Lazy component is loaded (code-split chunk)
    ↓
Suspense shows <RouteLoading /> ("Loading..." pulse)
    ↓
Component renders with Convex reactive queries
    ↓
Convex queries resolve → UI updates reactively
```

---

## 6. Database Schema

### Database Technology

**Convex Database** — serverless NoSQL document store with built-in indexing, reactive queries, and transactions.

### Tables

#### `users` (extends authTables from @convex-dev/auth)

| Field | Type | Required | Purpose |
|---|---|---|---|
| `name` | string | No | Display name |
| `image` | string | No | Profile image URL |
| `email` | string | No | Email address |
| `emailVerificationTime` | number | No | Timestamp of email verification |
| `isAnonymous` | boolean | No | Whether user is anonymous |
| `role` | `"admin" \| "user" \| "member"` | No | User role for authorization |
| `phone` | string | No | Phone number |
| `dateOfBirth` | string | No | Date of birth |
| `notes` | string | No | Admin notes |

**Indexes:**
- `email` on `[email]`

#### `procedures`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `slug` | string | Yes | URL-friendly identifier (unique by index) |
| `titleAr` | string | Yes | Arabic title |
| `titleEn` | string | Yes | English title |
| `descriptionAr` | string | Yes | Arabic short description |
| `descriptionEn` | string | Yes | English short description |
| `longDescriptionAr` | string | Yes | Arabic full description |
| `longDescriptionEn` | string | Yes | English full description |
| `icon` | string | Yes | Lucide icon name (e.g. "Eye", "SmilePlus") |
| `category` | string | Yes | Category: "face", "body", "revision" |
| `duration` | string | Yes | Procedure duration text |
| `recovery` | string | Yes | Recovery period text |
| `price` | string | No | Price text (optional) |
| `image` | string | No | Main image (storageId) |
| `gallery` | string[] | No | Array of image storageIds |
| `beforeImage` | string | No | Before image (storageId) |
| `afterImage` | string | No | After image (storageId) |
| `seoTitleAr` | string | No | SEO title Arabic |
| `seoTitleEn` | string | No | SEO title English |
| `seoDescriptionAr` | string | No | SEO description Arabic |
| `seoDescriptionEn` | string | No | SEO description English |
| `ogImage` | string | No | Open Graph image (storageId) |
| `isActive` | boolean | Yes | Whether procedure is shown publicly |
| `isFeatured` | boolean | No | Whether shown on homepage |
| `order` | number | Yes | Sort order |

**Indexes:**
- `by_slug` on `[slug]`
- `by_category` on `[category]`
- `by_order` on `[order]`

#### `beforeAfter`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `titleAr` | string | Yes | Arabic title |
| `titleEn` | string | Yes | English title |
| `procedureType` | string | Yes | Procedure slug this case relates to |
| `beforeImage` | string | Yes | Before image (storageId) |
| `afterImage` | string | Yes | After image (storageId) |
| `descriptionAr` | string | No | Arabic description |
| `descriptionEn` | string | No | English description |
| `patientAge` | number | No | Patient age |
| `isActive` | boolean | Yes | Whether shown publicly |
| `order` | number | Yes | Sort order |

**Indexes:**
- `by_procedure` on `[procedureType]`
- `by_order` on `[order]`

#### `testimonials`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `nameAr` | string | Yes | Arabic patient name |
| `nameEn` | string | Yes | English patient name |
| `textAr` | string | Yes | Arabic testimonial text |
| `textEn` | string | Yes | English testimonial text |
| `rating` | number | Yes | Star rating (1-5) |
| `procedureType` | string | No | Related procedure slug |
| `avatar` | string | No | Avatar image (storageId) |
| `isActive` | boolean | Yes | Whether shown publicly |
| `order` | number | Yes | Sort order |

**Indexes:**
- `by_order` on `[order]`

#### `faq`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `questionAr` | string | Yes | Arabic question |
| `questionEn` | string | Yes | English question |
| `answerAr` | string | Yes | Arabic answer |
| `answerEn` | string | Yes | English answer |
| `category` | string | No | FAQ category |
| `isActive` | boolean | Yes | Whether shown publicly |
| `order` | number | Yes | Sort order |

**Indexes:**
- `by_order` on `[order]`
- `by_category` on `[category]`

#### `media`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `storageId` | string | Yes | Convex storage ID (canonical reference) |
| `url` | string | Yes | Legacy URL field (empty for new uploads) |
| `name` | string | Yes | Original filename |
| `type` | string | Yes | MIME type |
| `size` | number | Yes | File size in bytes |
| `alt` | string | No | Alt text |
| `uploadedAt` | number | No | Upload timestamp |
| `uploadedBy` | string | No | User ID of uploader |

**Indexes:**
- `by_storageId` on `[storageId]`

#### `siteSettings`

| Field | Type | Required | Purpose |
|---|---|---|---|
| `key` | string | Yes | Setting identifier (unique by index) |
| `value` | any | Yes | Setting value (object or primitive) |

**Indexes:**
- `by_key` on `[key]`

**Known keys:**
- `doctor` — Doctor/clinic information (name, phone, email, address, bio, social media, hero text, working hours)
- `hero` — Hero section content (badge, title, subtitle, description, CTAs, trust badges)
- `about` — About section content (badge, title, description, doctor image, stats)
- `cta` — CTA section content (title, description, button text, destination)
- `footer` — Footer description
- `homepage` — Section visibility flags (hero, about, procedures, etc.)
- `seo` — Global SEO settings (title, description, OG image, canonical base)
- `proceduresSection` — Procedures section header (badge, title, highlight, subtitle)
- `beforeAfterSection` — Before & After section header
- `testimonialsSection` — Testimonials section header
- `faqSection` — FAQ section header

### Entity Relationships

```
users ───────────────────────┐
  (role: "admin")            │
  uploads media ─────────────┼──→ media (uploadedBy → user._id)
                             │
procedures ◄────────────────┤
  .image → media.storageId   │
  .beforeImage → media.storageId
  .afterImage → media.storageId
  .ogImage → media.storageId │
  .gallery[] → media.storageId

beforeAfter ◄───────────────┤
  .beforeImage → media.storageId
  .afterImage → media.storageId
  .procedureType → procedures.slug

testimonials ◄──────────────┤
  .avatar → media.storageId

siteSettings ◄──────────────┘
  (key-value store for all CMS content)
```

---

## 7. Backend — Convex Functions

### Convex Auth (`src/convex/auth.ts`)

**Status: READ-ONLY file. Do not modify.**

```typescript
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [emailOtp, Anonymous],
});
```

- **Providers:** Email OTP (via Freebuff API) + Anonymous
- **Token management:** Handled by `@convex-dev/auth`
- **JWT validation:** Two providers in `auth.config.ts`:
  1. Convex self-issued tokens (for project sign-in)
  2. Freebuff federated JWTs (for SSO from Freebuff platform)

### Admin Authorization (`src/convex/admin.ts`)

Two exported functions:

```typescript
// Throws if not authenticated or not admin
export async function requireAdmin(ctx: MutationCtx)

// Returns null if not admin, or { userId, user } if admin
export async function getAdminUser(ctx: MutationCtx)
```

**Usage:** Every CMS mutation calls `await requireAdmin(ctx)` at the top.

### User Management (`src/convex/users.ts`)

| Function | Type | Purpose |
|---|---|---|
| `currentUser` | query | Returns current authenticated user (or null) |
| `getCurrentUser` | helper | Internal helper to get current user |
| `becomeAdmin` | mutation | First user can become admin (only if no admin exists) |

### Procedures (`src/convex/procedures.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `list` | query | Public | All procedures (by order) |
| `listActive` | query | Public | Active procedures only |
| `listFeatured` | query | Public | Featured + active procedures |
| `getBySlug` | query | Public | Get single procedure by slug |
| `getById` | query | Public | Get single procedure by ID |
| `getByCategory` | query | Public | Get active procedures by category |
| `create` | mutation | Admin | Create new procedure |
| `update` | mutation | Admin | Update procedure (filters out undefined) |
| `remove` | mutation | Admin | Delete procedure |

### Before & After (`src/convex/beforeAfter.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `list` | query | Public | All cases |
| `listActive` | query | Public | Active cases only |
| `getByProcedure` | query | Public | Cases by procedure type |
| `create` | mutation | Admin | Create case |
| `update` | mutation | Admin | Update case |
| `remove` | mutation | Admin | Delete case |

### Testimonials (`src/convex/testimonials.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `list` | query | Public | All testimonials |
| `listActive` | query | Public | Active testimonials only |
| `create` | mutation | Admin | Create testimonial |
| `update` | mutation | Admin | Update testimonial |
| `remove` | mutation | Admin | Delete testimonial |

### FAQ (`src/convex/faq.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `list` | query | Public | All FAQ items |
| `listActive` | query | Public | Active FAQ items only |
| `create` | mutation | Admin | Create FAQ |
| `update` | mutation | Admin | Update FAQ |
| `remove` | mutation | Admin | Delete FAQ |

### Site Settings (`src/convex/siteSettings.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `get` | query | Public | Get setting by key |
| `list` | query | Public | All settings |
| `getDoctorSettings` | query | Public | Get "doctor" settings |
| `set` | mutation | Admin | Upsert setting by key |

### Homepage Settings (`src/convex/homepageSettings.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `getHeroSettings` | query | Public | Get "hero" CMS settings |
| `getAboutSettings` | query | Public | Get "about" CMS settings |
| `getCTASettings` | query | Public | Get "cta" CMS settings |
| `getFooterSettings` | query | Public | Get "footer" CMS settings |
| `getHomepageSettings` | query | Public | Get section visibility flags |
| `getSEOSettings` | query | Public | Get SEO settings |
| `getSectionContent` | query | Public | Get any section header by key |
| `set` | mutation | Admin | Upsert any CMS setting |

### Media (`src/convex/media.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `generateUploadUrl` | mutation | Admin | Generate signed upload URL |
| `recordUpload` | mutation | Admin | Record uploaded file in media table |
| `list` | query | Public | List all media (newest first) |
| `getByStorageId` | query | Public | Get media record by storageId |
| `getFileUrl` | query | Public | Get storage URL for a storageId |
| `resolveUrl` | query | Public | Resolve any image ref → working URL |
| `resolveUrls` | query | Public | Batch resolve multiple image refs |
| `checkReferences` | query | Public | Check if media is used by CMS content |
| `diagnostic` | query | Public | Inspect all media records + storage health |
| `repairUrls` | mutation | Admin | Repair broken media URLs |
| `updateMedia` | mutation | Admin | Update media metadata (alt, name) |
| `remove` | mutation | Admin | Delete media item + storage file |

### Seed Data (`src/convex/seed.ts`)

| Function | Type | Auth | Purpose |
|---|---|---|---|
| `seedProcedures` | mutation | Admin | Create 10 default procedures (idempotent) |
| `seedHomepageSettings` | mutation | Admin | Populate CMS settings (safe — fills empty fields only) |
| `seedAll` | mutation | Admin | Seed procedures + testimonials + FAQ (skips existing) |

### HTTP Routes (`src/convex/http.ts`)

| Path | Method | Purpose |
|---|---|---|
| `/sitemap.xml` | GET | Dynamic sitemap from CMS procedures + static pages |
| `auth/*` | Various | Convex Auth HTTP routes (handled by `auth.addHttpRoutes`) |

---

## 8. Authentication & Authorization

### Authentication Flow

```
User visits /auth
    ↓
Enters email address
    ↓
signIn("email-otp", formData) called
    ↓
Convex Auth sends request to emailOtp provider
    ↓
emailOtp.sendVerificationRequest() → POST to https://auth.freebuff.app/send_otp
    ↓
User receives 6-digit OTP code via email
    ↓
User enters OTP code
    ↓
signIn("email-otp", formData) verifies code
    ↓
Convex Auth creates/validates session
    ↓
User is authenticated (isAuthenticated = true)
    ↓
Navigate to returnTo param or /dashboard
```

### Authorization Model

**Three roles defined:** `admin`, `user`, `member`

**Current usage:** Only `admin` role is checked. `user` and `member` roles exist in the schema but are not checked by any function.

**Admin promotion:** First user can click "Become Admin" in Dashboard → Overview. This calls `users.becomeAdmin` which only succeeds if NO admin exists yet. After that, no new admins can self-promote.

**Server-side enforcement:** Every CMS mutation calls `requireAdmin(ctx)` which verifies the authenticated user has `role: "admin"`. This prevents unauthorized writes even if the frontend check is bypassed.

### Protected Routes

Only `/dashboard` is protected via `RequireAuth` component:
- Checks `isAuthenticated` via `useAuth()` hook
- If loading: shows spinner
- If not authenticated: redirects to `/auth?returnTo=<current_path>`
- If authenticated: renders children

### Auth Provider Configuration (`auth.config.ts`)

Two JWT providers:
1. **Convex self-issued** — Standard provider for this project's own sign-in
2. **Freebuff federated** — `customJwt` provider allowing SSO from Freebuff platform (`freebuff.com`)

**Critical note from code:** The Convex self-issued entry must NOT be changed to `type: "customJwt"` because Convex self-issued tokens don't carry a `kid` header, which `customJwt` validation requires.

---

## 9. Frontend Pages & Components

### Pages

#### Landing (`src/pages/Landing.tsx`)
- **Route:** `/`, `/ar`, `/en`
- **Purpose:** Main homepage with all sections
- **Data:** Reads `homepageSettings.getHomepageSettings` (visibility), `homepageSettings.getSEOSettings`, `siteSettings.getDoctorSettings`
- **Sections rendered (conditionally based on CMS visibility):**
  - Hero, About, Procedures, BeforeAfter, Testimonials, FAQ, CTA, Contact
- **SEO:** Dynamic `document.title`, meta description, OG image, Twitter cards, MedicalOrganization JSON-LD
- **Skip navigation:** `<a href="#home" className="sr-only ...">Skip to main content</a>`

#### Auth (`src/pages/Auth.tsx`)
- **Route:** `/auth`
- **Purpose:** Email OTP login/signup
- **Props:** `redirectAfterAuth` (defaults to `/dashboard`)
- **Flow:** Email input → OTP input → verify → navigate
- **UI:** Glass card with doctor logo, email input, 6-digit OTP input
- **Error handling:** Displays inline error messages
- **Note:** Auth page UI is English-only (not translated)

#### Dashboard (`src/pages/Dashboard.tsx` + `src/components/dashboard/`)
- **Route:** `/dashboard` (protected)
- **Purpose:** Full admin CMS dashboard — thin shell component that owns auth/session, the active tab, sign-out, the layout (`DashboardLayout`) and the nav (`DashboardNav`)
- **~48 lines** in `Dashboard.tsx`; every tab is a standalone component under `src/components/dashboard/`
- **11 tabs:** Overview, Analytics, Homepage (CMS), Procedures, Before & After, Testimonials, FAQ, Articles (blog), SEO, Settings, Media
- **Features per tab:**
  - **Overview** (`DashboardOverviewTab.tsx`): Stats, CMS health check, seed buttons, migration status/actions
  - **Analytics** (`DashboardAnalyticsTab.tsx`): visit counts, 14-day chart, countries, top pages/actions
  - **Homepage** (`HomepageCMSTab.tsx`): CMS editors for Hero, About, CTA, Footer, section headers, visibility toggles
  - **Procedures** (`DashboardProceduresTab.tsx`): Full CRUD, search, filter, reorder, icon picker, image management, SEO fields
  - **Before & After** (`DashboardBeforeAfterTab.tsx`): CRUD, reorder, MediaSelector for images
  - **Testimonials** (`DashboardTestimonialsTab.tsx`): CRUD, reorder, avatar + result photos
  - **FAQ** (`DashboardFaqTab.tsx`): CRUD, reorder
  - **Articles** (`ArticlesTab.tsx`): blog article CRUD (see "New feature — Blog")
  - **SEO** (`SEOTab.tsx`): Global SEO settings editor
  - **Settings** (`DashboardSettingsTab.tsx`): Doctor/clinic information form + navbar photo
  - **Media** (`DashboardMediaTab.tsx`): Image upload, gallery, diagnostics, URL repair, delete with reference checking

#### ProceduresPage (`src/pages/ProceduresPage.tsx`)
- **Route:** `/procedures`
- **Purpose:** Public listing of all active procedures
- **Data:** `procedures.listActive`
- **Features:** Category filter, responsive grid, image cards, link to detail page

#### ProcedureDetail (`src/pages/ProcedureDetail.tsx`)
- **Route:** `/procedure/:slug`
- **Purpose:** Individual procedure detail page
- **Data:** `procedures.getBySlug`
- **Features:** Hero image, before/after slider, gallery, SEO meta, breadcrumb navigation, related procedures

#### ContactPage (`src/pages/ContactPage.tsx`)
- **Route:** `/contact`
- **Purpose:** Public contact page
- **Data:** `siteSettings.getDoctorSettings`
- **Features:** Contact form (WhatsApp redirect), phone/email/address display, map placeholder

#### BeforeAfterPage (`src/pages/BeforeAfterPage.tsx`)
- **Route:** `/before-after`
- **Purpose:** Before & After gallery with interactive slider
- **Data:** `beforeAfter.listActive`
- **Features:** Interactive before/after slider (drag to compare), responsive grid, procedure filter

#### ConsultationPage (`src/pages/ConsultationPage.tsx`)
- **Route:** `/consultation`
- **Purpose:** WhatsApp consultation form
- **Data:** `procedures.listActive` (for procedure selection)
- **Flow:** 2-step wizard: Select procedures → Fill personal info → Review → Send via WhatsApp
- **Data stored:** NONE — purely client-side, generates WhatsApp message
- **Features:** Multi-select procedures, "Other Procedure" option, age/gender/nationality/residence fields, Arabic/English message generation

#### NotFound (`src/pages/NotFound.tsx`)
- **Route:** `*` (catch-all)
- **Purpose:** 404 page
- **Features:** Glassmorphism styled, link back to home

### Key Components

#### GlassNavbar (`src/components/GlassNavbar.tsx`)
- Fixed top navigation with glassmorphism effect
- Logo (CMS `navbarPhoto` or static fallback)
- Hash-scroll links (Home, About, Testimonials, FAQ) — native `<a>` tags
- Route links (Procedures, Before & After, Contact) — React Router `<Link>`
- Language toggle button
- Dashboard link (visible only when authenticated)
- Book Consultation CTA button
- Mobile hamburger menu with slide-in animation (Framer Motion)
- Reads `siteSettings.getDoctorSettings` for logo

#### Footer (`src/components/Footer.tsx`)
- Brand section with logo (CMS navbarPhoto or static)
- Footer description (CMS-driven)
- Social media links (CMS-driven from doctor settings)
- Quick links (hardcoded + CMS)
- Services list (top 6 from CMS procedures)
- Contact info (CMS-driven)
- Working hours (CMS-driven)
- Language toggle

#### ResolvedImage (`src/components/ResolvedImage.tsx`)
- **The universal image rendering component**
- Accepts `ref` (storageId, URL, or empty)
- Uses `media.resolveUrl` query to resolve references
- **State model:**
  - `ref` empty → "No image" placeholder
  - `ref` present, query loading (`undefined`) → Loading spinner
  - Query resolved with URL → Renders `<img>`
  - Query resolved with empty string → "No image" (storage missing)
  - `<img>` onError → "Image unavailable"
- Props: `ref`, `alt`, `className`, `imgClassName`, `fallbackClassName`, `lazy`

#### MediaSelector (`src/components/MediaSelector.tsx`)
- Media library picker for CMS image fields
- Shows current image thumbnail (via `ResolvedImage`)
- Opens dialog with full media library grid
- Search/filter functionality
- Upload new image directly from selector
- Select existing image or upload new one

#### ImageUpload (`src/components/ImageUpload.tsx`)
- Drag & drop / click to upload
- File validation (type, size)
- Preview during upload
- Calls `useImageUpload` hook

#### MediaDiagnostics (`src/components/MediaDiagnostics.tsx`)
- Debug component in Dashboard → Media tab
- Shows all media records with storage health status
- Displays storageId, URL, resolution status, errors
- Summary stats: total, OK, missing, empty URL

---

## 10. User Flows

### Flow 1: Public Website Browsing

```
Visitor opens website (/)
    ↓
Landing page renders with CMS content
    ↓
Sections load reactively from Convex
    ↓
Language toggle switches AR/EN (localStorage)
    ↓
Navigation to /procedures, /contact, /before-after, /consultation
```

### Flow 2: Authentication (Email OTP)

```
Visitor clicks "Book Consultation" or "Dashboard"
    ↓
If not authenticated → redirected to /auth?returnTo=<path>
    ↓
Enters email → signIn("email-otp") → OTP sent via Freebuff API
    ↓
Enters 6-digit code → signIn("email-otp") verifies
    ↓
Session established → Navigate to returnTo path
```

### Flow 3: First Admin Setup

```
First user signs in via /auth
    ↓
Navigates to /dashboard
    ↓
RequireAuth verifies authentication
    ↓
Dashboard → Overview → "Become Admin" button
    ↓
becomeAdmin mutation: checks no admin exists → sets role = "admin"
    ↓
Page reloads → user now has admin access
    ↓
CMS mutations now authorized
```

### Flow 4: CMS Content Management

```
Admin opens Dashboard (/dashboard)
    ↓
Selects tab (e.g., Procedures)
    ↓
useQuery(api.procedures.list) fetches data
    ↓
Admin edits/creates/deletes records
    ↓
useMutation(api.procedures.create/update/remove) writes to Convex
    ↓
Convex reactive queries update all connected clients automatically
    ↓
Public website reflects changes in real-time
```

### Flow 5: Image Upload

```
Admin clicks "Upload" in Media tab or MediaSelector
    ↓
selectFile() → file input
    ↓
useImageUpload.upload(file):
    1. Validate (type: JPEG/PNG/WebP/GIF, size: <5MB)
    2. generateUploadUrl() → Convex signed URL
    3. fetch(uploadUrl, { method: "POST", body: file }) → storageId
    4. recordUpload({ storageId, url: "", name, type, size }) → media record
    ↓
Media record created with storageId (canonical reference)
    ↓
UI displays via ResolvedImage → resolveUrl query → ctx.storage.getUrl() → <img>
```

### Flow 6: WhatsApp Consultation

```
Visitor opens /consultation
    ↓
Step 1: Select procedures from CMS list (multi-select) + "Other Procedure" option
    ↓
Step 2: Fill personal info (name, age, gender, nationality, residence)
    ↓
Step 3: Review summary
    ↓
Click "Send via WhatsApp"
    ↓
Generates formatted AR/EN message
    ↓
window.open(https://wa.me/<number>?text=<encoded_message>)
    ↓
No data stored in database — entirely client-side
```

### Flow 7: Media Library Management

```
Admin opens Dashboard → Media tab
    ↓
Sees grid of uploaded images (with thumbnails)
    ↓
Can: Upload new, Delete (with reference checking), Repair URLs
    ↓
Upload: calls useImageUpload → creates media record
    ↓
Delete: checkReferences query → shows where image is used → confirm → remove mutation
    ↓
Repair: repairUrls mutation → regenerates URLs from storageIds
    ↓
Diagnostics: shows storage health for each media record
```

---

## 11. Data Flow

### Reading Data (Public)

```
Component (e.g., Procedures section)
    ↓
useQuery(api.procedures.listActive)     ← React hook
    ↓
ConvexReactClient sends subscription    ← WebSocket
    ↓
Convex server executes query function
    ↓
Database read
    ↓
Result streamed back to client
    ↓
Component re-renders with data
```

### Writing Data (Admin)

```
Admin fills form in Dashboard
    ↓
handleSubmit() → extract FormData
    ↓
useMutation(api.procedures.create)(data)   ← React hook
    ↓
ConvexReactClient sends mutation request   ← HTTP
    ↓
Convex server executes mutation function
    ↓
requireAdmin(ctx) check
    ↓
Database write (insert/patch/delete)
    ↓
All active subscriptions notified
    ↓
All connected UIs update reactively
```

### Image Resolution Flow

```
StorageId stored in CMS field (e.g., procedure.image)
    ↓
Component renders <ResolvedImage ref={storageId} />
    ↓
useQuery(api.media.resolveUrl, { ref: storageId })
    ↓
resolveUrl function:
    1. Empty? → return ""
    2. Data URI? → return as-is
    3. Plain storageId (no protocol)? → ctx.storage.getUrl(storageId) → return URL
    4. URL containing storageId? → extract + resolve
    5. URL matching media record? → find storageId + resolve
    6. No resolution? → return original URL as fallback
    ↓
ResolvedImage receives URL
    ↓
<img src={resolvedUrl} />
    ↓
Browser fetches image from Convex storage CDN
```

---

## 12. Image System

### Architecture

```
Upload Path:
  file → generateUploadUrl → POST to Convex → storageId
  → recordUpload({ storageId, url: "" }) → media record

Resolution Path:
  storageId (stored in CMS field)
  → ResolvedImage component
  → useQuery(media.resolveUrl, { ref: storageId })
  → ctx.storage.getUrl(storageId) → working URL
  → <img src={workingUrl} />

Batch Resolution Path:
  [storageId1, storageId2, ...]
  → useResolvedMedia(items) hook
  → useQuery(media.resolveUrls, { refs })
  → Map<storageId, resolvedUrl>
  → Each item gets resolvedUrl
```

### Canonical Reference

**`storageId` is the single source of truth.** All image fields in the database store Convex storageIds (or empty strings). The `media.url` field is a **legacy field** kept for backward compatibility — new uploads store `url: ""`.

### Resolution Priority

1. Empty string → "No image"
2. Data URI → render as-is
3. Plain string (no `http://` or `https://`) → treat as storageId → `ctx.storage.getUrl()`
4. Full URL containing `/api/storage/<id>` → extract storageId → resolve
5. Full URL matching a media record → find storageId → resolve
6. Full URL with no resolution possible → return as-is (fallback)

### Image Components

| Component | Location | Purpose |
|---|---|---|
| `ResolvedImage` | `src/components/ResolvedImage.tsx` | Universal image renderer |
| `MediaSelector` | `src/components/MediaSelector.tsx` | Media library picker |
| `ImageUpload` | `src/components/ImageUpload.tsx` | Upload component |
| `MediaDiagnostics` | `src/components/MediaDiagnostics.tsx` | Debug/health check |

### Upload Validation

- **Max size:** 5MB
- **Allowed types:** `image/jpeg`, `image/png`, `image/webp`, `image/gif`
- **Storage:** Convex file storage

### Media Reference Checking

Before deleting a media item, `checkReferences(storageId)` checks:
- `siteSettings.about.image`
- All `procedures` (image, ogImage, beforeImage, afterImage, gallery[])
- All `beforeAfter` (beforeImage, afterImage)
- All `testimonials` (avatar)
- `siteSettings.seo.ogImage`

---

## 13. CMS System

### Architecture

The CMS uses a **key-value store pattern** (`siteSettings` table) for most homepage content and **dedicated tables** for structured content (procedures, testimonials, FAQ, before/after).

### CMS Data Sources

| Content Type | Storage | Editor |
|---|---|---|
| Doctor Info | `siteSettings.key="doctor"` | Settings tab |
| Hero Section | `siteSettings.key="hero"` | Homepage CMS → Hero |
| About Section | `siteSettings.key="about"` | Homepage CMS → About |
| CTA Section | `siteSettings.key="cta"` | Homepage CMS → CTA |
| Footer | `siteSettings.key="footer"` | Homepage CMS → Footer |
| Section Headers | `siteSettings.key="<section>Section"` | Homepage CMS → individual |
| Visibility | `siteSettings.key="homepage"` | Homepage CMS → Visibility |
| SEO | `siteSettings.key="seo"` | SEO tab |
| Procedures | `procedures` table | Procedures tab |
| Before & After | `beforeAfter` table | Before & After tab |
| Testimonials | `testimonials` table | Testimonials tab |
| FAQ | `faq` table | FAQ tab |
| Media | `media` table | Media tab |
| Navbar Photo | `siteSettings.key="doctor".navbarPhoto` | Settings tab |

### CMS → Public Website Mapping

| Public Section | CMS Source | Fallback |
|---|---|---|
| Hero badge, title, subtitle, description, CTAs | `hero` settings | i18n translations |
| Hero trust badges | `hero.trustBadges` | i18n translations |
| About badge, title, description, stats | `about` settings | i18n translations |
| About doctor image | `about.image` | Static `/assets/1.jpg` |
| Procedures list | `procedures.listActive` | None (empty state) |
| Procedures section header | `proceduresSection` settings | i18n translations |
| Before & After cases | `beforeAfter.listActive` | Placeholder |
| B&A section header | `beforeAfterSection` settings | i18n translations |
| Testimonials | `testimonials.listActive` | Placeholder |
| Testimonials section header | `testimonialsSection` settings | i18n translations |
| FAQ | `faq.listActive` | i18n translations |
| FAQ section header | `faqSection` settings | i18n translations |
| CTA | `cta` settings | i18n translations |
| Contact info | `doctor` settings | Hardcoded defaults |
| Footer description | `footer` settings | i18n translations |
| Footer services | `procedures.listActive` (top 6) | i18n translations |
| Social media | `doctor.socialMedia` | Not rendered if empty |
| Navbar logo | `doctor.navbarPhoto` | Static `/assets/3.jpg` |
| SEO meta | `seo` settings | Hardcoded in index.html |
| Section visibility | `homepage` settings | All visible by default |

---

## 14. Internationalization (i18n)

### System

**Custom React Context-based i18n** (not next-intl or i18next).

- **Languages:** Arabic (`ar`) and English (`en`)
- **Default:** Arabic
- **Storage:** `localStorage.setItem("locale", locale)`
- **RTL/LTR:** Set via `document.documentElement.dir` attribute

### Implementation

```typescript
// src/i18n/index.tsx
export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(getInitialLocale);
  // Sets localStorage, document.lang, document.dir
  // Provides: locale, t (translations), dir, setLocale, toggleLocale
}

export function useI18n() {
  // Returns: { locale, t, dir, setLocale, toggleLocale }
}
```

### Translation Files

- `src/locales/ar.json` — Arabic translations
- `src/locales/en.json` — English translations

Both files have identical structure (keyed by section/feature).

### Translation Coverage

All UI text is translated: navigation, hero, about, procedures, before/after, testimonials, FAQ, contact, CTA, footer, consultation form, common strings, error messages.

### Language Switching

- Toggle button in Navbar and Footer
- Calls `setLocale()` which updates React state + localStorage + `document.dir`
- All components re-render with new translations reactively
- No page reload required

### CMS Bilingual Content

All CMS content has `*Ar` and `*En` fields. Components check `isArabic = dir === "rtl"` and select the appropriate field.

---

## 15. UI / Design System

### Design Theme: Light Glassmorphism

**Key CSS classes** (defined in `src/index.css`):

| Class | Effect |
|---|---|
| `.glass` | White 55% opacity, 20px blur, white border |
| `.glass-strong` | White 70% opacity, 30px blur |
| `.glass-subtle` | White 30% opacity, 12px blur |
| `.glass-card` | White 45% opacity, 24px blur, shadow, inset highlight |
| `.glass-elevated` | White 65% opacity, 32px blur, stronger shadow |
| `.luxury-gradient` | Multi-stop warm gradient background |
| `.hero-gradient` | Hero-specific gradient |
| `.glass-shimmer` | Animated shimmer effect |

### Color System (CSS Variables)

| Variable | Value | Purpose |
|---|---|---|
| `--background` | `#FDF8F4` | Page background (warm ivory) |
| `--foreground` | `#1E1E1E` | Text color (deep charcoal) |
| `--primary` | `#8B7355` | Primary action color (warm brown) |
| `--primary-foreground` | `#FFFFFF` | Text on primary |
| `--secondary` | `#C5A882` | Secondary accent (champagne) |
| `--muted` | `#F0E8DE` | Muted background |
| `--muted-foreground` | `#6B5E4F` | Muted text |
| `--accent` | `#D4C4AD` | Accent (warm nude) |
| `--border` | `rgba(212, 196, 173, 0.4)` | Border color |
| `--ring` | `#8B7355` | Focus ring |

### Typography

- **Headings:** `Playfair Display` (serif, luxury feel) via `.font-serif-luxury`
- **Body:** `Inter` (English) / `Noto Kufi Arabic` (Arabic)
- **RTL:** `Noto Kufi Arabic` takes priority in RTL mode

### Component Library

**shadcn/ui** (new-york style) — ~60 components in `src/components/ui/`. Includes:
- Layout: Card, Separator, AspectRatio, Resizable
- Forms: Input, Textarea, Select, Checkbox, Switch, RadioGroup, Slider, Form, InputOTP
- Navigation: Tabs, Breadcrumb, NavigationMenu, Pagination
- Overlays: Dialog, Sheet, AlertDialog, Popover, Tooltip, HoverCard, Drawer
- Feedback: Alert, Progress, Skeleton, Toaster
- Data: Table, Accordion, Command, Calendar
- Advanced: Carousel, Chart, Sidebar

### Animation

**Framer Motion** for:
- Page section fade-in-up animations (triggered by `react-intersection-observer`)
- Navbar slide-in/out
- Mobile menu slide-in (direction-aware for RTL)
- Procedure cards stagger animation
- Hero content stagger animation

### Responsive Behavior

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Mobile menu: slide-in panel with backdrop
- Grid layouts adapt: 1 col → 2 col → 3/4/5 col
- Dashboard: sidebar tabs → horizontal scrollable tabs

---

## 16. External Services & Integrations

### Convex (Backend-as-a-Service)

- **Purpose:** Database, file storage, serverless functions, authentication
- **URL:** Configured via `VITE_CONVEX_URL`
- **Used for:** All data operations, auth, file storage
- **Dependency:** Core — the entire backend depends on Convex

### Freebuff Platform

- **Purpose:** Hosting, development environment, error monitoring
- **Integration:** `@vly-ai/integrations` package, `VlyToolbar` component
- **Error reporting:** `src/instrumentation.tsx` sends errors to `VITE_VLY_MONITORING_URL`
- **Federated auth:** Freebuff JWTs accepted as valid authentication via `auth.config.ts`
- **Email OTP:** Sent via `https://auth.freebuff.app/send_otp` with API key `fb_email_2crN1hqIArZP2bEfvjp5Qik4`

### WhatsApp

- **Purpose:** Consultation requests — messages sent directly to doctor's WhatsApp
- **Mechanism:** `window.open(https://wa.me/<number>?text=<message>)`
- **No API integration** — just URL-based deep link
- **Phone number:** Stored in CMS `doctor.whatsappNumber`

### Email (OTP only)

- **Purpose:** Authentication only
- **Provider:** Freebuff email service
- **Endpoint:** `https://auth.freebuff.app/send_otp`
- **Method:** POST with `x-api-key` header
- **Not used for:** Marketing, notifications, or any other email

---

## 17. Environment Variables

| Variable | Required | Used In | Purpose |
|---|---|---|---|
| `VITE_CONVEX_URL` | Yes | `src/main.tsx` | Convex deployment URL (frontend connection) |
| `VITE_VLY_APP_ID` | No | `src/instrumentation.tsx` | Freebuff app identifier |
| `VITE_VLY_MONITORING_URL` | No | `src/instrumentation.tsx` | Freebuff error monitoring endpoint |
| `VLY_INTEGRATION_KEY` | No | `src/lib/vly-integrations.ts` | Freebuff integrations token |
| `VLY_APP_NAME` | No | `src/convex/auth/emailOtp.ts` | App name for OTP email |
| `VLY_CONVEX_AUTH_ISSUER` | No | `src/convex/auth.config.ts` | Freebuff auth issuer URL |

**Default fallback:** If `VITE_CONVEX_URL` is not set, falls back to `https://impartial-ladybug-881.convex.cloud` (hardcoded in `src/main.tsx`).

**IMPORTANT:** Never expose secrets in source code. The email OTP API key is hardcoded in `src/convex/auth/emailOtp.ts` — this is intentional as it's a server-side Convex function (not exposed to the browser).

---

## 18. Build / Run / Deployment

### Development

```bash
bun install              # Install dependencies
bunx convex dev --once   # Run Convex dev (codegen + functions push)
bun dev                  # Start Vite dev server
```

### Type Checking

```bash
bun tsc -b --noEmit       # TypeScript type check
```

### Production Build

```bash
bun run build            # Runs: tsc -b && vite build
```

Output: `dist/` directory

### Deployment

- **Hosting:** Freebuff/Vercel (managed)
- **Build command:** `bun run build`
- **Output directory:** `dist`
- **Convex deployment:** `bunx convex deploy` (requires Convex account)
- **Environment variables:** Set via hosting platform UI

### Scripts (from package.json)

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start development server |
| `build` | `tsc -b && vite build` | Production build |
| `lint` | `eslint .` | Run linter |
| `format` | `prettier --write .` | Format code |
| `preview` | `vite preview` | Preview production build |

### Vite Configuration

- **Framework:** `@vitejs/plugin-react`
- **Tailwind:** `@tailwindcss/vite` plugin
- **Path aliases:** `@/` → `src/`
- **HMR:** Enabled but overlay disabled (`hmr: { overlay: false }`)
- **React dedupe:** Configured to prevent duplicate React bundles
- **Manual chunk splitting:** react-vendor, convex-vendor, radix-ui, framer-motion, charts, forms
- **IMPORTANT:** Do NOT modify HMR or chunk splitting settings

---

## 19. SEO & Structured Data

### Static SEO (in `index.html`)

- `<title>` with doctor name + specialties
- `<meta name="description">` with keywords
- `<meta name="keywords">` with relevant terms
- `<link rel="canonical">` to `https://dr-alhasan.com/`
- Open Graph tags (type, title, description, image, url, site_name, locale)
- Twitter Card tags (summary_large_image)
- Physician JSON-LD structured data

### Dynamic SEO (from CMS)

- `Landing.tsx` dynamically updates:
  - `document.title` from `seo.siteTitleAr`/`siteTitleEn`
  - Meta description from `seo.metaDescriptionAr`/`metaDescriptionEn`
  - OG image from `seo.ogImage`
  - Twitter card meta tags
- MedicalBusiness JSON-LD (dynamic from doctor settings)
- FAQPage JSON-LD (dynamic from FAQ entries)

### Dynamic Sitemap

- Served from Convex HTTP action at `/sitemap.xml`
- Includes static pages + dynamic procedure pages
- Generated from live CMS data
- 1-hour cache (`max-age=3600`)
- Static fallback in `public/sitemap.xml`

### Per-Procedure SEO

Each procedure has:
- `seoTitleAr`/`seoTitleEn` — custom page title
- `seoDescriptionAr`/`seoDescriptionEn` — custom meta description
- `ogImage` — custom Open Graph image

---

## 20. State Management

### Client-Side State

**No global state management library** (no Redux, Zustand, Jotai, etc.).

**State is managed via:**

1. **Convex reactive queries** (`useQuery`) — Server state is the primary source of truth. No need to cache or manage server state client-side because Convex handles subscriptions and updates.

2. **React `useState`** — Local component state for:
   - Form inputs and editing state
   - UI state (active tab, modals, search, filters)
   - Upload state (progress, errors)

3. **React Context** — Two contexts:
   - `I18nContext` — locale, translations, direction
   - Convex auth context (via `ConvexAuthProvider`)

4. **localStorage** — Persists language preference (`locale`)

### Key State Locations

| State | Location | Purpose |
|---|---|---|
| Auth session | Convex auth store | Managed by `@convex-dev/auth` |
| User data | `useQuery(api.users.currentUser)` | Current user info |
| CMS data | Various `useQuery` calls | All CMS content |
| Active dashboard tab | `Dashboard.tsx` useState | Current tab |
| Form editing state | Per-tab useState | Edit mode, form values |
| Language | `I18nContext` + localStorage | Current locale |
| Upload state | `use-upload.ts` useState | Upload progress/errors |

---

## 21. Business Logic

### Rule 1: Admin-Only CMS Access

All CMS mutations require admin role. The first authenticated user can self-promote to admin. After that, only existing admins can create new admins (no function exists for this — it must be done directly in the database).

### Rule 2: Procedure Management

- Procedures have a unique `slug` used for URLs (`/procedure/{slug}`)
- Procedures can be active/inactive (shown/hidden on public site)
- Procedures can be featured (shown on homepage)
- Procedures have a numeric `order` for sorting
- Procedures support multiple images: main image, before/after, gallery, OG image

### Rule 3: Before & After Cases

- Linked to procedures via `procedureType` (procedure slug)
- Each case has exactly one before image and one after image
- Cases can be active/inactive

### Rule 4: Media Upload

- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, GIF
- Stored in Convex storage
- Referenced by `storageId` (not URL)
- Deletion checks all CMS references first

### Rule 5: Consultation Flow

- No data is stored in the database
- WhatsApp message format differs by language (AR vs EN)
- Includes selected procedures, patient info
- Opens WhatsApp deep link directly

### Rule 6: Seed Data Safety

- `seedProcedures` is idempotent — checks slug existence before insert
- `seedHomepageSettings` only fills empty/missing fields — never overwrites
- `seedAll` checks if procedures exist before seeding

### Rule 7: Image Resolution

- `storageId` is the canonical reference
- New uploads store `url: ""` in media table
- All resolution goes through `ctx.storage.getUrl()`
- Legacy records with full URLs are handled via fallback resolution

### Rule 8: Section Visibility

- All homepage sections can be individually toggled on/off via CMS
- Default: all sections visible when no settings exist

### Rule 9: Language Selection

- All CMS content has AR and EN fields
- Components check `dir === "rtl"` to select language
- Fallback chain: CMS field → i18n translation → hardcoded default

---

## 22. Technical Debt

### TD-1: Dashboard.tsx monolith — **RESOLVED** (2026-09-19, commit `dc29c4e`)
- **Location (before):** `src/pages/Dashboard.tsx` (~1600–2050 lines, all tab components inline)
- **Resolution:** `Dashboard.tsx` is now a ~48-line shell; every tab moved to `src/components/dashboard/` (`DashboardOverviewTab`, `DashboardAnalyticsTab`, `DashboardProceduresTab` incl. `ProcedureForm`, `DashboardBeforeAfterTab`, `DashboardTestimonialsTab`, `DashboardFaqTab`, `DashboardSettingsTab`, `DashboardMediaTab` incl. its upload widget), with `DashboardLayout`, `DashboardNav`, and shared `dashboard-utils.ts`. Existing `HomepageCMSTab`, `ArticlesTab`, `SEOTab` untouched. Behavior preserved — `tsc`/lint/build green.

### TD-2: Duplicate seed data
- **Location:** `src/convex/seed.ts` — `seedAll` and `seedProcedures`
- **Description:** `seedAll` contains its own procedure data that differs slightly from `seedProcedures` (different slugs like `blepharoplasty` vs `upper-lower-eyelid-lift`, bilingual duration/recovery strings)
- **Impact:** Confusion about which seed to use; data inconsistency
- **Suggestion:** Consolidate into a single seed function

### TD-3: Hardcoded Convex URL fallback
- **Location:** `src/main.tsx` line: `VITE_CONVEX_URL || 'https://impartial-ladybug-881.convex.cloud'`
- **Description:** Development Convex URL hardcoded as fallback
- **Impact:** If env var is missing, production connects to dev Convex
- **Suggestion:** Remove fallback or use environment-appropriate default

### TD-4: Hardcoded API key
- **Location:** `src/convex/auth/emailOtp.ts`
- **Description:** Freebuff email OTP API key is hardcoded
- **Impact:** Key is visible in Convex function source (though not exposed to browser)
- **Suggestion:** Move to environment variable if possible

### TD-5: Unused dependencies
- **Location:** `package.json`
- **Description:** Several packages installed but not actively used in source code: `recharts`, `hono`, `next-themes`, `react-resizable-panels`, `react-day-picker`
- **Impact:** Increased bundle size
- **Suggestion:** Remove unused dependencies

### TD-6: Unused Convex files
- **Location:** `src/convex/notifications.ts`
- **Description:** Contains only a comment: `// DEPRECATED - Notifications table removed.`
- **Impact:** Dead file
- **Suggestion:** Delete

### TD-7: No database migrations
- **Description:** No migration system exists. Schema changes are applied directly via Convex's schema validation (currently set to `schemaValidation: false`)
- **Impact:** Schema drift between development and production possible
- **Suggestion:** Enable schema validation or implement migration strategy

### TD-8: Image `url` field is legacy
- **Location:** `media` table
- **Description:** The `url` field is kept empty for new uploads. Some old records may have full URLs.
- **Impact:** Dual resolution logic needed (storageId + legacy URL)
- **Suggestion:** Eventually migrate all records to storageId-only and remove `url`

### TD-9: `becomeAdmin` only works once
- **Location:** `src/convex/users.ts`
- **Description:** After the first admin is created, no mechanism exists to promote additional admins from the UI
- **Impact:** New admin users must be promoted via database directly
- **Suggestion:** Add an admin-only `promoteUser` mutation

### TD-10: Auth page is English-only
- **Location:** `src/pages/Auth.tsx`
- **Description:** The login/signup page UI is hardcoded in English, not using the i18n system
- **Impact:** Arabic users see English auth UI
- **Suggestion:** Add auth page translations

### TD-11: `schemaValidation: false`
- **Location:** `src/convex/schema.ts`
- **Description:** Schema validation is disabled
- **Impact:** No runtime type checking for database records
- **Suggestion:** Enable after stabilizing schema

---

## 23. Known Bugs & Issues

### BUG-1: Image System — Unverified in Production
- **Severity:** High
- **Location:** Image resolution system (ResolvedImage, media.ts)
- **Current behavior:** Images may not display correctly in production if Convex deployment differs between upload and read contexts
- **Evidence:** Multiple image report files document ongoing investigation (IMAGE-REPORT.md, IMAGE-REPORT2.md, IMAGE-REPORT3.md)
- **Status:** Root cause identified (loading state conflation) and fix applied, but browser verification incomplete
- **Recommendation:** Test image upload → refresh → display cycle in production environment

### BUG-2: `object-cover` on all content images
- **Severity:** Low
- **Location:** All ResolvedImage usage in public components
- **Current behavior:** All images use `object-cover` which crops images to fill their container
- **Evidence:** User previously requested `object-fill` then reverted to `object-cover`
- **Note:** This is the current intentional behavior after user feedback

### BUG-3: sitemap.xml references `proc.active`
- **Severity:** Low
- **Location:** `src/convex/http.ts`
- **Description:** Dynamic sitemap checks `proc.active !== false` but the procedure field is `isActive`, not `active`
- **Impact:** The check always passes (undefined !== false is true), so all procedures appear in sitemap regardless of active status
- **Suggestion:** Change to `proc.isActive !== false`

---

## 24. Dead / Unused / Suspicious Code

### Dead Code

| File/Code | Status | Notes |
|---|---|---|
| `src/convex/notifications.ts` | **Dead** | Contains only `// DEPRECATED` comment |
| `src/components/LogoDropdown.tsx` | **Unused** | Imported nowhere in the application |
| `src/components/ui/index.ts` | **Registry only** | Not imported by any component (components import directly from individual files) |
| `recharts` dependency | **Unused** | No imports found in source code |
| `hono` dependency | **Unused** | No imports found in source code |
| `next-themes` dependency | **Unused** | No imports found in source code |
| `react-resizable-panels` dependency | **Unused** | No imports found in source code |
| `react-day-picker` dependency | **Unused** | Only used indirectly by calendar.tsx which isn't used |

### Suspicious Code

| Code | Location | Notes |
|---|---|---|
| `window.navigateToAuth` type declaration | `src/types/global.d.ts` | Declared but never implemented |
| `InstrumentationProvider` | `src/instrumentation.tsx` | Imported in main.tsx but `InstrumentationProvider` is not used in the render tree — only `ErrorBoundary` and error dialog are used |

---

## 25. Security Audit

### Authentication
- **Rating:** Adequate for the use case
- Email OTP verification prevents unauthorized access
- Sessions managed by Convex Auth (not custom)
- **Issue:** No rate limiting on OTP attempts visible in frontend code

### Authorization
- **Rating:** Good
- All CMS mutations enforce `requireAdmin()` server-side
- Client-side checks are supplementary only

### Input Validation
- **Rating:** Minimal
- File upload validates type and size
- Form inputs use HTML5 `required` attribute
- No server-side validation beyond Convex schema (which has `schemaValidation: false`)
- **Issue:** No Zod validation on mutation inputs despite `zod` being installed

### XSS
- **Rating:** Low risk
- React escapes content by default
- `dangerouslySetInnerHTML` used in two places:
  - `Landing.tsx` — MedicalOrganization JSON-LD (from CMS data)
  - `FAQ.tsx` — FAQPage JSON-LD (from CMS data)
- **Issue:** CMS data injected into `dangerouslySetInnerHTML` without sanitization. If admin inputs malicious HTML/JS in CMS, it could execute.

### CSRF
- **Rating:** Not applicable
- Convex uses its own transport (WebSocket/HTTP with auth tokens), not traditional cookie-based sessions

### Secrets Exposure
- **Rating:** Acceptable
- Freebuff API key is in Convex server function (not browser)
- `VITE_` env vars are exposed to the browser (by design)
- No production secrets found in client-side code

### File Upload Security
- **Rating:** Adequate
- Server-side validation: type and size checked before upload
- Signed upload URLs prevent direct file manipulation
- Admin-only upload access

### Content Security
- **Rating:** Medium concern
- Admin CMS content rendered without sanitization
- Images loaded from Convex storage (trusted source)
- Social media URLs from CMS open in new tabs with `noopener noreferrer`

---

## 26. What Is Actually Complete

| Area | Status | Evidence |
|---|---|---|
| **Public Homepage** | Complete | All sections render with CMS data + i18n |
| **Bilingual Support (AR/EN)** | Complete | Full translations, RTL/LTR, language toggle |
| **Procedures CMS** | Complete | Full CRUD, public display, detail pages |
| **Before & After CMS** | Complete | Full CRUD, public gallery, slider |
| **Testimonials CMS** | Complete | Full CRUD, public display |
| **FAQ CMS** | Complete | Full CRUD, public accordion |
| **Homepage CMS** | Complete | All sections editable, visibility toggle |
| **SEO CMS** | Complete | Global + per-procedure settings |
| **Doctor Settings CMS** | Complete | All contact/bio/social fields |
| **Media Library** | Partial | Upload/delete work; thumbnails may be unreliable |
| **Image System** | Partial | Code fixed, browser verification pending |
| **Authentication** | Complete | Email OTP flow works |
| **Authorization** | Complete | Admin-only CMS mutations |
| **Consultation Form** | Complete | WhatsApp integration, no data stored |
| **Contact Page** | Complete | Form, contact info, WhatsApp |
| **Responsive Design** | Complete | Mobile-first, all breakpoints |
| **Animations** | Complete | Framer Motion throughout |
| **SEO** | Complete | Meta tags, JSON-LD, sitemap |
| **Dashboard Seed** | Complete | Three seed buttons (procedures, CMS, full) |
| **Database** | Complete | 7 tables, proper indexes |
| **Navbar Photo CMS** | Complete | Settings tab → navbar/footer display |
| **Tests** | **Missing** | No test files found |
| **CI/CD** | **Missing** | No GitHub Actions or pipelines |
| **Error Monitoring** | Partial | Freebuff integration exists but limited |
| **Notifications** | **Missing** | Table removed, file deprecated |

---

## 27. CRITICAL INVARIANTS

These must NOT be broken:

1. **`requireAdmin(ctx)` must remain on ALL CMS mutations** — This is the sole server-side authorization gate.

2. **`storageId` is the canonical image reference** — Do not switch to URL-based references for new uploads.

3. **Convex auth config must have two JWT providers** — Convex self-issued (for project sign-in) and Freebuff federated (for SSO). The Convex entry must NOT be changed to `type: "customJwt"`.

4. **`schemaValidation: false` in schema.ts** — Enabling this without ensuring all existing data conforms will break the app.

5. **The `siteSettings` key-value store pattern** — All homepage CMS content uses `siteSettings` with string keys. Do not create separate tables for homepage section content.

6. **All public Convex queries are unauthenticated** — Public data is accessible without login. Only mutations are protected.

7. **i18n uses `localStorage` for persistence** — Language preference survives page refresh but not browser clear.

8. **`becomeAdmin` only works when no admin exists** — After the first admin, no self-service promotion is possible.

9. **The WhatsApp consultation stores NO data** — This is intentional. Do not add database storage for consultations.

10. **Hero and CTA image fields are intentionally unused** — The Hero and CTA sections are text/design-based. Do not add image upload UI for these sections.

11. **Freebuff `server.hmr: false`** — The Vite dev server must NOT have HMR enabled.

12. **All image resolution goes through `ctx.storage.getUrl()`** — Do not manually construct Convex storage URLs.

---

## 28. Architecture Decision Records

### ADR-1: Convex as Full Backend
- **Decision:** Use Convex for database, auth, storage, and serverless functions
- **Why:** Single platform handles all backend needs with reactive queries
- **Where:** Entire `src/convex/` directory
- **Dependencies:** Convex SDK, `@convex-dev/auth`
- **Break if changed:** Everything — entire data layer, auth, storage

### ADR-2: Key-Value CMS Pattern
- **Decision:** Store homepage CMS content as JSON objects in `siteSettings` table using string keys
- **Why:** Flexible — new sections can be added without schema changes
- **Where:** `siteSettings` table, `homepageSettings.ts`, `siteSettings.ts`
- **Dependencies:** All homepage sections depend on this pattern
- **Break if changed:** All CMS editors, all homepage sections, seed functions

### ADR-3: Dual Language via Context (not URL)
- **Decision:** Language switching via React Context + localStorage, not URL segments
- **Why:** Simpler architecture — single route per page, language in state
- **Where:** `src/i18n/index.tsx`, all components using `useI18n()`
- **Dependencies:** All components that display text
- **Break if changed:** All text rendering, all CMS bilingual logic

### ADR-4: WhatsApp for Consultations (No Backend)
- **Decision:** Send consultation requests via WhatsApp deep link, storing nothing
- **Why:** Zero infrastructure cost for consultation management
- **Where:** `src/pages/ConsultationPage.tsx`, `src/components/sections/Contact.tsx`
- **Dependencies:** Contact form, consultation form
- **Break if changed:** Consultation flow

### ADR-5: Lazy Loading All Routes
- **Decision:** All page components lazy-loaded via `React.lazy()`
- **Why:** Better code splitting and initial load performance
- **Where:** `src/main.tsx`
- **Dependencies:** All route components
- **Break if changed:** Initial load performance

### ADR-6: Single ResolvedImage Component
- **Decision:** All image rendering goes through `ResolvedImage` component
- **Why:** Single resolution logic, consistent loading/error states
- **Where:** `src/components/ResolvedImage.tsx`, all components rendering CMS images
- **Dependencies:** All image rendering across the app
- **Break if changed:** Image display in Dashboard and public site

---

## 29. HANDOFF FOR NEXT AI AGENT

### Before Touching Code

1. **Read `src/convex/schema.ts`** to understand all data structures
2. **Read `src/main.tsx`** to understand routing and providers
3. **Read `src/i18n/index.tsx`** to understand the i18n system
4. **Read `src/components/ResolvedImage.tsx`** to understand image rendering
5. **Run `bunx convex dev --once && bun tsc -b --noEmit`** to verify the current state

### Important Architecture Constraints

- **Do NOT add a separate backend** — Convex IS the backend
- **Do NOT add another database** — Convex IS the database
- **Do NOT add another auth system** — Convex Auth IS the auth
- **Do NOT modify `src/convex/auth.ts`** — It's marked as read-only
- **Do NOT modify `src/convex/auth.config.ts`** — JWT provider configuration is fragile
- **Do NOT enable `schemaValidation`** without ensuring all data conforms
- **Do NOT add `hmr: true`** to Vite config
- **Do NOT manually construct Convex storage URLs** — always use `ctx.storage.getUrl()`
- **Do NOT use raw `<img src={storageId}>`** — always use `ResolvedImage`
- **Do NOT add Hero Image or CTA Image** — they are intentionally unused

### Important Business Rules

- All CMS mutations must call `requireAdmin(ctx)`
- `becomeAdmin` only works when no admin exists
- WhatsApp consultation stores no data
- All public queries are unauthenticated
- Language is determined by localStorage, not URL
- `storageId` is the canonical image reference

### Fragile Areas

1. **Image system** — Storage resolution, loading states, and URL generation have had multiple rounds of fixes. Test thoroughly.
2. **Dashboard.tsx** — resolved 2026-09-19: split into modular components under `src/components/dashboard/` (was a 1600–2050-line monolith)
3. **Auth config** — JWT provider configuration must match exactly
4. **Seed data** — `seedAll` and `seedProcedures` have different procedure slugs

### Known Problems

- No tests exist
- Image system browser verification is incomplete
- `becomeAdmin` only promotes one user
- Auth page is English-only
- No rate limiting on auth attempts
- `dangerouslySetInnerHTML` in JSON-LD without sanitization
- Dynamic sitemap checks wrong field name (`active` instead of `isActive`)

### Safe Areas

- Homepage sections (Hero, About, Procedures, etc.)
- Public pages (ProceduresPage, BeforeAfterPage, ContactPage)
- i18n system
- Tailwind/CSS theme
- Seed functions
- Media resolution hooks
- Public Convex queries

### Recommended First Investigation

1. `src/convex/schema.ts` — Data structures
2. `src/main.tsx` — App entry and routing
3. `src/components/sections/` — Homepage components
4. `src/pages/Dashboard.tsx` (+ `src/components/dashboard/`) — Admin CMS
5. `src/convex/media.ts` — Image system backend
6. `src/components/ResolvedImage.tsx` — Image system frontend
7. `src/hooks/` — Custom hooks
8. `src/i18n/` — Translation system

---

## 30. DOCUMENTATION AUDIT

Generated from repository inspection.

### Confidence Levels

- **High:** Directly verified from source code or configuration files
- **Medium:** Inferred from multiple code references
- **Low:** Inferred but not fully verifiable

### Important Unverified Areas

1. **Production Convex environment** — Cannot verify which Convex deployment production uses vs development
2. **Image system in production** — Browser verification not performed; code-level fixes applied but untested
3. **Vercel deployment configuration** — Cannot inspect Vercel project settings from this environment
4. **Email OTP delivery** — Cannot verify the Freebuff email service is working
5. **WhatsApp deep link** — Cannot verify the doctor's WhatsApp number is correct
6. **Dynamic sitemap** — Cannot verify the HTTP action works in production (checks wrong field name `active` instead of `isActive`)

### Files Examined

All 132+ source files in the project were examined during this audit, including:
- All `src/convex/*.ts` files (11 files)
- All `src/pages/*.tsx` files (9 files)
- All `src/components/*.tsx` files (12 custom components)
- All `src/hooks/*.ts` files (5 files)
- All `src/i18n/*` files (2 files)
- Both locale files (`ar.json`, `en.json`)
- `package.json`, `components.json`, `index.html`
- `src/main.tsx`, `src/index.css`
- `src/lib/utils.ts`, `src/lib/vly-integrations.ts`
- `README.md`
- `src/components/ui/index.ts`

### Last Audited

September 12, 2026

### Repository State

Branch: main (assumed — git commands unavailable)
