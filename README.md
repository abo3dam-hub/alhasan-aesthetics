# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

> **Last Updated:** August 31, 2026
> **Status:** Public website ✅ | Backend (Convex) ✅ | Admin Dashboard ✅ | Contact Form ✅ | Before/After Page ✅ | Procedure Detail Page ✅

---

## Project Overview

A premium, bilingual (Arabic RTL / English LTR) website for **Dr. Al Hasan Al Saiem** (د. الحسن الصايم), a plastic and aesthetic surgeon based in **Syria (Damascus, Lattakia)** and **United Arab Emirates (Dubai)**.

The design direction is **Luxury Medical / Glassmorphism** — premium, elegant, modern, clean, trustworthy, and sophisticated. Not sterile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Animations | Framer Motion 12 |
| Routing | React Router 7 (client-side SPA) |
| Backend/DB | Convex (schema defined, no custom functions yet) |
| Auth | Convex Auth (`@convex-dev/auth`) with email OTP |
| i18n | Custom I18nProvider (Arabic/English, localStorage persistence) |
| Icons | Lucide React |
| Forms | React Hook Form + Zod validation |
| Package Manager | Bun |

---

## Design System — Light Glassmorphism

### Color Palette

| Token | Value | Usage |
|---|---|---|
| Warm Ivory | `#FDF8F4` | Background |
| Deep Charcoal | `#1E1E1E` | Text |
| Champagne | `#C5A882` | Secondary accent |
| Warm Nude | `#D4C4AD` | Borders, muted elements |
| Warm Brown | `#8B7355` | Primary CTA buttons |

### Glass Utility Classes (defined in `src/index.css`)

| Class | Opacity | Blur | Use Case |
|---|---|---|---|
| `.glass` | 55% white | 20px | General glass panels |
| `.glass-strong` | 70% white | 30px | Navbar, prominent panels |
| `.glass-subtle` | 30% white | 12px | Background accents |
| `.glass-card` | 45% white | 24px | Cards with inner shadow |
| `.glass-elevated` | 65% white | 32px | Navbar, elevated elements |

### Typography

| Font | Usage |
|---|---|
| **Playfair Display** | Serif headings (luxury editorial feel) — `.font-serif-luxury` |
| **Inter** | Body text (Latin) |
| **Noto Kufi Arabic** | Arabic text (auto-applied when `dir="rtl"`) |

---

## Project Structure

