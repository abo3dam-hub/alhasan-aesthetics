# ADMIN-UX-AUDIT-AND-IMPROVEMENT-PLAN

**Project:** Dr. Al Hasan Al Saiem — Aesthetic Surgery Website
**Scope:** Admin Dashboard / CMS (`/dashboard`) and related admin flows (`/auth`)
**Audience considered:** Dr. Al Hasan (owner) and his clinic staff — **non-technical, Arabic-first**
**Date of audit:** 2026-09-21
**Method:** Static code review of the deployed codebase at `HEAD 4601f52` (dashboard modularized in `dc29c4e`). Rendering claims are based on code inspection; a live-browser verification pass was **not** performed.

---

## 1. Executive Summary

The dashboard that the clinic team will use every day is functionally complete and freshly modularized — 11 working tabs covering procedures, before/after, testimonials, FAQ, articles, homepage CMS, SEO, analytics, media, and settings. But it was **built as a developer tool, in English, on a site whose users are Arabic-speaking and whose audience-facing content is Arabic-first**. The result is a dashboard that is **partially Arabic by accident**: because the app defaults to locale `ar` and sets `document.documentElement.dir = "rtl"` (`src/i18n/index.tsx`), the whole admin UI renders inside a right-to-left document while displaying English-only labels, buttons, validation messages, toasts, and confirmation dialogs.

The five most important findings, in order:

1. **Critical — The admin UI is 100% hard-coded English.** Every dashboard tab, the auth screen, toasts, confirms, and upload errors are English strings. The site's i18n system (`src/i18n`, `src/locales/ar.json` / `en.json`) covers public pages only; no dashboard keys exist.
2. **Critical — Destructive/internals operations sit on the operator's first screen.** "Overview" exposes **Seed CMS Settings, Seed Default Procedures, Seed Full Database, Run Structure Migration** (which deactivates procedures) and a raw status view with English slugs (`upper-lower-eyelid-lift`, ...) — dangerous, developer-facing actions with no role gating above the admin check.
3. **High — Information architecture is a flat list of 11 technical labels** ("Overview", "Analytics", "Before & After", "FAQ", "SEO", ...) with no grouping, a duplicated `Settings` icon, and no way to deep-link or bookmark a tab (tab state is local `useState` in `src/pages/Dashboard.tsx`).
4. **High — Feedback is inconsistent and English.** Success toasts, error toasts, and the 5 different native browser `confirm()` dialogs used across tabs are all English; loading vs. empty states are indistinguishable in Procedures/Before-After/Testimonials/FAQ (shows "No … yet." while still loading).
5. **High — Technical leakage.** Slugs, "Canonical Base URL", "storageId", font-mono URL chips, "Uploading…/KB/MB" sizes, event-type codes ("whatsapp"/"cta"), and raw `Admin/Member/User` role badges are exposed to a non-technical operator.

**Bottom line:** No functional rebuild is needed. The tab logic and every Convex query/mutation work well today. The gap is *presentation and language* — a highly tractable, low-risk, UI/UX-only work program whose net effect is a dashboard that the clinic staff can actually operate in their own language, on their phones, without fear of the red buttons.

---

## 2. Current Admin Structure (verified)

