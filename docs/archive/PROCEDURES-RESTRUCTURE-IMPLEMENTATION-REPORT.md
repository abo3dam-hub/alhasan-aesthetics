# Procedures Restructure + Homepage Information Card — Implementation Report

> **🗄️ HISTORICAL SNAPSHOT — archived.** Written 2026-09-13; reflects the project **as of that date**, not now. For the current state see `README.md`, `PROJECT-MASTER-HANDOVER.md`, and `report 9-14-26.md` (latest refresh 2026-09-18).

Date: 2026-09-13
Commit: `feat: restructure procedures and add homepage information card`

---

## 1. What changed

### Procedures tree
- The 3 combined procedures were split into independent, top-level procedures:
  - `upper-lower-eyelid-lift` → `upper-eyelid-lift` + `lower-eyelid-lift`
  - `arm-thigh-lift` → `arm-lift` + `thigh-lift`
  - `breast-augmentation-reduction` → `breast-augmentation` + `breast-reduction-and-lift`
- `breast-reduction-and-lift` («تصغير وشد الثدي / Breast Reduction and Lift») became a **group page** with 2 sub-options:
  - `breast-lift` («شد الثدي / Breast Lift»)
  - `breast-lift-with-implants` («شد الثدي مع بروتيز / Breast Lift with Implants») — both carry `parentSlug: "breast-reduction-and-lift"`.
- New CMS procedure added: `prominent-ear-correction` («تبارز الصيوان / Prominent Ear Correction»).

### Old URLs never break
- Legacy records are **not deleted**. On migration they are set `isActive: false` and keep a `supersededBy` pointer to their replacements.
- Visiting an old URL (e.g. `/procedure/upper-lower-eyelid-lift`) renders a **"reorganized" notice page** listing links to the new procedures, and is tagged `noindex, nofollow`.
- Visiting any other unpublished/inactive procedure still returns the normal not-found page.

### Homepage Information Card
- New CMS-managed section placed **between About and Our Procedures**.
- Default Arabic title (exact): **«معلومات على كل سيدة تنوي إجراء جراحة تجميلية معرفتها»**, EN: "Information Every Woman Considering Cosmetic Surgery Should Know". Badge «معلومات مهمة / Patient Guide», body content, optional image, and optional CTA button (default `/consultation`).
- Entirely editable from the Dashboard (Homepage CMS → Information Card) including image (uses the existing Media / Convex Storage flow and the canonical `storageId` references) and a section-visibility toggle.
- Only rendered when enabled + CMS data is present; hidden while loading (no layout flash).

---

## 2. Data model & schema
`src/convex/schema.ts` — minimal, non-breaking additions to the `procedures` table:
- `parentSlug: v.optional(v.string())` — sub-procedure belonging to a group page.
- `supersededBy: v.optional(v.array(v.string()))` — legacy-record pointer to replacement slugs.
- New index `by_parentSlug` (created for convenience; runtime queries deliberately do **not** depend on it yet, so nothing breaks if it lags on the live deployment).

All front-end and seed/insert code keeps `storageId` as the canonical image reference — no new media system was introduced.

---

## 3. Dashboard additions
- **Overview → Migrate Procedure Structure** button:
  - Inserts any missing new procedure (idempotent by slug).
  - Deactivates the 3 legacy combined records + sets their `supersededBy`.
  - Seeds the `informationCard` site-setting and adds `informationCard: true` to the homepage visibility object.
  - Shows a live status pill-row (new procedures count, sub-procedures, legacy records, whether any old combined record is still active). Admin-only mutation.
- **Procedures tab → Add/Edit Procedure form**: new **"Parent Procedure"** select to attach a procedure as a sub-option of a group (e.g. `parentSlug: breast-reduction-and-lift`).

## 4. Frontend
- `Landing.tsx`: renders `<InformationCard />` between `<About />` and `<Procedures />`, gated by the `informationCard` homepage-visibility flag.
- `InformationCard.tsx`: new luxury glass section (image side + content side), RTL-aware, with CTA.
- `HomepageCMSTab.tsx`: new "Information Card (Patient Guide)" editor + visibility toggle (AR/EN badge, title, body separated by blank lines, image picker, CTA text/link/enabled).
- `ProcedureDetail.tsx`:
  - Sub-options of a group render as "خيارات العلاج / Treatment Options" cards on the parent page.
  - Sub-pages show a "جزء من «…» / Part of …" breadcrumb linking to the parent, and the back-link goes to the parent.
  - Legacy/inactive records render the reorganization notice (noindex).
  - BreadcrumbList structured data now includes the parent level for sub-pages.
  - `robots: noindex` meta is injected for inactive/legacy records.
- Queries added to `src/convex/procedures.ts`: `listChildren`, `getBySlugs`; `listActive`/`listFeatured` exclude sub-procedures (they are presented via the parent page).

## 5. SEO / routing
- `src/convex/http.ts`: fixed the wrong `active !== false` check on `{ active?: boolean }` (the real field is `isActive`) so the dynamic sitemap correctly lists procedures.
- `public/sitemap.xml` (static fallback): replaced combined slugs with the new split slugs + the 2 breast sub-options + prominent-ear-correction.
- Old combined slug URLs still resolve (reorganization notice) without a hard 404 — routing stays on `/procedure/:slug`.

## 6. Validation
- `npm run build` (`tsc -b && vite build`): **passes**.
- `npm run lint` (`eslint .`): **net-zero** vs. the pre-existing baseline (167 pre-existing errors at HEAD; same count now; none introduced by this work). The 3 errors initially added by the new editor were cleaned up.
- `_generated` files: `npx convex codegen` cannot run from this environment (anonymous deployment + remote `VLY_CONVEX_AUTH_ISSUER` env check). Because the generated dir is git-tracked here, `_generated/api.d.ts` was patched by hand to include the `migration` module; `dataModel.d.ts`/`server.d.ts` already derive from `schema.ts` so they picked up `parentSlug`/`supersededBy` automatically. The next real deploy will regenerate everything and match.

## 7. Manual actions required after deploy
1. Deploy this commit.
2. Open the **Dashboard → Overview** and click **"Run Structure Migration"** (admin only). This transforms the live production DB (it cannot be run from a script because Convex mutations need an authenticated admin).
3. In Homepage CMS, optionally upload an image for the Information Card and review the AR/EN copy.
4. Confirm the archives/consultation selectors and footer now point at the new slugs.

## Caveats / notes
- The new procedures use `order` values 11–19 so they sort **after** the existing production procedures (orders 1–10); on a fresh install they still sort correctly among themselves.
- `seedProcedures`/`seedAll` now seed the **new** procedure set only (the 7 pre-existing top-level procedures already live in production and are intentionally not re-defined/overwritten in code). A brand-new blank Convex deployment would therefore only auto-seed the restructured set — run the existing "Seed Full Data" there if the full catalogue is desired.
- The Information Card's `prominent-ear-correction` description intentionally avoids invented medical claims and notes that detailed content will be completed by the clinic (`سيكتمل المحتوى التفصيلي لهذا الإجراء من إدارة العيادة`).