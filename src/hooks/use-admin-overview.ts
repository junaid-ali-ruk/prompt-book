import { useQuery } from "@tanstack/react-query";

import { listAllAdminPrompts } from "@/lib/prompt-queries";
import { queryKeys } from "@/lib/query-keys";

export function useAdminOverview(params: { currentUserId?: string | null; enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.adminOverview(params.currentUserId),
    queryFn: () => listAllAdminPrompts(params.currentUserId),
    enabled: Boolean(params.currentUserId) && Boolean(params.enabled),
    staleTime: 30_000,
  });
}