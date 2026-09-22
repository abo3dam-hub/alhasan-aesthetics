# Video Section (Reels) — Feature Report

## Scope

Add a standalone **homepage video section (Reels-style)** to the al-hasan-aesthetics clinic site, positioned between «معلومات مهمة» (InformationCard) and «إجراءاتنا» (Procedures), fully managed from the **existing admin CMS** (no separate CMS), built on the **existing Convex File Storage** (no S3/R2, no schema changes, no new tables).

Explicit non-goals honored from the brief:

- The video section is **not** part of the Hero and the Hero is untouched.
- **No other section order change** — the videos section was the only insertion.
- **No Convex rebuild / CMS rebuild** — no new table, no schema migration, no auth/patient-account changes, no new dependencies.
- **Existing content untouched** — everything else on the homepage and in the dashboard continues to read/write the same keys it did before.
- **Minimal diff** — see file list below.

## Key decisions

| Decision | Rationale |
| --- | --- |
| Videos stored as an array inside `siteSettings["videos"]` (single row, keyed by `videos`) rather than a new Convex table | Mirrors the existing homepage-CMS pattern (hero / about / informationCard all live in `siteSettings`). Requires **zero schema change**, so no `npx convex codegen` of `dataModel.d.ts` is needed and deployment is just function + client code. |
| Video **files** uploaded directly to Convex storage via the existing admin-gated `media.generateUploadUrl` signed URL; only a `storageId` is ever stored in the record | Follows the existing `useImageUpload` flow; large files (up to 50MB) are never passed into a mutation payload; no duplicate copies are kept. |
| Section header texts stored under `siteSettings["videoSection"]` and edited with the existing reusable `SectionHeaderEditor` | Reuses the exact same header-editing UI/locale keys used by Procedures/Testimonials/FAQ/Before-After. |
| Public `api.videos.getVideos` resolves `url` + `posterUrl` **server-side** via `ctx.storage.getUrl` inside the query | One round-trip, no client-side URL resolution plumbing, and it degrades cleanly to `""` when a file is missing. |
| Replace/delete clean up old storage objects (only when no other record still references them) | No orphaned files accumulate in Convex storage. Note: `getVideos`/`listAll` both call `ctx.storage.getUrl`, which doubles as the "still referenced" check (deleting deletes the file itself). |

## Data model

Videos live in the `siteSettings` table under key `videos`, validated by `videoValidator` in `src/convex/videos.ts`.

```ts
{
  id: string,                 // stable client-generated id (crypto.randomUUID)
  storageId: string,          // Convex _storage id of the uploaded video file
  titleAr?: string,           // Arabic title
  titleEn?: string,           // English title
  descriptionAr?: string,     // Arabic caption
  descriptionEn?: string,     // English caption
  poster?: string,            // optional image storageId shown before playback
  isActive: boolean,          // hard on/off for the clip
  showOnHome: boolean,        // whether it appears in the homepage video section
  uploadedAt?: number,        // epoch ms
  uploadedBy?: string,        // admin user id
  fileName?: string,          // original file name
  size?: number,              // bytes
  mimeType?: string
}
```

The homepage section shows records where `isActive !== false` **and** `showOnHome !== false` **and** `storageId` is present. Nothing else on the homepage is affected.

## New Convex module — `src/convex/videos.ts`

All admin operations call `requireAdmin(ctx)`; the public query filters `isActive`/`showOnHome`.

