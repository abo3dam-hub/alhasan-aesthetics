# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

## Overview

A premium, bilingual (Arabic RTL / English LTR) aesthetic and plastic surgery website built with a luxury glassmorphism design. Features a WhatsApp-based consultation request system, a full Admin CMS dashboard, and Convex backend.

**No patient accounts. No appointment database. No stored consultation requests.**

The consultation flow is: **Form → Validate → Generate WhatsApp message → Open WhatsApp**.

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript | Type safety |
| Vite | Build tool |
| React Router | Client-side routing |
| Tailwind CSS v4 | Utility-first styling |
| Convex | Backend (DB, auth, functions) |
| @convex-dev/auth | Authentication (email OTP) |
| Framer Motion | Animations |
| Lucide React | Icons |
| Sonner | Toast notifications |
| shadcn/ui | UI components |

## Design System

**Theme:** Luxury Medical / Editorial / Light Glassmorphism
**Typography:** Playfair Display (headings) + Inter (body) + Noto Kufi Arabic
**Colors:** Warm Ivory, Deep Charcoal, Champagne, Warm Nude
**Glass Effects:** `.glass-card`, `.glass-elevated`, `.glass-subtle`, `.glow-champagne`

## Routes

| Route | Component | Description |
|---|---|---|
| `/` | Landing | Full homepage (Arabic default) |
| `/ar` | Landing | Arabic homepage |
| `/en` | Landing | English homepage |
| `/consultation` | ConsultationPage | Multi-step consultation form → WhatsApp |
| `/procedure/:slug` | ProcedureDetail | Dynamic procedure detail page (CMS data) |
| `/before-after` | BeforeAfterPage | Before/after gallery with slider |
| `/auth` | AuthPage | Admin login (email OTP) |
| `/dashboard` | Dashboard | Admin CMS (protected) |
| `*` | NotFound | 404 page |

## Navigation & Buttons

### Navbar
| Button | Destination |
|---|---|
| Logo | `/` |
| Home | `/#home` (native scroll) |
| About | `/#about` (native scroll) |
| Procedures | `/#procedures` (native scroll) |
| Before & After | `/before-after` |
| Testimonials | `/#testimonials` (native scroll) |
| FAQ | `/#faq` (native scroll) |
| Contact | `/#contact` (native scroll) |
| Language Toggle | Switches AR↔EN |
| Book Consultation | `/consultation` |
| Dashboard (if auth) | `/dashboard` |

### Homepage Sections
| Section | Button | Destination |
|---|---|---|
| Hero | "Book Your Consultation & Get Pricing" | `/consultation` |
| Hero | "Explore Procedures" | Scrolls to `#procedures` |
| Procedures | Each procedure card | `/procedure/:slug` |
| Procedures | View All Results | `/before-after` |
| Before/After | View All Results | `/before-after` |
| CTA | "Book Your Consultation & Get Pricing" | `/consultation` |

### Consultation Flow (WhatsApp)
1. **Step 1:** Select procedures (multi-select from CMS) + "Other Procedure" option
2. **Step 2:** Patient info (name, age, gender, nationality with searchable dropdown, residence)
3. **Review:** Summary of entered information
4. **Submit:** Generates WhatsApp message → opens `wa.me` with pre-filled text
5. **No data stored** — form validates → generates message → opens WhatsApp

### Before & After Page
| Button | Destination |
|---|---|
| Back to Home | `/` |
| Procedure filter buttons | Filter gallery |
| Range slider | Compare before/after images |
| Book Consultation CTA | `/consultation` |

## Admin Dashboard (`/dashboard`)

Protected by `requireAdmin()` — only authenticated users with `role: "admin"` can access.

### Tabs

| Tab | Capabilities |
|---|---|
| **Overview** | Stats, Seed Database button, Become Admin |
| **Procedures** | Add/Edit/Delete with icon picker, bilingual content, category, duration, recovery |
| **Before & After** | Add/Edit/Delete cases with procedure selection, before/after images |
| **Testimonials** | Add/Edit/Delete with ratings, bilingual |
| **FAQ** | Add/Edit/Delete with bilingual Q&A |
| **Settings** | Doctor info, WhatsApp, phone, email, addresses, social media, hero content |

### Settings Management
- Doctor name (AR/EN)
- WhatsApp number (configurable — not hardcoded)
- Phone, email, addresses (AR/EN)
- Doctor profile: biography, specializations, education (AR/EN)
- Hero section content (AR/EN)
- Social media links (Instagram, Facebook, Twitter, Snapchat, TikTok)

## Database Schema (Convex)

| Table | Fields | Purpose |
|---|---|---|
| `users` | name, email, role, phone... | Admin users (via Convex Auth) |
| `procedures` | slug, titleAr/En, descriptionAr/En, icon, category, image, gallery, isActive, order | CMS-managed procedures |
| `beforeAfter` | titleAr/En, procedureType, beforeImage, afterImage, isActive, order | Before/after cases |
| `testimonials` | nameAr/En, textAr/En, rating, isActive, order | Patient testimonials |
| `faq` | questionAr/En, answerAr/En, isActive, order | FAQ items |
| `siteSettings` | key, value (any) | Doctor info, WhatsApp number, social links, hero content |

