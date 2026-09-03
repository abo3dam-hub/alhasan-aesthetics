# IMAGE SYSTEM — FINAL HARDENING REPORT

**Date:** September 3, 2026  
**Project:** Dr. Al Hasan — Aesthetic & Plastic Surgery Website

---

## Final Hardening Results

### Canonical Storage Reference

**PASS** ✅

The canonical image reference is `storageId`. The upload hook no longer constructs URLs:

```js
// BEFORE (eliminated):
const url = `${convexUrl}/api/storage/${storageId}`;

// AFTER:
url: "" // LEGACY: empty for new uploads
```

All image resolution goes through: `storageId → ctx.storage.getUrl() → working URL`

The `media.url` field is retained as a legacy field (`v.string()` required in schema) but:
- New uploads store `""` (empty string)
- `resolveUrl` resolves via `storageId`, ignoring the url field
- `resolveUrls` batch query resolves via `storageId`
- The url field is only used as a last-resort fallback for old records

### Upload Persistence

**SOURCE CODE VERIFIED** ✅ | **BROWSER VERIFIED: NOT AVAILABLE** ⚠️

Upload flow:
1. `generateUploadUrl()` → signed upload URL
2. `fetch(uploadUrl, { method: "POST", body: file })` → Convex Storage → storageId
3. `recordUpload({ storageId, url: "", name, type, size })` → media table record
4. Returns `{ storageId, url: "" }`

Persistence is guaranteed because:
- Step 2 uploads to Convex Storage (atomic)
- Step 3 inserts a database record (atomic)
- Both happen before the function returns
- Convex transactions ensure consistency

**Cannot verify from this environment:** Actual browser upload test, actual database record inspection.

### Multiple Upload Test

**SOURCE CODE VERIFIED** ✅ | **BROWSER VERIFIED: NOT AVAILABLE** ⚠️

The upload flow is stateless per call. Each `upload()` call:
- Generates a unique signed URL
- Uploads independently
- Creates a separate database record
- Returns a unique storageId

Multiple rapid uploads work because:
- Each call uses its own `generateUploadUrl()` mutation
- Convex Storage handles concurrent uploads
- Each `recordUpload()` is a separate mutation
- `useQuery(api.media.list)` returns all records reactively

**Cannot verify:** Actual 3-upload browser test.

### Refresh Persistence

**SOURCE CODE VERIFIED** ✅ | **BROWSER VERIFIED: NOT AVAILABLE** ⚠️

After page refresh:
1. `useQuery(api.media.list)` re-fetches all media records from Convex database
2. `useResolvedMedia(items)` collects all storageIds, calls `resolveUrls` batch query
3. `resolveUrls` calls `ctx.storage.getUrl(storageId)` for each → fresh URLs
4. `ResolvedImage` renders `<img src={resolvedUrl}>`

The critical fix: `ResolvedImage` now properly handles `undefined` (query loading) by showing a spinner, NOT by rendering the raw storageId as `<img src>`. This was the root cause of "images disappear after refresh."

**Cannot verify:** Actual browser refresh test.

### Batch Resolution

**SOURCE CODE VERIFIED** ✅

`resolveUrls` characteristics:
- **Input order preserved:** Iterates `args.refs` in order, builds `results` dict
- **Duplicate handling:** Caller uses `Set<string>` to deduplicate before querying
- **Invalid reference handling:** Each ref has independent try/catch — one failure does not affect others
- **Null/empty handling:** Returns `""` for empty refs
- **Storage errors:** Caught individually, falls through to fallback
- **Partial failures:** If ref A fails and ref B succeeds, both get their own result

Proof that one broken image cannot cause others to disappear: Each `for (const ref of args.refs)` iteration is independent with its own error handling.

### CMS Persistence

**SOURCE CODE VERIFIED** ✅

All CMS mutations (`procedures.update`, `beforeAfter.update`, `testimonials.update`) use:
```js
const { id, ...updates } = args;
const filtered = Object.fromEntries(
  Object.entries(updates).filter(([, v]) => v !== undefined)
);
await ctx.db.patch(id, filtered);
```

