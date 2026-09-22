# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

Premium bilingual (Arabic/English) aesthetic surgery website with a structured Admin CMS, WhatsApp consultation flow, built-in visit + conversion analytics (page views, visitor countries, WhatsApp/CTA clicks), semantic procedure icons, geo-targeted SEO, patient-review photo galleries, a homepage **Reels video section** (vertical clips managed from the admin CMS), a media library, and a branded on-demand Open Graph share-image generator for the blog.

Production Convex deployment: `kindly-anaconda-422` (HTTP site: `https://kindly-anaconda-422.convex.site`). Web: **`https://www.dralhasanalsaiem.com`** (custom domain wired to Vercel; auto-deployed from the `main` branch).

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Glassmorphism theme
- **Backend:** Convex (database, auth, storage, HTTP actions)
- **Auth:** @convex-dev/auth — **Password** provider (scrypt-hashed), max 2 admin accounts
- **Routing:** React Router v7
- **i18n:** Custom bilingual system (Arabic RTL primary / English LTR secondary)
- **Icons:** Custom semantic procedure icon registry (hand-drawn SVGs + Lucide) in `src/lib/procedureIcons.tsx`
- **UI:** shadcn/ui components + Lucide icons + Framer Motion (lazy-loaded, kept out of the entry chunk)
- **Blog social-preview images:** satori + `@resvg/resvg-wasm` rendered on-demand inside a Convex node action (`src/convex/og_image.tsx`) → 1200×630 branded PNG; `harfbuzzjs` (Arabic text shaping) patched via **patch-package** to load its wasm from jsDelivr
- **Image optimization:** static WebP variants generated with `sharp` + a `<picture>` component (`BrandMark`) with JPG/PNG fallbacks

## Architecture

