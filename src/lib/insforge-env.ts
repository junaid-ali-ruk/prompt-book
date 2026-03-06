type EnvLike = Record<string, string | undefined>;

export interface InsforgeEnv {
  baseUrl: string;
  anonKey: string;
}

export function getInsforgeEnv(env: EnvLike, fallback?: Partial<InsforgeEnv>): InsforgeEnv {
  const baseUrl = env.VITE_INSFORGE_BASE_URL?.trim() || fallback?.baseUrl?.trim();
  const anonKey = env.VITE_INSFORGE_ANON_KEY?.trim() || fallback?.anonKey?.trim();

  if (!baseUrl) {
    throw new Error("Missing VITE_INSFORGE_BASE_URL");
  }

  if (!anonKey) {
    throw new Error("Missing VITE_INSFORGE_ANON_KEY");
  }

  return { baseUrl, anonKey };
}