- **Entry / routes** (`src/main.tsx`): Landing → `/auth` → `/dashboard` (lazy, wrapped by `RequireAuth`). `RequireAuth` redirects unauthenticated users to `/auth?returnTo=/dashboard`.
- **Shell** (`src/pages/Dashboard.tsx`): a thin component holding `useState<Tab>` for the active tab and rendering `DashboardLayout` + the active tab. No per-tab URL, so refreshing always lands on Overview and back/forward navigation exits the dashboard.
- **Layout** (`src/components/dashboard/DashboardLayout.tsx`): sticky header (`h-16`) with "Admin Dashboard", the signed-in user's name, and a "Sign Out" button (icon-only on mobile via `hidden sm:inline`).
- **Navigation** (`src/components/dashboard/DashboardNav.tsx`): the 11-tab union `overview | analytics | homepage | procedures | beforeAfter | testimonials | faq | blog | seo | settings | media`. Mobile: horizontal scrollable pill row (`overflow-x-auto`); desktop: vertical sidebar `lg:w-56`. Icons: `Settings` is reused for homepage, SEO, and settings; `ImageIcon` is reused for before/after and media.
- **Tabs** (all in `src/components/dashboard/`):
  - `DashboardOverviewTab.tsx` — 4 stat cards; "CMS Health Check" grid with OK/EMPTY badges; Seed CMS Settings; Seed Default Procedures; Migrate Procedure Structure (+ Run / Check Status showing "legacy records"; hides only behind "asked to run"); Seed Full Database. Non-admin visitors get a warning card.
  - `DashboardAnalyticsTab.tsx` — read-only 30-day stats: visits (total/today/7d/unique sessions), WhatsApp & CTA click conversions, 14-day bar chart, countries, "Top pages" (font-mono paths), "Top actions" (font-mono labels + tiny raw event-type codes).
  - `HomepageCMSTab.tsx` — accordion of section editors (Hero, About, Statistics, Information Card, CTA, Footer, Section Headers, Visibility) with AR fields using `dir="rtl"` and English labels such as "Badge (AR)", "Title (AR)".
  - `DashboardProceduresTab.tsx` — search + active filter; "Normalize Icons" and "Fill SEO (AR/EN)" maintenance buttons; "Add Procedure"; long single form including required **Slug**, free-text Category, Parent Procedure select showing `titleEn (slug)`, Icon search-picker (English tooltips), 6 image fields (Main/Before/After/OG + gallery), SEO block, "Featured on homepage" checkbox.
  - `DashboardBeforeAfterTab.tsx` — add/edit form (Title EN/AR, Procedure Type select, Description EN/AR, Patient Age); `confirm("Delete this case?")`.
  - `DashboardTestimonialsTab.tsx` — add/edit (Name/Text EN/AR, Rating 1–5, free-text "Procedure Type" e.g. "rhinoplasty", Avatar, Result Photos); `confirm("Delete this testimonial?")`.
  - `DashboardFaqTab.tsx` — add/edit (Question/Answer EN/AR, free-text Category "e.g. general, pricing, recovery"); `confirm("Delete this FAQ?")`.
  - `ArticlesTab.tsx` — the most polished: distinct loading, empty, and search-empty states; publish toggle; form (Title, Slug, Category EN/AR, Reading minutes, Related procedure, Excerpt EN/AR, Body EN/AR with `## ` heading guidance, SEO fields, Published/Featured checkboxes).
  - `SEOTab.tsx` — Site Title (EN/AR), Meta Description (EN/AR), **OG Image**, **Canonical Base URL** (default `https://dralhasanalsaiem.com`).
  - `DashboardSettingsTab.tsx` — **two save buttons** ("Save All Settings" top + "Save Settings" bottom) around Doctor/Clinic Info, Doctor Profile, Hero Section, Working Hours, Social Media; plus an "Admin Accounts / إدارة حسابات الإدارة" block (promote-by-email, role badges Admin/Member/User, 2-admin cap enforced in Convex).
  - `DashboardMediaTab.tsx` — upload widget (drag/drop), "Repair Media URLs", `MediaDiagnostics`, search, gallery grid, preview modal showing raw URL field, "Use in Procedure" button (actually just copies the URL), and a delete dialog that checks references.
- **Shared** (`src/components/`): `MediaSelector.tsx`, `ResolvedImage.tsx`, `ImageGalleryInput.tsx`, `MediaLibraryModal.tsx` ("Media Library" title), `MediaDiagnostics.tsx` (storageId/URL/resolution).

---

## 3. What Should Stay

Do not rebuild, restyle blindly, or re-modularize again. The following are working and worth preserving:

- **The modular per-tab split** from `dc29c4e`. Keep one component per tab; only edit strings/labels inside.
- **The thin shell** — `Dashboard.tsx` as a coordinator with `DashboardLayout` + `DashboardNav` separation.
- **Existing business logic & Convex layer** — every query/mutation (procedures, beforeAfter, testimonials, faq, articles, media, siteSettings, users, analytics, seed, migration, loginRateLimit). No data-flow changes are required by the UX work.
- **Settings save-as-merge** — `handleSave` spreads `...settings` so unrelated fields are preserved. Keep this behavior.
- **Media delete reference-check dialog** — warns before deleting referenced images. Keep, translate it.
- **Articles tab's state handling** — the one place loading/empty/search-empty are distinct. Use it as the pattern for the other tabs.
- **Read-only Analytics tab** — safe for an operator to look at; only wording needs translation.
- **Convex-side auth hardening** (rate limiting, 2-admin cap) — untouched by UX scope.
- **The Arabic helper hints already in `MediaSelector`** (e.g. the 1:1 / 1200×630 guidance) — good examples of the desired tone; extend them, don't remove them.
- **`RequireAuth` redirect flow** with `returnTo` — keep and (later) localize the auth page.

---

## 4. Problems and Recommendations

Legend — **Dif:** Difficulty (Easy / Medium / Large). **Type:** UI-only (strings/classes) / UX behavior (structure/flow changes, no data impact) / Behavior+data (touches save logic or data). **Safe in UX-only scope?** Yes / Partial / No.