```
src/
├── components/
│   ├── sections/       # Homepage sections (Hero, About, Procedures, BeforeAfter,
│   │                   #   Testimonials, FAQ, CTA, Contact, InformationCard, Videos)
│   ├── dashboard/      # Admin CMS tab components (HomepageCMSTab, SEOTab, ArticlesTab,
│   │                   #   VideoEditor)
│   ├── ui/             # shadcn/ui components
│   ├── Footer.tsx      # Dynamic footer (CMS-driven procedures + settings)
│   ├── GlassNavbar.tsx # Navigation with mobile menu + language toggle
│   ├── AnalyticsTracker.tsx  # Fire-and-forget page-view tracker (no PII)
│   ├── ScrollProgress.tsx    # Champagne scroll-progress bar (rAF, framer-free)
│   ├── MediaSelector.tsx / MediaLibraryModal.tsx
│   │                   # Media library picker used by every image field
│   ├── ImageGalleryInput.tsx # Multi-image upload + library picker (testimonials)
│   ├── Lightbox.tsx    # Shared photo lightbox (testimonial galleries)
│   ├── ResolvedImage.tsx / MediaDiagnostics.tsx
│   ├── ImageUpload.tsx # Convex storage upload component
│   ├── BrandMark.tsx   # <picture> WebP logo/avatar with JPG/PNG fallback
│   ├── RequireAuth.tsx # Auth guard
│   └── dashboard/      # Admin CMS tabs: Dashboard*,Tab.tsx (Overview, Analytics, Procedures,
│                       #   Before & After, Testimonials, FAQ, Settings, Media) + HomepageCMSTab,
│                       #   ArticlesTab, SEOTab, DashboardLayout, DashboardNav, dashboard-utils.ts
├── lib/
│   ├── procedureIcons.tsx    # SVG + Lucide icon registry keyed by icon slug
│   ├── track.ts              # Frontend analytics client (page views + events)
│   └── utils.ts
├── convex/
│   ├── schema.ts             # Database schema
│   ├── admin.ts              # Server-side admin authorization (requireAdmin)
│   ├── procedures.ts         # Procedures CRUD (protected)
│   ├── articles.ts           # Blog article CRUD + published queries (protected writes)
│   ├── og_image.tsx          # OG share-card renderer (node action: satori → resvg PNG)
│   ├── beforeAfter.ts        # Before & After CRUD (protected)
│   ├── testimonials.ts       # Testimonials CRUD (protected, with photos)
│   ├── videos.ts             # Homepage video section CRUD (protected); stores clips + posters
│   │                         #   in Convex storage, records as a `videos` key in siteSettings
│   ├── faq.ts                # FAQ CRUD (protected)
│   ├── homepageSettings.ts   # Homepage CMS settings (hero, about, CTA, footer, sections)
│   ├── siteSettings.ts       # Key/value settings store (doctor, SEO)
│   ├── media.ts              # Media library (Convex storage upload, protected)
│   ├── analytics.ts          # Visit analytics (record, geocode cache, aggregates)
│   ├── users.ts              # User queries + becomeAdmin
│   ├── notifications.ts      # Notifications (unread counts)
│   ├── http.ts               # HTTP actions: /sitemap.xml, /og-meta, /og-image, /trackVisit
│   ├── migration.ts          # Admin-only data migrations
│   │                         #   (normalize icons, fill geo-targeted SEO)
│   ├── procedureIconDefaults.ts  # Canonical icon key per procedure slug
│   ├── procedureSeoDefaults.ts   # Canonical AR/EN SEO per procedure slug
│   ├── seed.ts               # Initial data seeding
│   └── auth/                 # Auth providers (Password)
├── pages/
│   ├── Landing.tsx            # Homepage (all sections CMS-driven with toggle)
│   ├── Dashboard.tsx          # Admin CMS shell (tabs live in components/dashboard/)
│   ├── ProcedureDetail.tsx    # Individual procedure page (CMS-driven + SEO)
│   ├── ProceduresPage.tsx     # All-procedures listing page
│   ├── BlogListPage.tsx       # Blog listing (/blog) — featured + grid of articles
│   ├── BlogArticlePage.tsx    # Single article (/blog/:slug) with SEO + JSON-LD
│   ├── BeforeAfterPage.tsx    # Before & After gallery with interactive slider
│   ├── ConsultationPage.tsx   # WhatsApp consultation form (2-step, no data stored)
│   ├── ContactPage.tsx        # Static contact page
│   ├── Auth.tsx               # Admin sign in / sign up (email + password)
│   └── NotFound.tsx           # 404 page
├── hooks/               # Custom hooks (auth, upload, mobile, media resolution)
├── i18n/                # Internationalization system
├── locales/             # ar.json, en.json translations (full i18n coverage)
└── index.css            # Glassmorphism theme + Tailwind
```

## Admin CMS

Access: Visit `/auth` → sign in with email + password → go to `/dashboard`. The first two sign-ups become administrators; further sign-ups are rejected.

### Dashboard Tabs (11)

| Tab | CRUD | Edit | Reorder | Search | Image Upload | Toggle Active |
|-----|------|------|---------|--------|--------------|---------------|
| **Overview** | — | — | — | — | — | — |
| **Analytics** | — | — | — | — | — | — |
| **Homepage CMS** | — | ✅ | — | — | ✅ | ✅ Toggle |
| **Procedures** | ✅ | ✅ | ✅ ↑↓ | ✅ | ✅ (picker + gallery) | ✅ |
| **Before & After** | ✅ | ✅ | ✅ ↑↓ | — | ✅ (picker) | ✅ |
| **Testimonials** | ✅ | ✅ | ✅ ↑↓ | — | ✅ (avatar + multi-photos) | ✅ |
| **FAQ** | ✅ | ✅ | ✅ ↑↓ | ✅ | — | ✅ |
| **Articles** | ✅ | ✅ | ✅ ↑↓ | ✅ | ✅ (cover + OG image) | ✅ Published |
| **SEO** | — | ✅ | — | — | — | — |
| **Settings** | — | ✅ | — | — | ✅ (navbar photo) | — |
| **Media** | — | — | — | — | ✅ Upload (multi, drag & drop) | — |

### Procedures Tab — Admin Actions

- **Normalize Icons** — writes the canonical semantic icon key for every procedure
  (runs `migration.migrateProcedureIcons`, admin-protected).
