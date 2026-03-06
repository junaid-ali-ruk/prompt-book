import { describe, expect, it } from "bun:test";

import type { PromptRecord } from "@/lib/prompt-types";

import { buildAdminOverview } from "./admin-analytics";

const prompts: PromptRecord[] = [
  { id: "1", userId: "u1", title: "Prompt A", prompt: "A", image: "/a.png", agent: "Lovable", author: "Junaid", likes: 5, createdAt: "2026-03-01", status: "approved", updatedAt: "2026-03-05" },
  { id: "2", userId: "u2", title: "Prompt B", prompt: "B", image: "/b.png", agent: "Bolt", author: "Amina", likes: 2, createdAt: "2026-03-02", status: "pending", updatedAt: "2026-03-03" },
  { id: "3", userId: "u1", title: "Prompt C", prompt: "C", image: "/c.png", agent: "Lovable", author: "Junaid", likes: 1, createdAt: "2026-03-04", status: "rejected", updatedAt: "2026-03-06" },
];

describe("buildAdminOverview", () => {
  it("summarizes totals, statuses, and rankings", () => {
    const overview = buildAdminOverview(prompts);

    expect(overview.totals.totalPrompts).toBe(3);
    expect(overview.totals.uniqueAuthors).toBe(2);
    expect(overview.totals.totalLikes).toBe(8);
    expect(overview.statusBreakdown.find(item => item.status === "approved")?.value).toBe(1);
    expect(overview.agentBreakdown[0]).toEqual({ label: "Lovable", value: 2 });
    expect(overview.topAuthors[0]).toEqual({ label: "Junaid", value: 2 });
    expect(overview.topPrompts[0]?.title).toBe("Prompt A");
    expect(overview.recentPrompts[0]?.title).toBe("Prompt C");
  });
});