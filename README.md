# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

> **Last Updated:** August 31, 2026
> **Status:** ✅ Public Website | ✅ Backend (Convex) | ✅ Booking System | ✅ Admin Dashboard | ✅ i18n (AR/EN) | ✅ Seed Data

---

## Project Overview

A premium, bilingual (Arabic RTL / English LTR) website for **Dr. Al Hasan Al Saiem** (د. الحسن الصايم), a plastic and aesthetic surgeon based in **Syria (Damascus, Lattakia)** and **United Arab Emirates (Dubai)**.

**Design Direction:** Luxury Medical / Light Glassmorphism — premium, elegant, modern, clean, trustworthy, and sophisticated.

**GitHub:** `https://github.com/abo3dam-hub/alhasan-aesthetics`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 + Glassmorphism utilities |
| UI Components | shadcn/ui (50+ Radix UI primitives) |
| Animations | Framer Motion 12 |
| Routing | React Router 7 (client-side SPA) |
| Backend/DB | Convex (schema + queries + mutations) |
| Auth | Convex Auth (`@convex-dev/auth`) — Email OTP + Anonymous |
| i18n | Custom I18nProvider (Arabic RTL / English LTR) |
| Icons | Lucide React |
| Package Manager | Bun |

---

## Color Palette & Design System

| Token | Value | Usage |
|---|---|---|
| Warm Ivory | `#FDF8F4` | Background |
| Deep Charcoal | `#1E1E1E` | Text |
| Champagne | `#C5A882` | Secondary accent |
| Warm Nude | `#D4C4AD` | Borders, muted elements |
| Warm Brown | `#8B7355` | Primary CTA buttons |

### Glass Utility Classes

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
| **Playfair Display** | Serif headings (`.font-serif-luxury`) |
| **Inter** | Body text (Latin) |
| **Noto Kufi Arabic** | Arabic text (auto RTL) |

---

## Routing & Navigation Map

### Pages

| Path | Component | Auth | Description |
|---|---|---|---|
| `/` | `<Landing />` | No | Arabic homepage (default) |
| `/ar` | `<Landing />` | No | Arabic homepage (explicit) |
| `/en` | `<Landing />` | No | English homepage |
| `/booking` | `<BookingPage />` | No | 3-step booking wizard |
| `/procedure/:slug` | `<ProcedureDetail />` | No | Individual procedure page |
| `/before-after` | `<BeforeAfterPage />` | No | B&A gallery with filters |
| `/auth` | `<AuthPage />` | No | Login/signup with email OTP |
| `/dashboard` | `<Dashboard />` | **Yes** | Admin dashboard |
| `*` | `<NotFound />` | No | Beautiful 404 page |

### Button Navigation Map

| Button | Location | Target |
|---|---|---|
| Book Free Consultation | Hero | → `/booking` |
| Explore Procedures | Hero | → `#procedures` (scroll) |
| Book Consultation | Navbar (desktop) | → `/booking` |
| Book Consultation | Navbar (mobile) | → `/booking` |
| Dashboard | Navbar (auth only) | → `/dashboard` |
| Language Toggle | Navbar | Switches AR ↔ EN |
| Each Procedure Card | Procedures | → `/procedure/:slug` |
| View All Results | Procedures / Before/After | → `/before-after` |
| Book Now | CTA section | → `/booking` |
| Book Consultation | Before/After page CTA | → `/booking` |
| Back to Home | All detail pages | → `/` |
| All footer links | Footer | → Respective pages |
| Login/Signup | Auth page | → `/dashboard` |
| Sign Out | Dashboard | → `/` |
| Seed Data | Dashboard Overview | Populates database |

---

## Booking System

The booking page (`/booking`) implements a **3-step wizard**:

1. **Step 1 — Procedure Selection:** Choose from 10 available procedures
2. **Step 2 — Schedule:** Pick date (from today) and time slot (9:00-17:30, 30min intervals)
3. **Step 3 — Personal Info:** Name, email, phone, optional notes
4. **Confirmation:** Saves to Convex `bookings` table, shows summary

**Time Slots:** `09:00, 09:30, 10:00, 10:30, 11:00, 11:30, 12:00, 12:30, 13:00, 13:30, 14:00, 14:30, 15:00, 15:30, 16:00, 16:30, 17:00, 17:30`

**Working Hours:** Sunday - Thursday, 9 AM - 6 PM

**Pre-selection:** Can be pre-selected via URL: `/booking?procedure=rhinoplasty`

---

## Available Procedures (from Business Card)

