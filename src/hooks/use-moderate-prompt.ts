import { useMutation, useQueryClient } from "@tanstack/react-query";

import { moderatePrompt } from "@/lib/prompt-mutations";
import type { PromptStatus } from "@/lib/prompt-types";

export function useModeratePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { promptId: string; status: PromptStatus; rejectionReason?: string }) =>
      moderatePrompt(input.promptId, input.status, input.rejectionReason),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      void queryClient.invalidateQueries({ queryKey: ["public-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["my-prompts"] });
      void queryClient.invalidateQueries({ queryKey: ["prompt"] });
    },
  });
}

