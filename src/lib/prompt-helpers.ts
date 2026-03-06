import { openPrompt } from "./router";

export function truncatePromptPreview(promptText: string, maxLines = 3) {
  const lines = promptText.split(/\r?\n/);

  if (lines.length <= maxLines) {
    return promptText;
  }

  const preview = lines.slice(0, maxLines).join("\n").trimEnd();
  return `${preview}...`;
}

export function formatSearchResultPreview(promptText: string) {
  return truncatePromptPreview(promptText, 3);
}

const AGENT_TEXT_CLASSNAMES: Record<string, string> = {
  Lovable: "text-heat font-semibold",
  v0: "text-[hsl(20,60%,50%)]",
  Bolt: "text-[hsl(45,70%,50%)]",
  Cursor: "text-muted-foreground",
  Other: "text-muted-foreground",
};

export function getPromptAgentTextClass(agent: string) {
  return AGENT_TEXT_CLASSNAMES[agent] ?? "text-muted-foreground";
}

export function formatPromptDetailMetaLabels(input: {
  status?: string;
  agent: string;
  author: string;
  showModerationStatus: boolean;
}) {
  const labels = input.showModerationStatus && input.status
    ? [input.status, input.agent, input.author]
    : [input.agent, input.author];

  return labels;
}

export function selectPromptFromSearch(
  promptId: string,
  onOpenChange: (open: boolean) => void,
  navigateToPrompt: (promptId: string) => void = openPrompt,
) {
  navigateToPrompt(promptId);
  onOpenChange(false);
}