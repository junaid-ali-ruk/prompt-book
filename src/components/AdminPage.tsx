import { type ReactNode, useMemo, useState } from "react";
import PromptStatusBadge from "@/components/PromptStatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminOverview } from "@/hooks/use-admin-overview";
import { useAdminPrompts } from "@/hooks/use-admin-prompts";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useModeratePrompt } from "@/hooks/use-moderate-prompt";
import { buildAdminOverview } from "@/lib/admin-analytics";
import { getPromptAgentTextClass, truncatePromptPreview } from "@/lib/prompt-helpers";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { navigateTo, openPrompt, openPromptEditor } from "@/lib/router";
import type { PromptStatus } from "@/lib/prompt-types";
import { getSafePromptImageSrc } from "@/lib/url-safety";

const STATUSES: Array<PromptStatus | "all"> = ["pending", "approved", "rejected", "all"];
const STATUS_COLORS: Record<PromptStatus, string> = {
  pending: "#f59e0b",
  approved: "#10b981",
  rejected: "#ef4444",
};

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function OverviewCard({ title, value, description }: { title: string; value: string; description: string }) {
  return <div className="rounded-sm border border-border bg-card p-4 shadow-card"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{title}</p><p className="mt-3 text-3xl font-semibold text-foreground">{value}</p><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p></div>;
}

