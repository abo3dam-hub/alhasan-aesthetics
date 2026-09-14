# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

Premium bilingual (Arabic/English) aesthetic surgery website with structured Admin CMS, WhatsApp consultation flow, semantic procedure icons, geo-targeted SEO, patient-review photo galleries, and a media library.

Production Convex deployment: `kindly-anaconda-422` (hosted site: `dralhasan-three.vercel.app`).

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Glassmorphism theme
- **Backend:** Convex (database, auth, storage)
- **Auth:** @convex-dev/auth (Email OTP + Anonymous, with `becomeAdmin`)
- **Routing:** React Router v7
- **i18n:** Custom bilingual system (Arabic RTL primary / English LTR secondary)
- **Icons:** Custom semantic procedure icon registry (hand-drawn SVGs + Lucide) in `src/lib/procedureIcons.tsx`
- **UI:** shadcn/ui components + Lucide icons + Framer Motion

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
│   ├── MediaSelector.tsx / MediaLibraryModal.tsx
│   │                   # Media library picker used by every image field
│   ├── ImageGalleryInput.tsx # Multi-image upload + library picker (testimonials)
│   ├── Lightbox.tsx    # Shared photo lightbox (testimonial galleries)
│   ├── ResolvedImage.tsx / MediaDiagnostics.tsx
│   ├── ImageUpload.tsx # Convex storage upload component
│   └── RequireAuth.tsx # Auth guard
├── lib/
│   ├── procedureIcons.tsx    # SVG + Lucide icon registry keyed by icon slug
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
│   ├── users.ts              # User queries + becomeAdmin
│   ├── notifications.ts      # Notifications (unread counts)
│   ├── http.ts               # HTTP actions
│   ├── migration.ts          # Admin-only data migrations
│   │                         #   (normalize icons, fill geo-targeted SEO)
│   ├── procedureIconDefaults.ts  # Canonical icon key per procedure slug
│   ├── procedureSeoDefaults.ts   # Canonical AR/EN SEO per procedure slug
│   ├── seed.ts               # Initial data seeding
│   └── auth/                 # Auth providers (Email OTP, Anonymous)
├── pages/
│   ├── Landing.tsx            # Homepage (all sections CMS-driven with toggle)
│   ├── Dashboard.tsx          # Full Admin CMS dashboard (9 tabs)
│   ├── ProcedureDetail.tsx    # Individual procedure page (CMS-driven + SEO)
│   ├── ProceduresPage.tsx     # All-procedures listing page
│   ├── BeforeAfterPage.tsx    # Before & After gallery with interactive slider
│   ├── ConsultationPage.tsx   # WhatsApp consultation form (2-step, no data stored)
│   ├── ContactPage.tsx        # Static contact page
│   ├── Auth.tsx               # Login/signup page (Email OTP)
│   └── NotFound.tsx           # 404 page
├── hooks/               # Custom hooks (auth, upload, mobile, media resolution)
├── i18n/                # Internationalization system
├── locales/             # ar.json, en.json translations (full i18n coverage)
└── index.css            # Glassmorphism theme + Tailwind
```

## Admin CMS

Access: Visit `/auth` → sign in → go to `/dashboard` → click **"Become Admin"** (first user only).

### Dashboard Tabs

| Tab | CRUD | Edit | Reorder | Search | Image Upload | Toggle Active |
|-----|------|------|---------|--------|--------------|---------------|
| **Overview** | — | — | — | — | — | — |
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

## Image Management

- **Media Library Selector** (`MediaLibraryModal`) re-used by every CMS image field: single-select (MediaSelector) or multi-select (ImageGalleryInput)
- Upload via Media tab (multi-file, drag & drop); uploads auto-append to the library
- Images are persisted to Convex storage with a library record; safe deletion checks all CMS references before allowing delete
- Upload date tracking per image
- Supported: JPEG, PNG, WebP, GIF (max 5MB)

## Responsive Design

- Mobile-first with responsive breakpoints
- Glassmorphism design system
- RTL/LTR support
- Mobile hamburger menu with slide-in animation
- Interactive before/after slider on gallery page
- Testimonial photo thumbnails + full-screen lightbox

## SEO & Structured Data

- Global SEO (title, description, OG image) via admin
- Per-procedure SEO fillable from Dashboard → **Fill SEO (AR/EN)**: canonical geo-targeted titles/descriptions (AR + EN) covering all practice locations — Syria (Damascus, Latakia, Tartus), Dubai (UAE), Beirut (Lebanon), and Iraq — via `procedureSeoDefaults.ts`
- Dynamic meta tags per route; per-procedure title/description injected in `ProcedureDetail`
- Physician JSON-LD structured data with `location` array for all six clinics and the 16 active procedures as `availableService`
- FAQPage, Person/Physician, BreadcrumbList JSON-LD structured data
- Twitter/X card meta tags
- Skip navigation link for accessibility
- Reduced motion CSS support
- aria-labels on all interactive elements

## Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing (homepage) | Public |
| `/procedures` | All procedures listing | Public |
| `/procedure/:slug` | Procedure detail | Public |
| `/before-after` | Before & After gallery | Public |
| `/consultation` | WhatsApp consultation form | Public |
| `/contact` | Contact page | Public |
| `/auth` | Login / signup (Email OTP) | Public |
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
- `CONVEX_DEPLOYMENT` — Deployment slug for CLI commands (e.g. `kindly-anaconda-422`)
- `JWT_PRIVATE_KEY` / `JWKS` (auth) — server-side secrets, never committed

## Deployment

### Production Setup

1. **Convex production:** `CONVEX_DEPLOYMENT=kindly-anaconda-422 npx convex deploy --typecheck enable`
2. **Hosting:** Deploy to Vercel with:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment variable: `VITE_CONVEX_URL` (your Convex production URL)
3. **Admin account:** Visit `/auth` → sign up → click "Become Admin" (first user only)
4. **Seed data:** Go to Dashboard → Overview → click "Seed Data" (once)
5. **WhatsApp:** Configure real WhatsApp number in Dashboard → Settings
6. **Content:** Upload doctor image, hero image, procedure images via Media Library; run **Normalize Icons** and **Fill SEO (AR/EN)** in the Procedures tab
7. **Domain:** Connect custom domain + configure DNS + verify HTTPS (point canonical away from the placeholder `dr-alhasan.com`)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL (set in hosting platform) |

All secrets are managed through the hosting platform's environment variables UI.
Never commit secrets to source code.