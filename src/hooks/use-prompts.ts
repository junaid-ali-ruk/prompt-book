import { useInfiniteQuery } from "@tanstack/react-query";

import type { AgentTool } from "@/data/prompts";
import { listPublicPrompts } from "@/lib/prompt-queries";
import { queryKeys } from "@/lib/query-keys";

export function usePrompts(params: { agent: AgentTool | "All"; search: string; currentUserId?: string | null; enabled?: boolean }) {
  const { enabled, ...queryParams } = params;

  return useInfiniteQuery({
    queryKey: queryKeys.publicPrompts({ agent: queryParams.agent, search: queryParams.search, userId: queryParams.currentUserId }),
    initialPageParam: 0,
    enabled: enabled ?? true,
    queryFn: ({ pageParam }) => listPublicPrompts({ ...queryParams, offset: pageParam }),
    getNextPageParam: lastPage => lastPage.nextOffset,
  });
}

