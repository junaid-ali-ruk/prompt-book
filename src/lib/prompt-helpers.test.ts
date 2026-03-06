import { describe, expect, it } from "bun:test";

import { formatPromptDetailMetaLabels, formatSearchResultPreview, getPromptAgentTextClass, selectPromptFromSearch, truncatePromptPreview } from "./prompt-helpers";

describe("truncatePromptPreview", () => {
  it("returns the original text when it has three lines or fewer", () => {
    expect(truncatePromptPreview("one\ntwo\nthree")).toBe("one\ntwo\nthree");
  });

  it("truncates text after the third line and appends an ellipsis", () => {
    expect(truncatePromptPreview("one\ntwo\nthree\nfour")).toBe("one\ntwo\nthree...");
  });
});

describe("formatSearchResultPreview", () => {
  it("formats search preview text as a 3-line truncated snippet", () => {
    expect(formatSearchResultPreview("one\ntwo\nthree\nfour")).toBe("one\ntwo\nthree...");
  });
});

describe("selectPromptFromSearch", () => {
  it("opens the selected prompt and closes the search dialog", () => {
    let selectedPromptId: string | null = null;
    let openState: boolean | null = true;

    selectPromptFromSearch(
      "42",
      open => {
        openState = open;
      },
      promptId => {
        selectedPromptId = promptId;
      },
    );

    expect(selectedPromptId).toBe("42");
    expect(openState).toBe(false);
  });
});

describe("formatPromptDetailMetaLabels", () => {
  it("hides moderation status for public viewers and shows agent + author", () => {
    expect(
      formatPromptDetailMetaLabels({
        status: "approved",
        agent: "Lovable",
        author: "Junaid",
        showModerationStatus: false,
      }),
    ).toEqual(["Lovable", "Junaid"]);
  });

  it("keeps moderation status for owners or admins", () => {
    expect(
      formatPromptDetailMetaLabels({
        status: "approved",
        agent: "Lovable",
        author: "Junaid",
        showModerationStatus: true,
      }),
    ).toEqual(["approved", "Lovable", "Junaid"]);
  });
});

describe("getPromptAgentTextClass", () => {
  it("highlights Lovable with the heat accent", () => {
    expect(getPromptAgentTextClass("Lovable")).toContain("text-heat");
  });

  it("keeps unknown agents readable with the default muted style", () => {
    expect(getPromptAgentTextClass("SomethingElse")).toBe("text-muted-foreground");
  });
});