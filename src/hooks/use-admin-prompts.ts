import { useInfiniteQuery } from "@tanstack/react-query";

import { listAdminPrompts } from "@/lib/prompt-queries";
import { queryKeys } from "@/lib/query-keys";
import type { PromptStatus } from "@/lib/prompt-types";

export function useAdminPrompts(params: { search: string; status: PromptStatus | "all"; currentUserId?: string | null; enabled?: boolean }) {
  return useInfiniteQuery({
    queryKey: queryKeys.adminPrompts({ search: params.search, status: params.status, userId: params.currentUserId }),
    initialPageParam: 0,
    enabled: Boolean(params.currentUserId) && Boolean(params.enabled),
    queryFn: ({ pageParam }) => listAdminPrompts({ ...params, offset: pageParam }),
    getNextPageParam: lastPage => lastPage.nextOffset,
  });
}

