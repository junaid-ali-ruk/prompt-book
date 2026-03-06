import { AGENT_TOOLS } from "@/data/prompts";
import type { PromptRecord, PromptStatus } from "@/lib/prompt-types";

interface BreakdownItem {
  label: string;
  value: number;
}

interface RankedPrompt {
  id: string;
  title: string;
  author: string;
  likes: number;
  status?: PromptStatus;
}

export interface AdminOverviewData {
  totals: {
    totalPrompts: number;
    uniqueAuthors: number;
    totalLikes: number;
    averageLikes: number;
    approvalRate: number;
    pendingShare: number;
  };
  statusBreakdown: Array<BreakdownItem & { status: PromptStatus }>;
  agentBreakdown: BreakdownItem[];
  topAuthors: BreakdownItem[];
  topPrompts: RankedPrompt[];
  recentPrompts: RankedPrompt[];
}

function sortByValue(items: BreakdownItem[]) {
  return [...items].sort((left, right) => right.value - left.value || left.label.localeCompare(right.label));
}

function toTime(value?: string | null) {
  return value ? new Date(value).getTime() : 0;
}

export function buildAdminOverview(prompts: PromptRecord[]): AdminOverviewData {
  const statusCounts: Record<PromptStatus, number> = { pending: 0, approved: 0, rejected: 0 };
  const agentCounts = new Map<string, number>();
  const authorCounts = new Map<string, number>();

  let totalLikes = 0;

  for (const prompt of prompts) {
    if (prompt.status) statusCounts[prompt.status] += 1;
    agentCounts.set(prompt.agent, (agentCounts.get(prompt.agent) ?? 0) + 1);
    authorCounts.set(prompt.author, (authorCounts.get(prompt.author) ?? 0) + 1);
    totalLikes += prompt.likes;
  }

  const totalPrompts = prompts.length;
  const uniqueAuthors = authorCounts.size;
  const approvedCount = statusCounts.approved;
  const pendingCount = statusCounts.pending;

  return {
    totals: {
      totalPrompts,
      uniqueAuthors,
      totalLikes,
      averageLikes: totalPrompts ? totalLikes / totalPrompts : 0,
      approvalRate: totalPrompts ? approvedCount / totalPrompts : 0,
      pendingShare: totalPrompts ? pendingCount / totalPrompts : 0,
    },
    statusBreakdown: [
      { label: "Pending", value: pendingCount, status: "pending" },
      { label: "Approved", value: approvedCount, status: "approved" },
      { label: "Rejected", value: statusCounts.rejected, status: "rejected" },
    ],
    agentBreakdown: sortByValue(AGENT_TOOLS.map(agent => ({ label: agent, value: agentCounts.get(agent) ?? 0 }))),
    topAuthors: sortByValue(Array.from(authorCounts.entries()).map(([label, value]) => ({ label, value }))).slice(0, 5),
    topPrompts: [...prompts].sort((left, right) => right.likes - left.likes || toTime(right.createdAt) - toTime(left.createdAt)).slice(0, 5).map(prompt => ({ id: prompt.id, title: prompt.title, author: prompt.author, likes: prompt.likes, status: prompt.status })),
    recentPrompts: [...prompts].sort((left, right) => toTime(right.updatedAt ?? right.createdAt) - toTime(left.updatedAt ?? left.createdAt)).slice(0, 5).map(prompt => ({ id: prompt.id, title: prompt.title, author: prompt.author, likes: prompt.likes, status: prompt.status })),
  };
}