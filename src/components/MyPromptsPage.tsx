import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PromptStatusBadge from "@/components/PromptStatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useMyPrompts } from "@/hooks/use-my-prompts";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { deletePrompt } from "@/lib/prompt-mutations";
import { getPromptAgentTextClass, truncatePromptPreview } from "@/lib/prompt-helpers";
import { navigateTo, openPrompt, openPromptEditor } from "@/lib/router";
import type { PromptStatus } from "@/lib/prompt-types";
import { getSafePromptImageSrc } from "@/lib/url-safety";

const STATUSES: Array<PromptStatus | "all"> = ["all", "pending", "approved", "rejected"];

export default function MyPromptsPage() {
  const queryClient = useQueryClient();
  const { userId } = useAuthSession();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PromptStatus | "all">("all");
  const promptsQuery = useMyPrompts({ search, status, currentUserId: userId });
  const prompts = useMemo(() => promptsQuery.data?.pages.flatMap(page => page.items) ?? [], [promptsQuery.data]);

  usePageMetadata({
    title: "My prompts",
    description: "Manage your Prompt Gallery submissions, updates, and moderation feedback.",
    canonicalPath: "/me",
    noIndex: true,
  });

  const deleteMutation = useMutation({
    mutationFn: (input: { id: string; imageKey?: string }) => deletePrompt(input.id, input.imageKey),
    onSuccess: () => { toast.success("Prompt deleted."); void queryClient.invalidateQueries({ queryKey: ["my-prompts"] }); void queryClient.invalidateQueries({ queryKey: ["public-prompts"] }); void queryClient.invalidateQueries({ queryKey: ["admin-prompts"] }); },
    onError: error => toast.error(error instanceof Error ? error.message : "Delete failed."),
  });

  if (!userId) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Sign in to manage your prompts</h1><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/auth")}>Go to sign in</Button></div>;

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-3"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">My Prompts</h1><p className="text-sm leading-relaxed text-muted-foreground">Track submissions, update prompt details, and review moderation feedback in one place.</p></div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search your prompts by title or content" className="rounded-sm border-border bg-card" /><div className="flex flex-wrap gap-2">{STATUSES.map(value => <Button key={value} type="button" variant={status === value ? "default" : "outline"} className="rounded-sm text-[11px] uppercase tracking-[0.15em]" onClick={() => setStatus(value)}>{value}</Button>)}</div></div>
      <div className="space-y-3">{prompts.map(prompt => <div key={prompt.id} className="grid gap-4 rounded-sm border border-border bg-card p-4 shadow-card md:grid-cols-[120px_1fr_auto]"><button type="button" onClick={() => openPrompt(prompt.id)} className="overflow-hidden rounded-sm border border-border"><img src={getSafePromptImageSrc(prompt.image)} alt={prompt.title} className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" loading="lazy" decoding="async" referrerPolicy="no-referrer" /></button><div className="space-y-3"><div className="flex flex-wrap items-center gap-2"><PromptStatusBadge status={prompt.status} /><span className={`text-[10px] uppercase tracking-[0.15em] ${getPromptAgentTextClass(prompt.agent)}`}>{prompt.agent}</span></div><button type="button" className="text-left" onClick={() => openPrompt(prompt.id)}><h2 className="text-lg font-semibold uppercase tracking-[0.1em] transition-colors hover:text-heat">{prompt.title}</h2></button><p className="overflow-hidden whitespace-pre-line text-sm leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{truncatePromptPreview(prompt.prompt)}</p>{prompt.rejectionReason ? <p className="text-xs uppercase tracking-[0.15em] text-red-300">Rejection note: {prompt.rejectionReason}</p> : null}</div><div className="flex flex-col gap-2"><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => openPrompt(prompt.id)}>Open</Button><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => openPromptEditor(prompt.id)}>Edit</Button><Button type="button" variant="destructive" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => deleteMutation.mutate({ id: prompt.id, imageKey: prompt.imageKey })}>Delete</Button></div></div>)}{!prompts.length && !promptsQuery.isLoading ? <p className="py-16 text-center text-sm uppercase tracking-[0.15em] text-muted-foreground">No prompts yet. Share your first one from the navigation bar.</p> : null}</div>
      {promptsQuery.hasNextPage ? <div className="flex justify-center"><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => promptsQuery.fetchNextPage()} disabled={promptsQuery.isFetchingNextPage}>{promptsQuery.isFetchingNextPage ? "Loading..." : "Load More"}</Button></div> : null}
    </div>
  );
}

