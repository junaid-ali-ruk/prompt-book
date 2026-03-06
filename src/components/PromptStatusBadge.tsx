import type { PromptStatus } from "@/lib/prompt-types";
import { cn } from "@/lib/utils";

const statusClasses: Record<PromptStatus, string> = {
  pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",
};

export default function PromptStatusBadge({ status }: { status?: PromptStatus }) {
  if (!status) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]",
        statusClasses[status],
      )}
    >
      {status}
    </span>
  );
}