- **Fill SEO (AR/EN)** — fills the SEO title + description (AR & EN) of every
  procedure from the geo-targeted canonical defaults (runs
  `migration.migrateProcedureSeo`; respects manual edits).

### Homepage CMS (Editable from Admin)

Every homepage section header and content is CMS-managed:

| Section | Admin-Editable Fields |
|---------|----------------------|
| **Hero** | Badge, title, subtitle, description, primary/secondary CTA text, trust badges, hero image |
| **About** | Badge, title, highlight, description, doctor image, statistics (value, icon, label, order) |
| **Procedures Header** | Badge, title, title highlight, subtitle |
| **Before & After Header** | Badge, title, title highlight, subtitle |
| **Testimonials Header** | Badge, title, title highlight, subtitle |
| **FAQ Header** | Badge, title, title highlight, subtitle |
| **CTA** | Badge, title, description, button text, destination, enable/disable |
| **Footer** | Description (AR/EN) |
| **Videos (Reels)** | Badge, title, highlight, subtitle + full video list management (see below) |
| **Visibility** | Show/hide each homepage section |

### Homepage Videos (Reels)

Vertical 9:16 clips shown between «معلومات مهمة» (InformationCard) and «إجراءاتنا» (Procedures), fully managed from Dashboard → **Homepage content**:

- **Add / Edit** — AR/EN titles + descriptions, video file (MP4/WebM/MOV, ≤ 50MB, direct Convex storage upload), optional poster (from the media library) with a **"generate poster from video"** one-click capture, active / show-on-homepage toggles, replace-file (old storage object auto-deleted), and an unsaved-file preview.
- **List actions** — statistics bar (total / active / shown on homepage), pagination (20/page), **move up/down reordering**, row checkboxes with a **bulk toolbar** (select all, `N/total` counter, grouped delete with its own confirm dialog), active & show-on-homepage quick toggles, inline preview, edit, delete.
- **Public behavior** — cards render poster-first; once ≥50% of a card enters the viewport it **autoplay with sound** (muted fallback only if the browser blocks unmuted autoplay) and pauses when scrolled away; an expand button opens a full-screen viewer with native controls.

### Blog (Articles)

The bilingual patient-education blog lives at `/blog` (listing) and `/blog/:slug`
(article). All content is CMS-driven from Dashboard → **Articles**:

- Full CRUD with AR/EN titles, excerpts, bodies, categories, SEO titles +
  descriptions, cover + Open Graph images, reading minutes, featured flag, and a
  related-procedure dropdown.
- **Body formatting conventions:** separate paragraphs with a blank line; start a
  line with `## ` for a section heading; prefix `- ` for bullet lists; wrap
  emphasized words in `**bold**`.
- **Published** toggle controls visibility; unpublished articles are `noindex`
  and excluded from the sitemap.
- **Public SEO:** dynamic `<title>`/meta description/OG/Twitter tags plus
  `<script type="application/ld+json">` Article schema (author Dr. Al Hasan Al
  Saiem, dates, in-language).
- **Sitemap:** published articles are emitted in `/sitemap.xml` (priority 0.6).
- **SEO defaults:** each article carries its own AR/EN SEO title + description;
  matching procedures can be cross-linked via *Related procedure*.
- **Starter content:** `seed.seedArticles` (idempotent) creates 2 sample bilingual
  articles — facelift longevity and rhinoplasty recovery.

#### Social share previews (branded OG cards)

Sharing an article on WhatsApp/Twitter/Facebook/LinkedIn shows a **branded
1200×630 preview card** generated on-demand:

- **`/og-image?slug=…`** (`GET`) — renders the card server-side
  (`src/convex/og_image.tsx`, a Convex `"use node"` action): Satori lays out the
  Arabic/English title beside a rounded framed panel carrying the article's
  cover image, over the branded gold-on-dark glass background, then
  `@resvg/resvg-wasm` rasterizes the SVG to a PNG. No client-side canvas or
  HTML → zero layout shift, works for any crawler. Results are cached
  server-side by slug+lang for a day
  (`Cache-Control: public, max-age=86400, stale-while-revalidate=43200`).
