export const PROMPT_TOAST_CLASSNAMES = {
  toast: "group toast rounded-sm border border-border bg-card text-foreground shadow-card-hover font-mono",
  title: "text-[10px] font-semibold uppercase tracking-[0.15em] text-foreground",
  description: "text-xs leading-5 text-muted-foreground",
  actionButton: "rounded-sm border border-[hsl(var(--heat)/0.35)] bg-[hsl(var(--heat))] text-primary-foreground text-[10px] font-semibold uppercase tracking-[0.15em]",
  cancelButton: "rounded-sm border border-border bg-secondary text-muted-foreground text-[10px] font-semibold uppercase tracking-[0.15em]",
  closeButton: "border-border bg-card text-muted-foreground hover:text-heat",
  success: "border-[hsl(var(--heat)/0.35)]",
  error: "border-red-500/35",
  warning: "border-amber-500/35",
  info: "border-border",
} as const;

export function getCopiedToastMessage(subject: string) {
  return `${subject} copied.`;
}