### 4.1 Critical

**C-01 | Dashboard is 100% English, rendered inside an RTL (Arabic) document**
- Category: Terminology · Language
- Files: every file in `src/components/dashboard/`, `src/pages/Auth.tsx`, `src/components/Media*.tsx`, `src/hooks/use-upload.ts`, toasts/confirms throughout.
- Behavior: site defaults to `ar` and `I18nProvider` sets `dir="rtl"` on `<html>`. The public site is Arabic-first (`t.*` everywhere), but **no dashboard component calls `useI18n`**; `src/locales/ar.json`/`en.json` contain zero admin keys. So the clinic team sees English text in a right-to-left layout, with mixed-directions placeholders (e.g. `placeholder="جراحة تجميلية وتجميلية"` next to an English label).
- Why confusing: Same site is Arabic for patients and English for staff; bidi mixed English-in-RTL containers are disorienting; a staff member can mistranslate fields like "Badge (AR)".
- Recommendation: Make Arabic the default admin UI language using the existing i18n infra. Two workable approaches:
  1. *Recommended:* add an `admin` namespace to `src/locales/{ar,en}.json` and a small `useAdminText()` hook (or reuse `useI18n`) that resolves dashboard strings; default to `ar` regardless of site locale (dashboard admin is Arabic-first; a locale toggle can come later).
  2. *Minimal-risk interim:* standardize on short bilingual labels ("الاسم (العربية)"), which is what several fields already implicitly do. Good stop-gap, not the end state.
- Type: UI-only (labels + text source). Safe: **Yes**.
- Risks: larger diff; needs a consistent glossary (Section 5). No risk of data change.

**C-02 | Auth screen is English-only**
- Category: Terminology · Language
- File: `src/pages/Auth.tsx`
- Behavior: "Admin Sign In" / "Create Admin Account" / "Register an administrator account. Registration closes after two admin accounts exist." / "Don't have an account? Create one" — English; earlier audit already tracked this as unresolved (TD-10).
- Why confusing: This is the very first screen a non-technical Arabic user meets; it also renders RTL (default `ar`) with English text.
- Recommendation: localize it (Arabic default). Wire the login-rate-limit messages and the "Registration closes after two admin accounts" note to Arabic. Type: UI-only. Safe: **Yes**.

### 4.2 High

**H-01 | Overview = operator home + developer tool room, mixed**
- Category: Home Screen presence; Technical leakage
- File: `src/components/dashboard/DashboardOverviewTab.tsx`
- Behavior: Welcome screen contains (a) useful counts; (b) "CMS Health Check" (OK/EMPTY); (c) three seed buttons; (d) **Run Structure Migration** / **Check Status** with English slugs and "legacy records" chips. Nothing is hidden behind a confirmation beyond the mutation itself.
- Why confusing: A staff member editing content is one click away from deactivating production procedures ("deactivates the 3 old combined ones …"). "Seed"/"EMPTY"/"OK" are developer vocabulary.
- Recommendation: Partition Overview into two zones:
  1. **Operator zone (visible by default):** greeting, stat cards, quick links to the 4 most-used tabs, and an *Arabic* "حالة محتوى الموقع" health strip (labels: الإجراءات، قبل وبعد، آراء المرضى، ... ؛ قيمة: موجود/فارغ → "محتوى ناقص").
  2. **"خيارات متقدمة" (Advanced)** — collapsible/collapsed by default, with a second confirm. Move seeds + migration + health/status internals here, unchanged in what they call.
- Type: UX behavior. Safe: **Yes** (no mutation calls moved/deleted, only relocated + hidden).
- Risks: keeping the migration button anywhere on this screen still needs a guard → gate it to admin role (already the case for all mutations) + explicit typed confirmation with Arabic text.

**H-02 | Flat 11-tab IA with no grouping, duplicated icons, no deep link**
- Category: Navigation & IA; Mobile
- Files: `src/components/dashboard/DashboardNav.tsx`, `src/pages/Dashboard.tsx`
- Behavior: 11 flat items; same `Settings` icon on Homepage/SEO/Settings; `ImageIcon` on Before&After/Media; mobile is a horizontally scrolling pill row with no group labels and no current-position indicator beyond the pill highlight.
- Why confusing: "SEO" and "Settings" are indistinguishable by icon; an operator can't find "المقالات" by logic of where it might live; no way to bookmark/share/refresh-to a tab.
- Recommendation (non-destructive):
  1. Group nav items under Arabic section headers (labels only, order only — see Section 6). Same 11 tabs underneath.
  2. Replace duplicated icons (`Settings` → distinct icons for homepage/SEO/settings; e.g. `Home`, `SearchCheck`, `Settings`).
  3. Add tab deep-linking via `#analytics` etc. read in `Dashboard.tsx` on mount, so refresh/back share keeps the place. Behavior is cosmetic; keep `useState` as the single source driven by URL hash.