- **`/og-meta`** (`GET`, served by `middleware.ts` on Vercel edge to crawler UAs)
  — returns an HTML shell whose `meta[property=og:image]` points at
  `/og-image?slug=<article>&lang=<…>` **on the same production origin**, with the
  right `og:image`/`og:image:width`/`og:image:height`, so scrapers like
  Twitterbot/WhatsApp fetch the PNG directly. The Vercel edge also proxies
  `/og-image` itself (it is not a Vercel route) and forwards the crawler's
  `Accept-Language`, so Arabic devices get Arabic previews.
- **Fallbacks:** if an article has no cover image a branded graphic-only
  fallback is rendered; if rendering still fails the route falls back to a
  static OG-ready asset.

#### Share buttons

Articles and blog-list cards include a **share button** (`CardShareButton` /
article share): uses the native Web Share API on mobile, clipboard copy of the
public article URL as fallback, and fires a `share` analytics event through the
same `/trackVisit` endpoint.

### Settings CMS Fields

- Doctor name (AR/EN)
- Phone, WhatsApp, Email
- Address (AR/EN)
- Biography (AR/EN)
- Specializations (AR/EN)
- Education (AR/EN)
- Hero title/highlight (AR/EN)
- Working hours (weekdays, Friday, Saturday)
- Social media: Instagram, Facebook, Twitter, Snapchat, TikTok
- Navbar photo

### Admin Security

All CMS mutations are protected server-side via `requireAdmin()`. Authorization is verified at the Convex function level — public users cannot modify any content, and admin-gated migrations can only be triggered from an authenticated admin browser (not via CLI).

## Visit & Conversion Analytics (Dashboard → Analytics)

A self-contained analytics feature — no third-party script (no GA4/Vercel Analytics) and no personal data stored.

- **Collection:** `AnalyticsTracker` calls `POST /trackVisit` on every route change (excluding `/dashboard` and `/auth`), sending only the path, locale, and a per-session `sessionId` stored in `sessionStorage`.
- **Conversion events:** WhatsApp and CTA clicks are tracked through the same endpoint via `trackEvent(type, label)` (`src/lib/track.ts`) — wired to the hero CTA, CTA section, floating WhatsApp button, consultation submit, and the contact forms.
- **Country resolution:** the visitor IP (from `true-client-ip` / `cf-connecting-ip` / `x-forwarded-for`) is geolocated server-side via `ipwho.is` (fallback `ip-api.com`). The IP is **hashed and immediately discarded** — only the country code is stored.
- **Caching:** country lookups are cached per IP hash for 24h (`ipCountryCache`), keeping external calls minimal.
- **Aggregates (`analytics.getStats`, 30-day window):** total visits, today, last 7 days, unique sessions, top pages, country breakdown, a 14-day daily series, plus conversion totals (WhatsApp clicks, CTA clicks) and the top tracked actions.
- **Dashboard widget:** four visit stat cards, conversion cards, a 14-day bar chart, countries list (flags + bars), top pages, and top actions.
- **Maintenance:** `analytics.purgePath` (internal mutation) removes recorded visits and events for a given path (e.g. smoke-test data).

| HTTP endpoint | Method | Purpose |
|---------------|--------|---------|
| `/trackVisit` | `POST` | Record a page visit **or** a conversion event (CORS-enabled, served on `*.convex.site`) |
| `/trackVisit` | `OPTIONS` | CORS preflight |
| `/sitemap.xml` | `GET` | Dynamic sitemap from live CMS data |
| `/og-meta` | `GET` | HTML shell for crawlers with `og:image` set to the branded card (served by Vercel edge middleware to bot user agents) |
| `/og-image?slug=…&lang=…` | `GET` | Renders the branded 1200×630 PNG share card for an article (crawlers + public) |

## Consultation Flow (WhatsApp — No Data Stored)

1. Visitor selects procedures from CMS-driven list + "Other Procedure"
2. Fills patient info (name, age, gender, nationality, residence)
3. Reviews summary
4. Clicks **"Send via WhatsApp"** → generates professional AR/EN message
5. Opens `wa.me` with pre-filled text
6. **No patient data is stored in the database**

## Public Website — CMS-Driven

