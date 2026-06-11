"use client";

import { useQuery } from "@tanstack/react-query";
import { followQueryKeys } from "./follow-query-keys";
import { getFollowStatusAction } from "../server/get-follow-status.action";

export function useFollowStatusQuery(userId: string) {
  return useQuery({
    queryKey: followQueryKeys.status(userId),
    queryFn: async () => {
      const result = await getFollowStatusAction({ userId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.status;
    },
    enabled: Boolean(userId),
  });
}
