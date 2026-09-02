# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

Premium bilingual (Arabic/English) aesthetic surgery website with structured Admin CMS and WhatsApp consultation flow.

## Stack

- **Frontend:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS v4 + Glassmorphism theme
- **Backend:** Convex (database, auth, storage)
- **Auth:** @convex-dev/auth (Email OTP + Anonymous)
- **Routing:** React Router v7
- **i18n:** Custom bilingual system (Arabic RTL / English LTR)
- **UI:** shadcn/ui components + Lucide icons + Framer Motion

## Architecture

```
src/
├── components/
│   ├── sections/       # Homepage sections (Hero, About, Procedures, etc.)
│   ├── dashboard/      # Admin CMS tab components (HomepageCMSTab, SEOTab)
│   ├── ui/             # shadcn/ui components
│   ├── Footer.tsx      # Dynamic footer (CMS-driven procedures + settings)
│   ├── GlassNavbar.tsx # Navigation with mobile menu
│   ├── ImageUpload.tsx # Convex storage upload component
│   └── RequireAuth.tsx # Auth guard
├── convex/
│   ├── schema.ts       # Database schema (no consultations table)
│   ├── admin.ts        # Server-side admin authorization (requireAdmin)
│   ├── procedures.ts   # Procedures CRUD (protected)
│   ├── beforeAfter.ts  # Before & After CRUD (protected)
│   ├── testimonials.ts # Testimonials CRUD (protected)
│   ├── faq.ts          # FAQ CRUD (protected)
│   ├── homepageSettings.ts # Homepage CMS settings (hero, about, CTA, footer, sections)
│   ├── siteSettings.ts # Key/value settings store (doctor, SEO)
│   ├── media.ts        # File upload to Convex storage (protected)
│   ├── users.ts        # User queries + becomeAdmin
│   ├── seed.ts         # Initial data seeding (10 procedures, 3 testimonials, 6 FAQ)
│   └── auth/           # Auth providers (Email OTP)
├── pages/
│   ├── Landing.tsx         # Homepage (all sections CMS-driven with visibility toggle)
│   ├── Dashboard.tsx       # Full Admin CMS dashboard (9 tabs)
│   ├── ProcedureDetail.tsx # Individual procedure page (CMS-driven)
│   ├── BeforeAfterPage.tsx # Before & After gallery with interactive slider
│   ├── ConsultationPage.tsx # WhatsApp consultation form (2-step, no data stored)
│   ├── Auth.tsx            # Login/signup page (Email OTP)
│   └── NotFound.tsx        # 404 page
├── hooks/              # Custom hooks (auth, upload, mobile)
├── i18n/               # Internationalization system
├── locales/            # ar.json, en.json translations (full i18n coverage)
└── index.css           # Glassmorphism theme + Tailwind
```

## Admin CMS

Access: Visit `/auth` → sign in → go to `/dashboard` → click **"Become Admin"** (first user only).

### Dashboard Tabs

| Tab | CRUD | Edit | Reorder | Search | Image Upload | Toggle Active |
|-----|------|------|---------|--------|--------------|---------------|
| **Overview** | — | — | — | — | — | — |
| **Homepage CMS** | — | ✅ | — | — | ✅ | ✅ Toggle |
| **Procedures** | ✅ | ✅ | ✅ ↑↓ | ✅ | ✅ | ✅ |
| **Before & After** | ✅ | ✅ | ✅ ↑↓ | — | Via Media tab | ✅ |
| **Testimonials** | ✅ | ✅ | ✅ ↑↓ | — | — | ✅ |
| **FAQ** | ✅ | ✅ | ✅ ↑↓ | ✅ | — | ✅ |
| **SEO** | — | ✅ | — | — | — | — |
| **Settings** | — | ✅ | — | — | — | — |
| **Media** | — | — | — | — | ✅ Upload | — |

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

### Admin Security

All CMS mutations are protected server-side via `requireAdmin()`. Authorization is verified at the Convex function level — public users cannot modify any content.

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
| **Testimonials** | testimonials.listActive + section header CMS | placeholder |
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
| `users` | Auth users with role (admin/user) |
| `procedures` | CMS-managed procedures (CRUD, with SEO fields) |
| `beforeAfter` | Before & After cases (CRUD) |
| `testimonials` | Patient testimonials (CRUD) |
| `faq` | FAQ entries (CRUD) |
| `siteSettings` | Key/value settings store (doctor, hero, about, CTA, footer, visibility, SEO, section headers) |

## Image Management

- Upload via Media tab in Dashboard (multi-file, drag & drop)
- Images stored in Convex storage
- Safe deletion: checks all CMS references before allowing delete
- Upload date tracking per image
- Hero image and doctor image use ImageUpload component
- Supported: JPEG, PNG, WebP, GIF (max 5MB)

## Responsive Design

- Mobile-first with responsive breakpoints
- Glassmorphism design system
- RTL/LTR support
- Mobile hamburger menu with slide-in animation
- Interactive before/after slider on gallery page

## SEO & Structured Data

- Global SEO (title, description, OG image) via admin
- Per-procedure SEO (title, description, OG image)
- Dynamic meta tags per route
- FAQPage JSON-LD structured data
- MedicalBusiness JSON-LD structured data
- Skip navigation link for accessibility

## Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing (homepage) | Public |
| `/procedure/:slug` | Procedure detail | Public |
| `/before-after` | Before & After gallery | Public |
| `/consultation` | WhatsApp consultation form | Public |
| `/auth` | Login / signup (Email OTP) | Public |
| `/dashboard` | Admin CMS dashboard | Admin only |

## Development

```bash
# Install dependencies
bun install

# Run dev server
bun dev

# Type check
bun tsc -b --noEmit

# Convex dev (with codegen)
bunx convex dev --once

# Production build
bun run build
```

## Environment Variables

- `VITE_CONVEX_URL` — Convex deployment URL (managed by Freebuff/Convex)

## Deployment

1. Push to GitHub
2. Connect to Vercel/Freebuff
3. Set `VITE_CONVEX_URL` in environment
4. Run `bunx convex deploy` for production Convex
5. Seed data: click "Seed Data" in the Dashboard Overview tab (once)
