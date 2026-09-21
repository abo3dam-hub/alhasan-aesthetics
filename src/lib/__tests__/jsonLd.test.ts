import { describe, expect, it } from "vitest";
import { safeJsonLd } from "../jsonLd";

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