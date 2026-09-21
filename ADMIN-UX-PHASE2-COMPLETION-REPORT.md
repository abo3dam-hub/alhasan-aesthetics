# Admin UX — Phase 2 Completion Report

## Scope

Final polish pass over the admin dashboard for the clinic's non-technical Arabic-speaking administrator. **No** Convex schema, database, query, mutation, auth-security, public-site, or i18n-architecture changes were made; **no new dependencies** were added; **no roadmap expansion** (auto-slug, data-model changes, new modules) was implemented. Deferred opportunities are recorded at the bottom.

## What changed

### Phase 1 debt closed — native `confirm()` fully migrated
The 5 remaining `window.confirm(...)` calls from Phase 1 were replaced with the shared [`ConfirmDialog`](./src/components/dashboard/ConfirmDialog.tsx):
- Procedures — `DashboardProceduresTab.tsx`
- Before & After — `DashboardBeforeAfterTab.tsx`
- Testimonials — `DashboardTestimonialsTab.tsx`
- FAQ — `DashboardFaqTab.tsx`
- Articles — `ArticlesTab.tsx`

Each row now opens a Radix alert dialog with the localized strong message, a cancel button, and a destructive confirm that shows the pending "…جارٍ الحذف" state (`isLoading`) while the mutation runs. No new confirmation component was introduced — all tabs share the same one.

### Mobile / touch
- Media-library actions that were **hover-only** (`opacity-0 group-hover:opacity-100`) are now always visible on touch devices via Tailwind's `pointer-coarse:` variant: the Media tab grid overlay (copy/delete), `MediaSelector` thumbnail replace/remove, `ImageGalleryInput` thumbnails (remove), and the library-modal name/gradient overlay.
- Row action buttons across all content tabs enlarged (`p-2` → `p-2.5`) for comfortable touch targets while keeping desktop density.
- Homepage trust-badge rows (`grid-cols-[1fr_1fr_auto_auto]`) now stack on phones (`grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto]`).

### RTL
- `ImageGalleryInput` remove button switched from physical `right-1.5` to logical `end-1.5` (RTL-safe).

### Accessibility
- `aria-label` (Arabic, localized) added to every previously icon-only button: edit, visibility toggle, featured, delete, reorder (move up/down), media copy/delete, preview close, sign-out.
- New localized `common.moveUp` / `common.moveDown` keys replace the leftover English `"Move up"/"Move down"` labels.
- `DashboardNav` buttons carry `aria-current="page"` for the active tab.
- `MediaLibraryModal` item `aria-label` is now localized (`{admin.media.selectImage} — {name}`).

### Arabic-first consistency
- Fixed the Phase 1 label bug where English-language fields were labeled "بالعربية" (`admin.content.*`, per-tab `*En` keys, SEO/settings En keys). En fields now read "…(بالإنجليزية)" and Ar fields "…(بالعربية)" in `ar.json`, mirrored in `en.json`.
- Articles form: replaced leftover English labels/hints (`Title (English)`, "Short summary shown on the blog listing.", "Meta description for search engines.", image hints, English SEO placeholders) with Arabic; the published checkbox note uses the new `articles.publishedHint`.
- Articles list: "Unpublish" tooltip now localized (`articles.unpublish`); the raw `slug` is no longer shown under each article.
- Settings: social-media fields now use Arabic labels (`settings.socialInstagram` … `socialTiktok`); the anonymous-user fallback is `settings.unknownUser` (غير معروف); profile/hero/working-hours placeholders are Arabic.
- Uniform save verb: submit buttons across all forms show "حفظ" (saving → "…جارٍ الحفظ") instead of the edit/add verb mix.
- Auth sign-in fallback error is now `admin.auth.signInFailed`, removing the last English error string on the auth screen.

### Analytical / insight readability
- `DashboardAnalyticsTab` now respects the dashboard locale: formatted numbers, Arabic country names (`Intl.DisplayNames([locale])`), and localized day labels on the chart (was raw `MM-DD`).
- Stat cards show a loading skeleton instead of a bare "…".
- Top-pages list dropped the monospace styling and its English empty text; a new localized hint (`analytics.topPagesHint`) explains the paths are browser-internal links.

### Deep links
- `Dashboard.tsx` now normalizes an invalid hash (e.g. `#/nope`) to `#/overview` so the URL never desyncs from the visible tab. The `replaceState` architecture is kept — no history-spam, unchanged behavior elsewhere.

## Verification (all green, final state)
- `npx tsc -b` — exit 0
- `npm run lint` (eslint .) — exit 0
- `npm run build` — ✓ built in ~5.5s
- `npm test` (vitest) — 3 files / 12 tests passed

## Deferred (documented, intentionally not implemented)
- `HomepageCMSTab` keeps its hardcoded Arabic inline labels and English *content-example* placeholders (e.g. "Your Beauty Deserves"); the file already uses hardcoded Arabic as its established pattern. Full i18n of that page is a separate task — labels are Arabic, the remaining strings demonstrate English content for English-language fields.
- `src/components/ImageUpload.tsx` is dead code (never imported; not used by the dashboard). Left untouched and retained for reference.
- Deep-links use `replaceState`, so the dashboard keeps no history entries: pressing Back leaves the dashboard rather than cycling tabs (acceptable, deliberately kept).
- Login/sign-up errors may still surface **server-provided** English messages when the backend throws one; only the client-side fallback was localized (auth architecture is out of scope).
- `PROJECT_STATUS.md` does not exist in this repo — the repo tracks progress via per-phase completion reports instead (`ADMIN-UX-AUDIT-AND-IMPROVEMENT-PLAN.md` → Phase 1 → this report).
- Auto-slug, data-model changes, and new modules remain out of scope per the improvement plan.

## Files touched (Phase 2)
`src/pages/Dashboard.tsx`, `src/pages/Auth.tsx`, `src/locales/ar.json`, `src/locales/en.json`, `src/components/dashboard/` (`ArticlesTab`, `DashboardAnalyticsTab`, `DashboardBeforeAfterTab`, `DashboardFaqTab`, `DashboardLayout`, `DashboardMediaTab`, `DashboardNav`, `DashboardProceduresTab`, `DashboardSettingsTab`, `DashboardTestimonialsTab`, `HomepageCMSTab`), `src/components/` (`MediaSelector`, `MediaLibraryModal`, `ImageGalleryInput`).