import { describe, expect, it } from "vitest";
import { resolveIconKey } from "../../convex/procedureIconDefaults";

describe("resolveIconKey", () => {
  it("prefers the admin-chosen semantic key", () => {
    expect(resolveIconKey("rhinoplasty", "FaceLift")).toBe("FaceLift");
  });

  it("falls back to the slug-specific default", () => {
    expect(resolveIconKey("rhinoplasty", "")).toBe("Rhinoplasty");
    expect(resolveIconKey("upper-eyelid-lift", undefined)).toBe("EyelidLift");
  });

  it("normalizes legacy lucide names", () => {
    expect(resolveIconKey("unknown-procedure", "Eye")).toBe("EyelidLift");
    expect(resolveIconKey(undefined, "Stethoscope")).toBe("BreastAugmentation");
  });

  it("defaults to General when nothing matches", () => {
    expect(resolveIconKey(undefined, undefined)).toBe("General");
    expect(resolveIconKey("made-up-slug", "not-a-key")).toBe("General");
  });
});