function ChartShell({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <div className="rounded-sm border border-border bg-card p-4 shadow-card"><div className="space-y-1"><h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-foreground">{title}</h2><p className="text-sm leading-relaxed text-muted-foreground">{description}</p></div><div className="mt-4">{children}</div></div>;
}

function StatusDonut({ items }: { items: Array<{ status: PromptStatus; label: string; value: number }> }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  const gradient = total ? (() => {
    let current = 0;
    return `conic-gradient(${items.map(item => {
      const next = current + (item.value / total) * 100;
      const segment = `${STATUS_COLORS[item.status]} ${current}% ${next}%`;
      current = next;
      return segment;
    }).join(", ")})`;
  })() : "conic-gradient(#27272a 0% 100%)";

  return <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center"><div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border border-border" style={{ background: gradient }}><div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-card text-center"><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</p><p className="mt-2 text-3xl font-semibold text-foreground">{total}</p></div></div><div className="space-y-3">{items.map(item => <div key={item.status} className="flex items-center justify-between rounded-sm border border-border bg-background/40 px-3 py-2"><div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.status] }} /><span className="text-sm font-medium text-foreground">{item.label}</span></div><span className="text-sm text-muted-foreground">{item.value}</span></div>)}</div></div>;
}

function HorizontalBarList({ items }: { items: Array<{ label: string; value: number }> }) {
  const maxValue = Math.max(...items.map(item => item.value), 1);

  return <div className="space-y-3">{items.map(item => <div key={item.label} className="space-y-1.5"><div className="flex items-center justify-between text-sm"><span className="font-medium text-foreground">{item.label}</span><span className="text-muted-foreground">{item.value}</span></div><div className="h-2 rounded-full bg-background/70"><div className="h-2 rounded-full bg-gradient-to-r from-heat to-orange-400" style={{ width: `${(item.value / maxValue) * 100}%` }} /></div></div>)}</div>;
}

export default function AdminPage() {
  const { userId, isAdmin } = useAuthSession();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PromptStatus | "all">("pending");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const overviewQuery = useAdminOverview({ currentUserId: userId, enabled: isAdmin });
  const promptsQuery = useAdminPrompts({ search, status, currentUserId: userId, enabled: isAdmin });
  const moderateMutation = useModeratePrompt();
  const prompts = useMemo(() => promptsQuery.data?.pages.flatMap(page => page.items) ?? [], [promptsQuery.data]);
  const overview = useMemo(() => buildAdminOverview(overviewQuery.data ?? []), [overviewQuery.data]);

  usePageMetadata({
    title: "Moderation queue",
    description: "Review and moderate prompt submissions in Prompt Gallery.",
    canonicalPath: "/admin",
    noIndex: true,
  });

  if (!userId || !isAdmin) return <div className="space-y-4 text-center pt-10"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Admin access required</h1><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/")}>Return home</Button></div>;

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-3"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Admin dashboard</h1><p className="text-sm leading-relaxed text-muted-foreground">Monitor the health of Prompt Gallery, review moderation queues, and inspect the latest submission activity.</p></div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><OverviewCard title="Total prompts" value={formatCompactNumber(overview.totals.totalPrompts)} description={`${formatCompactNumber(overview.totals.uniqueAuthors)} creators across the gallery.`} /><OverviewCard title="Total likes" value={formatCompactNumber(overview.totals.totalLikes)} description={`${overview.totals.totalPrompts ? overview.totals.averageLikes.toFixed(1) : "0.0"} likes per prompt on average.`} /><OverviewCard title="Approval rate" value={formatPercent(overview.totals.approvalRate)} description={`${overview.statusBreakdown.find(item => item.status === "approved")?.value ?? 0} prompts are currently approved.`} /><OverviewCard title="Pending review" value={formatPercent(overview.totals.pendingShare)} description={`${overview.statusBreakdown.find(item => item.status === "pending")?.value ?? 0} prompts still need moderation.`} /></div>
      <div className="grid gap-4 xl:grid-cols-2"><ChartShell title="Status mix" description="A quick view of the moderation pipeline across pending, approved, and rejected prompts."><StatusDonut items={overview.statusBreakdown} /></ChartShell><ChartShell title="Tool distribution" description="Which AI tools are driving the most prompt submissions."><HorizontalBarList items={overview.agentBreakdown} /></ChartShell></div>
      <div className="grid gap-4 xl:grid-cols-2"><ChartShell title="Top contributors" description="Creators with the highest number of submissions.">{overview.topAuthors.length ? <HorizontalBarList items={overview.topAuthors} /> : <p className="text-sm text-muted-foreground">No contributor data yet.</p>}</ChartShell><ChartShell title="Website details" description="Live highlights from the strongest and most recent prompt activity."><div className="space-y-4">{overview.topPrompts.length ? <div className="space-y-3"><div><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Most liked prompts</p></div>{overview.topPrompts.map(prompt => <div key={prompt.id} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background/50 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{prompt.title}</p><p className="text-xs text-muted-foreground">{prompt.author}</p></div><span className="shrink-0 text-xs text-muted-foreground">{prompt.likes} likes</span></div>)}</div> : null}{overview.recentPrompts.length ? <div className="space-y-3"><div><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Latest updated prompts</p></div>{overview.recentPrompts.map(prompt => <div key={prompt.id} className="flex items-center justify-between gap-3 rounded-sm border border-border bg-background/50 px-3 py-2"><div className="min-w-0"><p className="truncate text-sm font-medium text-foreground">{prompt.title}</p><p className="text-xs text-muted-foreground">{prompt.author}</p></div><PromptStatusBadge status={prompt.status} /></div>)}</div> : null}</div></ChartShell></div>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]"><Input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search by title, author, tool, or prompt text" className="rounded-sm border-border bg-card" /><div className="flex flex-wrap gap-2">{STATUSES.map(value => <Button key={value} type="button" variant={status === value ? "default" : "outline"} className="rounded-sm text-[11px] uppercase tracking-[0.15em]" onClick={() => setStatus(value)}>{value}</Button>)}</div></div>
      <div className="space-y-3">{prompts.map(prompt => <div key={prompt.id} className="grid gap-4 rounded-sm border border-border bg-card p-4 shadow-card md:grid-cols-[120px_1fr_auto]"><button type="button" onClick={() => openPrompt(prompt.id)} className="overflow-hidden rounded-sm border border-border"><img src={getSafePromptImageSrc(prompt.image)} alt={prompt.title} className="aspect-[4/3] h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]" loading="lazy" decoding="async" referrerPolicy="no-referrer" /></button><div className="space-y-3"><div className="flex flex-wrap items-center gap-2"><PromptStatusBadge status={prompt.status} /><span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{prompt.author}</span><span className={`text-[10px] uppercase tracking-[0.15em] ${getPromptAgentTextClass(prompt.agent)}`}>{prompt.agent}</span><span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{prompt.likes} likes</span></div><button type="button" className="text-left" onClick={() => openPrompt(prompt.id)}><h2 className="text-lg font-semibold uppercase tracking-[0.1em] transition-colors hover:text-heat">{prompt.title}</h2></button><p className="overflow-hidden whitespace-pre-line text-sm leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{truncatePromptPreview(prompt.prompt)}</p>{prompt.rejectionReason ? <p className="text-xs uppercase tracking-[0.15em] text-red-300">Rejection note: {prompt.rejectionReason}</p> : null}{rejectingId === prompt.id ? <div className="space-y-2"><Textarea value={rejectionReason} onChange={event => setRejectionReason(event.target.value)} placeholder="Optional feedback for the creator" className="rounded-sm border-border bg-background" /><Button type="button" variant="destructive" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => moderateMutation.mutate({ promptId: prompt.id, status: "rejected", rejectionReason }, { onSuccess: () => { toast.success("Prompt rejected."); setRejectingId(null); setRejectionReason(""); }, onError: error => toast.error(error instanceof Error ? error.message : "Moderation failed.") })}>Confirm rejection</Button></div> : null}</div><div className="flex flex-col gap-2"><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => openPrompt(prompt.id)}>Open</Button><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => openPromptEditor(prompt.id)}>Edit</Button><Button type="button" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => moderateMutation.mutate({ promptId: prompt.id, status: "approved" }, { onSuccess: () => toast.success("Prompt approved."), onError: error => toast.error(error instanceof Error ? error.message : "Moderation failed.") })}>Approve</Button><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => { setRejectingId(rejectingId === prompt.id ? null : prompt.id); setRejectionReason(prompt.rejectionReason ?? ""); }}>{rejectingId === prompt.id ? "Close reject" : "Reject"}</Button></div></div>)}{!prompts.length && !promptsQuery.isLoading ? <p className="py-16 text-center text-sm uppercase tracking-[0.15em] text-muted-foreground">No prompts in this moderation bucket.</p> : null}</div>
      {promptsQuery.hasNextPage ? <div className="flex justify-center"><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => promptsQuery.fetchNextPage()} disabled={promptsQuery.isFetchingNextPage}>{promptsQuery.isFetchingNextPage ? "Loading..." : "Load More"}</Button></div> : null}
    </div>
  );
}