Every homepage section pulls data from Convex with translation fallbacks:

| Section | CMS Source | Fallback |
|---------|-----------|----------|
| **Hero** | siteSettings.hero, hero image | translations |
| **About** | siteSettings.about, doctor image | translations |
| **Procedures** | procedures.listActive + section header CMS | translations |
| **Before & After** | beforeAfter.listActive + section header CMS | placeholder |
| **Testimonials** | testimonials.listActive (photos + lightbox) + section header CMS | placeholder |
| **FAQ** | faq.listActive + section header CMS | translations |
| **Videos** | videos.getVideos (active + showOnHome) + section header CMS | translations (empty state) |
| **Contact** | siteSettings.doctor (phone, email, address) | — |
| **CTA** | siteSettings.cta | translations |
| **Footer** | siteSettings.footer + doctor settings + procedures | translations |

## Bilingual Support

- Arabic (RTL) as primary language
- English (LTR) as secondary
- All CMS content has AR/EN fields
- Language toggle in navbar and footer
- WhatsApp messages generated in the correct language
- Full i18n coverage: all UI strings, form labels, errors, and placeholders

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Auth users with role (admin/user/member) |
| `procedures` | CMS-managed procedures (CRUD, icon, SEO title/description AR+EN, OG image, parent/superseded relations) |
| `beforeAfter` | Before & After cases (CRUD) |
| `testimonials` | Patient testimonials (CRUD, `images[]` photo gallery + avatar) |
| `faq` | FAQ entries (CRUD) |
| `media` | Media library records (storageId, url, name, type, size, alt) |
| `siteSettings` | Key/value settings store (doctor, hero, about, CTA, footer, visibility, SEO, section headers, videoSection, **videos**) |
| `pageVisits` | Analytics page views (path, locale, country, sessionId, ts) — no raw IP |
| `ipCountryCache` | 24h IP-hash → country cache for analytics geolocation |
| `analyticsEvents` | Conversion events (type, label, path, locale, country, sessionId, ts) |

## Image Management

- **Media Library Selector** (`MediaLibraryModal`) re-used by every CMS image field: single-select (MediaSelector) or multi-select (ImageGalleryInput)
- Upload via Media tab (multi-file, drag & drop); uploads auto-append to the library
- Images are persisted to Convex storage with a library record; safe deletion checks all CMS references before allowing delete
- Upload date tracking per image
- Supported: JPEG, PNG, WebP, GIF (max 5MB)
- **Static brand assets are shipped as optimized WebP** (`assets/*.webp`, generated with `sharp`)
  rendered through `BrandMark` (`<picture>` with JPG/PNG fallbacks) in the navbar, footer,
  timeline logo, and About; the about image uses `srcSet`/`sizes` for art direction

## Responsive Design & UI Polish

- Mobile-first with responsive breakpoints; **two cards per row on all screen sizes** for procedures, before/after, and testimonials
- Glassmorphism design system with RTL/LTR support
- Floating action stack (WhatsApp, socials, back-to-top) on public pages
- Mobile hamburger menu with slide-in animation
- Interactive before/after slider on the gallery page; **homepage before/after cards are drag-to-compare sliders** (mouse + touch, keyboard accessible) with an animated center handle
- Testimonial photo thumbnails + full-screen lightbox
- Champagne scroll-progress bar, card hover glow, button sheen, section title underline, image shimmer placeholders, subtle film-grain overlay, and a centered animated scroll hint
- Custom `::selection` and scrollbar theming; reduced-motion CSS support

## SEO & Structured Data

- Global SEO (title, description, OG image) via admin
- Per-procedure SEO fillable from Dashboard → **Fill SEO (AR/EN)**: canonical geo-targeted titles/descriptions (AR + EN) covering all practice locations — Syria (Damascus, Latakia, Tartus), Dubai (UAE), Beirut (Lebanon), and Iraq — via `procedureSeoDefaults.ts`
- Dynamic meta tags per route; per-procedure title/description injected in `ProcedureDetail`
- Physician JSON-LD structured data with `location` array for all six clinics and the 16 active procedures as `availableService` (no fabricated aggregate rating)
- FAQPage, Person/Physician, BreadcrumbList JSON-LD structured data
- Blog articles emit `Article` JSON-LD and can additionally emit `NewsArticle`
  schema; the organization logo URL is fixed to the production domain
  (`/assets/3.jpg`) so rich results pass Google's logo requirements
