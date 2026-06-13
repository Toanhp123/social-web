"use client";

import { useQuery } from "@tanstack/react-query";
import { getPostReportStatusAction } from "./manage-post.action";
import { managePostQueryKeys } from "./manage-post-query-keys";

type UsePostReportStatusQueryInput = {
  postId: string;
  enabled?: boolean;
};

export function usePostReportStatusQuery({
  postId,
  enabled = true,
}: UsePostReportStatusQueryInput) {
  return useQuery({
    queryKey: managePostQueryKeys.reportStatus(postId),
    queryFn: async () => {
      const result = await getPostReportStatusAction({ postId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.reportStatus;
    },
    enabled: enabled && Boolean(postId),
  });
}
