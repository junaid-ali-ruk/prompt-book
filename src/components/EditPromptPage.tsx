import PromptForm from "@/components/PromptForm";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { usePromptDetail } from "@/hooks/use-prompt-detail";
import { navigateTo } from "@/lib/router";

export default function EditPromptPage({ promptId }: { promptId: string | null }) {
  const { userId, displayName, isAdmin } = useAuthSession();
  const promptQuery = usePromptDetail(promptId, userId);
  const prompt = promptQuery.data;

  usePageMetadata({
    title: prompt?.title ? `Edit ${prompt.title}` : "Edit prompt",
    description: "Edit an existing prompt submission in Prompt Gallery.",
    canonicalPath: promptId ? `/edit?id=${encodeURIComponent(promptId)}` : "/edit",
    noIndex: true,
  });

  if (!userId) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Sign in to edit prompts</h1><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/auth")}>Go to sign in</Button></div>;
  if (!promptId) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Prompt not found</h1><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/me")}>Return to my prompts</Button></div>;
  if (promptQuery.isLoading) return <div className="py-24 text-center text-sm uppercase tracking-[0.18em] text-muted-foreground">Loading prompt editor…</div>;
  if (!prompt) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Prompt not found</h1><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/me")}>Return to my prompts</Button></div>;
  if (!prompt.isOwner && !isAdmin) return <div className="space-y-4 pt-10 text-center"><h1 className="text-3xl font-bold uppercase tracking-[0.15em]">Editing not allowed</h1><p className="text-sm text-muted-foreground">You can only edit your own prompts.</p><Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/me")}>Return to my prompts</Button></div>;

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4">
      <div className="space-y-3"><p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-heat">Edit submission</p><h1 className="text-4xl font-bold tracking-[0.08em] text-foreground sm:text-5xl">Update your prompt</h1><p className="text-sm leading-relaxed text-muted-foreground">Edit the full prompt, update the preview image, and resubmit your changes for review.</p></div>
      <div className="rounded-sm border border-border bg-card p-6 shadow-card"><PromptForm currentUserId={userId} defaultAuthorName={displayName} initialPrompt={prompt} submitLabel="Save changes" onSaved={() => navigateTo("/me")} onCancel={() => navigateTo("/me")} /></div>
    </div>
  );
}