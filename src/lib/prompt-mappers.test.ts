import { describe, expect, it } from "bun:test";

import { mapPromptRowToPrompt } from "./prompt-mappers";

describe("mapPromptRowToPrompt", () => {
  it("maps an InsForge row into a prompt record", () => {
    const prompt = mapPromptRowToPrompt(
      {
        id: "prompt-1",
        user_id: "user-1",
        title: "Prompt Title",
        prompt: "Do the thing",
        image_url: "https://cdn.example.com/image.png",
        live_url: "https://example.com/demo",
        agent: "Lovable",
        author_name: "Junaid",
        status: "approved",
        rejection_reason: null,
        created_at: "2026-03-06T00:00:00.000Z",
        updated_at: "2026-03-06T00:00:00.000Z",
        image_source_type: "upload",
        image_key: "prompt-screenshots/abc.png",
        approved_at: "2026-03-06T01:00:00.000Z",
        approved_by: "admin-1",
        likes_count: 7,
        liked_by_me: true,
      },
      "user-1",
    );

    expect(prompt).toMatchObject({
      id: "prompt-1",
      title: "Prompt Title",
      image: "https://cdn.example.com/image.png",
      likes: 7,
      likedByMe: true,
      isOwner: true,
      status: "approved",
    });
  });

  it("falls back safely when optional values are missing", () => {
    const prompt = mapPromptRowToPrompt({
      id: "prompt-2",
      user_id: "user-2",
      title: "Fallback",
      prompt: "Keep going",
      image_url: "https://cdn.example.com/fallback.png",
      live_url: null,
      agent: "Other",
      author_name: "Anon",
      status: "pending",
      rejection_reason: "Needs more detail",
      created_at: "2026-03-06T00:00:00.000Z",
      updated_at: "2026-03-06T00:00:00.000Z",
      image_source_type: "url",
      image_key: null,
      approved_at: null,
      approved_by: null,
    });

    expect(prompt.likes).toBe(0);
    expect(prompt.likedByMe).toBe(false);
    expect(prompt.rejectionReason).toBe("Needs more detail");
  });
});
