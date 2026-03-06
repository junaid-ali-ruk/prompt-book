import type { AgentTool } from "@/data/prompts";
import { insforge } from "@/lib/insforge";
import { mapPromptRowToPrompt } from "@/lib/prompt-mappers";
import type { PromptRecord, PromptRow, PromptStatus } from "@/lib/prompt-types";

export const PROMPT_PAGE_SIZE = 9;
const ADMIN_OVERVIEW_PAGE_SIZE = 100;

export interface PromptPage {
  items: PromptRecord[];
  nextOffset?: number;
}

async function addLikedState(rows: PromptRow[], currentUserId?: string | null) {
  if (!rows.length || !currentUserId) {
    return rows.map(row => ({ ...row, liked_by_me: false }));
  }

  const { data, error } = await insforge.database
    .from("prompt_likes")
    .select("prompt_id")
    .eq("user_id", currentUserId)
    .in("prompt_id", rows.map(row => row.id));

  if (error) throw error;

  const likedPromptIds = new Set((data ?? []).map((row: { prompt_id: string }) => row.prompt_id));
  return rows.map(row => ({ ...row, liked_by_me: likedPromptIds.has(row.id) }));
}

async function toPage(rows: PromptRow[], offset: number, currentUserId?: string | null): Promise<PromptPage> {
  const currentRows = rows.slice(0, PROMPT_PAGE_SIZE);
  const likedRows = await addLikedState(currentRows, currentUserId);
  return {
    items: likedRows.map(row => mapPromptRowToPrompt(row, currentUserId)),
    nextOffset: rows.length > PROMPT_PAGE_SIZE ? offset + PROMPT_PAGE_SIZE : undefined,
  };
}

export async function listPublicPrompts(params: { agent: AgentTool | "All"; search: string; offset: number; currentUserId?: string | null; }) {
  const { data, error } = await insforge.database.rpc("list_public_prompts", {
    search_query: params.search || null,
    agent_filter: params.agent === "All" ? null : params.agent,
    page_limit: PROMPT_PAGE_SIZE + 1,
    page_offset: params.offset,
  });
  if (error) throw error;
  return toPage((data ?? []) as PromptRow[], params.offset, params.currentUserId);
}

export async function listMyPrompts(params: { search: string; status: PromptStatus | "all"; offset: number; currentUserId?: string | null; }) {
  const { data, error } = await insforge.database.rpc("list_my_prompts", {
    search_query: params.search || null,
    status_filter: params.status,
    page_limit: PROMPT_PAGE_SIZE + 1,
    page_offset: params.offset,
  });
  if (error) throw error;
  return toPage((data ?? []) as PromptRow[], params.offset, params.currentUserId);
}

export async function listAdminPrompts(params: { search: string; status: PromptStatus | "all"; offset: number; currentUserId?: string | null; }) {
  const { data, error } = await insforge.database.rpc("list_admin_prompts", {
    search_query: params.search || null,
    status_filter: params.status,
    page_limit: PROMPT_PAGE_SIZE + 1,
    page_offset: params.offset,
  });
  if (error) throw error;
  return toPage((data ?? []) as PromptRow[], params.offset, params.currentUserId);
}

export async function listAllAdminPrompts(currentUserId?: string | null) {
  const rows: PromptRow[] = [];
  let offset = 0;

  while (offset <= 1_000) {
    const { data, error } = await insforge.database.rpc("list_admin_prompts", {
      search_query: null,
      status_filter: "all",
      page_limit: ADMIN_OVERVIEW_PAGE_SIZE,
      page_offset: offset,
    });

    if (error) throw error;

    const pageRows = (data ?? []) as PromptRow[];
    rows.push(...pageRows);

    if (pageRows.length < ADMIN_OVERVIEW_PAGE_SIZE) break;
    offset += ADMIN_OVERVIEW_PAGE_SIZE;
  }

  return rows.map(row => mapPromptRowToPrompt(row, currentUserId));
}

export async function getPromptById(promptId: string, currentUserId?: string | null) {
  const { data, error } = await insforge.database.from("prompts").select("*").eq("id", promptId).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const [likedRow] = await addLikedState([data as PromptRow], currentUserId);
  return mapPromptRowToPrompt(likedRow, currentUserId);
}

