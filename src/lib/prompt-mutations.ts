import { insforge } from "@/lib/insforge";
import { optimizePromptImageFile } from "@/lib/image-optimization";
import { mapPromptRowToPrompt } from "@/lib/prompt-mappers";
import type { ImageSourceType, PromptRecord, PromptRow, PromptStatus } from "@/lib/prompt-types";
import { assertValidImageFile, normalizeHttpUrl } from "@/lib/url-safety";

const SCREENSHOT_BUCKET = "prompt-screenshots";

function sanitizeFileName(fileName: string) {
  const sanitizedFileName = fileName.toLowerCase().replace(/[^a-z0-9._-]+/g, "-").replace(/-+/g, "-");
  return sanitizedFileName.replace(/^-|-$/g, "") || "image";
}

export interface SavePromptInput {
  promptId?: string;
  title: string;
  prompt: string;
  agent: string;
  authorName: string;
  liveUrl?: string;
  imageSourceType: ImageSourceType;
  imageUrl?: string;
  imageFile?: File | null;
  existingImageKey?: string;
  existingImageUrl?: string;
}

async function uploadPromptImage(file: File, userId: string) {
  assertValidImageFile(file);
  const optimizedFile = await optimizePromptImageFile(file);
  const path = `users/${userId}/${Date.now()}-${sanitizeFileName(optimizedFile.name)}`;
  const { data, error } = await insforge.storage.from(SCREENSHOT_BUCKET).upload(path, optimizedFile);
  if (error || !data) throw error ?? new Error("Image upload failed.");
  return { image_url: data.url, image_key: data.key };
}

async function cleanupImage(imageKey?: string | null) {
  if (!imageKey) return;
  await insforge.storage.from(SCREENSHOT_BUCKET).remove(imageKey);
}

export async function savePrompt(input: SavePromptInput, userId: string): Promise<PromptRecord> {
  let uploadedImageKey: string | undefined;
  const normalizedLiveUrl = input.liveUrl?.trim() ? normalizeHttpUrl(input.liveUrl) : null;
  if (input.liveUrl?.trim() && !normalizedLiveUrl) {
    throw new Error("Live demo URL must use http:// or https://.");
  }

  const normalizedImageUrl = input.imageSourceType === "url" ? normalizeHttpUrl(input.imageUrl) : null;
  if (input.imageSourceType === "url" && !normalizedImageUrl) {
    throw new Error("Image URL must use http:// or https://.");
  }

  let nextImageUrl = normalizedImageUrl ?? input.existingImageUrl ?? "";
  let nextImageKey = input.imageSourceType === "upload" ? input.existingImageKey ?? null : null;

  try {
    if (input.imageSourceType === "upload") {
      if (input.imageFile) {
        const upload = await uploadPromptImage(input.imageFile, userId);
        nextImageUrl = upload.image_url;
        nextImageKey = upload.image_key;
        uploadedImageKey = upload.image_key;
      }
      if (!nextImageUrl || !nextImageKey) throw new Error("Upload a screenshot before submitting.");
    }

    const payload = {
      user_id: userId,
      title: input.title.trim(),
      prompt: input.prompt.trim(),
      agent: input.agent,
      author_name: input.authorName.trim(),
      live_url: normalizedLiveUrl,
      image_url: nextImageUrl,
      image_key: nextImageKey,
      image_source_type: input.imageSourceType,
    };

    const query = input.promptId
      ? insforge.database.from("prompts").update(payload).eq("id", input.promptId).select()
      : insforge.database.from("prompts").insert(payload).select();

    const { data, error } = await query;
    if (error || !data?.[0]) throw error ?? new Error("Prompt save failed.");

    const savedPrompt = mapPromptRowToPrompt(data[0] as PromptRow, userId);
    const previousImageKey = input.existingImageKey && input.existingImageKey !== savedPrompt.imageKey ? input.existingImageKey : null;

    if (previousImageKey) {
      void cleanupImage(previousImageKey);
    }

    return savedPrompt;
  } catch (error) {
    if (uploadedImageKey) await cleanupImage(uploadedImageKey);
    throw error;
  }
}

export async function deletePrompt(promptId: string, imageKey?: string) {
  const { error } = await insforge.database.from("prompts").delete().eq("id", promptId);
  if (error) throw error;
  await cleanupImage(imageKey);
}

export async function togglePromptLike(promptId: string, likedByMe: boolean, userId: string) {
  if (likedByMe) {
    const { error } = await insforge.database.from("prompt_likes").delete().eq("prompt_id", promptId).eq("user_id", userId);
    if (error) throw error;
    return false;
  }

  const { error } = await insforge.database.from("prompt_likes").insert({ prompt_id: promptId, user_id: userId });
  if (error) throw error;
  return true;
}

export async function moderatePrompt(promptId: string, status: PromptStatus, rejectionReason?: string) {
  const { data, error } = await insforge.database
    .from("prompts")
    .update({ status, rejection_reason: status === "rejected" ? rejectionReason?.trim() || null : null })
    .eq("id", promptId)
    .select();

  if (error || !data?.[0]) throw error ?? new Error("Moderation update failed.");
  return mapPromptRowToPrompt(data[0] as PromptRow);
}