| # | Arabic | English | Slug |
|---|---|---|---|
| 1 | شد الأجفان العلوية والسفلية | Upper & Lower Eyelid Lift | `blepharoplasty` |
| 2 | شد الوجه والرقبة | Face & Neck Lift | `face-neck-lift` |
| 3 | تجميل الأنف | Rhinoplasty | `rhinoplasty` |
| 4 | شفط الشحم وحقن الشحم | Liposuction & Fat Transfer | `liposuction-fat-transfer` |
| 5 | شد البطن | Tummy Tuck | `tummy-tuck` |
| 6 | حقن البوتوكس | Botox Injections | `botox` |
| 7 | الفيلر | Fillers | `fillers` |
| 8 | شد العضدين والفخذين | Arm & Thigh Lift | `arm-thigh-lift` |
| 9 | تكبير/تصغير الثدي | Breast Augmentation/Reduction | `breast-augmentation-reduction` |
| 10 | إصلاح الندب والتشوهات | Scar & Deformity Correction | `scar-deformity-correction` |

Each procedure has: Arabic/English titles, descriptions, long descriptions, duration, and recovery time — both as fallback data in code AND in Convex database (via seed).

---

## Doctor's Locations

- **Syria:** Damascus, Lattakia
- **United Arab Emirates:** Dubai

---

## Assets Inventory

| File | Usage |
|---|---|
| `public/assets/1.jpg` | Doctor photo in About section |
| `public/assets/2.jpg` | Available (not used) |
| `public/assets/3.jpg` | Doctor photo — Navbar avatar + LogoDropdown |
| `public/assets/4.jpg` | Business card — Footer logo |

---

## Seed Data

The admin dashboard includes a **"Seed Data"** button that populates the Convex database with:

- **10 procedures** (all from business card, bilingual)
- **3 testimonials** (bilingual, 5-star ratings)
- **6 FAQ items** (bilingual, common questions)

To seed: Login → `/dashboard` → Overview tab → Click "Seed Data"

---

## Project Structure

```
/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json / tsconfig.app.json
├── components.json
│
├── public/assets/
│   ├── 1.jpg                    # Doctor photo (About)
│   ├── 2.jpg                    # Available
│   ├── 3.jpg                    # Doctor photo (Navbar, LogoDropdown)
│   └── 4.jpg                    # Business card (Footer)
│
├── src/
│   ├── main.tsx                 # App entry — providers, routing
│   ├── index.css                # Glass utilities, theme tokens
│   │
│   ├── i18n/
│   │   ├── index.tsx            # I18nProvider + useI18n()
│   │   └── types.ts             # Translation types
│   │
│   ├── locales/
│   │   ├── ar.json              # Arabic translations (100+ keys)
│   │   └── en.json              # English translations (100+ keys)
│   │
│   ├── pages/
│   │   ├── Landing.tsx          # Homepage — all sections
│   │   ├── BookingPage.tsx      # 3-step booking wizard
│   │   ├── ProcedureDetail.tsx  # /procedure/:slug (with fallback data)
│   │   ├── BeforeAfterPage.tsx  # /before-after gallery
│   │   ├── Auth.tsx             # Email OTP login (glassmorphism bg)
│   │   ├── Dashboard.tsx        # Admin panel (6 tabs + seed button)
│   │   └── NotFound.tsx         # 404 page
│   │
│   ├── components/
│   │   ├── GlassNavbar.tsx      # Fixed glass navbar + mobile menu
│   │   ├── Footer.tsx           # 4-column footer
│   │   ├── RequireAuth.tsx      # Auth guard
│   │   ├── LogoDropdown.tsx     # Logo dropdown (uses 3.jpg)
│   │   │
│   │   ├── sections/            # Homepage sections
│   │   │   ├── Hero.tsx         # Hero + CTAs
│   │   │   ├── About.tsx        # Doctor bio + photo
│   │   │   ├── Procedures.tsx   # 10 procedure cards → /procedure/:slug
│   │   │   ├── BeforeAfter.tsx  # Convex data → /before-after
│   │   │   ├── Testimonials.tsx # Convex data
│   │   │   ├── FAQ.tsx          # Convex data + Accordion
│   │   │   ├── Contact.tsx      # Form → Convex consultations
│   │   │   └── CTA.tsx          # → /booking
│   │   │
│   │   └── ui/                  # 50+ shadcn/ui components
│   │
│   ├── convex/
│   │   ├── schema.ts            # Full schema (8 tables)
│   │   ├── seed.ts              # Seed data mutation
│   │   ├── procedures.ts        # CRUD queries/mutations
│   │   ├── beforeAfter.ts       # CRUD queries/mutations
│   │   ├── testimonials.ts      # CRUD queries/mutations
│   │   ├── faq.ts               # CRUD queries/mutations
│   │   ├── bookings.ts          # CRUD + status management
│   │   ├── consultations.ts     # CRUD + status management
│   │   ├── notifications.ts     # CRUD + read/unread
│   │   ├── users.ts             # User queries
│   │   ├── auth.ts              # Auth config
│   │   ├── auth.config.ts       # Auth providers
│   │   ├── http.ts              # HTTP routes
│   │   └── auth/emailOtp.ts     # Email OTP provider
│   │
│   ├── hooks/
│   │   ├── use-auth.ts
│   │   └── use-mobile.ts
│   │
│   └── lib/
│       ├── utils.ts
│       └── vly-integrations.ts
```

