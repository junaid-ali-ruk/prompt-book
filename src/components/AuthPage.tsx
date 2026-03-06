import AuthForm from "@/components/AuthForm";
import { usePageMetadata } from "@/hooks/use-page-metadata";

export default function AuthPage() {
  usePageMetadata({
    title: "Sign in or create an account",
    description: "Sign in or create a Prompt Gallery account to share prompts, manage submissions, and access community features.",
    canonicalPath: "/auth",
    noIndex: true,
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6 pt-10 text-center">
      <div className="space-y-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-heat">Prompt Gallery account access</p>
        <h1 className="text-4xl font-bold tracking-[0.08em] text-foreground sm:text-5xl">Sign in or create an account to share and manage prompts</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">Use email and password, Google, or GitHub to publish prompts, track moderation updates, and manage your gallery submissions.</p>
      </div>
      <AuthForm />
    </div>
  );
}

