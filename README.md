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
│   ├── siteSettings.ts # Key/value settings store (protected)
│   ├── media.ts        # File upload to Convex storage (protected)
│   ├── users.ts        # User queries + becomeAdmin
│   ├── seed.ts         # Initial data seeding
│   └── auth/           # Auth providers (Email OTP)
├── pages/
│   ├── Landing.tsx         # Homepage (all sections CMS-driven)
│   ├── Dashboard.tsx       # Full Admin CMS dashboard
│   ├── ProcedureDetail.tsx # Individual procedure page (CMS-driven)
│   ├── BeforeAfterPage.tsx # Before & After gallery with interactive slider
│   ├── ConsultationPage.tsx # WhatsApp consultation form (3-step, no data stored)
│   ├── Auth.tsx            # Login/signup page (Email OTP)
│   └── NotFound.tsx        # 404 page
├── hooks/              # Custom hooks (auth, upload, mobile)
├── i18n/               # Internationalization system
├── locales/            # ar.json, en.json translations (full i18n coverage)
└── index.css           # Glassmorphism theme + Tailwind
```

## Admin CMS

Access via `/auth` → sign in → `/dashboard` → click "Become Admin" (first user only).

### CMS Tabs

| Tab | CRUD | Edit | Reorder | Search | Image Upload | Toggle Active |
|-----|------|------|---------|--------|--------------|---------------|
| **Procedures** | ✅ | ✅ | ✅ ↑↓ | ✅ | ✅ | ✅ |
| **Before & After** | ✅ | ✅ | ✅ ↑↓ | — | Via Media tab | ✅ |
| **Testimonials** | ✅ | ✅ | ✅ ↑↓ | — | — | ✅ |
| **FAQ** | ✅ | ✅ | ✅ ↑↓ | ✅ | — | ✅ |
| **Settings** | — | ✅ | — | — | — | — |
| **Media** | — | — | — | — | ✅ Upload | — |

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

All CMS mutations are protected server-side via `requireAdmin()`. Public users cannot modify content. Authorization verified at the Convex function level.

## Consultation Flow (WhatsApp — No Data Stored)

1. Visitor selects procedures from CMS-driven list + "Other Procedure"
2. Fills patient info (name, age, gender, nationality, residence)
3. Reviews summary
4. Clicks "Send via WhatsApp" → generates professional AR/EN message
5. Opens `wa.me` with pre-filled text
6. **No patient data is stored in the database**

The consultation form uses translation keys for all labels, errors, and placeholders (full i18n coverage in `src/locales/ar.json` and `src/locales/en.json`).

## Public Website — CMS-Driven

Every homepage section pulls data from Convex CMS:

| Section | CMS Source | Fallback |
|---------|-----------|----------|
| **Hero** | siteSettings (heroTitle, heroSubtitle) | translations |
| **About** | siteSettings (biography) | translations |
| **Procedures** | procedures (listActive) | — |
| **Before & After** | beforeAfter (listActive) | placeholder |
| **Testimonials** | testimonials (listActive) | placeholder |
| **FAQ** | faq (listActive) | translations |
| **Contact** | siteSettings (phone, email, address) | — |
| **Footer** | siteSettings (phone, email, address, hours) + procedures (listActive) | translations |

## Bilingual Support

- Arabic (RTL) as primary language
- English (LTR) as secondary
- All CMS content has AR/EN fields
- Language toggle in navbar and footer
- WhatsApp messages generated in the correct language
- Full i18n coverage: all UI strings, form labels, errors, and placeholders use translation keys

## Database Schema

| Table | Purpose |
|-------|---------|
| `users` | Auth users with role (admin/user) |
| `procedures` | CMS-managed procedures (CRUD) |
| `beforeAfter` | Before & After cases (CRUD) |
| `testimonials` | Patient testimonials (CRUD) |
| `faq` | FAQ entries (CRUD) |
| `siteSettings` | Key/value settings store |

### Removed (Legacy Cleanup)

- `consultations` table — removed, replaced by WhatsApp flow
- `bookings` table — removed (deprecated stub)
- `notifications` table — removed (deprecated stub)

## Image Management

- Upload via Media tab in Dashboard
- Images stored in Convex storage
- Copy URL and paste into procedure/BA/testimonial forms
- Supported: JPEG, PNG, WebP, GIF (max 5MB)
- File validation: type + size checked client-side

## SEO

- Meta tags (title, description, keywords, robots)
- Open Graph + Twitter Card
- JSON-LD structured data (Physician schema)
- robots.txt + sitemap.xml
- Semantic HTML
- Favicon + web app manifest

## Responsive Design

- Mobile-first with responsive breakpoints
- Glassmorphism design system
- RTL/LTR support
- Mobile hamburger menu with slide-in animation
- Optimized for 320px+ screens
- Interactive before/after slider on gallery page

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
5. Seed data: call `seed:seedAll` from Convex dashboard (once)
