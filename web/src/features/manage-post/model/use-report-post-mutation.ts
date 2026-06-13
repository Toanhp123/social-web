"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reportPostAction } from "./manage-post.action";
import { managePostQueryKeys } from "./manage-post-query-keys";

type ReportPostMutationInput = {
  postId: string;
  reason?: string;
};

export function useReportPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReportPostMutationInput) => {
      const result = await reportPostAction(input);

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