This ensures:
- Updating `titleEn` does NOT touch `image` (undefined → filtered out)
- Clearing an image sends `image: ""` or `image: undefined` → user intent preserved
- Convex `db.patch` only updates fields present in the object
- Image refs are never accidentally erased

### Media Selector

**SOURCE CODE VERIFIED** ✅

Flow when editing a procedure with existing image:

1. `ProcedureForm` initializes: `imageUrl = existing?.image || ""` (storageId)
2. `MediaSelector value={imageUrl}` receives the storageId
3. `MediaSelector` renders: `<ResolvedImage ref={value}>` with the storageId
4. `ResolvedImage` queries `resolveUrl({ ref: storageId })` → `ctx.storage.getUrl()` → URL
5. Shows actual thumbnail

When value is empty:
- Shows dashed border with "Select Image" button
- This is correct — no image is assigned

When value is a legacy URL:
- `resolveUrl` extracts storageId from URL pattern `/api/storage/<id>`
- Resolves via `ctx.storage.getUrl()`
- Falls back to original URL if extraction fails

### Public Image Rendering

**SOURCE CODE VERIFIED** ✅

All public image components now use `ResolvedImage`:

| Component | Image Field | Uses ResolvedImage |
|---|---|---|
| `ProcedureDetail.tsx` | image, beforeImage, afterImage, gallery | ✅ |
| `ProceduresPage.tsx` | procedure card images | ✅ |
| `Procedures.tsx` | homepage procedure images | ✅ |
| `BeforeAfterPage.tsx` | slider before/after images | ✅ |
| `BeforeAfter.tsx` | homepage B&A card images | ✅ |
| `About.tsx` | CMS doctor image (fallback: static) | ✅ |
| `Testimonials.tsx` | avatar images | ✅ |

Remaining raw `<img>` tags (intentionally kept):
- `Auth.tsx`: Static logo import (`/assets/3.jpg`) — not CMS-driven
- `About.tsx`: Static fallback (`/assets/1.jpg`) when no CMS image set

No `<img src={storageId}>` paths remain anywhere in the codebase.

### Production Convex Environment

**NOT VERIFIED** ⚠️

The Convex deployment used by this environment:
- **URL:** `https://impartial-ladybug-881.convex.cloud`
- **Deployment:** `freebuff:8009d0a5-ca42-4d82-9d52-fcbca98c47df:dev`
- **Type:** Development

Cannot inspect from this environment:
- Vercel production environment variables
- Whether Vercel uses the same or different Convex deployment
- Whether `VITE_CONVEX_URL` on Vercel matches the dev deployment

**Risk:** If Vercel production uses a different Convex deployment, images uploaded via the dashboard (dev) would not appear on the production site. This must be verified manually.

### Manual URL Generation

**PASS** ✅

The upload hook no longer constructs URLs:

```js
// ELIMINATED:
const url = `${convexUrl}/api/storage/${storageId}`;

// REPLACED WITH:
url: "" // LEGACY: empty for new uploads
```

`resolveUrl` and `resolveUrls` are the ONLY mechanisms for resolving storageIds to URLs. The `VITE_CONVEX_URL` env var is no longer used for image URL construction.

### Remaining Legacy Data

**ACCEPTED** ✅

Old records in the database may have manually constructed URLs in the `media.url` field. These are handled by:

1. `resolveUrl` tries to extract storageId from URL pattern `/api/storage/<id>`
2. If found → resolves via `ctx.storage.getUrl(extractedId)`
3. If not found → tries media record lookup by URL
4. If still not found → returns original URL as fallback

Legacy records will work IF the underlying Convex Storage object still exists. If the storage object was deleted, the image is genuinely unrecoverable and must be re-uploaded.

### Browser Verification

**NOT AVAILABLE** ⚠️

This environment cannot:
- Launch a browser
- Query live Convex data
- Perform authenticated dashboard testing
- Test actual upload → render cycles
- Inspect network requests

All other verifications are source-code based.

### Diagnostic Tools

**PASS** ✅

