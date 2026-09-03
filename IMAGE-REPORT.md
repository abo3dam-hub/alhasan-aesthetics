# IMAGE SYSTEM — ROOT CAUSE INVESTIGATION & COMPLETE FIX REPORT

**Date:** September 3, 2026  
**Project:** Dr. Al Hasan — Aesthetic & Plastic Surgery Website

---

## Executive Summary

The image system had **two fundamental root causes** that affected both the Admin Dashboard and the public website:

1. **Public website used raw `<img src={value}>`** — not the `ResolvedImage` component. If `value` was a Convex storageId (a raw string like `"k3b5...xyz"`), the browser couldn't render it. If `value` was a broken URL (e.g., from an incorrect `VITE_CONVEX_URL`), same problem.

2. **Upload hook stored URLs instead of storageIds** — The upload hook (`use-upload.ts`) manually constructed URLs using `import.meta.env.VITE_CONVEX_URL`. If this env var was empty or mismatched at build time, the stored URL was permanently broken in the database.

Both root causes have been fixed.

---

## Original Symptoms

1. Media Library: Thumbnails intermittently missing after refresh
2. Media Library: "Image unavailable" for recently uploaded images
3. CMS Image Fields: "Select Image" instead of actual thumbnails
4. Public Website: Broken JPG/image icons for valid images
5. Inconsistent behavior across upload → save → refresh → public render

---

## Root Cause Analysis

### Root Cause #1: Public Website Used Raw `<img src>`

The `ResolvedImage` component was created in earlier work to resolve any image reference (storageId, URL, data URI) via `ctx.storage.getUrl()`. However, it was **only used in the Admin Dashboard** (Media Library, MediaSelector, ImageUpload).

The **public website** components used raw `<img src={value}>`:

| Component | Raw `<img>` Used For |
|---|---|
| `ProcedureDetail.tsx` | Main image, before/after images, gallery images |
| `ProceduresPage.tsx` | Procedure card images |
| `Procedures.tsx` (homepage) | Procedure card images |
| `BeforeAfterPage.tsx` | Before/after slider images |
| `BeforeAfter.tsx` (homepage) | Before/after card images |
| `About.tsx` | Doctor profile image (CMS-driven) |

**Impact:** If any image field contained a storageId instead of a URL, the browser rendered a broken image icon.

### Root Cause #2: Upload Hook Stored URLs, Not storageIds

The upload hook (`src/hooks/use-upload.ts`) constructed URLs:
```js
const url = `${convexUrl}/api/storage/${storageId}`;
```

This stored a **manually constructed URL** in the database. Problems:
- If `VITE_CONVEX_URL` was empty at build time → URL became `/api/storage/...` (broken relative URL)
- If the env var pointed to a different Convex deployment → URL pointed to wrong environment
- URLs may expire or become invalid while storageIds remain permanent

**Impact:** Stored URLs could be permanently broken, with no recovery without re-upload.

---

## Fixes Implemented

### Fix #1: Public Website Uses `ResolvedImage`

All public image-rendering components now use `ResolvedImage` instead of raw `<img>`:

| File | What Changed |
|---|---|
| `src/pages/ProcedureDetail.tsx` | Main image, before/after, gallery → `ResolvedImage` |
| `src/pages/ProceduresPage.tsx` | Procedure card images → `ResolvedImage` |
| `src/pages/BeforeAfterPage.tsx` | Before/after slider images → `ResolvedImage` |
| `src/components/sections/Procedures.tsx` | Homepage procedure card images → `ResolvedImage` |
| `src/components/sections/BeforeAfter.tsx` | Homepage B&A card images → `ResolvedImage` |
| `src/components/sections/About.tsx` | Doctor image → `ResolvedImage` (with static fallback) |

**How it works:** `ResolvedImage` takes any image reference (storageId, URL, or data URI), resolves it via `ctx.storage.getUrl()` on the backend, and renders the actual `<img>` with the correct working URL.

### Fix #2: Upload Hook Returns storageId as Primary Reference

`src/hooks/use-upload.ts` now returns `{ storageId, url }` with storageId as the canonical reference. `MediaSelector` and `ImageUpload` both pass `storageId` (not `url`) to CMS fields.

### Files Created (3)

| File | Purpose |
|---|---|
| `src/components/ResolvedImage.tsx` | Shared image component — resolves any reference via Convex query |
| `src/hooks/use-image-url.ts` | Single/batch URL resolution hooks |
| `src/hooks/use-resolved-media.ts` | Media batch resolution for Media Library |

### Files Modified (6)

