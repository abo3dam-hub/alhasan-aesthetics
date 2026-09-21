/**
 * Render a JSON-LD object as a safe `<script type="application/ld+json">` body.
 *
 * Structured data is injected into the page via dangerouslySetInnerHTML inside
 * a script tag. To keep that safe we:
 *   1. stringify the object/array;
 *   2. escape every `<` as its short escape `\u003c` so it can never form an
 *      opening tag, even if a text field (SEO title/description, procedure
 *      name, article excerpt — all CMS-controlled) contains "<";
 *   3. return ONLY the escaped string.
 *
 * The caller is responsible for wrapping the result in
 * `<script type="application/ld+json">{...}</script>` and passing it to
 * dangerouslySetInnerHTML.
 */
export function safeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}