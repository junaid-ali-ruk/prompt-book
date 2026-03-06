import { describe, expect, it } from "bun:test";

import { createPromptImageOptimizationPlan } from "./image-optimization";

describe("createPromptImageOptimizationPlan", () => {
  it("keeps already-small screenshots untouched", () => {
    expect(
      createPromptImageOptimizationPlan({
        width: 1280,
        height: 720,
        size: 240_000,
        type: "image/png",
      }),
    ).toEqual({
      shouldOptimize: false,
      targetWidth: 1280,
      targetHeight: 720,
      targetMimeType: "image/png",
      quality: 0.92,
    });
  });

  it("downscales oversized screenshots to a faster upload size", () => {
    expect(
      createPromptImageOptimizationPlan({
        width: 3200,
        height: 2400,
        size: 4_500_000,
        type: "image/png",
      }),
    ).toEqual({
      shouldOptimize: true,
      targetWidth: 1600,
      targetHeight: 1200,
      targetMimeType: "image/webp",
      quality: 0.82,
    });
  });

  it("still optimizes very large files even if dimensions are moderate", () => {
    expect(
      createPromptImageOptimizationPlan({
        width: 1440,
        height: 900,
        size: 3_000_000,
        type: "image/jpeg",
      }),
    ).toEqual({
      shouldOptimize: true,
      targetWidth: 1440,
      targetHeight: 900,
      targetMimeType: "image/webp",
      quality: 0.82,
    });
  });
});