| File | Changes |
|---|---|
| `src/convex/media.ts` | Added `resolveUrl`, `resolveUrls`, `repairUrls` queries/mutations using `ctx.storage.getUrl()` |
| `src/pages/Dashboard.tsx` | Media Library grid + preview modal use `ResolvedImage` |
| `src/components/MediaSelector.tsx` | Thumbnail + gallery use `ResolvedImage`; passes `storageId` to CMS fields |
| `src/components/ImageUpload.tsx` | Preview uses `ResolvedImage`; passes `storageId` to CMS fields |
| `src/hooks/use-upload.ts` | Returns `storageId` as primary upload result |
| `src/pages/ProcedureDetail.tsx` | All image fields use `ResolvedImage` |
| `src/pages/ProceduresPage.tsx` | Procedure card images use `ResolvedImage` |
| `src/pages/BeforeAfterPage.tsx` | B&A slider images use `ResolvedImage` |
| `src/components/sections/Procedures.tsx` | Homepage procedure images use `ResolvedImage` |
| `src/components/sections/BeforeAfter.tsx` | Homepage B&A images use `ResolvedImage` |
| `src/components/sections/About.tsx` | Doctor image uses `ResolvedImage` with static fallback |

---

## Architecture — After Fix

### Image Reference Resolution Flow

```
Any image reference (storageId, URL, data URI)
    ↓
resolveUrl Convex query
    ↓
ctx.storage.getUrl(storageId)  ← Convex canonical resolver
    ↓
Valid HTTPS URL
    ↓
<ResolvedImage> → <img src={resolvedUrl}>
    ↓
Actual browser-rendered image
```

### Single Source of Truth

**storageId** is the canonical image reference. The backend resolves it via `ctx.storage.getUrl()`. No manually constructed URLs are the primary mechanism.

### Backward Compatibility

- Existing URLs stored in the database → `resolveUrl` tries to extract storageId from the URL pattern `/api/storage/<storageId>` and resolves via Convex
- Existing storageIds → resolved directly via `ctx.storage.getUrl()`
- Legacy data URLs → passed through as-is
- Empty references → show "No image" state

### Language Fallbacks

All fallback patterns use independent per-language `||` operators:
```jsx
isArabic ? (cms?.fieldAr || fallback) : (cms?.fieldEn || fallback)
```
No broken `&&` patterns exist.

---

## Image Field Mapping

### Public Website — Dashboard Image Flow

| Dashboard Field | Convex Table | Storage Format | Public Component | Public Page |
|---|---|---|---|---|
| Procedure Main Image | `procedures.image` | storageId | `ResolvedImage` | `ProcedureDetail.tsx` |
| Procedure Before Image | `procedures.beforeImage` | storageId | `ResolvedImage` | `ProcedureDetail.tsx` |
| Procedure After Image | `procedures.afterImage` | storageId | `ResolvedImage` | `ProcedureDetail.tsx` |
| Procedure Gallery | `procedures.gallery` | storageId[] | `ResolvedImage` | `ProcedureDetail.tsx` |
| Procedure OG Image | `procedures.ogImage` | storageId | meta tag | `ProcedureDetail.tsx` |
| Before & After Before | `beforeAfter.beforeImage` | storageId | `ResolvedImage` | `BeforeAfterPage.tsx` |
| Before & After After | `beforeAfter.afterImage` | storageId | `ResolvedImage` | `BeforeAfterPage.tsx` |
| About/Doctor Image | `siteSettings.about.image` | URL or storageId | `ResolvedImage` (fallback: static) | `About.tsx` |
| Testimonial Avatar | `testimonials.avatar` | storageId | optional | `Testimonials.tsx` |
| Media Library | `media.storageId` | storageId | `ResolvedImage` | Dashboard Media tab |

### Intentionally Unused (by design)

- **Hero Image** — Removed from Dashboard UI. Hero section is text/design only.
- **CTA Image** — Removed from Dashboard UI. CTA section is text/design only.

---

## Browser Verification

### Limitations

This environment **cannot perform authenticated browser testing**. The `read_url` tool only retrieves the HTML shell of the React SPA (client-rendered content is not visible). Convex data queries cannot be executed from outside.

### Source-Code Verification ✅

All of the following were verified by inspecting source code:

- [x] `ResolvedImage` correctly resolves storageId via `ctx.storage.getUrl()`
- [x] `ResolvedImage` handles URLs (passthrough), storageIds (resolve), empty (show "No image"), broken (show "Image unavailable")
- [x] `MediaSelector` passes `storageId` to CMS fields
- [x] `ImageUpload` passes `storageId` to CMS fields
- [x] Media Library uses `ResolvedImage` for all thumbnails
- [x] All public pages use `ResolvedImage` for all image fields
- [x] `resolveUrl` query uses `ctx.storage.getUrl()` as canonical resolver
- [x] `resolveUrls` batch query uses the same logic
- [x] `repairUrls` mutation uses `ctx.storage.getUrl()` for URL generation
- [x] No duplicate image URL construction logic remains (except in `use-upload.ts` which stores a fallback URL)
- [x] All public image components import and use `ResolvedImage`
- [x] No raw `<img src={cmsField}>` remains for CMS-driven images
- [x] About.tsx has proper fallback to static image when CMS image is empty

