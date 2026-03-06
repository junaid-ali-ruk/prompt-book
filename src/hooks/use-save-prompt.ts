import { useMutation, useQueryClient } from "@tanstack/react-query";

import { savePrompt, type SavePromptInput } from "@/lib/prompt-mutations";
import { queryKeys } from "@/lib/query-keys";

export function useSavePrompt(currentUserId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SavePromptInput) => savePrompt(input, currentUserId!),
    onSuccess: savedPrompt => {
      void queryClient.invalidateQueries({ queryKey: ["public-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["my-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      queryClient.setQueryData(queryKeys.promptDetail(savedPrompt.id, currentUserId), savedPrompt);
    },
  });
}

