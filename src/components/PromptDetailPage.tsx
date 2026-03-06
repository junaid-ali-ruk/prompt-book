import { ArrowLeft, Check, Copy, ExternalLink, FilePenLine, Heart } from "lucide-react";
import { useState } from "react";
import PromptStatusBadge from "@/components/PromptStatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { usePromptDetail } from "@/hooks/use-prompt-detail";
import { useToggleLike } from "@/hooks/use-toggle-like";
import { formatPromptDetailMetaLabels, getPromptAgentTextClass } from "@/lib/prompt-helpers";
import { getCopiedToastMessage } from "@/lib/prompt-toast";
import { navigateTo, openPromptEditor } from "@/lib/router";
import { summarizeForMetadata } from "@/lib/site-config";
import { getSafePromptImageSrc, getSafePromptLiveUrl } from "@/lib/url-safety";

function AuthenticatedLikeButton({ promptId, likes, likedByMe, currentUserId }: { promptId: string; likes: number; likedByMe?: boolean; currentUserId: string }) {
  const likeMutation = useToggleLike(currentUserId);

  return (
    <button type="button" onClick={() => likeMutation.mutate({ promptId, likedByMe: Boolean(likedByMe) }, { onError: error => toast.error(error instanceof Error ? error.message : "Like failed.") })} className="flex items-center gap-2 rounded-sm border border-border px-4 py-2 transition-all duration-300 hover:border-heat/50 hover:bg-heat/5">
      <Heart className={`h-5 w-5 transition-all ${likedByMe ? "scale-110 fill-[hsl(var(--heat-melting))] text-heat" : "text-foreground"}`} />
      <span className={`tabular-nums font-medium ${likedByMe ? "text-heat" : "text-foreground"}`}>{likes}</span>
    </button>
  );
}

export default function PromptDetailPage({ promptId }: { promptId: string | null }) {
  const { userId, isAdmin } = useAuthSession();
  const promptQuery = usePromptDetail(promptId, userId);
  const prompt = promptQuery.data;
  const [copied, setCopied] = useState(false);

  usePageMetadata({
    title: prompt?.title ?? "Prompt details",
    description: prompt ? summarizeForMetadata(prompt.prompt) : "View a prompt submission in Prompt Gallery.",
    canonicalPath: promptId ? `/prompt?id=${encodeURIComponent(promptId)}` : "/prompt",
    noIndex: Boolean(prompt && prompt.status && prompt.status !== "approved"),
  });

  if (!promptId) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Prompt not found</h1><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/")}>Return home</Button></div>;
  if (promptQuery.isLoading) return <div className="py-24 text-center text-sm uppercase tracking-[0.18em] text-muted-foreground">Loading prompt…</div>;
  if (!prompt) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Prompt not found</h1><p className="text-sm text-muted-foreground">This prompt could not be loaded or you no longer have access to it.</p><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/")}>Return home</Button></div>;

  const imageSrc = getSafePromptImageSrc(prompt.image);
  const liveUrl = getSafePromptLiveUrl(prompt.liveUrl);
  const canEdit = Boolean(userId && (prompt.isOwner || isAdmin));
  const metaLabels = formatPromptDetailMetaLabels({
    status: prompt.status,
    agent: prompt.agent,
    author: prompt.author,
    showModerationStatus: canEdit,
  });

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
    <div className="space-y-6 pt-4">
      <Button type="button" variant="ghost" className="rounded-sm px-0 uppercase tracking-[0.12em] text-muted-foreground hover:text-heat" onClick={() => navigateTo("/")}><ArrowLeft className="mr-2 h-4 w-4" />Back to gallery</Button>
      <div className="grid gap-6 rounded-sm border border-border bg-card p-4 shadow-card lg:grid-cols-[1.1fr_0.9fr] lg:p-6">
        <div className="overflow-hidden rounded-sm border border-border bg-muted"><img src={imageSrc} alt={prompt.title} className="h-full w-full object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" /></div>
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">{canEdit ? <PromptStatusBadge status={prompt.status} /> : null}{metaLabels.filter(label => !(canEdit && label === prompt.status)).map(label => <span key={label} className={`text-[10px] uppercase tracking-[0.15em] ${label === prompt.agent ? getPromptAgentTextClass(prompt.agent) : "text-muted-foreground"}`}>{label}</span>)}</div>
          <div className="space-y-2"><h1 className="text-3xl font-bold tracking-[0.08em] text-foreground sm:text-4xl">{prompt.title}</h1><p className="text-sm leading-relaxed text-muted-foreground">Created {new Date(prompt.createdAt).toLocaleDateString()}{prompt.updatedAt ? ` · Updated ${new Date(prompt.updatedAt).toLocaleDateString()}` : ""}</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-sm border border-border bg-background/60 p-3"><p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Likes</p><p className="mt-2 text-2xl font-semibold text-foreground">{prompt.likes}</p></div><div className="rounded-sm border border-border bg-background/60 p-3"><p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Owner status</p><p className="mt-2 text-sm font-medium text-foreground">{prompt.isOwner ? "Your submission" : "Community prompt"}</p></div></div>
          {prompt.rejectionReason ? <div className="rounded-sm border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200"><p className="text-[10px] uppercase tracking-[0.15em] text-red-300">Moderator note</p><p className="mt-2 whitespace-pre-line">{prompt.rejectionReason}</p></div> : null}
          <div className="flex flex-wrap gap-2"><Button type="button" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => void copyPrompt()}>{copied ? <><Check className="mr-2 h-4 w-4" />Copied</> : <><Copy className="mr-2 h-4 w-4" />Copy prompt</>}</Button>{canEdit ? <Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => openPromptEditor(prompt.id)}><FilePenLine className="mr-2 h-4 w-4" />Edit</Button> : null}{liveUrl ? <Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => window.open(liveUrl, "_blank", "noopener,noreferrer")}><ExternalLink className="mr-2 h-4 w-4" />View live</Button> : null}{userId ? <AuthenticatedLikeButton promptId={prompt.id} likes={prompt.likes} likedByMe={prompt.likedByMe} currentUserId={userId} /> : <Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/auth")}><Heart className="mr-2 h-4 w-4" />Sign in to like</Button>}</div>
        </div>
      </div>
      <div className="rounded-sm border border-border bg-card p-5 shadow-card"><div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold uppercase tracking-[0.1em] text-foreground">Full prompt</h2><span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Ready to copy</span></div><div className="rounded-sm border border-border bg-background/70 p-4"><p className="whitespace-pre-line text-sm leading-7 text-foreground">{prompt.prompt}</p></div></div>
    </div>
  );
}