```
/
├── index.html                          # Entry HTML (title: Dr. Al Hasan Al Saiem)
├── package.json                        # Dependencies & scripts
├── vite.config.ts                      # Vite config (HMR disabled, path aliases)
├── tsconfig.json / tsconfig.app.json   # TypeScript config
├── tailwind.config.*                   # (Uses Tailwind CSS v4 — config in CSS)
├── components.json                     # shadcn/ui configuration
│
├── public/
│   └── assets/
│       ├── 1.jpg                       # Doctor photo (used in About section)
│       ├── 2.jpg                       # Available asset
│       ├── 3.jpg                       # Doctor photo (used as Navbar icon)
│       └── 4.jpg                       # Business card image (used as Footer logo)
│
├── src/
│   ├── main.tsx                        # App entrypoint — providers, routing, error boundaries
│   ├── index.css                       # Global styles, glass utilities, theme tokens
│   ├── vite-env.d.ts                   # Vite type declarations
│   │
│   ├── i18n/
│   │   ├── index.tsx                   # I18nProvider + useI18n() hook
│   │   └── types.ts                    # Translation type definitions
│   │
│   ├── locales/
│   │   ├── ar.json                     # Arabic translations (primary language)
│   │   └── en.json                     # English translations
│   │
│   ├── pages/
│   │   ├── Landing.tsx                 # Homepage — assembles all sections
│   │   ├── Auth.tsx                    # Authentication page (email + OTP)
│   │   ├── Dashboard.tsx               # Protected dashboard (placeholder)
│   │   └── NotFound.tsx                # 404 page
│   │
│   ├── components/
│   │   ├── GlassNavbar.tsx             # Fixed glassmorphism navbar with mobile menu
│   │   ├── Footer.tsx                  # 4-column footer with contact info
│   │   ├── RequireAuth.tsx             # Auth guard wrapper
│   │   ├── LogoDropdown.tsx            # Logo dropdown component
│   │   │
│   │   ├── sections/                   # Homepage sections
│   │   │   ├── Hero.tsx                # Hero with CTA buttons (scroll to #contact, #procedures)
│   │   │   ├── About.tsx               # Doctor bio, photo (1.jpg), stats
│   │   │   ├── Procedures.tsx          # 10 procedures grid with icons
│   │   │   ├── BeforeAfter.tsx         # Before/After gallery (placeholder images)
│   │   │   ├── Testimonials.tsx        # 3 patient testimonial cards
│   │   │   ├── FAQ.tsx                 # 6 FAQ accordion items
│   │   │   ├── Contact.tsx             # Contact form + info cards
│   │   │   └── CTA.tsx                 # Final call-to-action section
│   │   │
│   │   └── ui/                         # shadcn/ui components (50+ components)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── accordion.tsx
│   │       ├── dialog.tsx
│   │       └── ... (50+ components)
│   │
│   ├── convex/                         # Convex backend
│   │   ├── schema.ts                   # Database schema (users + auth tables)
│   │   ├── auth.config.ts              # Auth configuration
│   │   ├── auth.ts                     # Auth utilities
│   │   ├── http.ts                     # HTTP endpoints
│   │   ├── users.ts                    # User queries/mutations
│   │   ├── auth/
│   │   │   └── emailOtp.ts             # Email OTP auth
│   │   └── _generated/                 # Auto-generated Convex types
│   │
│   ├── hooks/
│   │   ├── use-auth.ts                 # Auth hook
│   │   └── use-mobile.ts              # Mobile detection hook
│   │
│   ├── lib/
│   │   ├── utils.ts                    # Utility functions (cn, etc.)
│   │   └── vly-integrations.ts         # Vly platform integrations
│   │
│   └── types/
│       └── global.d.ts                 # Global type declarations
│
└── convex.json                         # Convex project config
```

---

## Routing

| Path | Component | Auth Required | Description |
|---|---|---|---|
| `/` | `<Landing />` | No | Arabic homepage (default) |
| `/ar` | `<Landing />` | No | Arabic homepage (explicit) |
| `/en` | `<Landing />` | No | English homepage |
| `/procedure/:slug` | `<ProcedureDetail />` | No | Individual procedure page |
| `/before-after` | `<BeforeAfterPage />` | No | Dedicated B&A gallery with filters |
| `/auth` | `<AuthPage />` | No | Login/signup with email OTP |
| `/dashboard` | `<Dashboard />` | **Yes** | Admin dashboard (procedures, testimonials, FAQ, bookings, consultations) |
| `*` | `<NotFound />` | No | 404 page |

**Auth flow:** Unauthenticated users hitting `/dashboard` are redirected to `/auth?returnTo=/dashboard`. After successful auth, they're redirected to `/dashboard`.

---

## Homepage Sections (Single-Page Layout)

All sections are assembled in `src/pages/Landing.tsx` as a single scrollable page with anchor-based navigation.

| Section | ID | Component | Description |
|---|---|---|---|
| Navbar | — | `GlassNavbar.tsx` | Fixed top, glass effect, language toggle, mobile slide-out menu |
| Hero | `#home` | `Hero.tsx` | Full-height hero, gradient text, two CTAs → `#contact` & `#procedures` |
| About | `#about` | `About.tsx` | Doctor photo (1.jpg), bio, 4 stats (15+ years, 5000+ procedures, 99% satisfaction, international certification) |
| Procedures | `#procedures` | `Procedures.tsx` | 10 procedure cards in 3-column grid |
| Before/After | `#before-after` | `BeforeAfter.tsx` | 4-column comparison grid (placeholder images) |
| Testimonials | `#testimonials` | `Testimonials.tsx` | 3 patient review cards with star ratings |
| FAQ | `#faq` | `FAQ.tsx` | 6 accordion Q&A items |
| Contact | `#contact` | `Contact.tsx` | Contact info cards + form (name, email, subject, message) |
| CTA | — | `CTA.tsx` | Final call-to-action → `#contact` |
| Footer | — | `Footer.tsx` | 4-column footer, business card logo (4.jpg), addresses, hours |