- **Branded OG share cards** — every public article advertises a 1200×630
  `og:image` PNG (see *Social share previews* above) generated on `/og-image`
  at request time
- Twitter/X card meta tags
- Skip navigation link for accessibility
- aria-labels on all interactive elements

## Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing (homepage) | Public |
| `/ar` | Landing (Arabic) | Public |
| `/en` | Landing (English) | Public |
| `/procedures` | All procedures listing | Public |
| `/procedure/:slug` | Procedure detail | Public |
| `/blog` | Blog listing (featured + grid) | Public |
| `/blog/:slug` | Blog article with SEO + JSON-LD + share | Public |
| `/before-after` | Before & After gallery | Public |
| `/consultation` | WhatsApp consultation form | Public |
| `/contact` | Contact page | Public |
| `/auth` | Admin sign in / sign up (email + password) | Public |
| `/dashboard` | Admin CMS dashboard | Admin only |

## Development

```bash
# Install dependencies
npm install
# NOTE: postinstall runs `patch-package` to apply patches/harfbuzzjs+0.10.0.patch

# Run dev server
npm run dev

# Type check + production build
npm run build

# Lint (0 errors, 0 warnings)
npm run lint

# Convex dev (with codegen)
npx convex dev --once

# Production convex deployment
CONVEX_DEPLOYMENT=kindly-anaconda-422 npx convex deploy --typecheck enable
```

## Environment Variables

- `VITE_CONVEX_URL` — Convex deployment URL (managed at build/platform level)
- `VITE_CONVEX_SITE_URL` — Convex HTTP-actions site URL (optional; derived from `VITE_CONVEX_URL` by swapping `.convex.cloud` → `.convex.site` when unset)
- `CONVEX_DEPLOYMENT` — Deployment slug for CLI commands (e.g. `kindly-anaconda-422`)
- `JWT_PRIVATE_KEY` / `JWKS` (auth) — server-side secrets, never committed

## Deployment

### Production Setup

1. **Convex production:** `CONVEX_DEPLOYMENT=kindly-anaconda-422 npx convex deploy --typecheck enable` (this also registers the `/og-image` HTTP action — do this **before** pushing frontend changes so `/og-meta` never advertises a 404 image)
2. **Hosting:** Deploy to Vercel with:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_CONVEX_URL` (your Convex production URL)
   - Connected to the `main` branch → **auto-deploys** on every `git push`; the `middleware.ts` edge route serves `/og-meta` to crawler user agents
3. **Admin accounts:** Visit `/auth` → sign up (first two users become admins; further sign-ups rejected)
4. **Seed data (fresh installs only):** Go to Dashboard → Overview → click "Seed Data" (once). **Do not seed an existing production database** — it overwrites content and does not restore real images; production data is already complete.
5. **WhatsApp:** Configure real WhatsApp number in Dashboard → Settings
6. **Content:** Upload doctor image, hero image, procedure images via Media Library; run **Normalize Icons** and **Fill SEO (AR/EN)** in the Procedures tab
7. **Analytics:** page views begin recording automatically — view them in Dashboard → Analytics
8. **Domain:** Production domain is **`dralhasanalsaiem.com`** (custom domain, connected in Vercel). All canonical/OG/JSON-LD/sitemap URLs use this domain — verified serving `/blog` and article URLs. Do **not** use the placeholder `dr-alhasan.com` (it is not registered in DNS).
9. **Verify share previews:** `curl -A "Twitterbot" https://dralhasanalsaiem.com/blog/<slug>` should show `og:image` = the `/og-image?…` URL; that URL must return a 1200×630 PNG.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL (set in hosting platform) |
| `VITE_CONVEX_SITE_URL` | No | Convex `.convex.site` URL for HTTP actions (auto-derived if omitted) |

All secrets are managed through the hosting platform's environment variables UI.
Never commit secrets to source code.
