import type { PromptRecord, PromptRow } from "@/lib/prompt-types";

export function mapPromptRowToPrompt(row: PromptRow, currentUserId?: string | null): PromptRecord {
  const rawLikes = row.likes_count ?? row.like_count ?? 0;
  const likes = typeof rawLikes === "string" ? Number(rawLikes) : rawLikes;

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    prompt: row.prompt,
    image: row.image_url,
    liveUrl: row.live_url ?? undefined,
    agent: row.agent,
    author: row.author_name,
    likes: Number.isFinite(likes) ? likes : 0,
    likedByMe: Boolean(row.liked_by_me),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status,
    rejectionReason: row.rejection_reason ?? undefined,
    imageSourceType: row.image_source_type,
    imageKey: row.image_key ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    isOwner: Boolean(currentUserId) && row.user_id === currentUserId,
  };
}

