import { useInfiniteQuery } from "@tanstack/react-query";

import { listMyPrompts } from "@/lib/prompt-queries";
import { queryKeys } from "@/lib/query-keys";
import type { PromptStatus } from "@/lib/prompt-types";

export function useMyPrompts(params: { search: string; status: PromptStatus | "all"; currentUserId?: string | null }) {
  return useInfiniteQuery({
    queryKey: queryKeys.myPrompts({ search: params.search, status: params.status, userId: params.currentUserId }),
    initialPageParam: 0,
    enabled: Boolean(params.currentUserId),
    queryFn: ({ pageParam }) => listMyPrompts({ ...params, offset: pageParam }),
    getNextPageParam: lastPage => lastPage.nextOffset,
  });
}