### Browser Verification — NOT VERIFIED ⚠️

The following cannot be verified from this environment:

- [ ] New JPG upload shows actual thumbnail
- [ ] New PNG upload shows actual thumbnail
- [ ] New WebP upload shows actual thumbnail
- [ ] Multiple uploaded images all display after refresh
- [ ] Existing media records show thumbnails
- [ ] Procedure Main Image shows thumbnail in Dashboard
- [ ] Procedure Before/After shows thumbnail in Dashboard
- [ ] Gallery images show thumbnails in Dashboard
- [ ] Before & After images show thumbnails in Dashboard
- [ ] Testimonial avatar shows thumbnail in Dashboard
- [ ] Replace image updates thumbnail
- [ ] Save + refresh preserves new thumbnail
- [ ] Public site renders correct images
- [ ] Repair Media URLs works end-to-end
- [ ] CMS Health Check shows correct counts

---

## Build Verification

| Check | Result |
|---|---|
| Convex functions compile | ✅ Pass |
| TypeScript typecheck | ✅ 0 errors |
| Vite production build | ✅ 10.79s |

---

## What To Test In Your Browser

### Test 1: Media Library Thumbnails
1. Open Dashboard → Media
2. Upload a JPG → verify real thumbnail (not "JPG" icon)
3. Upload a PNG → verify real thumbnail
4. Refresh the page → verify thumbnails still appear
5. Open the preview modal → verify the full image loads

### Test 2: CMS Image Fields
1. Open Dashboard → Procedures → Edit a procedure
2. Check that "Main Image" shows an actual thumbnail (not "Select Image")
3. Click "Replace Image" → select a different one → verify new thumbnail
4. Save → refresh → verify the new image persists
5. Check Before/After image fields similarly

### Test 3: Public Website
1. Open `/procedures` → verify procedure card images render
2. Open `/procedure/<slug>` → verify main image, before/after, gallery
3. Open `/before-after` → verify slider images render
4. Open homepage → verify procedure cards and before/after section images

### Test 4: Repair URLs
1. Dashboard → Media → click "Repair Media URLs"
2. Verify result message shows count of repaired/skipped/failed
3. Check that thumbnails still work after repair

### Test 5: Before/After Slider
1. Open `/before-after`
2. Verify the before/after slider works (drag to compare)
3. Both images should load and the clipping mechanism should work

---

## Remaining Issues

1. **Browser verification cannot be performed from this environment** — All fixes are source-code verified only. The user must test in their actual browser.

2. **Existing broken URLs in database** — If old media records have permanently broken URLs (from before the fix), the `repairUrls` button or the `ResolvedImage` component will attempt to re-resolve them via `ctx.storage.getUrl()`. If the storage object still exists, the image will render. If not, "Image unavailable" is shown.

3. **Hero Image and CTA Image** — Intentionally not connected. These sections are text/design based.

4. **Testimonial avatars** — The Dashboard supports optional avatar upload via `MediaSelector`. If no avatar is set, the public Testimonials component should show a default/placeholder (no image).

---

## Files Changed Summary

```
NEW: src/components/ResolvedImage.tsx
NEW: src/hooks/use-image-url.ts
NEW: src/hooks/use-resolved-media.ts

MODIFIED: src/convex/media.ts
MODIFIED: src/pages/Dashboard.tsx
MODIFIED: src/pages/ProcedureDetail.tsx
MODIFIED: src/pages/ProceduresPage.tsx
MODIFIED: src/pages/BeforeAfterPage.tsx
MODIFIED: src/components/MediaSelector.tsx
MODIFIED: src/components/ImageUpload.tsx
MODIFIED: src/hooks/use-upload.ts
MODIFIED: src/components/sections/Procedures.tsx
MODIFIED: src/components/sections/BeforeAfter.tsx
MODIFIED: src/components/sections/About.tsx
```

---

## Conclusion

The root causes were:

1. **Public website used raw `<img src>`** instead of the `ResolvedImage` resolver component
2. **Upload hook stored manually constructed URLs** instead of the canonical `storageId`

Both have been fixed. The image system now has ONE canonical architecture:

```
storageId → ctx.storage.getUrl() → working URL → ResolvedImage → <img>
```

This architecture works for:
- New uploads
- Existing media records
- CMS image fields (procedures, B&A, about, testimonials)
- Public website pages
- Admin Dashboard previews

**Status: SOURCE CODE VERIFIED ✅ | BUILD VERIFIED ✅ | BROWSER VERIFIED: NOT VERIFIED ⚠️**
