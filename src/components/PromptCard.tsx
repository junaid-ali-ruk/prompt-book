import { Check, Copy, ExternalLink, Heart } from "lucide-react";
import { useState } from "react";
import type { Prompt } from "@/data/prompts";
import { toast } from "@/components/ui/sonner";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { getCopiedToastMessage } from "@/lib/prompt-toast";
import { navigateTo, openPrompt } from "@/lib/router";
import { truncatePromptPreview } from "@/lib/prompt-helpers";
import { getSafePromptImageSrc, getSafePromptLiveUrl } from "@/lib/url-safety";

const agentColors: Record<string, string> = {
  Lovable: "text-heat border-heat",
  v0: "text-[hsl(20,60%,50%)] border-[hsl(20,60%,50%/0.3)]",
  Bolt: "text-[hsl(45,70%,50%)] border-[hsl(45,70%,50%/0.3)]",
  Cursor: "text-muted-foreground border-border",
  Other: "text-muted-foreground border-border",
};

function AuthenticatedLikeButton({ prompt, currentUserId }: { prompt: Prompt; currentUserId: string }) {
  const likeMutation = useToggleLike(currentUserId);

  return (
    <button
      onClick={event => {
        event.stopPropagation();
        if (!currentUserId) return navigateTo("/auth");
        likeMutation.mutate({ promptId: prompt.id, likedByMe: Boolean(prompt.likedByMe) }, { onError: error => toast.error(error instanceof Error ? error.message : "Like failed.") });
      }}
      disabled={likeMutation.isPending}
      className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-heat"
    >
      <Heart className={`h-3.5 w-3.5 transition-all ${prompt.likedByMe ? "scale-110 fill-[hsl(var(--heat-melting))] text-heat" : ""}`} />
      <span className="tabular-nums font-medium">{prompt.likes}</span>
    </button>
  );
}

export default function PromptCard({ prompt, currentUserId }: { prompt: Prompt; currentUserId?: string | null }) {
  const [copied, setCopied] = useState(false);
  const imageSrc = getSafePromptImageSrc(prompt.image);
  const liveUrl = getSafePromptLiveUrl(prompt.liveUrl);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt.prompt);
      setCopied(true);
      toast.success(getCopiedToastMessage("Prompt"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy the prompt.");
    }
  };

  return (
    <div onClick={() => openPrompt(prompt.id)} className="group relative cursor-pointer overflow-hidden rounded-sm border border-border bg-card transition-all duration-300 hover:border-[hsl(var(--heat)/0.3)] hover:shadow-card-hover">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-border">
        <img src={imageSrc} alt={prompt.title} className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105 group-hover:opacity-100" loading="lazy" decoding="async" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-transparent to-transparent opacity-60" />
        <div className="absolute right-3 top-3 flex gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
          <button onClick={event => { event.stopPropagation(); void copyPrompt(); }} className="rounded-sm border border-border bg-card/80 p-2 backdrop-blur-sm transition-colors hover:border-[hsl(var(--heat)/0.5)]">{copied ? <Check className="h-3.5 w-3.5 text-heat" /> : <Copy className="h-3.5 w-3.5 text-foreground" />}</button>
          {liveUrl ? <a href={liveUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer" onClick={event => event.stopPropagation()} className="rounded-sm border border-border bg-card/80 p-2 backdrop-blur-sm transition-colors hover:border-[hsl(var(--heat)/0.5)]"><ExternalLink className="h-3.5 w-3.5 text-foreground" /></a> : null}
        </div>
        <span className={`absolute left-3 top-3 rounded-sm border bg-card/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] backdrop-blur-sm ${agentColors[prompt.agent] || agentColors.Other}`}>{prompt.agent}</span>
      </div>
      <div className="space-y-3 p-4">
        <h3 className="text-sm font-semibold uppercase leading-tight tracking-wide text-foreground">{prompt.title}</h3>
        <p className="overflow-hidden whitespace-pre-line text-xs leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{truncatePromptPreview(prompt.prompt)}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{prompt.author}</span>
          <div className="flex items-center gap-3"><button onClick={event => { event.stopPropagation(); void copyPrompt(); }} className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:text-heat">{copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}<span>{copied ? "COPIED" : "COPY"}</span></button>{currentUserId ? <AuthenticatedLikeButton prompt={prompt} currentUserId={currentUserId} /> : <button onClick={event => { event.stopPropagation(); navigateTo("/auth"); }} className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-heat"><Heart className="h-3.5 w-3.5" /><span className="tabular-nums font-medium">{prompt.likes}</span></button>}</div>
        </div>
      </div>
    </div>
  );
}