- Type: UX behavior. Safe: **Yes** (no route changes, no data changes).
- Risks: none to data; only that icon swaps shouldn't touch business logic.

**H-03 | Loading vs empty states are conflated**
- Category: Feedback
- Files: `DashboardProceduresTab.tsx`, `DashboardBeforeAfterTab.tsx`, `DashboardTestimonialsTab.tsx`, `DashboardFaqTab.tsx` (empty shown via `!rows || rows.length === 0`), vs `ArticlesTab.tsx` (has "Loading articles...").
- Behavior: On slow loads, the dashboard flashes "No procedures yet."/"No before/after cases yet."/"No testimonials yet."/"No FAQ items yet." to a user who *knows* they created content minutes ago.
- Why confusing: looks like data loss; erodes trust.
- Recommendation: replicate ArticlesTab pattern — show a skeleton or "جارٍ التحميل…" while `useQuery` returns `undefined`, and reserve the empty message for a real empty result. Type: UI-only. Safe: **Yes**.

**H-04 | Deletion confirmation is inconsistent + English browser dialogs**
- Category: Feedback; Consistency
- Files: `DashboardProceduresTab.tsx` (`confirm("Are you sure you want to delete this procedure?")`), `DashboardBeforeAfterTab.tsx` ("Delete this case?"), `DashboardTestimonialsTab.tsx` ("Delete this testimonial?"), `DashboardFaqTab.tsx` ("Delete this FAQ?") vs `DashboardMediaTab.tsx` (custom reference-check dialog).
- Behavior: five different phrasings; native `confirm()` dialogs are unstyled, browser-language (not site-language), and inconsistent with the media tab's custom modal.
- Recommendation: one shared `ConfirmDialog` component (already-available Radix `AlertDialog`), wrapping the existing delete mutations; Arabic text: title "حذف …؟" body "سيتم حذف هذا نهائيًا ولا يمكن التراجع." actions "حذف" / "إلغاء". Optionally reuse the media tab's reference-check call for procedures (procedures are referenced by before/after cases and articles).
- Type: UX behavior. Safe: **Yes**. Risks: ensure confirmations run the *same* mutation handlers they replace.

**H-05 | Analytics leaks technical labels and raw event codes**
- Category: Technical leakage
- File: `src/components/dashboard/DashboardAnalyticsTab.tsx`
- Behavior: "Unique sessions (30d)", "Top pages" in `font-mono` chips (e.g. `/procedures/rhinoplasty`), "Top actions" showing `e.type` codes (`whatsapp`, `cta`) next to `e.label`, ISO date fragments in the chart.
- Why confusing: codes and URLs are noise to an operator; "Tracked actions" is unclear.
- Recommendation: Arabic labels (كل الزيارات ٣٠ يومًا، اليوم، آخر ٧ أيام، زوار فريدون؛ نقرات واتساب؛ نقرات الحجز؛ الصفحات الأكثر زيارة؛ أكثر الأزرار نقرًا), drop the raw `e.type` chip, and render friendly action names instead. Keep the chart/table logic. Type: UI-only. Safe: **Yes**.

**H-06 | Expressing procedures/FAQ/analytics in English + duplicated "hero" editing**
- Category: Consistency; Home screen
- Files: `DashboardSettingsTab.tsx` (Hero Section card with `heroTitleAr/En`, `heroSubtitleAr/En`) and `HomepageCMSTab.tsx` (HeroEditor with Badge/Title/Highlight/Description/CTAs/Trust badges).
- Behavior: the hero can be edited from two places with different overlapping field sets; Settings also has **two** save buttons ("Save All Settings" at top, "Save Settings" at bottom) for one form.
- Why confusing: staff edit hero text in Settings, save, and `HomepageCMSTab` (or the actual homepage) may still show different text; the two save buttons look like separate actions.
- Recommendation: in the first pass, keep both but (a) collapse Settings' "Hero Section" card into an informational link to Homepage→Hero (avoid editing in two places), and (b) keep a single sticky save action at the bottom. The merge behavior (`...settings`) must be preserved.
- Type: UX behavior. Safe: **Partial** — removing the hero fields from Settings would stop them from being saved; do **not** remove the fields in the UX pass; only re-label/link. Tag as needing a product decision.

