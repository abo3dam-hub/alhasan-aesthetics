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

/**
 * Build the FAQPage structured-data object for a list of CMS FAQ rows.
 *
 * One shared builder for the server-side `/faq-jsonld` endpoint — the only
 * place the block is emitted since 2026-11-25 (it used to be injected
 * client-side by FAQ.tsx after the Convex query resolved, which Google's
 * renderer consistently snapshotted before — Rich Results Test never saw
 * it). `isArabic` picks the Arabic or English question/answer per row.
 */
export interface FaqJsonLdRow {
  questionAr: string;
  questionEn: string;
  answerAr: string;
  answerEn: string;
}

export function buildFaqJsonLd(faqs: FaqJsonLdRow[], isArabic: boolean) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: isArabic ? faq.questionAr : faq.questionEn,
      acceptedAnswer: {
        "@type": "Answer",
        text: isArabic ? faq.answerAr : faq.answerEn,
      },
    })),
  };
}