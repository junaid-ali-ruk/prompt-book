import { Flame, Search } from "lucide-react";
import { lazy, Suspense, useEffect, useState } from "react";
import SharePromptDialog from "@/components/SharePromptDialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { useAuthSession } from "@/hooks/use-auth-session";
import { insforge } from "@/lib/insforge";
import { navigateTo } from "@/lib/router";

const SearchDialog = lazy(() => import("@/components/SearchDialog"));

export default function Navbar() {
  const { userId, isAdmin, displayName } = useAuthSession();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleSignOut = async () => {
    const { error } = await insforge.auth.signOut();
    if (error) return toast.error(error.message);
    toast.success("Signed out.");
    navigateTo("/");
  };

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-[hsl(var(--background)/0.9)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-6">
          <button onClick={() => navigateTo("/")} className="flex shrink-0 items-center gap-1.5 text-sm font-bold uppercase tracking-[0.15em]">
            <span className="text-foreground">PROMPT</span>
            <span className="text-heat-glow">GALLERY</span>
            <Flame className="h-4 w-4 text-heat-glow" />
          </button>

          <button
            onClick={() => setSearchOpen(true)}
            className="flex w-full max-w-xs items-center gap-2 overflow-hidden rounded-sm border border-border bg-secondary/50 px-3 py-1.5 transition-colors hover:border-[hsl(var(--heat)/0.3)] sm:w-64"
          >
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="min-w-0 flex-1 truncate whitespace-nowrap text-left text-[11px] tracking-wider text-muted-foreground">Search prompts or tools</span>
            <kbd className="hidden items-center rounded-sm border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-muted-foreground sm:inline-flex">
              ⌘K
            </kbd>
          </button>

          <div className="flex items-center gap-2">
            {userId ? <span className="hidden text-[10px] uppercase tracking-[0.15em] text-muted-foreground xl:inline">{displayName}</span> : null}
            {userId ? <Button type="button" variant="ghost" className="hidden rounded-sm text-[11px] uppercase tracking-[0.15em] md:inline-flex" onClick={() => navigateTo("/me")}>My prompts</Button> : <Button type="button" variant="ghost" className="rounded-sm text-[11px] uppercase tracking-[0.15em]" onClick={() => navigateTo("/auth")}>Sign in / Sign up</Button>}
            {isAdmin ? <Button type="button" variant="ghost" className="hidden rounded-sm text-[11px] uppercase tracking-[0.15em] md:inline-flex" onClick={() => navigateTo("/admin")}>Admin</Button> : null}
            <SharePromptDialog />
            {userId ? <Button type="button" variant="outline" className="hidden rounded-sm text-[11px] uppercase tracking-[0.15em] md:inline-flex" onClick={() => void handleSignOut()}>Sign out</Button> : null}
          </div>
        </div>
      </nav>

      {searchOpen ? <Suspense fallback={null}><SearchDialog open={searchOpen} onOpenChange={setSearchOpen} /></Suspense> : null}
    </>
  );
}