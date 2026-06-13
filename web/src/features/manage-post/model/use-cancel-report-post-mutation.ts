"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelReportPostAction } from "./manage-post.action";
import { managePostQueryKeys } from "./manage-post-query-keys";

type CancelReportPostMutationInput = {
  postId: string;
};

export function useCancelReportPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CancelReportPostMutationInput) => {
      const result = await cancelReportPostAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.reportStatus;
    },
    onSuccess: (reportStatus, input) => {
      queryClient.setQueryData(
        managePostQueryKeys.reportStatus(input.postId),
        reportStatus,
      );
    },
  });
}
