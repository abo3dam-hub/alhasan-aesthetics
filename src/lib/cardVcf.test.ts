import { describe, expect, it } from "vitest";
import { buildVCard, escapeVCardText, foldVCardLine } from "./cardVcf";

const contact = {
  fullName: "Dr. Alhasan Alsaiem",
  title: "MD, Board Certified in Plastic Surgery",
  phone: "+963 933 178 794",
  whatsapp: "963991301700",
  email: "dr.alhassan@gmail.com",
  note: "العيادات: دمشق، اللاذقية (سوريا) — دبي (الإمارات العربية المتحدة)",
};

describe("escapeVCardText", () => {
  it("escapes commas, semicolons, backslashes and newlines", () => {
    expect(escapeVCardText("a;b,c\\d\ne")).toBe("a\\;b\\,c\\\\d\\ne");
  });
});

describe("foldVCardLine", () => {
  it("leaves short lines untouched", () => {
    expect(foldVCardLine("FN:Dr. Alhasan Alsaiem")).toBe("FN:Dr. Alhasan Alsaiem");
  });
  it("folds long lines at 75 octets with CRLF+space", () => {
    const folded = foldVCardLine("NOTE:" + "x".repeat(100));
    expect(folded).toContain("\r\n ");
    for (const part of folded.split("\r\n ")) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    }
  });
  it("never splits a multi-byte character", () => {
    const folded = foldVCardLine("NOTE:" + "ن".repeat(60));
    expect(folded).not.toContain("�");
    for (const part of folded.split("\r\n ")) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    }
  });
});

describe("buildVCard", () => {
  it("produces a valid vCard 3.0 with the literal card name", () => {
    const vcf = buildVCard(contact);
    expect(vcf).toMatch(/^BEGIN:VCARD\r\n/);
    expect(vcf).toContain("VERSION:3.0");
    expect(vcf).toContain("FN:Dr. Alhasan Alsaiem");
    expect(vcf).toContain("N:Alsaiem;Alhasan;;;Dr.");
    expect(vcf).toContain("TEL;TYPE=CELL,VOICE:+963933178794");
    expect(vcf).toContain("TEL;TYPE=WORK,VOICE:963991301700");
    expect(vcf).toContain("EMAIL:dr.alhassan@gmail.com");
    expect(vcf).toContain("URL;TYPE=WORK:https://dralhasanalsaiem.com/card");
    expect(vcf).toMatch(/END:VCARD\r\n$/);
  });
  it("keeps Arabic note text intact (UTF-8, no mangling)", () => {
    const vcf = buildVCard(contact);
    expect(vcf).toContain("العيادات");
    expect(vcf).toContain("دبي");
  });
  it("escapes special chars in fields", () => {
    const vcf = buildVCard({ ...contact, title: "A;B,C" });
    expect(vcf).toContain("TITLE:A\\;B\\,C");
  });
  it("omits optional fields cleanly when absent", () => {
    const vcf = buildVCard({ fullName: "Dr. Alhasan Alsaiem" });
    expect(vcf).not.toContain("EMAIL");
    expect(vcf).not.toContain("NOTE");
    expect(vcf).toContain("FN:Dr. Alhasan Alsaiem");
  });
});
