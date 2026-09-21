import { describe, expect, it } from "vitest";
import { cn } from "../utils";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });

  it("merges conflicting tailwind classes keeping the later one", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("text-center", "text-left")).toBe("text-left");
  });

  it("accepts conditional objects", () => {
    expect(cn("base", { active: true, hidden: false })).toBe("base active");
  });
});