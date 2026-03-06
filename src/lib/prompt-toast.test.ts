import { describe, expect, it } from "bun:test";

import { PROMPT_TOAST_CLASSNAMES, getCopiedToastMessage } from "./prompt-toast";

describe("PROMPT_TOAST_CLASSNAMES", () => {
  it("matches the prompt-book shell styling", () => {
    expect(PROMPT_TOAST_CLASSNAMES.toast).toContain("bg-card");
    expect(PROMPT_TOAST_CLASSNAMES.toast).toContain("border-border");
    expect(PROMPT_TOAST_CLASSNAMES.toast).toContain("shadow-card-hover");
    expect(PROMPT_TOAST_CLASSNAMES.title).toContain("uppercase");
    expect(PROMPT_TOAST_CLASSNAMES.description).toContain("text-muted-foreground");
  });
});

describe("getCopiedToastMessage", () => {
  it("uses site-consistent copy without emoji", () => {
    expect(getCopiedToastMessage("Prompt")).toBe("Prompt copied.");
  });
});
