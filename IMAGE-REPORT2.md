# IMAGE SYSTEM — ROOT-CAUSE PROOF & FINAL VALIDATION

**Date:** September 3, 2026  
**Project:** Dr. Al Hasan — Aesthetic & Plastic Surgery Website

---

## Root Cause

### ROOT CAUSE #1 (Critical): `ResolvedImage` interpreted query-loading as "Image unavailable"

**The bug in `src/components/ResolvedImage.tsx`:**

```jsx
// BEFORE (broken):
const resolved = useQuery(api.media.resolveUrl, ...);
const src = resolved ?? safeRef;  // ← resolved is undefined while loading!

if (!src) { /* "No image" */ }

// After refresh, resolved === undefined (loading) ?? safeRef === "k3b5...xyz"
// → <img src="k3b5...xyz"> → browser 404 → onError → "Image unavailable"
```

**What happened:**

1. User uploads image → media record created with `storageId = "k3b5...xyz"`
2. `ResolvedImage` queries `resolveUrl` → Convex returns `undefined` (query still loading)
3. `undefined ?? safeRef` → `"k3b5...xyz"` (the raw storageId string)
4. `<img src="k3b5...xyz">` → browser tries to load a relative URL → 404
5. `onError` fires → `setLoadError(true)` → "Image unavailable"

This explains:
- ✅ "Upload image → appears → refresh → Image unavailable" (loading race)
- ✅ "Some thumbnails appear, others don't" (different query timing)
- ✅ "After refresh, previously visible images disappear" (all queries restart loading simultaneously)

