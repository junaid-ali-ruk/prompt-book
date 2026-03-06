import { createClient } from "@insforge/sdk";

import { getInsforgeEnv } from "@/lib/insforge-env";

const DEFAULT_ENV = {
  baseUrl: "https://8n3h62mn.ap-southeast.insforge.app",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3OC0xMjM0LTU2NzgtOTBhYi1jZGVmMTIzNDU2NzgiLCJlbWFpbCI6ImFub25AaW5zZm9yZ2UuY29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NjI1MDZ9.4GIekCo0px2ZO3z5ntoulunkulUCwHARD2XFpJngoDM",
};

function ensureStorage(name: "localStorage" | "sessionStorage") {
  const target = globalThis as typeof globalThis & Record<string, unknown>;
  if (target[name]) return;

  const store = new Map<string, string>();
  target[name] = {
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    removeItem: (key: string) => store.delete(key),
    setItem: (key: string, value: string) => store.set(key, value),
    get length() {
      return store.size;
    },
  };
}

ensureStorage("localStorage");
ensureStorage("sessionStorage");

const metaEnv = ((import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {}) as Record<string, string | undefined>;
const processEnv = typeof process !== "undefined" ? (process.env as Record<string, string | undefined>) : {};

export const insforgeEnv = getInsforgeEnv({ ...processEnv, ...metaEnv }, DEFAULT_ENV);

export const insforge = createClient({
  baseUrl: insforgeEnv.baseUrl,
  anonKey: insforgeEnv.anonKey,
});