**H-07 | Forms surface technical fields to non-technical users**
- Category: Forms; Technical leakage
- Files: `DashboardProceduresTab.tsx` (required **Slug**, free-text Category `placeholder="face"`, Parent select showing `titleEn (slug)`, Icon picker English tooltips), `ArticlesTab.tsx` (required **Slug**, Category as free text), `SEOTab.tsx` (**Canonical Base URL**), `DashboardFaqTab.tsx` ("Category (optional)" `placeholder="e.g. general, pricing, recovery"`), `DashboardTestimonialsTab.tsx` (free-text "Procedure Type" `placeholder="e.g. rhinoplasty"`).
- Behavior: an operator must know what a "slug" is and type valid values, or the required-field validation fails on save with no explanation.
- Recommendation (UX-first, no logic change): turn every technical string into Arabic + a one-line help text; e.g. Slug → "الرابط في العنوان (اختياري — يُترك عادةً كما هو)" (still `required` technically; safe to keep required if prefilled), Category → "التصنيف", Canonical Base URL → move behind "خيارات متقدمة" (advanced). Icon picker: add Arabic tooltips. Where feasible *later* (Behavior+data, out of scope): auto-generate slug from Arabic title.
- Type: UI-only for re-labeling / advanced-collapse; Behavior+data for auto-slug. Safe: **Partial** (collapse is safe; auto-slug is not UX-scope).