**Evidence:** The `useQuery` hook returns `undefined` while the query is in-flight. The `??` operator only handles `null`/`undefined`, but `safeRef` is always truthy (it's the raw storageId string). So during loading, the component renders `<img src="storageId">` instead of a loading spinner.

### ROOT CAUSE #2: `checkReferences` deleted by storageId match failure

**The bug in `src/pages/Dashboard.tsx`:**

```jsx
// BEFORE (broken):
const [deleteTarget, setDeleteTarget] = useState<{ _id: string; url: string; ... }>();
const deleteRefs = useQuery(api.media.checkReferences, 
  deleteTarget ? { url: deleteTarget.url } : "skip");
setDeleteTarget({ _id: item._id, url: item.url, ... });
```

After the previous fix changed uploads to store `storageId` instead of `url`, the `item.url` field could be empty or stale. `checkReferences` was comparing against `url`, so it would never find any references → the "Delete Anyway" button would appear even for images that ARE referenced by CMS fields.

**Evidence:** `checkReferences` used `url` comparison, but CMS fields now store `storageId`. No match = false negative = data loss risk.

### ROOT CAUSE #3: `resolveUrl` silently swallowed all errors

**The bug in `src/convex/media.ts`:**

```jsx
// BEFORE (silent failure):
try {
  const resolved = await ctx.storage.getUrl(ref as any);
  if (resolved) return resolved;
} catch { /* fall through */ }
return ref;  // ← Returns raw storageId string on failure!
```

When `ctx.storage.getUrl()` threw an error (invalid storageId, deleted storage object), the function returned the raw reference as fallback. This meant `<img src="raw-storageId">` → browser 404 → "Image unavailable".

**Evidence:** The `catch` block swallowed errors with no logging, making it impossible to distinguish "storage works" from "storage failed but we returned the input".

---

## Fixes Applied

### Fix #1: `ResolvedImage` — Proper loading state

```jsx
// AFTER (correct):
if (resolved === undefined) {
  // Query still loading — show spinner, NOT "Image unavailable"
  return <Loader2 className="animate-spin" />;
}
if (!resolved) {
  // Query completed but storage object doesn't exist
  return "No image";
}
// resolved is a valid URL → render <img src={resolved}>
```

**Key change:** `undefined` (loading) is now a distinct state from `""` (empty) and `"url"` (resolved).

### Fix #2: `checkReferences` matches by `storageId`

```jsx
// AFTER:
const [deleteTarget, setDeleteTarget] = useState<{ _id: string; storageId: string; ... }>();
const deleteRefs = useQuery(api.media.checkReferences, 
  deleteTarget ? { storageId: deleteTarget.storageId } : "skip");
```

Now matches against the same field CMS uses (`storageId`), so references are correctly detected.

### Fix #3: `resolveUrl` returns empty on failure (not raw reference)

```jsx
// AFTER:
try {
  const resolved = await ctx.storage.getUrl(ref as any);
  if (resolved) return resolved;
} catch (e) {
  // Storage object may not exist
}
return "";  // ← Return empty, not the raw reference
```

On failure, returns `""` → `ResolvedImage` shows "No image" instead of rendering `<img src="k3b5...xyz">` → browser 404.

### Fix #4: Diagnostic query for real-time inspection

Added `media.diagnostic` query that:
- Lists all media records
- Tests `ctx.storage.getUrl()` for each
- Reports storageExists, resolvedUrl, and errors
- Shows total counts

### Fix #5: MediaDiagnostics component in Dashboard

Dashboard → Media tab now shows:
- Total media records
- How many have valid storage
- How many have missing storage
- How many have empty URLs
- Per-item details with thumbnails

---

## Convex Environment

**Development deployment:**
- URL: `https://impartial-ladybug-881.convex.cloud`
- Deployment: `freebuff:8009d0a5-ca42-4d82-9d52-fcbca98c47df:dev`
- Dashboard: `https://dashboard.convex.dev/t/freebuff/8009d0a5-ca42-4d82-9d52-fcbca98c47df/impartial-ladybug-881`

**No environment mismatch detected.** The frontend connects to the same Convex deployment where uploads are stored. The `VITE_CONVEX_URL` env var points to this deployment.

**No production deployment verified.** The Vercel production site's Convex URL was not inspected. If Vercel uses a different `VITE_CONVEX_URL`, images uploaded via the dev dashboard would not appear on the production site.

---

## Image Data Model

| Field | Format | Notes |
|---|---|---|
| `media.storageId` | `string` (Convex storage ID) | **Canonical reference** |
| `media.url` | `string` (URL) | Legacy field, populated by upload hook |
| `procedures.image` | `string` (storageId) | New uploads store storageId |
| `procedures.beforeImage` | `string` (storageId) | New uploads store storageId |
| `procedures.afterImage` | `string` (storageId) | New uploads store storageId |
| `procedures.gallery` | `string[]` (storageIds) | New uploads store storageIds |
| `beforeAfter.beforeImage` | `string` (storageId) | New uploads store storageId |
| `beforeAfter.afterImage` | `string` (storageId) | New uploads store storageId |
| `testimonials.avatar` | `string` (storageId) | New uploads store storageId |
| `siteSettings.about.image` | `string` (URL or storageId) | May be legacy URL |

**Resolution priority:**
1. storageId → `ctx.storage.getUrl()` → working URL
2. URL with `/api/storage/<id>` → extract storageId → resolve
3. URL matching media record → find storageId → resolve
4. Raw URL → return as-is (legacy fallback)

---

## Diagnostic Tools

### Convex Diagnostic Query

```
media.diagnostic → {
  totalRecords: number,
  items: [{
    _id, storageId, url, name, type, size,
    storageExists: boolean,
    resolvedUrl: string,
    error: string
  }]
}
```

### Dashboard MediaDiagnostics Component

Location: Dashboard → Media tab (below Repair URLs button)

Shows:
- Total Records count
- Storage OK count (green)
- Storage Missing count (red)
- URL Empty count (amber)
- Per-item details with storageId, URL, resolved URL, error messages

---

## Browser Verification

### NOT VERIFIED ⚠️

This environment cannot:
- Launch a browser
- Query live Convex data
- Perform authenticated dashboard testing
- Inspect network requests
- Test actual upload → render cycle

All fixes are **SOURCE-CODE VERIFIED** based on:
- Tracing the exact code path from upload → storageId → resolveUrl → ResolvedImage → img
- Identifying the loading state conflation bug
- Fixing the error handling to not return raw references
- Adding diagnostic tools for live inspection

### What You Must Test

**Critical test (this proves the root cause fix):**

1. Open Dashboard → Media
2. Upload 3 images (JPG, PNG, WebP)
3. Verify all 3 thumbnails appear
4. **Hard refresh** the page (Ctrl+Shift+R)
5. Verify all 3 thumbnails still appear ← **This is where they were disappearing**

**If step 5 shows "Image unavailable" for any image:**
- Open browser DevTools → Console
- Look for `[ResolvedImage] Failed to load: ref="..." resolvedUrl="..."`
- If resolvedUrl is a valid HTTPS URL → network/storage issue
- If resolvedUrl is empty → storage object missing (check Media Diagnostics)
- If resolvedUrl is a raw storageId → resolveUrl query not working (check Convex)

**Diagnostics test:**
1. Dashboard → Media tab → Media Diagnostics section
2. Verify: Total Records = N, Storage OK = N, Storage Missing = 0
3. If Storage Missing > 0 → those storage objects are gone from Convex Storage

**CMS image test:**
1. Dashboard → Procedures → Edit a procedure
2. Verify: Main Image field shows actual thumbnail (not "Select Image")
3. If it shows "Select Image" but the procedure has an image → the stored value is a broken URL, not a storageId

---

## Architecture — Final

```
┌─────────────────────────────────────────────────────────┐
│ Upload Flow                                              │
│ use-upload.ts → generateUploadUrl → fetch → storageId   │
│              → recordUpload(storageId, url)              │
│              → return { storageId, url }                 │
│ MediaSelector/ImageUpload → onChange(storageId)          │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ CMS Fields (procedure.image, beforeAfter.beforeImage)   │
│ Store: storageId (canonical reference)                  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Resolution (backend)                                     │
│ resolveUrl(ref) → ctx.storage.getUrl(storageId) → URL   │
│ resolveUrls([refs]) → batch resolution                  │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Rendering (frontend)                                     │
│ ResolvedImage(ref) → useQuery(resolveUrl) → <img>       │
│ States: loading → resolved → img → error                 │
└─────────────────────────────────────────────────────────┘
```

**Key properties:**
- `storageId` is the single canonical reference
- `ctx.storage.getUrl()` is the single source of URL resolution
- `ResolvedImage` is the single image rendering component
- Loading state is properly distinguished from error state
- Failed resolution returns empty (shows "No image") not raw storageId

---

## Files Changed

```
src/convex/media.ts
  - resolveUrl: returns "" on failure (not raw ref)
  - checkReferences: matches by storageId (not url)
  - Added diagnostic query

src/components/ResolvedImage.tsx
  - Fixed loading state: undefined = loading, not unavailable
  - Added useEffect to reset loadError on ref change
  - Console.warn on image load failure for debugging

src/components/MediaDiagnostics.tsx (NEW)
  - Real-time diagnostic display for all media records
  - Shows storage resolution status per item

src/pages/Dashboard.tsx
  - deleteTarget uses storageId (not url)
  - checkReferences queries by storageId
  - Added MediaDiagnostics component to Media tab
```

---

## Build Verification

| Check | Result |
|---|---|
| Convex functions | ✅ Compiled successfully |
| TypeScript typecheck | ✅ 0 errors |
| Vite production build | ✅ 11.71s |

---

## Remaining Issues

1. **Browser verification not performed** — The root cause fix (loading state) must be verified by actually uploading images and refreshing. The diagnostic tools are now in place to help debug.

2. **Legacy URLs in database** — If old procedures/BnA records store manually constructed URLs (not storageIds), `resolveUrl` will try to extract the storageId from the URL pattern. If successful → image works. If not → falls back to original URL.

3. **`use-upload.ts` still stores `url`** — The upload hook stores both `storageId` and `url`. The `url` is constructed from `VITE_CONVEX_URL`. This is a fallback; `storageId` is the primary reference. To fully eliminate this, the `url` field in the media schema could be made optional.

4. **No production Convex verification** — Need to confirm that Vercel production uses the same Convex deployment as development.

---

## Conclusion

**The root cause was a loading state conflation bug.** The `ResolvedImage` component could not distinguish between:
- Query still loading (`undefined`) → should show spinner
- Query returned empty (`""`) → should show "No image"  
- Query returned URL (`"https://..."`) → should render `<img>`

During the loading phase, the raw storageId was used as `<img src>`, causing a browser 404 → "Image unavailable".

**The fix adds explicit handling for each state**, ensuring loading shows a spinner, resolution failure shows "No image", and only valid URLs are passed to `<img>`.

**Status: SOURCE CODE VERIFIED ✅ | BUILD VERIFIED ✅ | BROWSER VERIFIED: NOT VERIFIED ⚠️**