---

## Doctor's Procedures (from Business Card)

1. **شد الأجفان العلوية والسفلية** — Upper & Lower Blepharoplasty
2. **شد الوجه والرقبة** — Face & Neck Lift
3. **تجميل الأنف** — Rhinoplasty
4. **شفط الشحم وحقن الشحم** — Liposuction & Fat Transfer
5. **شد البطن** — Tummy Tuck
6. **حقن البوتوكس** — Botox Injections
7. **الفيلر** — Dermal Fillers
8. **شد العضدين والفخذين** — Arm & Thigh Lift
9. **تكبير/تصغير الثدي** — Breast Augmentation/Reduction
10. **إصلاح الندب والتشوهات** — Scar Revision

---

## Doctor's Locations

- **Syria:** Damascus, Lattakia
- **United Arab Emirates:** Dubai

---

## i18n System

- **Default language:** Arabic (RTL)
- **Secondary language:** English (LTR)
- Persistence: `localStorage` key `"locale"`
- Toggle: Globe icon in Navbar (desktop & mobile)
- All UI text uses `t.key` translations from `src/locales/ar.json` / `src/locales/en.json`
- RTL/LTR auto-applied via `document.documentElement.dir`

---

## Button & Navigation Map

All interactive elements and their targets:

| Button/Link | Location | Action |
|---|---|---|
| Logo (3.jpg) | Navbar | `→ #home` (scroll to top) |
| Home | Navbar | `→ #home` |
| About | Navbar | `→ #about` |
| Procedures | Navbar | `→ #procedures` |
| Before/After | Navbar | `→ #before-after` |
| Testimonials | Navbar | `→ #testimonials` |
| FAQ | Navbar | `→ #faq` |
| Contact | Navbar | `→ #contact` |
| Language Toggle | Navbar | Switches AR ↔ EN |
| Book Consultation | Navbar | `→ #contact` |
| Book Free Consultation | Hero | `→ #contact` |
| Explore Procedures | Hero | `→ #procedures` |
| Learn More | Procedure cards | `→ #procedures` (same section) |
| View All | Procedures | `→ #procedures` (same section) |
| View All | Before/After | `→ #before-after` (same section) |
| Book Consultation | CTA | `→ #contact` |
| Send Message | Contact form | Form submission |
| Language toggle | Footer | Switches AR ↔ EN |
| All footer links | Footer | `→ #home`, `→ #about`, etc. |

**Mobile menu:** All nav links scroll to section AND close the mobile menu overlay.

---

## Backend Status (Convex)

### Completed
- Schema defined (`src/convex/schema.ts`) with:
  - Auth tables (via `@convex-dev/auth`)
  - Users table with: name, image, email, emailVerificationTime, isAnonymous, role, phone, dateOfBirth, notes
  - Roles: admin, user, member
- Auth configured with email OTP + Anonymous
- Full CRUD functions for:
  - **Procedures** (`src/convex/procedures.ts`) — list, listActive, getBySlug, getById, getByCategory, create, update, remove
  - **Before/After Cases** (`src/convex/beforeAfter.ts`) — list, listActive, getByProcedure, create, update, remove
  - **Testimonials** (`src/convex/testimonials.ts`) — list, listActive, create, update, remove
  - **FAQ** (`src/convex/faq.ts`) — list, listActive, create, update, remove
  - **Bookings** (`src/convex/bookings.ts`) — list, listByUser, listByStatus, create, updateStatus, remove
  - **Consultations** (`src/convex/consultations.ts`) — list, listByStatus, create, updateStatus, remove
  - **Notifications** (`src/convex/notifications.ts`) — listByUser, unreadCount, markAsRead, markAllAsRead, create
