import { describe, expect, it } from "vitest";
import { buildFaqJsonLd, safeJsonLd } from "../jsonLd";

describe("safeJsonLd", () => {
  it("stringifies a plain object", () => {
    expect(safeJsonLd({ name: "Dr. Alhasan" })).toBe('{"name":"Dr. Alhasan"}');
  });

  it("escapes every '<' so it can never open a tag", () => {
    const malicious = { name: "<script>alert(1)</script><img src=x onerror=alert(1)>" };
    const out = safeJsonLd(malicious);
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003cscript>");
    expect(out).toContain("\\u003cimg");
  });

  it("escapes '<' introduced by JSON.stringify of nested arrays", () => {
    const out = safeJsonLd({ steps: ["step < 3"] });
    expect(out).not.toContain("<");
    expect(out).toContain("\\u003c");
  });

  it("preserves valid JSON semantics for the JSON-LD consumer", () => {
    expect(safeJsonLd({ a: 1, b: [true, null] })).toBe('{"a":1,"b":[true,null]}');
  });
});

describe("buildFaqJsonLd", () => {
  const rows = [
    {
      questionAr: "كيف أعرف الإجراء المناسب لي؟",
      questionEn: "How do I know which procedure is right for me?",
      answerAr: "جواب عربي.",
      answerEn: "English answer.",
    },
    {
      questionAr: "هل الجراحة آمنة؟",
      questionEn: "Is the surgery safe?",
      answerAr: "جواب عربي آخر.",
      answerEn: "Another English answer.",
    },
  ];

  it("emits a FAQPage with the Arabic questions and answers", () => {
    const out = buildFaqJsonLd(rows, true);
    expect(out["@type"]).toBe("FAQPage");
    expect(out.mainEntity).toHaveLength(2);
    expect(out.mainEntity[0].name).toBe("كيف أعرف الإجراء المناسب لي؟");
    expect(out.mainEntity[0].acceptedAnswer.text).toBe("جواب عربي.");
  });

  it("emits the same questions in English when isArabic is false", () => {
    const out = buildFaqJsonLd(rows, false);
    expect(out.mainEntity[0].name).toBe(
      "How do I know which procedure is right for me?",
    );
    expect(out.mainEntity[1].acceptedAnswer.text).toBe(
      "Another English answer.",
    );
  });

  it("emits an empty mainEntity for an empty list", () => {
    expect(buildFaqJsonLd([], true).mainEntity).toEqual([]);
  });
});