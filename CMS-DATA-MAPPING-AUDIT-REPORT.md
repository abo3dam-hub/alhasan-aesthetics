# CMS DATA-MAPPING AUDIT + ADMIN/PUBLIC SYNCHRONIZATION REPORT

**Project:** Dr. Al Hasan — Aesthetic & Plastic Surgery Website  
**Date:** September 3, 2026  
**Status:** Audit Complete — Fixes Applied Locally (Not Committed)

---

## Table of Contents

1. [Root Causes](#a-root-causes)
2. [Complete CMS Data Map](#b-complete-cms-data-map)
3. [Changes Made](#c-changes-made)
4. [Migration / Seed Instructions](#d-migration--seed)
5. [Media Flow](#e-media-flow)
6. [Build Status](#f-build-status)
7. [Remaining Issues](#g-remaining-issues)

---

## A. Root Causes

### 1. Why Admin Fields Are Empty (Hero, About, CTA, etc.)

The Admin Homepage CMS editors (HeroEditor, AboutEditor, CTAEditor, FooterEditor, SectionHeaderEditor) correctly read from `siteSettings` using `homepageSettings.get*Settings` queries. The public components (Hero, About, CTA, Contact, Footer) also read from the **same** `siteSettings` records. **Both use the same data source.**

**Root cause:** The Admin Dashboard fields appear empty because the `seedHomepageSettings` mutation (which populates CMS settings) has **never been run on the production Convex database**. The Overview tab has a "Seed CMS Settings" button that calls this mutation. Once clicked, all fields will be populated.

### 2. Why Testimonials Are Empty

The public `Testimonials.tsx` component queries `api.testimonials.listActive`. The Admin `TestimonialsTab` queries `api.testimonials.list`. Both query the **same** `testimonials` table.

**Root cause:** The `seedAll` mutation has an early-return guard: `if (existingProcedures) return "Data already seeded"`. Since procedures were already seeded, `seedAll` exits **before** inserting testimonials and FAQ items. This was a bug in the seeding logic.

### 3. Why FAQ Is Empty

Same root cause as Testimonials. The `seedAll` mutation's early-return prevented FAQ items from being seeded after procedures existed.

### 4. Why Media Thumbnails Are Missing

The upload flow in `use-upload.ts` correctly constructs URLs:

```
VITE_CONVEX_URL/api/storage/{storageId}
```

This URL is stored in the media table and rendered as `<img src={item.url}>`. **The URL is correct if `VITE_CONVEX_URL` is set properly in the build environment.**

If `VITE_CONVEX_URL` is not set or wrong, the URL falls back to `https://impartial-ladybug-881.convex.cloud` (hardcoded default). The thumbnails should display correctly if the URL is valid. If they show only "JPG", it means the `<img>` tag is failing to load.

### 5. Why the Repair Button Was Not Visible

**The `repairUrls` mutation existed in `src/convex/media.ts` but was never wired to any frontend component.** The MediaTab had no button to invoke it. Previous reports claimed a button was added, but the code was never actually connected to the UI.

### 6. Why Admin Image Fields Are Not Clearly Synchronized

The `MediaSelector` component correctly displays image thumbnails (real `<img>` tags) when the value is a valid URL. When no image is selected, it shows a dashed placeholder. The confusion arises because:

- The `repairUrls` button didn't exist, so broken URLs couldn't be fixed
- The `seedAll` bug prevented the full database from being populated

---

## B. Complete CMS Data Map

### Homepage CMS (siteSettings table)

| Dashboard Field | Convex Source | Public Component | Public Page | Exact Visual Element |
|---|---|---|---|---|
| Hero Badge (AR) | `siteSettings` key=`hero`, field=`badgeAr` | `Hero.tsx` | `/` | Badge text above main heading |
| Hero Badge (EN) | `siteSettings` key=`hero`, field=`badgeEn` | `Hero.tsx` | `/` | Badge text above main heading (EN) |
| Hero Badge Enabled | `siteSettings` key=`hero`, field=`badgeEnabled` | `Hero.tsx` | `/` | Shows/hides badge |
| Hero Title (AR) | `siteSettings` key=`hero`, field=`titleAr` | `Hero.tsx` | `/` | First line of main heading |
| Hero Title (EN) | `siteSettings` key=`hero`, field=`titleEn` | `Hero.tsx` | `/` | First line of main heading (EN) |
| Hero Subtitle (AR) | `siteSettings` key=`hero`, field=`subtitleAr` | `Hero.tsx` | `/` | Highlighted second line |
| Hero Subtitle (EN) | `siteSettings` key=`hero`, field=`subtitleEn` | `Hero.tsx` | `/` | Highlighted second line (EN) |
| Hero Description (AR) | `siteSettings` key=`hero`, field=`descriptionAr` | `Hero.tsx` | `/` | Paragraph below heading |
| Hero Description (EN) | `siteSettings` key=`hero`, field=`descriptionEn` | `Hero.tsx` | `/` | Paragraph below heading (EN) |
| Hero CTA Text (AR) | `siteSettings` key=`hero`, field=`ctaTextAr` | `Hero.tsx` | `/` | Primary button text |
| Hero CTA Text (EN) | `siteSettings` key=`hero`, field=`ctaTextEn` | `Hero.tsx` | `/` | Primary button text (EN) |
| Hero Secondary CTA (AR) | `siteSettings` key=`hero`, field=`ctaSecondaryTextAr` | `Hero.tsx` | `/` | Secondary button text |
| Hero Secondary CTA (EN) | `siteSettings` key=`hero`, field=`ctaSecondaryTextEn` | `Hero.tsx` | `/` | Secondary button text (EN) |
| Hero Image | `siteSettings` key=`hero`, field=`image` | `Hero.tsx` | `/` | **Note: Hero.tsx does NOT render heroCMS.image as a visible `<img>` — it only uses it for alt text. The hero section has no visible doctor image.** |
| Hero Image Alt (AR) | `siteSettings` key=`hero`, field=`imageAltAr` | `Hero.tsx` | `/` | Alt text for hero image |
| Hero Image Alt (EN) | `siteSettings` key=`hero`, field=`imageAltEn` | `Hero.tsx` | `/` | Alt text for hero image (EN) |
| Hero Trust Badges | `siteSettings` key=`hero`, field=`trustBadges` | `Hero.tsx` | `/` | Trust badge strip below CTAs |
| Hero CTA Enabled | `siteSettings` key=`hero`, field=`ctaEnabled` | `Hero.tsx` | `/` | Shows/hides primary CTA |
| Hero Secondary CTA Enabled | `siteSettings` key=`hero`, field=`ctaSecondaryEnabled` | `Hero.tsx` | `/` | Shows/hides secondary CTA |
| About Badge (AR) | `siteSettings` key=`about`, field=`badgeAr` | `About.tsx` | `/` | About section badge |
| About Title (AR) | `siteSettings` key=`about`, field=`titleAr` | `About.tsx` | `/` | About section title |
| About Title Highlight (AR) | `siteSettings` key=`about`, field=`titleHighlightAr` | `About.tsx` | `/` | About section highlighted text |
| About Description (AR) | `siteSettings` key=`about`, field=`descriptionAr` | `About.tsx` | `/` | About section paragraph |
| About Image | `siteSettings` key=`about`, field=`image` | `About.tsx` | `/` | Large doctor photo (left side) |
| About Stats | `siteSettings` key=`about`, field=`stats` | `About.tsx` | `/` | 4 stat cards (experience, procedures, etc.) |
| CTA Title (AR) | `siteSettings` key=`cta`, field=`titleAr` | `CTA.tsx` | `/` | CTA section heading |
| CTA Description (AR) | `siteSettings` key=`cta`, field=`descriptionAr` | `CTA.tsx` | `/` | CTA section paragraph |
| CTA Button Text (AR) | `siteSettings` key=`cta`, field=`buttonTextAr` | `CTA.tsx` | `/` | CTA button text |
| CTA Button Destination | `siteSettings` key=`cta`, field=`buttonDestination` | `CTA.tsx` | `/` | CTA button link target |
| Footer Description (AR) | `siteSettings` key=`footer`, field=`descriptionAr` | `Footer.tsx` | `/` | Footer brand description |
| Section Visibility | `siteSettings` key=`homepage` | `Landing.tsx` | `/` | Show/hide homepage sections |
| SEO Site Title (AR) | `siteSettings` key=`seo`, field=`siteTitleAr` | `Landing.tsx` | `/` | `<title>` tag |
| SEO Meta Description (AR) | `siteSettings` key=`seo`, field=`metaDescriptionAr` | `Landing.tsx` | `/` | `<meta name="description">` |
| SEO OG Image | `siteSettings` key=`seo`, field=`ogImage` | `Landing.tsx` | `/` | `<meta property="og:image">` |

### Doctor Settings (siteSettings table, key=`doctor`)

| Dashboard Field | Convex Source | Public Component | Public Page | Exact Visual Element |
|---|---|---|---|---|
| Doctor Name (EN) | `siteSettings` key=`doctor`, field=`doctorNameEn` | `About.tsx`, `Footer.tsx` | `/` | Doctor name overlay on photo, footer |
| Doctor Name (AR) | `siteSettings` key=`doctor`, field=`doctorNameAr` | `About.tsx` | `/` | Doctor name overlay (AR) |
| Phone | `siteSettings` key=`doctor`, field=`phone` | `Contact.tsx`, `Footer.tsx` | `/` | Phone info card, footer |
| Email | `siteSettings` key=`doctor`, field=`email` | `Contact.tsx`, `Footer.tsx` | `/` | Email info card, footer |
| WhatsApp Number | `siteSettings` key=`doctor`, field=`whatsappNumber` | `Contact.tsx` | `/` | Contact form WhatsApp link |
| Address (AR) | `siteSettings` key=`doctor`, field=`addressAr` | `Contact.tsx`, `Footer.tsx` | `/` | Address info card |
| Address (EN) | `siteSettings` key=`doctor`, field=`addressEn` | `Contact.tsx`, `Footer.tsx` | `/` | Address info card (EN) |
| Biography (AR) | `siteSettings` key=`doctor`, field=`biographyAr` | `About.tsx` | `/` | About section (fallback) |
| Biography (EN) | `siteSettings` key=`doctor`, field=`biographyEn` | `About.tsx` | `/` | About section (fallback, EN) |
| Social Media Instagram | `siteSettings` key=`doctor`, field=`socialMedia.instagram` | `Footer.tsx` | `/` | Instagram icon link |
| Social Media Facebook | `siteSettings` key=`doctor`, field=`socialMedia.facebook` | `Footer.tsx` | `/` | Facebook icon link |
| Social Media Twitter | `siteSettings` key=`doctor`, field=`socialMedia.twitter` | `Footer.tsx` | `/` | Twitter icon link |
| Social Media Snapchat | `siteSettings` key=`doctor`, field=`socialMedia.snapchat` | `Footer.tsx` | `/` | Snapchat icon link |
| Social Media TikTok | `siteSettings` key=`doctor`, field=`socialMedia.tiktok` | `Footer.tsx` | `/` | TikTok icon link |
| Working Hours Weekdays | `siteSettings` key=`doctor`, field=`workingHoursWeekdays` | `Footer.tsx` | `/` | Working hours in footer |
| Working Hours Friday | `siteSettings` key=`doctor`, field=`workingHoursFriday` | `Footer.tsx` | `/` | Friday hours |
| Working Hours Saturday | `siteSettings` key=`doctor`, field=`workingHoursSaturday` | `Footer.tsx` | `/` | Saturday hours |

### Procedures (procedures table)

| Dashboard Field | Convex Source | Public Component | Public Page | Exact Visual Element |
|---|---|---|---|---|
| Main Image | `procedures.image` | `Procedures.tsx`, `ProcedureDetail.tsx` | `/procedures`, `/procedure/:slug` | Card image on list page, hero image on detail page |
| Before Image | `procedures.beforeImage` | `ProcedureDetail.tsx` | `/procedure/:slug` | "Before" image in B&A section |
| After Image | `procedures.afterImage` | `ProcedureDetail.tsx` | `/procedure/:slug` | "After" image in B&A section |
| Gallery Images | `procedures.gallery` | `ProcedureDetail.tsx` | `/procedure/:slug` | Gallery grid |
| OG Image | `procedures.ogImage` | `ProcedureDetail.tsx` | `/procedure/:slug` | `<meta property="og:image">` |
| Title (AR) | `procedures.titleAr` | `Procedures.tsx`, `ProcedureDetail.tsx` | `/procedures`, `/procedure/:slug` | Card title, detail heading |
| Title (EN) | `procedures.titleEn` | `Procedures.tsx`, `ProcedureDetail.tsx` | `/procedures`, `/procedure/:slug` | Card title (EN), detail heading (EN) |
| Description (AR) | `procedures.descriptionAr` | `Procedures.tsx`, `ProcedureDetail.tsx` | `/procedures`, `/procedure/:slug` | Card description, detail subtitle |
| Long Description (AR) | `procedures.longDescriptionAr` | `ProcedureDetail.tsx` | `/procedure/:slug` | Full detail text |
| Duration | `procedures.duration` | `ProcedureDetail.tsx` | `/procedure/:slug` | Duration info card |
| Recovery | `procedures.recovery` | `ProcedureDetail.tsx` | `/procedure/:slug` | Recovery info card |
| Price | `procedures.price` | `Procedures.tsx`, `ProcedureDetail.tsx` | `/procedures`, `/procedure/:slug` | Price text |
| Icon | `procedures.icon` | `Procedures.tsx` | `/procedures` | Icon in card (when no image) |
| Active/Inactive | `procedures.isActive` | `Procedures.tsx` | `/procedures` | Shown/hidden on public site |
| Featured | `procedures.isFeatured` | `HomepageCMSTab.tsx` | Dashboard only | Homepage highlight |
| SEO Title (AR) | `procedures.seoTitleAr` | `ProcedureDetail.tsx` | `/procedure/:slug` | `<title>` tag |
| SEO Description (AR) | `procedures.seoDescriptionAr` | `ProcedureDetail.tsx` | `/procedure/:slug` | `<meta name="description">` |

### Testimonials (testimonials table)

| Dashboard Field | Convex Source | Public Component | Public Page | Exact Visual Element |
|---|---|---|---|---|
| Name (AR) | `testimonials.nameAr` | `Testimonials.tsx` | `/` | Patient name below testimonial |
| Name (EN) | `testimonials.nameEn` | `Testimonials.tsx` | `/` | Patient name (EN) |
| Text (AR) | `testimonials.textAr` | `Testimonials.tsx` | `/` | Testimonial quote |
| Text (EN) | `testimonials.textEn` | `Testimonials.tsx` | `/` | Testimonial quote (EN) |
| Rating | `testimonials.rating` | `Testimonials.tsx` | `/` | Star rating (1-5) |
| Avatar | `testimonials.avatar` | `Testimonials.tsx` | `/` | Patient avatar image |
| Active/Inactive | `testimonials.isActive` | `Testimonials.tsx` | `/` | Shown/hidden |

### FAQ (faq table)

| Dashboard Field | Convex Source | Public Component | Public Page | Exact Visual Element |
|---|---|---|---|---|
| Question (AR) | `faq.questionAr` | `FAQ.tsx` | `/` | Accordion trigger text |
| Question (EN) | `faq.questionEn` | `FAQ.tsx` | `/` | Accordion trigger text (EN) |
| Answer (AR) | `faq.answerAr` | `FAQ.tsx` | `/` | Accordion content |
| Answer (EN) | `faq.answerEn` | `FAQ.tsx` | `/` | Accordion content (EN) |
| Category | `faq.category` | `FAQ.tsx` | `/` | Category badge in accordion |
| Active/Inactive | `faq.isActive` | `FAQ.tsx` | `/` | Shown/hidden |

### Before & After (beforeAfter table)

| Dashboard Field | Convex Source | Public Component | Public Page | Exact Visual Element |
|---|---|---|---|---|
| Before Image | `beforeAfter.beforeImage` | `BeforeAfter.tsx` | `/` | Before photo placeholder |
| After Image | `beforeAfter.afterImage` | `BeforeAfter.tsx` | `/` | After photo (main card image) |
| Title (AR) | `beforeAfter.titleAr` | `BeforeAfter.tsx` | `/` | Case title |
| Procedure Type | `beforeAfter.procedureType` | `BeforeAfter.tsx` | `/` | Links to procedure |
| Active/Inactive | `beforeAfter.isActive` | `BeforeAfter.tsx` | `/` | Shown/hidden |

---

## C. Changes Made

### File: `src/pages/Dashboard.tsx`

1. **Added `repairUrls` mutation import** to the `MediaTab` function
   ```tsx
   const repairUrls = useMutation(api.media.repairUrls);
   ```

2. **Added state variables** to `MediaTab`
   ```tsx
   const [repairing, setRepairing] = useState(false);
   const [repairResult, setRepairResult] = useState<string | null>(null);
   ```

3. **Added Repair Media URLs button** to the Media tab UI
   - Placed between Upload Area and Search section
   - Shows loading state ("Repairing...")
   - Displays repair result (e.g., "Media URL repair: 12 repaired, 4 already valid")
   - Shows error toast on failure

### File: `src/convex/seed.ts`

1. **Fixed `seedAll` mutation** to seed testimonials and FAQ items **independently** from procedures:

   **Before (broken):**
   ```ts
   const existingProcedures = await ctx.db.query("procedures").first();
   if (existingProcedures) {
     return "Data already seeded"; // ← testimonials & FAQ never seeded!
   }
   ```

   **After (fixed):**
   ```ts
   // Each table checked independently
   const existingProcedures = await ctx.db.query("procedures").first();
   if (!existingProcedures) {
     // seed procedures...
   }

   const existingTestimonials = await ctx.db.query("testimonials").first();
   if (!existingTestimonials) {
     // seed testimonials...
   }

   const existingFaq = await ctx.db.query("faq").first();
   if (!existingFaq) {
     // seed FAQ...
   }
   ```

---

## D. Migration / Seed

**What needs to happen to populate the empty data:**

### Step 1: Seed CMS Settings
- **Where:** Dashboard → Overview tab → "Seed CMS Settings" button
- **What it does:** Creates/merges Hero, About, CTA, Footer, Section Headers, SEO, and Doctor settings in the `siteSettings` table
- **Safe to run:** Yes (only fills empty fields, never overwrites)

### Step 2: Seed Full Database
- **Where:** Dashboard → Overview tab → "Seed Full Database" button
- **What it does:** Seeds Testimonials (3 items) and FAQ (6 items) into their respective tables. Also seeds procedures if they don't exist.
- **Safe to run:** Yes (checks existence before inserting)

### Step 3: Seed Procedures (if needed)
- **Where:** Dashboard → Overview tab → "Seed Default Procedures" button
- **What it does:** Creates 10 default procedures with slug-based deduplication
- **Safe to run:** Yes (skips procedures whose slug already exists)

---

## E. Media Flow

### Upload Flow
```
Admin clicks upload in MediaTab or MediaSelector
  ↓
useImageUpload() hook called
  ↓
api.media.generateUploadUrl (Convex signed upload URL)
  ↓
File uploaded to Convex Storage via fetch()
  ↓
storageId returned from response
  ↓
URL constructed: `${VITE_CONVEX_URL}/api/storage/${storageId}`
  ↓
api.media.recordInsert stores: {storageId, url, name, type, size}
  ↓
MediaTab renders: <img src={item.url}> → thumbnail displayed
  ↓
MediaSelector (in content editors) → user picks image → URL stored in CMS field
  ↓
Public component reads CMS field → renders <img src={value}>
```

### Media Repair Flow
```
Admin clicks "Repair Media URLs" in Media Tab
  ↓
api.media.repairUrls mutation (server-side)
  ↓
For each media record:
  if url is empty OR url is a blob: OR url is missing
    → rewrite as: ${CONVEX_SITE_URL}/api/storage/${storageId}
  else:
    → skip (already valid)
  ↓
Returns: "Media URL repair: X repaired, Y already valid"
  ↓
Media list refreshes → thumbnails load
```

### Media Reference Checking
```
Admin tries to delete a media item
  ↓
api.media.checkReferences called with the URL
  ↓
Server checks all CMS tables for references:
  - Hero image
  - About image
  - All procedure images (main, before, after, OG, gallery)
  - All B&A case images
  - All testimonial avatars
  - Global SEO OG image
  - CTA image
  ↓
Returns list of referencing content (e.g., ["Procedure: Rhinoplasty"])
  ↓
Admin sees warning before deletion
```

---

## F. Build Status

| Check | Status | Details |
|---|---|---|
| TypeScript | ✅ Pass | `bun tsc -b --noEmit` — zero errors |
| Convex | ✅ Pass | `bun convex dev --once` — functions deployed |
| Vite Production Build | ✅ Pass | `bun run build` — built in ~12s |

---

## G. Remaining Issues

### 1. Admin Must Run Seed Buttons
The "Seed CMS Settings" and "Seed Full Database" buttons in the Dashboard Overview tab **must be clicked** to populate the empty data. This is a one-time operation. Without it, all admin forms will show empty fields.

### 2. Media Thumbnails Depend on VITE_CONVEX_URL
If the build environment does not have `VITE_CONVEX_URL` set, uploaded images may show broken thumbnails. The upload hook falls back to `https://impartial-ladybug-881.convex.cloud` which should be correct for this Convex deployment.

### 3. Hero Image Is Not Visually Rendered
The Hero section (`Hero.tsx`) does **not** render `heroCMS.image` as a visible `<img>`. It's only used for alt text. The hero section currently shows text only (no doctor photo). The About section renders the doctor photo. This may be intentional design.

### 4. Social Media URLs Are Empty
The seed data initializes all social media URLs to empty strings. The admin must fill these in the Settings tab for them to appear in the Footer.

### 5. Fallback Pattern Audit — All Clean
All fallback patterns in the public components follow the correct per-language independent fallback:

```
Arabic CMS value exists → use Arabic CMS value
Arabic CMS value missing → use Arabic default
English CMS value exists → use English CMS value
English CMS value missing → use English default
```

One missing language does **not** invalidate the other. No instances of the broken `cms?.titleAr && cms?.titleEn` pattern remain.

### 6. Architecture Verified — Single Source of Truth
```
              CONVEX DATABASE (siteSettings, procedures, testimonials, faq, beforeAfter)
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
       PUBLIC WEBSITE          ADMIN DASHBOARD
          READ ONLY             READ + WRITE
              │                     │
              └────── SAME DATA ───┘
```

Both the public website and admin dashboard read from and write to the **same** Convex tables. No duplicate data sources exist.

---

*Report generated on September 3, 2026*