- Admin Dashboard with full management UI
- Contact form saves to Convex consultations table

### Not Yet Built
- [ ] Image storage (upload to Convex or external)
- [ ] Patient profile editing from dashboard
- [ ] Availability/scheduling system
- [ ] Email notifications (Convex action with email provider)

---

## Planned Features — What's NOT Built Yet

### Patient Features (NOT started)
- [ ] Mobile number login with OTP
- [ ] Patient profile page
- [ ] Booking requests
- [ ] Consultation requests
- [ ] Booking history
- [ ] Notifications

### Admin Dashboard (NOT started)
- [ ] Dashboard overview
- [ ] Patients management
- [ ] Procedures CRUD
- [ ] Before/After cases management
- [ ] Testimonials management
- [ ] FAQ management
- [ ] Bookings management
- [ ] Consultation requests
- [ ] Doctor availability
- [ ] Website settings

### Public Pages (partially built)
- [x] Homepage with all sections
- [ ] Individual procedure pages (dynamic routes)
- [ ] Before & After dedicated page
- [ ] Patient Stories page
- [ ] Dedicated contact page
- [ ] Cost inquiry form
- [ ] Procedure finder tool

---

## Assets Inventory

| File | Location | Usage |
|---|---|---|
| `1.jpg` | `public/assets/1.jpg` | Doctor photo in About section |
| `2.jpg` | `public/assets/2.jpg` | Available (not used yet) |
| `3.jpg` | `public/assets/3.jpg` | Doctor photo used as Navbar avatar icon |
| `4.jpg` | `public/assets/4.jpg` | Business card image used as Footer logo |
| `logo.svg` | `public/logo.svg` | Original SVG logo (not actively used) |
| `logo.svg` | `src/assets/logo.svg` | Source logo (not actively used) |

---

## How to Run Locally

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Typecheck
bun tsc -b --noEmit

# Build for production
bun run build
```

**Convex backend:**
```bash
# Start Convex dev (generates types + deploys functions)
bun convex dev

# One-shot codegen
bun convex dev --once
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL (set via Freebuff Keys UI) |
| `CONVEX_DEPLOY_KEY` | For deploy | Convex deploy key (server-side only) |

---

## Git & Deployment

- **GitHub Repo:** `https://github.com/abo3dam-hub/alhasan-aesthetics`
- **Branch:** `main`
- **Platform:** Freebuff (Vite dev server managed by platform)
- **Deploy:** Can be connected to Vercel for auto-deployment from GitHub

---

## Notes for AI Agents

1. **This is a single-page app.** The homepage is one long scrollable page (`Landing.tsx`) composed of section components. There are no separate route pages for About, Procedures, etc.
2. **All text is translatable.** Never hardcode Arabic or English strings in components — always use `t.nav.key`, `t.hero.key`, etc. from `useI18n()`.
3. **RTL is critical.** The app defaults to Arabic RTL. Use Tailwind's `rtl:` variant and `dir` attribute for layout mirroring.
4. **Glassmorphism is the design language.** Use `.glass`, `.glass-card`, `.glass-elevated` classes. Don't use solid backgrounds for cards/panels.
5. **Images are in `public/assets/`.** Reference them as `/assets/1.jpg` etc. Do not use `import` for JPGs in `public/`.
6. **Convex is the planned backend.** Don't add Express, Next.js API routes, or other backends. All server logic should go in `src/convex/`.
7. **The dashboard is a placeholder.** It only shows "Welcome to Dashboard" and a logout button. It needs to be fully built out.
8. **Before/After section uses placeholder images.** No real patient photos have been uploaded yet.
9. **The contact form is frontend-only.** It shows a success toast but doesn't save to any database yet.
10. **Freebuff manages the dev server.** Never run `bun run dev`, `vite`, or kill processes. Edit files and the platform picks up changes automatically.
