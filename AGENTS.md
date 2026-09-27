# AGENTS.md — working rules for AI agents

Project: **Dr. Al Hasan Al Saiem — Aesthetic & Plastic Surgery website**. Bilingual (AR primary / RTL, EN secondary)
marketing site + admin CMS. React + Vite + Tailwind + shadcn/ui on the front end; **Convex is the only backend**
(database, auth, storage, HTTP actions). Production domain: `dralhasanalsaiem.com`; Convex production deployment:
`kindly-anaconda-422`.

> بالعربية باختصار: الـConvex هو كل الـbackend. أربع وثائق حية فقط بالجذر. الأرشيف في
> `docs/archive/`. وافحص التزامن مع `origin/main` قبل أي مراجعة.

---

## 1. Documentation policy (mandatory)

The repository keeps **exactly four live documents at the repo root**:

| File | Scope |
|---|---|
| `README.md` | Canonical self-contained overview of the current implementation |
| `PROJECT-MASTER-HANDOVER.md` | Full technical handover; §27 holds the CRITICAL INVARIANTS |
| `WORK-LOG.md` | Append-only session log (chronological) |
| `VIDEO-SECTION-FEATURE-REPORT.md` | Reels video section + its admin editor |

Rules:

1. **Never create a new report/audit file at the repo root.** One-time or superseded reports go to
   `docs/archive/` (27 historical reports live there) and stay untouched afterwards.
2. New work updates **only the relevant document(s) of the four** — usually `WORK-LOG.md` for the session
   record and `README.md` / `PROJECT-MASTER-HANDOVER.md` when the implementation itself changed.
3. **Before reviewing, auditing, or asserting the state of the project, always run
   `git fetch origin` and confirm the working copy matches `origin/main`.** Never review a stale local
   checkout; a previous review was invalidated because it ran 15 commits behind.
4. Prefer appending to `WORK-LOG.md` over editing older log entries.

## 2. Verify before claiming anything

```bash
npm ci                     # postinstall runs patch-package (do not remove)
npx tsc --noEmit           # typecheck (no `typecheck` script exists)
npm run lint               # must stay at 0 errors
npm test                   # vitest
npm run build              # tsc -b && vite build
```

`npm` is the canonical package manager (`package-lock.json` is what CI uses via `npm ci`); `bun.lock` is a
leftover — do not introduce bun commands. Do not run `npm run build` or any mutation/seed command against
production data unless explicitly asked.

## 3. Environment gotchas

- **`VITE_CONVEX_URL` missing ⇒ the app connects to production** (`src/main.tsx` falls back to
  `kindly-anaconda-422`). Any local run then writes to real production data — be deliberate.
- **`@convex-dev/auth` is pinned to exactly `0.0.94`.** Version `0.0.95` breaks server-side module evaluation
  on the deployment (`evaluate_push 400 InvalidModules … Uncaught fetch failed`) and rejects every push. Do
  not bump it without testing on a throwaway deployment.
- `patches/harfbuzzjs+0.10.0.patch` is required for Arabic shaping in the OG image action; `postinstall`
  re-applies it. Never delete `patches/` or the `postinstall` script.
- Convex `schemaValidation` is **`true`** (13 tables) — every write is validated.
- Production Convex deploys are owner-approved steps: never run `convex deploy`, `convex login`, seeding, or
  migrations against production without an explicit instruction.

## 4. Critical invariants — read `PROJECT-MASTER-HANDOVER.md` §27 before touching auth, schema, or images

1. `requireAdmin(ctx)` on **every** CMS mutation — the only server-side authorization gate.
2. `storageId` is the canonical image reference; resolve through `ctx.storage.getUrl()`; render with
   `<ResolvedImage>`. Never hand-build storage URLs or use raw `<img src={storageId}>`.
3. `auth.config.ts` has **one** JWT provider (Convex self-issued). Do **not** re-add Freebuff, and do **not**
   switch to `type: "customJwt"` (self-issued tokens carry no `kid` header; sign-in would silently never confirm).
4. `schemaValidation: true` — do not disable it.
5. Homepage CMS content is JSON in the `siteSettings` key/value table — do not add section tables.
6. Public queries are intentionally unauthenticated; only mutations are protected.
7. Two login-capable admin accounts, enforced atomically (`MAX_ADMIN_ACCOUNTS = 2` in `src/convex/auth.ts`);
   `users.promoteUser` is the only promotion path and is admin-only.
8. Hero and CTA image fields are intentionally unused — do not add upload UI for them.
9. The WhatsApp consultation flow stores **no** data — intentional.
10. Language is React Context + `localStorage` (ADR-3), not URL segments — except the SEO-only `/ar` and `/en`
    entry points that force a locale on the homepage.

## 5. Layout conventions

- Admin UI: one component per tab in `src/components/dashboard/`; `src/pages/Dashboard.tsx` stays a thin shell
  (tab list in `VALID_TABS`, hash routing). Do not inline tabs back into the shell.
- Backend: one module per domain in `src/convex/`; read-only public queries vs admin-gated mutations.
- Every public query returning a media reference resolves URLs server-side in a single round trip.
- Text: CMS field → i18n key → hardcoded default fallback chain; RTL/LTR both handled.
- shadcn/ui primitives live in `src/components/ui/`; import individual files, not the barrel.
- `vly-toolbar-readonly.tsx` is a preview-only dev tool (Freebuff is otherwise fully removed).
