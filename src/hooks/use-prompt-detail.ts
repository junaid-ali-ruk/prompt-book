import { useQuery } from "@tanstack/react-query";

import { getPromptById } from "@/lib/prompt-queries";
import { queryKeys } from "@/lib/query-keys";

export function usePromptDetail(promptId?: string | null, currentUserId?: string | null) {
  return useQuery({
    queryKey: queryKeys.promptDetail(promptId ?? "missing", currentUserId),
    queryFn: () => getPromptById(promptId!, currentUserId),
    enabled: Boolean(promptId),
  });
}

