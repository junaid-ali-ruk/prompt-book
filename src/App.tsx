import { Flame } from "lucide-react";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import FilterBar from "@/components/FilterBar";
import HeroSection from "@/components/HeroSection";
import PageLayout from "@/components/PageLayout";
import PromptCard from "@/components/PromptCard";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import type { AgentTool } from "@/data/prompts";
import { useAuthSession } from "@/hooks/use-auth-session";
import { usePageMetadata } from "@/hooks/use-page-metadata";
import { usePrompts } from "@/hooks/use-prompts";
import { navigateTo, useRouteState } from "@/lib/router";
import "./index.css";

const AdminPage = lazy(() => import("@/components/AdminPage"));
const AuthPage = lazy(() => import("@/components/AuthPage"));
const CreatePromptPage = lazy(() => import("./components/CreatePromptPage"));
const EditPromptPage = lazy(() => import("./components/EditPromptPage"));
const MyPromptsPage = lazy(() => import("@/components/MyPromptsPage"));
const PromptDetailPage = lazy(() => import("./components/PromptDetailPage"));

function PageFallback() {
  return <PageLayout><div className="py-24 text-center text-sm uppercase tracking-[0.18em] text-muted-foreground">Loading…</div></PageLayout>;
}

function NotFoundPage() {
  usePageMetadata({
    title: "Page not found",
    description: "The page you requested could not be found in Prompt Gallery.",
    canonicalPath: window.location.pathname,
    noIndex: true,
  });

  return <main className="flex min-h-screen items-center justify-center bg-background px-6 text-foreground"><div className="space-y-4 text-center"><p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">404</p><h1 className="text-4xl font-bold uppercase tracking-[0.15em]">Page not found</h1><Button type="button" variant="ghost" className="rounded-sm uppercase tracking-[0.12em] text-heat hover:text-heat-glow" onClick={() => navigateTo("/")}>Return to Prompt Gallery</Button></div></main>;
}

function GalleryPage({ currentUserId }: { currentUserId?: string | null }) {
  const [filter, setFilter] = useState<AgentTool | "All">("All");
  const promptsQuery = usePrompts({ agent: filter, search: "", currentUserId });
  const prompts = useMemo(() => promptsQuery.data?.pages.flatMap(page => page.items) ?? [], [promptsQuery.data]);

  usePageMetadata({
    description: "Browse approved AI prompts, copy them quickly, and discover ideas for your next build.",
    canonicalPath: "/",
  });

  return (
    <PageLayout hero={<HeroSection />}>
      <div className="space-y-10">
        <FilterBar active={filter} onChange={setFilter} />
        <div className="flex items-center gap-4"><h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">HOT <span className="text-heat">PROMPTS</span> <Flame className="inline h-3.5 w-3.5" /></h2><div className="h-px flex-1 bg-border" /></div>
        {promptsQuery.isLoading ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse rounded-sm border border-border bg-card/60" />)}</div> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{prompts.map(prompt => <PromptCard key={prompt.id} prompt={prompt} currentUserId={currentUserId} />)}</div>
        {!prompts.length && !promptsQuery.isLoading ? <p className="py-20 text-center text-sm uppercase tracking-wider text-muted-foreground">No prompts found. Be the first to share one.</p> : null}
        {promptsQuery.hasNextPage ? <div className="flex justify-center"><Button type="button" variant="outline" className="rounded-sm uppercase tracking-[0.15em]" onClick={() => promptsQuery.fetchNextPage()} disabled={promptsQuery.isFetchingNextPage}>{promptsQuery.isFetchingNextPage ? "Loading..." : "Load More"}</Button></div> : null}
      </div>
    </PageLayout>
  );
}

export function App() {
  const { route } = useRouteState();
  const { userId } = useAuthSession();

  useEffect(() => {
    if (route.pathname === "/auth" && userId) navigateTo("/me", "replace");
  }, [route.pathname, userId]);

  const content = route.isNotFound
    ? <NotFoundPage />
    : route.pathname === "/auth"
      ? <Suspense fallback={<PageFallback />}><PageLayout><AuthPage /></PageLayout></Suspense>
      : route.pathname === "/share"
        ? <Suspense fallback={<PageFallback />}><PageLayout><CreatePromptPage /></PageLayout></Suspense>
      : route.pathname === "/prompt"
        ? <Suspense fallback={<PageFallback />}><PageLayout><PromptDetailPage promptId={route.promptId} /></PageLayout></Suspense>
      : route.pathname === "/edit"
        ? <Suspense fallback={<PageFallback />}><PageLayout><EditPromptPage promptId={route.promptId} /></PageLayout></Suspense>
      : route.pathname === "/me"
        ? <Suspense fallback={<PageFallback />}><PageLayout><MyPromptsPage /></PageLayout></Suspense>
        : route.pathname === "/admin"
          ? <Suspense fallback={<PageFallback />}><PageLayout><AdminPage /></PageLayout></Suspense>
          : <GalleryPage currentUserId={userId} />;

  return <>{content}<Toaster /></>;
}

export default App;

