"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followQueryKeys } from "./follow-query-keys";
import { unfollowUserAction } from "../server/unfollow-user.action";

type UnfollowUserVariables = {
  userId: string;
};

export function useUnfollowUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId }: UnfollowUserVariables) => {
      const result = await unfollowUserAction({ userId });

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
