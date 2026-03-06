import { describe, expect, it } from "bun:test";

import { getInsforgeEnv } from "./insforge-env";

describe("getInsforgeEnv", () => {
  it("returns trimmed env values when present", () => {
    const env = getInsforgeEnv({
      VITE_INSFORGE_BASE_URL: " https://example.insforge.app ",
      VITE_INSFORGE_ANON_KEY: " anon-key ",
    });

    expect(env).toEqual({
      baseUrl: "https://example.insforge.app",
      anonKey: "anon-key",
    });
  });

  it("uses fallback values when explicit env vars are missing", () => {
    const env = getInsforgeEnv({}, { baseUrl: "https://fallback.example", anonKey: "fallback-key" });
    expect(env).toEqual({ baseUrl: "https://fallback.example", anonKey: "fallback-key" });
  });

  it("throws helpful errors when required values are absent", () => {
    expect(() => getInsforgeEnv({ VITE_INSFORGE_BASE_URL: "", VITE_INSFORGE_ANON_KEY: "" })).toThrow(
      "Missing VITE_INSFORGE_BASE_URL",
    );
  });
});