Two diagnostic tools are available for live debugging:

1. **`media.diagnostic` Convex query:** Returns all media records with storageId, url, storageExists, resolvedUrl, and errors.

2. **`MediaDiagnostics` component:** Dashboard → Media tab shows:
   - Total records count
   - Storage OK count (green)
   - Storage Missing count (red)
   - URL Empty count (amber)
   - Per-item details with thumbnail preview

### Loading State Fix

**PASS** ✅

`ResolvedImage` state model (verified in code):

| `resolved` value | Component renders |
|---|---|
| `undefined` | Spinner (loading) |
| `""` or `null` | "No image" |
| Valid URL string | `<img src={url}>` |
| Valid URL but `<img>` onError | "Image unavailable" (with console.warn) |

Key behavior:
- `useEffect(() => { setLoadError(false); }, [safeRef])` — resets error on ref change
- `typeof console !== "undefined"` guard for SSR safety
- Console warning on image load failure for debugging

---

## Build Verification

| Check | Result |
|---|---|
| Convex functions | ✅ Compiled successfully |
| TypeScript typecheck | ✅ 0 errors |
| Vite production build | ✅ 11.32s |

---

## Files Changed This Pass

```
src/hooks/use-upload.ts
  - Eliminated manual URL construction
  - New uploads store url: "" (legacy field)
  - Added JSDoc explaining legacy field purpose

src/components/ResolvedImage.tsx (previous pass, kept)
  - Loading state: undefined = spinner
  - Error state: loadError with console.warn
  - Reset on ref change

src/components/sections/Testimonials.tsx
  - Fixed: raw <img src={item.avatar}> → ResolvedImage

src/pages/Dashboard.tsx
  - checkReferences now queries by storageId
  - deleteTarget stores storageId
  - Added MediaDiagnostics component

src/convex/media.ts
  - resolveUrl returns "" on failure (not raw ref)
  - checkReferences matches by storageId
  - Added diagnostic query
  - repairUrls unchanged (maintenance tool)

src/components/MediaDiagnostics.tsx (new)
  - Real-time diagnostic display
```

---

## Final Status

| Criterion | Status |
|---|---|
| Canonical storage reference | **PASS** ✅ |
| Upload persistence | **SOURCE CODE VERIFIED** ✅ |
| Multiple upload | **SOURCE CODE VERIFIED** ✅ |
| Refresh persistence | **SOURCE CODE VERIFIED** ✅ (loading state fix) |
| Batch resolution | **PASS** ✅ |
| CMS persistence | **PASS** ✅ |
| Media selector | **SOURCE CODE VERIFIED** ✅ |
| Public image rendering | **SOURCE CODE VERIFIED** ✅ |
| Production Convex env | **NOT VERIFIED** ⚠️ |
| Manual URL generation | **PASS** ✅ |
| Remaining legacy data | **ACCEPTED** ✅ |
| Browser verification | **NOT AVAILABLE** ⚠️ |
| Diagnostic tools | **PASS** ✅ |
| Loading state fix | **PASS** ✅ |

**FINAL STATUS: NOT VERIFIED**

**Blocker:** Browser verification is not available in this environment. The root cause fix (loading state conflation) is source-code verified but must be confirmed by actual browser testing.

**To verify:**
1. Open Dashboard → Media → Upload 3 images → Hard refresh (Ctrl+Shift+R) → All 3 should show thumbnails
2. Open Dashboard → Media → Media Diagnostics → "Storage OK" should equal total records
3. Open Dashboard → Procedures → Edit → Image field should show thumbnail
4. Open public `/procedures` → card images should render
5. Open public `/before-after` → slider images should render
6. Check browser console for `[ResolvedImage] Failed to load` warnings

---

## Remaining Work

1. **Browser test** — Must be performed by user to confirm the loading state fix resolves the disappearing thumbnails issue
2. **Production Convex verification** — Must confirm Vercel production uses the same Convex deployment as development
3. **Legacy URL records** — Old records with manually constructed URLs should be checked via Media Diagnostics; if storageExists is false, those images need re-uploading