| Export | Kind | Purpose |
| --- | --- | --- |
| `getVideos` | query (public) | Active homepage clips with resolved `url` + `posterUrl`. |
| `listAll` | query (admin) | Every record (active or not) with resolved `url` + `posterUrl`, for the management UI. |
| `saveVideo` | mutation (admin) | Upsert a full record by its string `id`. |
| `replaceVideoFile` | mutation (admin) | Swap a video's stored file; deletes the **old storage object** if no other record references it. |
| `deleteVideo` | mutation (admin) | Remove the record and `ctx.storage.delete` its file. |
| `moveVideo` | mutation (admin) | Reorder a clip one position up/down (swaps positions in the `videos` array). |
| `deleteVideos` | mutation (admin) | Bulk-remove several records and `ctx.storage.delete` their files (used by the list's bulk action). |

Reading/writing uses `db.query("siteSettings").withIndex("by_key", …)` with the same pattern as `homepageSettings.ts`; on first write the `videos` row is inserted, afterwards patched. `resolveStorageUrl` wraps `getUrl` in try/catch so a missing/un-granted file resolves to `""` instead of crashing the query.

## Public section — `src/components/sections/Videos.tsx`

Rendered by `Landing.tsx` exactly between `InformationCard` and `Procedures`, wrapped in `ErrorBoundary` and gated by the existing `isVisible("videos")` visibility system (default **visible**; toggle added to the dashboard Visibility editor).

- **Header** reads `siteSettings["videoSection"]` via the existing `getSectionContent(sectionKey)` with full AR/EN fallback to `t.videos.*`, styled like the other sections (badge pill + `font-serif-luxury` highlight + `title-line`).
- **Reels-style cards** — vertical `aspect-[9/16]` glass cards (`glass-card card-glow glow-champagne`), centered grid 1 / sm:2 / lg:3 with `dir` and locale-correct titles/captions.
- **Click the clip to play** — toggles playback in place, **no route change**. A keyboard-accessible play/pause (Enter/Space) is also wired up.
- **Separate, always-visible expand button** — opens a full-screen overlay (`ReelsExpand`) with a close button, backdrop click to close, Escape to close, body scroll-lock, and a native-controls `<video>` (volume / seek / fullscreen — mobile appropriate).
- **Autoplay with sound on scroll** — once ≥50% of a card enters the viewport (`useInView`, `threshold: 0.5`) the clip starts automatically **with sound** and pauses when scrolled out of view. If the browser's autoplay policy blocks unmuted playback before a user gesture, it falls back to a muted start (the mute control stays toggled); audio only ever starts from an explicit user gesture (play/mute button). Posters render first so cards are still visual before playback begins.
- **Performance / lazy** — `preload="none"` (clip fetches only on play), poster-first rendering, short clips looped (`loop` + `playsInline` for iOS), fade-in via the existing `useInView` + framer-motion pattern.
- **Custom mini controls** — play/pause, mute/unmute, expand in a bottom glass gradient bar, using logical RTL-safe icon flipping (`rtl:-scale-x-100`).

## Admin editor — `src/components/dashboard/VideoEditor.tsx` (+ `HomepageCMSTab.tsx`)

A new built-in section appears in **Dashboard → Homepage content** (no new nav tab). It renders:

1. The existing `SectionHeaderEditor` for `videoSection` (Arabic/English badge, title, highlight, subtitle).
2. `VideoSectionEditor`:

- **List** of records: 9:16 poster thumbnail (icon fallback), local language title, file name + size, and quick actions per row:
  - **Active toggle** (eye icon) — hard enable/disable.
  - **Show on homepage toggle** (home icon) — filters the public section only.
  - **Move up / down** — reorders clips (order = homepage display order).
  - **Row checkbox** — for the bulk toolbar (select all / clear, N-selected count, grouped delete with its own confirm dialog).
  - **Preview** — inline `<video>` (native controls) on/off.
  - **Edit / Delete**.
- **Bulk toolbar** (visible when more than one clip exists): select-all checkbox, live `selected/total` counter, and a disabled-until-selection «حذف المحدد (N)» button backed by `deleteVideos`.
- **Add / Edit form** (`VideoForm`):
  - Title & description in Arabic and English.
  - **Video file field** — `MP4 / WebM / MOV`, `≤ 50MB`, with a concise 9:16 practical hint. In **new** mode the file is required; in **edit** mode picking a new file becomes a **replace** (old storage object is deleted server-side).
  - **Preview before save** — a local `<video>` plays the selected unsaved file via a blob URL (clearly labeled «لم يُحفظ بعد»), or the saved file when editing.
  - **Poster selector** — existing `MediaSelector` (image storageId from the media library); recommended 9:16 matching frame.
  - **Generate poster from video** — one-click button that captures a representative frame (≈0.5s in) from the selected/new or saved video via a hidden `<video>` + `<canvas>`, uploads it through the signed `media.generateUploadUrl` path (`useImageUpload`), and fills the poster field automatically.
  - **Active / Show-on-home** checkboxes with helper text.
  - Save runs upload (signed URL) → `replaceVideoFile` (if replacing) → `saveVideo`, with Arabic success/error toasts.
- **Delete** uses the shared `ConfirmDialog` («حذف الفيديو؟») and removes the record + storage file.

## Supporting changes

| File | Change |
| --- | --- |
| `src/convex/_generated/api.d.ts` | Manually registered the new `videos` module in `fullApi` (`api.js` is `anyApi`, so no runtime change needed). |
| `src/convex/media.ts` | `checkReferences` now also scans video records and reports posters in use (avoids breaking a poster when deleting images from the library). |
| `src/hooks/use-upload.ts` | New `useVideoUpload` — same signed-upload flow as `useImageUpload`, 50MB cap, MP4/WebM/MOV validation, returns `{ storageId, name, type, size }`; never calls `recordUpload` (videos are not library images). `captureVideoFrame` helper lives in `VideoEditor.tsx`. |
| `src/pages/Landing.tsx` | Imported `Videos` and inserted `<div className="cvv">{isVisible("videos") && <Videos />}</div>` between InformationCard and Procedures. |
| `src/components/dashboard/HomepageCMSTab.tsx` | Added `videos` section entry + editor wiring; exported `SectionHeaderEditor` for reuse; added `videos` toggle to the Visibility editor (`homepageCMS.videos` defaults to visible). |
| `src/locales/ar.json`, `en.json` | New top-level `videos` block (badge/title/titleHighlight/subtitle/noVideos/play/pause/mute/unmute/expand/close); `admin.homepage.videosTitle`; full `admin.videos` block; `admin.toast.videoSaved/videoSaveError/videoDeleted/videoDeleteError`; `admin.confirm.deleteVideoTitle/deleteVideoMsg`. Admin list additions: `total/active/inactive/onHome/offHome` stats, `moveUp/moveDown`, `select/selectAll/clearSelection`, `deleteSelected`/`bulkDeleteTitle/deleteVideoMsg`, `autoPoster/generatingPoster/posterReady/posterFailed`. Arabic is authoritative per repo convention. |

## Constraints honored

- ✅ No Hero changes. ✅ No reordering of existing sections.
- ✅ No new tables / schema / migration / rebuild. ✅ Reuses existing Convex storage + signed upload URL (files never cross a mutation boundary).
- ✅ No auth / patient-account changes; admin actions gated by the existing `requireAdmin`.
- ✅ No new dependencies. ✅ No changes to existing CMS content shape.
- ✅ RTL + AR preserved (`dir` from `useI18n`, logical spacing, RTL icon flips). LTR + EN preserved.
- ✅ Mobile-first controls; desktop cards stay within the page-width card grid.

## Verification

```
npx tsc -b         ✔ clean
eslint .           ✔ clean
vite build         ✔ built in ~8s
vitest run         ✔ 3 files, 12/12 tests passed
```

> **Fix note (2026-09-22):** the first `06bab65` build failed on Vercel with
> `TS2339: Property 'showOnHome' does not exist on type …` in `VideoEditor.tsx`
> (the stats bar referenced `admin.videos.showOnHome`, which is not an i18n key —
> the correct key is `admin.videos.onHome`). Fixed and re-pushed.

## Deployment note (important)

The new Convex functions in `src/convex/videos.ts` are **local only** — this workspace has no deployment environment, so they were **not deployed**. Before the feature goes live (and before the admin UI can call `api.videos.*`), run:

```
# from the project/Convex root
npx convex deploy    # push functions to production
# or: npx convex dev # local dev loop
```

No schema migration is required. A typical `npx convex dev`/`deploy` will also regenerate `_generated`; the manual `api.d.ts` edit already matches what codegen would produce, and `api.js` is `anyApi` so the client works without regeneration.

### Manual QA checklist (after deploy)

1. Dashboard → Homepage content → «فيديوهات (Reels)» → add a video (MP4), poster optional → Save.
2. Homepage (AR & EN, mobile + desktop): section shows between InformationCard and Procedures; poster shows first; cards **autoplay with sound once 50% visible** (muted fallback only if the browser blocks unmuted autoplay) and pause when scrolled away; tapping the clip toggles playback in place (no navigation); expand button opens the large viewer with volume/seek/close.
3. Replace the file on an existing video → old storage object removed (verify no duplicate in Convex dashboard; storage usage drops).
4. Toggle «ظاهر في الصفحة الرئيسية» and «مفعّل» → reflects immediately on the homepage.
5. In the admin list: **move arrow** reorders a clip (change persists to the homepage order); select a few rows → bulk toolbar shows `N/total` → confirm bullets dialog → records + files gone together.
6. Auto-poster: open the edit form of a saved video (or pick a new file) → «توليد الغلاف من الفيديو» → poster field auto-fills from a captured frame.
7. Try deleting a poster image in the Media library → reference warning mentions the video poster.
8. Try a >50MB or non-video file → localized error, no upload.

## Deferred / known limitations

- **Storage cleanup is best-effort**: `storage.delete` failures (e.g. file already gone, or a "still referenced" guard triggered by another record) are swallowed so the UI never breaks; a manual storage sweep may occasionally be needed.
- **Poster remains optional by design** (brief allows it); without one the card shows a stylish dark placeholder with a play affordance — the auto-poster button is a convenience, not a hard requirement.
- Auto-poster generation captures a frame server-side URL or object URL, so it needs the video to be loaded/cached by the browser; very large or unusual files may fail gracefully (button stays functional; poster can be picked manually instead).
- `MOV` is accepted client-side but shouldn't be relied on for playback on iOS; `MP4 (H.264)` remains the recommended upload format.