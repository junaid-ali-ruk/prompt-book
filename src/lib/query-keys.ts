import type { AgentTool } from "@/data/prompts";
import type { PromptStatus } from "@/lib/prompt-types";

export const queryKeys = {
  auth: ["auth"] as const,
  promptDetail: (promptId: string, userId?: string | null) => ["prompt", promptId, userId ?? "guest"] as const,
  publicPrompts: (params: { agent: AgentTool | "All"; search: string; userId?: string | null }) =>
    ["public-prompts", params.agent, params.search, params.userId ?? "guest"] as const,
  myPrompts: (params: { search: string; status: PromptStatus | "all"; userId?: string | null }) =>
    ["my-prompts", params.status, params.search, params.userId ?? "guest"] as const,
  adminPrompts: (params: { search: string; status: PromptStatus | "all"; userId?: string | null }) =>
    ["admin-prompts", params.status, params.search, params.userId ?? "guest"] as const,
  adminOverview: (userId?: string | null) => ["admin-overview", userId ?? "guest"] as const,
};

