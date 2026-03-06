import { describe, expect, it } from "bun:test";

import { buildRouteUrl, parseRoute } from "./router";

describe("parseRoute", () => {
  it("reads the gallery root without a selected prompt", () => {
    expect(parseRoute("https://example.com/")).toEqual({
      pathname: "/",
      promptId: null,
      isNotFound: false,
    });
  });

  it("reads the selected prompt from the prompt page query parameter", () => {
    expect(parseRoute("https://example.com/prompt?id=42")).toEqual({
      pathname: "/prompt",
      promptId: "42",
      isNotFound: false,
    });
  });

  it("supports app sub-routes without marking them not found", () => {
    expect(parseRoute("https://example.com/admin")).toEqual({
      pathname: "/admin",
      promptId: null,
      isNotFound: false,
    });
  });

  it("supports the dedicated share page", () => {
    expect(parseRoute("https://example.com/share")).toEqual({
      pathname: "/share",
      promptId: null,
      isNotFound: false,
    });
  });

  it("supports the dedicated edit page", () => {
    expect(parseRoute("https://example.com/edit?id=9")).toEqual({
      pathname: "/edit",
      promptId: "9",
      isNotFound: false,
    });
  });

  it("flags unsupported paths as not found", () => {
    expect(parseRoute("https://example.com/elsewhere?id=9")).toEqual({
      pathname: "/elsewhere",
      promptId: null,
      isNotFound: true,
    });
  });
});

describe("buildRouteUrl", () => {
  it("adds the prompt id while preserving unrelated search params", () => {
    expect(buildRouteUrl("https://example.com/?foo=bar", "/prompt", "7")).toBe("/prompt?foo=bar&id=7");
  });

  it("removes the prompt id when navigating to a normal route", () => {
    expect(buildRouteUrl("https://example.com/prompt?foo=bar&id=7", "/me")).toBe("/me?foo=bar");
  });

  it("can switch to the edit page with a selected prompt", () => {
    expect(buildRouteUrl("https://example.com/me?foo=bar", "/edit", "7")).toBe("/edit?foo=bar&id=7");
  });
});