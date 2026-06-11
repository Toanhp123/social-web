"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followQueryKeys } from "./follow-query-keys";
import { followUserAction } from "../server/follow-user.action";

type FollowUserVariables = {
  userId: string;
};

export function useFollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: FollowUserVariables) => {
      const result = await followUserAction({ userId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.status;
    },
    onSuccess: (status, variables) => {
      queryClient.setQueryData(
        followQueryKeys.status(variables.userId),
        status,
      );
      queryClient.invalidateQueries({ queryKey: followQueryKeys.all });
    },
  });
}
