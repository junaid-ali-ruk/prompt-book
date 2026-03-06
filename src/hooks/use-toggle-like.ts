import { useMutation, useQueryClient } from "@tanstack/react-query";

import { togglePromptLike } from "@/lib/prompt-mutations";

export function useToggleLike(currentUserId?: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { promptId: string; likedByMe: boolean }) => togglePromptLike(input.promptId, input.likedByMe, currentUserId!),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["public-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["my-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["prompt"] });
    },
  });
}

