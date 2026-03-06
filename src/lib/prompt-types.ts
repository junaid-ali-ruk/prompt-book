import type { AgentTool } from "@/data/prompts";

export type PromptStatus = "pending" | "approved" | "rejected";
export type ImageSourceType = "upload" | "url";

export interface PromptRow {
  id: string;
  user_id: string;
  title: string;
  prompt: string;
  image_url: string;
  live_url: string | null;
  agent: AgentTool;
  author_name: string;
  status: PromptStatus;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  image_source_type: ImageSourceType;
  image_key: string | null;
  approved_at: string | null;
  approved_by: string | null;
  likes_count?: number | string | null;
  like_count?: number | string | null;
  liked_by_me?: boolean | null;
}

export interface PromptRecord {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  image: string;
  liveUrl?: string;
  agent: AgentTool;
  author: string;
  likes: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
  status?: PromptStatus;
  rejectionReason?: string;
  imageSourceType?: ImageSourceType;
  imageKey?: string;
  approvedAt?: string;
  approvedBy?: string;
  isOwner?: boolean;
}