**Removed tables:**
- `consultations` — replaced by WhatsApp flow (no data stored)
- `bookings` — removed (was deprecated)
- `notifications` — removed (was deprecated)

## Backend Security

All CMS mutations (create/update/delete) are protected by `requireAdmin()` which verifies:
1. User is authenticated
2. User has `role: "admin"` in the database

Public queries (listActive, getBySlug) are open for the public website.

## Procedures (10)

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

## Doctor Information

| Field | Value |
|---|---|
| Name (EN) | Dr. Al Hasan Al Saiem |
| Name (AR) | د. الحسن الصايم |
| Locations | Syria, Damascus, Lattakia / United Arab Emirates, Dubai |
| Working Hours | Sun-Thu: 9 AM - 6 PM |
| WhatsApp | Configurable via Admin Settings |

## SEO

- Comprehensive meta tags (title, description, keywords, author, robots)
- Open Graph tags (og:type, og:title, og:description, og:image, og:url, og:locale)
- Twitter Card tags
- Structured Data (JSON-LD) — Physician schema with services and ratings
- robots.txt with sitemap reference
- sitemap.xml with all routes
- Canonical URLs

## Important Notes

1. **No patient accounts** — The website is NOT a booking platform. Consultation requests go via WhatsApp.
2. **No patient data stored** — The consultation form generates a WhatsApp message without persisting patient data.
3. **Admin auth required** — All CMS mutations verify `role: "admin"` server-side.
4. **WhatsApp number is configurable** — Set it in Admin Dashboard → Settings.
5. **RTL/LTR** — Full Arabic RTL and English LTR support throughout.
6. **ProcedureDetail is CMS-driven** — No hardcoded procedure data; all content comes from Convex.
7. **Contact form uses WhatsApp** — Messages are sent via WhatsApp, not stored in a database.

## Seed Data

Click "Seed Data" in the Admin Dashboard Overview to populate:
- 10 procedures with full bilingual content
- 3 testimonials
- 6 FAQ items
- Doctor settings (name, WhatsApp number, addresses, biography, social media)

## File Structure

```
src/
├── components/
│   ├── Footer.tsx              # Site footer with links
│   ├── GlassNavbar.tsx         # Glassmorphism navbar with mobile menu
│   ├── LogoDropdown.tsx        # Logo dropdown for auth
│   ├── RequireAuth.tsx         # Auth guard component
│   └── sections/
│       ├── About.tsx           # Doctor about section
│       ├── BeforeAfter.tsx     # Before/after preview on homepage
│       ├── CTA.tsx             # Call-to-action section
│       ├── Contact.tsx         # Contact form (WhatsApp redirect)
│       ├── FAQ.tsx             # FAQ accordion section
│       ├── Hero.tsx            # Hero banner
│       ├── Procedures.tsx      # Procedures grid section
│       └── Testimonials.tsx    # Testimonials section
├── convex/
│   ├── admin.ts                # requireAdmin() helper
│   ├── auth.ts                 # Convex Auth config
│   ├── auth.config.ts          # Auth provider config
│   ├── auth/emailOtp.ts        # Email OTP provider
│   ├── beforeAfter.ts          # Before/After CRUD (admin-protected)
│   ├── consultations.ts        # DEPRECATED stub
│   ├── faq.ts                  # FAQ CRUD (admin-protected)
│   ├── http.ts                 # HTTP router
│   ├── procedures.ts           # Procedure CRUD (admin-protected)
│   ├── schema.ts               # Database schema
│   ├── seed.ts                 # Seed data mutation
│   ├── siteSettings.ts         # Site settings (admin-protected)
│   ├── testimonials.ts         # Testimonials CRUD (admin-protected)
│   ├── users.ts                # User queries + becomeAdmin
│   └── _generated/             # Auto-generated Convex types
├── hooks/
│   └── use-auth.ts             # Authentication hook
├── i18n/
│   ├── index.tsx               # I18nProvider + useI18n()
│   └── types.ts                # Translation types
├── locales/
│   ├── ar.json                 # Arabic translations
│   └── en.json                 # English translations
├── pages/
│   ├── Auth.tsx                # Admin login page
│   ├── BeforeAfterPage.tsx     # Full before/after gallery
│   ├── ConsultationPage.tsx    # Consultation form → WhatsApp
│   ├── Dashboard.tsx           # Admin CMS dashboard
│   ├── Landing.tsx             # Homepage assembly
│   ├── NotFound.tsx            # 404 page
│   └── ProcedureDetail.tsx     # Dynamic procedure page (CMS-driven)
├── index.css                   # Global styles + glassmorphism
├── main.tsx                    # App entry + routing
└── lib/utils.ts                # Utility functions
```
