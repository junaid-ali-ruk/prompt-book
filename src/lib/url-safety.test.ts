import { describe, expect, it } from "bun:test";

import {
  FALLBACK_PROMPT_IMAGE,
  assertValidImageFile,
  getSafePromptImageSrc,
  getSafePromptLiveUrl,
  normalizeHttpUrl,
} from "./url-safety";

describe("normalizeHttpUrl", () => {
  it("accepts trimmed http and https URLs", () => {
    expect(normalizeHttpUrl(" https://example.com/demo ")).toBe("https://example.com/demo");
    expect(normalizeHttpUrl("http://example.com")).toBe("http://example.com/");
  });

  it("rejects unsupported or malformed URLs", () => {
    expect(normalizeHttpUrl("javascript:alert(1)")).toBeNull();
    expect(normalizeHttpUrl("not-a-url")).toBeNull();
  });
});

describe("prompt URL helpers", () => {
  it("returns a fallback image when the image URL is unsafe", () => {
    expect(getSafePromptImageSrc("javascript:alert(1)")).toBe(FALLBACK_PROMPT_IMAGE);
  });

  it("drops unsafe live URLs", () => {
    expect(getSafePromptLiveUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("assertValidImageFile", () => {
  it("accepts normal image uploads", () => {
    const file = new File(["image"], "cover.png", { type: "image/png" });
    expect(() => assertValidImageFile(file)).not.toThrow();
  });

  it("accepts image uploads up to 15 MB", () => {
    const file = new File([new Uint8Array(15 * 1024 * 1024)], "large-cover.png", { type: "image/png" });
    expect(() => assertValidImageFile(file)).not.toThrow();
  });

  it("rejects non-image uploads", () => {
    const file = new File(["text"], "notes.txt", { type: "text/plain" });
    expect(() => assertValidImageFile(file)).toThrow("Upload a valid image file.");
  });

  it("rejects image uploads larger than 15 MB", () => {
    const file = new File([new Uint8Array(15 * 1024 * 1024 + 1)], "too-large.png", { type: "image/png" });
    expect(() => assertValidImageFile(file)).toThrow("Images must be 15 MB or smaller.");
  });
});