---

## Convex Database Schema

### Tables (8 total)

| Table | Fields | Indexes |
|---|---|---|
| **users** | name, image, email, role, phone, dateOfBirth, notes | `by_email` |
| **procedures** | slug, titleAr/En, descriptionAr/En, longDescriptionAr/En, icon, category, duration, recovery, price, image, gallery, isActive, order | `by_slug`, `by_category`, `by_order` |
| **beforeAfter** | titleAr/En, procedureType, beforeImage, afterImage, descriptionAr/En, patientAge, isActive, order | `by_procedure`, `by_order` |
| **testimonials** | nameAr/En, textAr/En, rating, procedureType, avatar, isActive, order | `by_order` |
| **faq** | questionAr/En, answerAr/En, category, isActive, order | `by_order`, `by_category` |
| **bookings** | userId, patientName, patientEmail, patientPhone, procedureType, preferredDate, preferredTime, message, status, notes | `by_user`, `by_status` |
| **consultations** | name, email, phone, subject, message, userId, status, reply | `by_status`, `by_user` |
| **notifications** | userId, title, message, type, isRead, link | `by_user`, `by_unread` |

### Convex Functions (8 files)

| File | Functions |
|---|---|
| `seed.ts` | seedAll |
| `procedures.ts` | list, listActive, getBySlug, getById, getByCategory, create, update, remove |
| `beforeAfter.ts` | list, listActive, getByProcedure, create, update, remove |
| `testimonials.ts` | list, listActive, create, update, remove |
| `faq.ts` | list, listActive, create, update, remove |
| `bookings.ts` | list, listByUser, listByStatus, create, updateStatus, remove |
| `consultations.ts` | list, listByStatus, create, updateStatus, remove |
| `notifications.ts` | listByUser, unreadCount, markAsRead, markAllAsRead, create |

---

## Admin Dashboard Features

The `/dashboard` page provides full CRUD management:

| Tab | Capabilities |
|---|---|
| **Overview** | Stats cards, seed data button, recent bookings list |
| **Procedures** | List all, toggle active/inactive, delete, add new (full form) |
| **Testimonials** | List all, toggle active, delete, add new |
| **FAQ** | List all, toggle active, delete, add new |
| **Bookings** | List all, change status (pending/confirmed/completed/cancelled) |
| **Consultations** | List all, change status (new/read/replied/archived) |

---

## Data Flow

### Public Pages (Convex → Frontend)
- **Before/After section:** Pulls from `beforeAfter.listActive`, falls back to placeholder cards
- **Testimonials section:** Pulls from `testimonials.listActive`, falls back to translation strings
- **FAQ section:** Pulls from `faq.listActive`, falls back to translation strings
- **Procedure Detail:** Pulls from `procedures.getBySlug`, falls back to hardcoded translation data (10 procedures with full descriptions)

### Forms → Convex
- **Contact Form:** Saves to `consultations` table via `consultations.create`
- **Booking Form:** Saves to `bookings` table via `bookings.create`

### Admin Dashboard → Convex
- All CRUD operations via Convex mutations
- Real-time reactive updates via Convex queries
- Seed data via `seed.seedAll` mutation

---

## How to Run

```bash
bun install
bun run dev            # Start dev server
bun tsc -b --noEmit    # Typecheck
bun convex dev --once  # One-shot codegen
```

**Environment Variables:**
| Variable | Required | Description |
|---|---|---|
| `VITE_CONVEX_URL` | Yes | Convex deployment URL |
| `CONVEX_DEPLOY_KEY` | For deploy | Server-side only |

---

## Notes for AI Agents

1. **SPA architecture.** Homepage is one scrollable page (`Landing.tsx`) with section components. Detail pages are separate routes.
2. **All text is translatable.** Use `t.key` from `useI18n()`. Never hardcode strings. Booking page uses `t.booking.*` keys.
3. **RTL is critical.** Default language is Arabic RTL. Use Tailwind `rtl:` variant.
4. **Glassmorphism design.** Use `.glass`, `.glass-card`, `.glass-elevated`. No solid backgrounds for panels.
5. **Images in `public/assets/`.** Reference as `/assets/1.jpg`. Don't `import` JPGs.
6. **Convex is the backend.** Don't add Express or other backends.
7. **Contact form saves to Convex.** Uses `consultations.create` mutation.
8. **Booking form saves to Convex.** Uses `bookings.create` mutation.
9. **Procedure detail has fallback.** Shows hardcoded data when Convex table is empty. 10 procedures fully defined.
10. **Seed data available.** Run `seedAll` mutation from Dashboard to populate database.
11. **All logos use 3.jpg.** Navbar, LogoDropdown, and Footer all use the doctor's photo. Auth page also uses it.
12. **Freebuff manages dev server.** Never run `bun run dev` or kill processes.
