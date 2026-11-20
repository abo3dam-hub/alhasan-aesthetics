/**
 * Canonical slug form for public URLs: no surrounding whitespace or slashes,
 * lowercase. Mirrors `normalizeSlug` in `src/convex/articles.ts` — legacy CMS
 * rows may carry slashes (e.g. "/my-article/") and must never leak into links.
 */
export function cleanSlug(raw: string): string {
  return raw.trim().replace(/^\/+|\/+$/g, "").toLowerCase();
}
