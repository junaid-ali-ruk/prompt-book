import PromptForm from "@/components/PromptForm";
import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { navigateTo } from "@/lib/router";

export default function CreatePromptPage() {
  const { userId, displayName } = useAuthSession();

  usePageMetadata({
    title: "Share a prompt",
    description: "Create and submit a new AI prompt to Prompt Gallery.",
    canonicalPath: "/share",
    noIndex: true,
  });

  if (!userId) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 pt-10 text-center">
        <div className="space-y-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-heat">Share a new prompt</p>
          <h1 className="text-4xl font-bold tracking-[0.08em] text-foreground sm:text-5xl">Sign in to publish a new prompt</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">Create an account or sign in to upload a preview image, add prompt details, and submit your work for review.</p>
        </div>
        <Button className="rounded-sm uppercase tracking-[0.15em]" onClick={() => navigateTo("/auth")}>Go to sign in</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 pt-4">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-heat">New prompt submission</p>
        <h1 className="text-4xl font-bold tracking-[0.08em] text-foreground sm:text-5xl">Share your AI prompt</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">Add the full prompt, choose the AI tool you used, and upload a preview image before submitting it to Prompt Gallery.</p>
      </div>
      <div className="rounded-sm border border-border bg-card p-6 shadow-card">
        <PromptForm currentUserId={userId} defaultAuthorName={displayName} onSaved={() => navigateTo("/me")} />
      </div>
    </div>
  );
}