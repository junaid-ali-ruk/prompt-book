export type AgentTool = "Lovable" | "v0" | "Bolt" | "Cursor" | "Other";

import type { PromptRecord } from "@/lib/prompt-types";

export const AGENT_TOOLS: AgentTool[] = ["Lovable", "v0", "Bolt", "Cursor", "Other"];

export type Prompt = PromptRecord;