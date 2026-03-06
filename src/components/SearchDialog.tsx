import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { usePrompts } from "@/hooks/use-prompts";
import { formatSearchResultPreview, getPromptAgentTextClass, selectPromptFromSearch } from "@/lib/prompt-helpers";
import { getSafePromptImageSrc } from "@/lib/url-safety";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const { userId } = useAuthSession();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query.trim(), 250);
  const shouldSearch = open && debouncedQuery.length >= 2;
  const resultsQuery = usePrompts({ agent: "All", search: debouncedQuery, currentUserId: userId, enabled: shouldSearch });
  const results = useMemo(() => resultsQuery.data?.pages.flatMap(page => page.items) ?? [], [resultsQuery.data]);

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl gap-0 overflow-hidden border-border bg-card p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Search prompts</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search prompts by title, tool, or text" autoFocus className="flex-1 bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
          <kbd className="hidden items-center rounded-sm border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground sm:inline-flex">ESC</kbd>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {!debouncedQuery.length ? <div className="py-10 text-center text-xs uppercase tracking-wider text-muted-foreground">Type at least 2 characters to search the gallery.</div> : null}
          {debouncedQuery.length === 1 ? <div className="py-10 text-center text-xs uppercase tracking-wider text-muted-foreground">Keep typing to search by title, tool, or prompt text.</div> : null}
          {resultsQuery.isLoading ? <div className="py-10 text-center text-xs uppercase tracking-wider text-muted-foreground">Searching prompts...</div> : null}
          {shouldSearch && !resultsQuery.isLoading && results.length === 0 ? <div className="py-10 text-center text-xs uppercase tracking-wider text-muted-foreground">No prompts matched that search.</div> : null}
          {shouldSearch && results.length > 0 ? <div className="py-2"><div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Prompts</div>{results.map(prompt => <button key={prompt.id} onClick={() => selectPromptFromSearch(prompt.id, onOpenChange)} className="group flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors hover:bg-secondary/50"><img src={getSafePromptImageSrc(prompt.image)} alt={prompt.title} className="h-12 w-12 shrink-0 rounded-sm border border-border object-cover" loading="lazy" decoding="async" referrerPolicy="no-referrer" /><div className="min-w-0 flex-1"><div className="truncate text-xs font-semibold uppercase tracking-wide text-foreground">{prompt.title}</div><div className="mt-0.5 overflow-hidden whitespace-pre-line text-[10px] leading-relaxed text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]">{formatSearchResultPreview(prompt.prompt)}</div></div><span className={`shrink-0 pt-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] ${getPromptAgentTextClass(prompt.agent)}`}>{prompt.agent}</span></button>)}{resultsQuery.hasNextPage ? <div className="px-4 py-3"><Button type="button" variant="outline" className="w-full rounded-sm uppercase tracking-[0.15em]" onClick={() => resultsQuery.fetchNextPage()} disabled={resultsQuery.isFetchingNextPage}>{resultsQuery.isFetchingNextPage ? "Loading..." : "Load More Results"}</Button></div> : null}</div> : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}

