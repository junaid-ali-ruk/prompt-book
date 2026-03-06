import { describe, expect, it } from "bun:test";

import {
  APP_TITLE,
  buildAbsoluteUrl,
  buildPageDescription,
  buildPageTitle,
  buildRobotsTxt,
  buildSitemapXml,
  normalizeSiteOrigin,
  summarizeForMetadata,
} from "./site-config";

describe("site-config helpers", () => {
  it("normalizes site origins", () => {
    expect(normalizeSiteOrigin("https://prompt-gallery.example/app")).toBe("https://prompt-gallery.example");
    expect(normalizeSiteOrigin("not-a-url")).toBeNull();
  });

  it("builds page titles and descriptions", () => {
    expect(buildPageTitle()).toBe(APP_TITLE);
    expect(buildPageTitle("My prompts")).toBe("My prompts | Prompt Gallery");
    expect(buildPageDescription("  Useful summary  ")).toBe("Useful summary");
  });

  it("creates metadata-safe summaries", () => {
    expect(summarizeForMetadata("one\n two\n three", 12)).toBe("one two thr…");
  });

  it("builds absolute URLs and SEO documents", () => {
    expect(buildAbsoluteUrl("https://prompt-gallery.example", "/auth")).toBe("https://prompt-gallery.example/auth");
    expect(buildRobotsTxt("https://prompt-gallery.example")).toContain("Sitemap: https://prompt-gallery.example/sitemap.xml");
    expect(buildSitemapXml("https://prompt-gallery.example")).toContain("https://prompt-gallery.example/auth");
  });
});
