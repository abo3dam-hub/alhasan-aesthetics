# Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery Website

Premium bilingual (Arabic/English) aesthetic surgery website with a structured Admin CMS and WhatsApp-based consultation flow.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Backend/Database:** Convex
- **Styling:** Tailwind CSS + Glassmorphism theme
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Routing:** React Router
- **UI Components:** shadcn/ui
- **Auth:** Convex Auth (Email OTP)
- **i18n:** Custom AR/EN with RTL/LTR support

## Architecture

```
src/
├── components/
│   ├── sections/        # Homepage sections (Hero, About, Procedures, etc.)
│   ├── ui/              # shadcn/ui components
│   ├── GlassNavbar.tsx  # Navigation with language toggle
│   ├── Footer.tsx       # Site footer
│   ├── ImageUpload.tsx  # Convex storage image upload component
│   └── RequireAuth.tsx  # Auth guard
├── convex/
│   ├── schema.ts        # Database schema
│   ├── procedures.ts    # Procedures CRUD
│   ├── beforeAfter.ts   # Before/After cases CRUD
│   ├── testimonials.ts  # Testimonials CRUD
│   ├── faq.ts           # FAQ CRUD
│   ├── siteSettings.ts  # CMS settings (doctor, hero, site content)
│   ├── users.ts         # User management + becomeAdmin
│   ├── seed.ts          # Seed data
│   ├── media.ts         # Image upload via Convex storage
│   └── auth.ts          # Auth configuration
├── hooks/
│   ├── use-auth.ts      # Auth hook
│   └── use-upload.ts    # File upload hook
├── i18n/                # Custom i18n with AR/EN translations
├── locales/             # Translation files (ar.json, en.json)
└── pages/
    ├── Landing.tsx       # Homepage
    ├── Auth.tsx          # Sign in / Sign up
    ├── Dashboard.tsx     # Admin CMS Dashboard
    ├── ConsultationPage.tsx  # WhatsApp consultation form
    ├── ProcedureDetail.tsx   # Dynamic procedure page
    ├── BeforeAfterPage.tsx   # Before/After gallery
    └── NotFound.tsx         # 404 page
```

## Features

### Public Website
- Fully bilingual Arabic (RTL) / English (LTR)
- Glassmorphism premium medical design
- Homepage with Hero, About, Procedures, Before/After, Testimonials, FAQ, Contact, CTA sections
- Individual procedure pages (CMS-driven)
- Before & After gallery with interactive slider + dynamic CMS filters
- WhatsApp-based consultation form (no data stored)

### Consultation Flow
1. User selects procedures from CMS-loaded list + "Other Procedure"
2. Fills personal info (name, age, gender, nationality, residence)
3. Reviews summary
4. Clicks "Send via WhatsApp" → generates professional AR/EN message
5. Opens WhatsApp with pre-filled text
6. **No patient data is stored in the database**

### Admin Dashboard (CMS)
| Tab | Capabilities |
|---|---|
| **Overview** | Stats, seed data, become admin |
| **Procedures** | Create, Edit (with icon picker), Delete, Toggle active, **Reorder (↑↓)** |
| **Before & After** | Create, Edit, Delete, Toggle active, **Reorder (↑↓)**, Image upload |
| **Testimonials** | Create, Edit, Delete, Toggle active, **Reorder (↑↓)** |
| **FAQ** | Create, Edit, Delete, Toggle active, **Reorder (↑↓)** |
| **Settings** | Doctor info, WhatsApp, phone, email, addresses, biography, specializations, education, hero content, social media |
| **Media** | Image upload via Convex storage, copy URL for use in CMS forms |

### Image Management
- Upload via `ImageUpload` component (Convex HTTP storage)
- Admin uploads image → gets URL → pastes URL in procedure/BA/testimonial forms
- Supported: JPEG, PNG, WebP, GIF (max 5MB)

### SEO
- Meta tags, Open Graph, Twitter Card
- JSON-LD structured data (Physician schema)
- robots.txt, sitemap.xml

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Auth + admin role |
| `procedures` | CMS-managed procedure list |
| `beforeAfter` | Before & After cases |
| `testimonials` | Patient testimonials |
| `faq` | FAQ items |
| `siteSettings` | Key/value CMS settings |

## Environment Variables

Managed through the project's Keys/API keys UI — do not edit `.env` files manually.

## Development

```bash
# Install dependencies
bun install

# Start dev server (Freebuff runs this automatically)
bun run dev

# Convex dev (Freebuff runs with --once)
bunx convex dev --once

# Type check
bun tsc -b --noEmit
```

## Accessing Admin Dashboard

1. Navigate to `/auth`
2. Sign in with any email (OTP will be sent)
3. Navigate to `/dashboard`
4. Click "Become Admin" (only first user can claim admin)
5. Full CMS access granted

## Deployment

The project runs on Freebuff Web with Vite dev server + Convex backend. The GitHub repository is at `github.com/abo3dam-hub/alhasan-aesthetics`.

## Design

- **Theme:** Luxury Medical / Editorial / Minimal Glassmorphism
- **Colors:** Warm Ivory, Deep Charcoal, Champagne, Warm Nude
- **Style:** Light glassmorphism with layered translucent panels, controlled blur, subtle edge highlights
- **Typography:** Serif luxury headings + clean sans-serif body
- **Responsive:** Mobile-first with desktop optimization