**H-08 | No obvious required/unsaved-change feedback; save naming is inconsistent**
- Category: Forms; Feedback
- Files: all tab forms (required attributes only; native tooltips only when hovered; English).
- Behavior: "Save Hero", "Save About", "Save CTA", "Save Footer", "Save Visibility", "Save Information Card", "Save Procedure", "Save Settings"/"Save All Settings", "Create…", etc. Required fields lack `*`. No dirty-state or "unsaved changes" warning if the operator navigates away.
- Recommendation: uniform save verb ("حفظ"), visible required markers, and a lightweight beforeunload/tab-switch guard that warns when a form is dirty. The guard is a UX behavior; keep it non-blocking. Type: UX behavior. Safe: **Yes** (no change to what's saved).

### 4.3 Medium

**M-01 | Inconsistent/media feedback in uploads**
- Files: `src/hooks/use-upload.ts`, `DashboardMediaTab.tsx` upload widget
- Behavior: "Uploading…", "Click or drag to upload", "JPEG, PNG, WebP, GIF • Max 5MB"; errors "Please upload a JPEG, PNG, WebP, or GIF image." / "Image must be smaller than 5MB." are English.
- Recommendation: Arabic. Keep the *English brand names* JPEG/PNG/WebP/GIF (universal) and translate the sentence. Type: UI-only. Safe: **Yes**.

**M-02 | Media tab's "Repair Media URLs" and diagnostics are exposed**
- Category: Technical leakage
- Files: `DashboardMediaTab.tsx` ("Repair Media URLs"), `src/components/MediaDiagnostics.tsx` (StatBoxes "Total Records / Storage OK / Storage Missing / URL Empty", `storageId:` / `url:` / `resolved:` rows in mono font).
- Behavior: an operator's first media screen shows internal repair tooling and storage identifiers.
- Recommendation: default-collapse both under "خيارات متقدمة"; keep them functional. Type: UX behavior. Safe: **Yes**.

**M-03 | "Use in Procedure" button in the media preview just copies the URL**
- File: `DashboardMediaTab.tsx` (preview modal)
- Behavior: the button copies the URL to clipboard and toasts "URL copied! Paste it in any image field." — misleading name; the adjacent "Copy" button already copies.
- Recommendation: remove the button, or rename to "نسخ الرابط للمحتوى" with the same toast in Arabic. Keep the URL field visible but move it under "نص متقدم" or accept it (image fields accept pasted URLs today). Type: UI-only. Safe: **Yes**.

**M-04 | Admin accounts section leaks database roles**
- Category: Technical leakage
- File: `DashboardSettingsTab.tsx`
- Behavior: "Current Users", role badges labeled "Admin / Member / User", "Email to Promote", "Promote to Admin", toast "User promoted to admin!" and a row counting "X total".
- Recommendation: Arabic labels ("حسابات المشرفين — السعة القصوى: اثنان", "رفع هذا المستخدم إلى مشرف", "مشرف / مساهم"). Keep the 2-admin cap text prominent. Optionally show only admin + "non-admin" (no "Member/User" taxonomy). Type: UI-only. Safe: **Yes**.

**M-05 | Tab state not persisted (no deep link)**
- Category: Navigation & IA
- Files: `src/pages/Dashboard.tsx`, `DashboardNav.tsx`
- Behavior: refreshing or sharing always lands on Overview; browser back goes to the public site, not the previous tab.
- Recommendation: sync active tab to `location.hash` (read on mount, update on change). Type: UX behavior. Safe: **Yes**. This is the same fix as H-02's item 3 — do them together.

**M-06 | Touch targets are small on mobile**
- Category: Mobile
- Files: list-row actions across tabs (`p-2` icon buttons ≈ 32–34px; up/down reorder icons `h-3 w-3`), media grid hover actions (opacity-0 until hover — invisible/unusable on touch), Settings' stacked `p-1` add/remove buttons.
- Behavior: sub-44px targets; hover-only media grid actions don't work on phones.
- Recommendation: enlarge hit-slopes (add `p-2.5`/`min-h-10`), make action icons `aria-label`-ed, and make media item actions always-visible (or long-press → action sheet) on coarse pointers. Type: UI-only. Safe: **Yes** (use `media (pointer: coarse)` guards).

**M-07 | Empty states are terse English text**
- Category: Feedback
- Files: `.empty`/centered text across tabs ("No procedures yet.", etc.).
- Recommendation: Arabic copy plus a one-line next-action (e.g. "لم تُضف إجراءات بعد — اضغط «إضافة إجراء» للبدء"). Type: UI-only. Safe: **Yes**.

**M-08 | Mirror/icon micro-inconsistencies in RTL**
- Category: Consistency
- Files: physical `mr-2`/`ml-2`, `right-3` absolute close buttons (e.g. media preview `top-3 right-3`), `ArrowRight` usages in Auth.
- Behavior: minor spacing/arrow direction quirks once content is Arabic-first.
- Recommendation: prefer logical utilities (`ms/me`, `end` over `right`). Type: UI-only. Safe: **Yes**. Low priority.

### 4.4 Low

**L-01 | Duplicated icons and small `aria-label`/`title` gaps on icon-only buttons** (procedures/BA/FAQ delete buttons lack `aria-label`). Fix with the M-06 pass. Type: UI-only. Safe: **Yes**.

**L-02 | `DashboardSettingsTab` heading is already bilingual but inconsistent** ("Admin Accounts / إدارة حسابات الإدارة") — decide one standard (Arabic primary, English secondary) and apply everywhere. Type: UI-only.

**L-03 | Placeholders mix languages** (e.g. `placeholder="face"`, `placeholder="e.g. general, pricing, recovery"`, but also Arabic placeholders like `"جراحة تجميلية وتجميلية"`). Normalize to Arabic placeholders with English examples given in parentheses only where truly needed (e.g. image formats).

---

## 5. Arabic Terminology Table (proposed canonical glossary)

| Current (English) | Proposed Arabic (primary) | Notes |
|---|---|---|
| Admin Dashboard | لوحة الإدارة | header title |
| Overview | نظرة عامة | first/last destination |
| Homepage | محتوى الصفحة الرئيسية | clarifies it edits homepage content |
| Procedures | الإجراءات | keep; it's the medical term |
| Before & After | قبل وبعد | |
| Testimonials | آراء المرضى | friendlier than "شهادات" |
| FAQ | الأسئلة الشائعة | |
| Articles | المقالات | or "المدونة" if used beside blog |
| SEO | إعدادات البحث (SEO) | keep acronym in parens for recognition |
| Settings | إعدادات الموقع | |
| Media / Media Library | مكتبة الصور | image-focused |
| Add Procedure | إضافة إجراء | |
| Add Case | إضافة حالة | |
| Add Testimonial | إضافة رأي | |
| Add FAQ | إضافة سؤال | |
| Add Article | إضافة مقال | |
| Save (Procedure/…/Settings/Settings All) | حفظ | single verb; one save per form |
| Cancel | إلغاء | |
| Delete | حذف | |
| Edit | تعديل | |
| Search … | ابحث عن … | |
| All / Active / Inactive | الكل / ظاهر / مخفي | procedures filter — avoids "Active" (semantic is visib.) |
| Published / Drafts | منشور / مسودات | articles |
| Featured on homepage | مميز في الصفحة الرئيسية | |
| Slug | الرابط (Slug) | explanatory; keep technical token visible since it's functional |
| Category | التصنيف | |
| Parent Procedure | إجراء رئيسي (اختياري) | |
| Duration / Recovery | مدة العملية / فترة التعافي | |
| Main/Before/After Image | الصورة الأساسية / قبل / بعد | |
| OG Image (for social sharing) | صورة المشاركة على التواصل (او جي) | |
| SEO Title / Description | عنوان البحث / وصف البحث | |
| Icon | الأيقونة | |
| Rating (1-5) | التقييم (من 1 إلى 5) | |
| Procedure Type | نوع الإجراء | (make it a select, not free text — see H-07) |
| Patient Age | عمر المريض | |
| Working Hours | أوقات العمل | |
| Social Media | حسابات التواصل | |
| Admin Accounts | إدارة حسابات الإدارة | keep current format or "حسابات المشرفين" |
| Promote to Admin | رفع إلى مشرف | |
| Total visits (30d) | إجمالي الزيارات (٣٠ يومًا) | |
| Unique sessions (30d) | الزوار الفريدون (٣٠ يومًا) | |
| WhatsApp clicks | نقرات واتساب | |
| CTA clicks | نقرات الحجز | |
| Top pages / Top actions | الصفحات الأكثر زيارة / أكثر الأزرار نقرًا | |
| Countries | دُوَل الزوار | |
| Repair Media URLs | إصلاح روابط الصور (متقدم) | |
| Media Diagnostics | تشخيص الصور (متقدم) | |
| Seed CMS Settings / Seed Default Procedures / Seed Full Database | تعبئة المحتوى الافتراضي (متقدم) | grouped under advanced; operator wording |
| Run Structure Migration | ترقية بنية البيانات (متقدم) | only with typed confirmation |
| CMS Health Check | حالة محتوى الموقع | |
| OK / EMPTY | جيد / ناقص | |
| No … yet. | لم تُضف … بعد. | empty states |
| Loading … | جارٍ التحميل … | loading states |
| Sign Out | تسجيل الخروج | |

Keep universally-recognized English items as-is: JPEG/PNG/WebP/GIF, WhatsApp, Instagram/Facebook/X/Snapchat/TikTok (brand names), and `SEO` inside parentheses after the Arabic equivalent.

---

## 6. Proposed Target Information Architecture

Same 11 modules, visually grouped, Arabic-first. No route changes and no backend changes.

**Section أ — نظرة عامة**
- نظرة عامة (Overview) *(lavelled home; becomes operator landing)*

**Section إدارة المحتوى (Content)**
- الإجراءات (Procedures)
- قبل وبعد (Before & After)
- آراء المرضى (Testimonials)
- الأسئلة الشائعة (FAQ)
- المقالات (Articles)

**Section الصفحة الرئيسية (Homepage CMS)**
- محتوى الصفحة الرئيسية (Homepage)

**Section التحليلات (Insights)**
- الإحصائيات (Analytics)

**Section الوسائط (Media)**
- مكتبة الصور (Media)

**Section الإعدادات (Settings)**
- إعدادات البحث (SEO)
- إعدادات الموقع (Settings)
- حسابات المشرفين (Admin Accounts) *(could be lifted out of Settings into its own small section, or kept as a labeled card inside Settings — see M-04; UX pass keeps it inside but relabeled)*

**What does NOT change:** the `Tab` union, the component files per tab, all Convex calls.

---

## 7. Recommended Implementation Sequence

Each stage is independently shippable; stages build on each other. Do them in order; run `npm run lint` and `npm run build` (tsc) after each (build script: `tsc -b && vite build`).

1. **Stage 1 — Glossary + admin i18n scaffolding (foundation).**
   - Add `admin.*` keys to `src/locales/ar.json`, `src/locales/en.json`; add `useAdminText()` (thin wrapper, default `ar`).
   - Replace strings in `DashboardNav.tsx`, `DashboardLayout.tsx` first (header "لوحة الإدارة"، "تسجيل الخروج"، grouped section headers — Section 6).
   - **Files:** `DashboardNav.tsx`, `DashboardLayout.tsx`, `src/i18n/*`, `src/locales/*.json`, new `src/hooks/use-admin-text.ts`.
   - **Verify:** lint+build; manual navigate all 11 tabs; confirm labels Arabic, layout unchanged.
2. **Stage 2 — Auth & Overview (the front door).**
   - Localize `Auth.tsx` per glossary (Admin Sign In → تسجيل دخول المشرف, etc.).
   - Partition `DashboardOverviewTab.tsx`: operator zone (greeting + stat cards + quick links + "حالة محتوى الموقع" with Arabic status words) + collapsible "خيارات متقدمة" housing seed/migration/status unchanged.
   - **Files:** `Auth.tsx`, `DashboardOverviewTab.tsx`.
   - **Verify:** login/logout both locales; confirm seeds/migration still reachable under advanced & require typed Arabic confirmation; run one seed in local/dev if permitted.
3. **Stage 3 — Feedback consistency + loading separation.**
   - Shared `ConfirmDialog` (Radix AlertDialog) replacing 5 native confirms; Arabic copy.
   - Loading states for Procedures/BeforeAfter/Testimonials/FAQ (ArticlesTab pattern).
   - Uniform save verbs/required markers; optional dirty guard.
   - **Files:** new `src/components/dashboard/ConfirmDialog.tsx`; edits in `DashboardProceduresTab.tsx`, `DashboardBeforeAfterTab.tsx`, `DashboardTestimonialsTab.tsx`, `DashboardFaqTab.tsx`, new empty-state helper; `ArticlesTab.tsx` (harmonize).
   - **Verify:** deleting each entity type goes through the modal without skipping the earlier mutations; toasts appear translated.
4. **Stage 4 — Analytics + Media polish.**
   - Localize `DashboardAnalyticsTab.tsx`; remove raw `e.type` chips; friendly action names.
   - `DashboardMediaTab.tsx`: Arabic upload/repair/diagnostics wording; move "Repair Media URLs"/diagnostics under advanced (collapsible, default-off); remove or rename "Use in Procedure"; translate delete dialog + reference-check copy.
   - `use-upload.ts` errors → Arabic.
   - **Files:** `DashboardAnalyticsTab.tsx`, `DashboardMediaTab.tsx`, `MediaDiagnostics.tsx` (labels only), `use-upload.ts`, `MediaLibraryModal.tsx`.
   - **Verify:** media upload/delete flow locally; analytics renders with Arabic labels.
5. **Stage 5 — Forms & settings clarity.**
   - Re-label/collapse technical fields per glossary (Procedures, Articles, SEO, Testimonials, FAQ); add help text; Arabic placeholders; **do not** remove any saved fields; keep the Settings merge.
   - Simplify Settings save to one bottom button; relabel Hero Section card → link to Homepage>Hero (fields retained internally).
   - **Files:** `DashboardProceduresTab.tsx`, `ArticlesTab.tsx`, `SEOTab.tsx`, `DashboardTestimonialsTab.tsx`, `DashboardFaqTab.tsx`, `DashboardSettingsTab.tsx`, `HomepageCMSTab.tsx` (labels only).
   - **Verify:** create/edit each entity type in local/dev; confirm saved values identical to before (diff against prod doc counts).
6. **Stage 6 — Mobile & consistency pass.**
   - Touch targets ≥40px; always-visible media actions on coarse pointers; aria-labels; icons dedupe (H-02); logical CSS props.
   - **Files:** nav icon map, list rows, media grid, modal buttons.
   - **Verify:** viewport 360px widths for nav rows, forms, lists, modal button rows.
7. **Stage 7 — Tab deep-linking (H-02 #3 / M-05).**
   - Sync active tab to `location.hash` in `Dashboard.tsx`.
   - **Verify:** refresh/back/share keep the tab.
8. **Stage 8 — Product decisions backlog (out of UX-scope, queued separately):**
   - Auto-generate procedure/article slugs from Arabic titles.
   - Deactivate/remove seed+**migration** surfaces entirely (replace with one-time admin-only utility).
   - Make Testimonials "Procedure Type"/FAQ "Category" actual selects fed from procedures/categories.
   - Consolidated, single-truth hero editing (Settings vs Homepage).

---

## 8. Scope Boundary

**In scope (this plan, all safe):** the seven stages above are UI-only or UX-behavior with no data/schema/route/package changes. Nothing touches Convex queries/mutations, `schema.ts`, auth policies, routes in `main.tsx`, or the public site.

**Out of scope (needs separate approval):**
- Backend/schema/function changes (incl. `seed.ts`, `migration.ts`, `users.ts` role logic, `loginRateLimit.ts`).
- New features or new tabs (no new admin module for consultations/bookings — that flow intentionally lives in public WhatsApp).
- Removing or changing which fields are persisted (e.g. dropping Settings' hero fields; auto-slugging) — these need product sign-off and separate testing.
- Redesign of visual identity/theme; the audit is conservative on visuals by design.
- Adding a language switcher inside the dashboard beyond the Arabic-default label layer (feasible later via the same `admin` namespace).

**Conformance notes:** the deliverables of Stage 8 land as a follow-up workstream, not in this UX pass; the 2-admin cap and login rate limiting remain enforced server-side and are untouched.

---

## 9. Final Recommendation

**Proceed with the plan as-is, staged, starting with Stage 2 (Auth + Overview) after Stage 1 glossary.** The single highest-leverage, lowest-risk change is making the dashboard genuinely Arabic-first: it is a labels-and-copy effort across ~12 component files plus one glossary namespace, needs zero Convex changes, and directly removes the top confusion driver for the clinic team. Pair it immediately with hiding the seed/migration tools behind the advanced section so no content editor can trip over a data-changing button. The remainder (feedback consistency, loading separation, analytics/media wording, forms clarity, mobile touch targets) is steady, low-risk polish that can ship one stage per release without coordination risk across the public site. Only Stage 8 items should wait for explicit product decisions — they are the only ones with data or behavior implications.