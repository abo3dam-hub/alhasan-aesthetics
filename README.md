# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

Premium bilingual (Arabic/English) aesthetic surgery website with a structured Admin CMS, WhatsApp consultation flow, built-in visit + conversion analytics (page views, visitor countries, WhatsApp/CTA clicks), semantic procedure icons, geo-targeted SEO, patient-review photo galleries, and a media library.

Production Convex deployment: `kindly-anaconda-422` (hosted site: `dralhasan-three.vercel.app`).

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Glassmorphism theme
- **Backend:** Convex (database, auth, storage, HTTP actions)
- **Auth:** @convex-dev/auth — **Password** provider (scrypt-hashed), max 2 admin accounts
- **Routing:** React Router v7
- **i18n:** Custom bilingual system (Arabic RTL primary / English LTR secondary)
- **Icons:** Custom semantic procedure icon registry (hand-drawn SVGs + Lucide) in `src/lib/procedureIcons.tsx`
- **UI:** shadcn/ui components + Lucide icons + Framer Motion (lazy-loaded, kept out of the entry chunk)

## Architecture

```
src/
├── components/
│   ├── sections/       # Homepage sections (Hero, About, Procedures, BeforeAfter,
│   │                   #   Testimonials, FAQ, CTA, Contact, InformationCard)
│   ├── dashboard/      # Admin CMS tab components (HomepageCMSTab, SEOTab)
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
│   └── RequireAuth.tsx # Auth guard
├── lib/
│   ├── procedureIcons.tsx    # SVG + Lucide icon registry keyed by icon slug
│   ├── track.ts              # Frontend analytics client (page views + events)
│   └── utils.ts
├── convex/
│   ├── schema.ts             # Database schema
│   ├── admin.ts              # Server-side admin authorization (requireAdmin)
│   ├── procedures.ts         # Procedures CRUD (protected)
│   ├── beforeAfter.ts        # Before & After CRUD (protected)
│   ├── testimonials.ts       # Testimonials CRUD (protected, with photos)
│   ├── faq.ts                # FAQ CRUD (protected)
│   ├── homepageSettings.ts   # Homepage CMS settings (hero, about, CTA, footer, sections)
│   ├── siteSettings.ts       # Key/value settings store (doctor, SEO)
│   ├── media.ts              # Media library (Convex storage upload, protected)
│   ├── analytics.ts          # Visit analytics (record, geocode cache, aggregates)
│   ├── users.ts              # User queries + becomeAdmin
│   ├── notifications.ts      # Notifications (unread counts)
│   ├── http.ts               # HTTP actions: /sitemap.xml + /trackVisit
│   ├── migration.ts          # Admin-only data migrations
│   │                         #   (normalize icons, fill geo-targeted SEO)
│   ├── procedureIconDefaults.ts  # Canonical icon key per procedure slug
│   ├── procedureSeoDefaults.ts   # Canonical AR/EN SEO per procedure slug
│   ├── seed.ts               # Initial data seeding
│   └── auth/                 # Auth providers (Password)
├── pages/
│   ├── Landing.tsx            # Homepage (all sections CMS-driven with toggle)
│   ├── Dashboard.tsx          # Full Admin CMS dashboard (10 tabs)
│   ├── ProcedureDetail.tsx    # Individual procedure page (CMS-driven + SEO)
│   ├── ProceduresPage.tsx     # All-procedures listing page
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

### Dashboard Tabs (10)

| Tab | CRUD | Edit | Reorder | Search | Image Upload | Toggle Active |
|-----|------|------|---------|--------|--------------|---------------|
| **Overview** | — | — | — | — | — | — |
| **Analytics** | — | — | — | — | — | — |
| **Homepage CMS** | — | ✅ | — | — | ✅ | ✅ Toggle |
| **Procedures** | ✅ | ✅ | ✅ ↑↓ | ✅ | ✅ (picker + gallery) | ✅ |
| **Before & After** | ✅ | ✅ | ✅ ↑↓ | — | ✅ (picker) | ✅ |
| **Testimonials** | ✅ | ✅ | ✅ ↑↓ | — | ✅ (avatar + multi-photos) | ✅ |
| **FAQ** | ✅ | ✅ | ✅ ↑↓ | ✅ | — | ✅ |
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
| **Visibility** | Show/hide each homepage section |

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
| `siteSettings` | Key/value settings store (doctor, hero, about, CTA, footer, visibility, SEO, section headers) |
| `pageVisits` | Analytics page views (path, locale, country, sessionId, ts) — no raw IP |
| `ipCountryCache` | 24h IP-hash → country cache for analytics geolocation |
| `analyticsEvents` | Conversion events (type, label, path, locale, country, sessionId, ts) |

## Image Management

- **Media Library Selector** (`MediaLibraryModal`) re-used by every CMS image field: single-select (MediaSelector) or multi-select (ImageGalleryInput)
- Upload via Media tab (multi-file, drag & drop); uploads auto-append to the library
- Images are persisted to Convex storage with a library record; safe deletion checks all CMS references before allowing delete
- Upload date tracking per image
- Supported: JPEG, PNG, WebP, GIF (max 5MB)

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
| `/before-after` | Before & After gallery | Public |
| `/consultation` | WhatsApp consultation form | Public |
| `/contact` | Contact page | Public |
| `/auth` | Admin sign in / sign up (email + password) | Public |
| `/dashboard` | Admin CMS dashboard | Admin only |

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Type check + production build
npm run build

# Lint (0 errors baseline; 26 benign warnings)
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

1. **Convex production:** `CONVEX_DEPLOYMENT=kindly-anaconda-422 npx convex deploy --typecheck enable`
2. **Hosting:** Deploy to Vercel with:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_CONVEX_URL` (your Convex production URL)
3. **Admin accounts:** Visit `/auth` → sign up (first two users become admins; further sign-ups rejected)
4. **Seed data (fresh installs only):** Go to Dashboard → Overview → click "Seed Data" (once). **Do not seed an existing production database** — it overwrites content and does not restore real images; production data is already complete.
5. **WhatsApp:** Configure real WhatsApp number in Dashboard → Settings
6. **Content:** Upload doctor image, hero image, procedure images via Media Library; run **Normalize Icons** and **Fill SEO (AR/EN)** in the Procedures tab
7. **Analytics:** page views begin recording automatically — view them in Dashboard → Analytics
8. **Domain:** Connect custom domain + configure DNS + verify HTTPS (point canonical away from the placeholder `dr-alhasan.com`)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL (set in hosting platform) |
| `VITE_CONVEX_SITE_URL` | No | Convex `.convex.site` URL for HTTP actions (auto-derived if omitted) |

All secrets are managed through the hosting platform's environment variables UI.
Never commit secrets to source code.
