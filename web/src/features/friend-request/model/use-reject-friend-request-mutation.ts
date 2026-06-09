"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendRequestQueryKeys } from "./friend-request-query-keys";
import { rejectFriendRequestAction } from "../server/reject-friend-request.action";

type RejectFriendRequestVariables = {
  requestId: string;
};

export function useRejectFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: RejectFriendRequestVariables) => {
      const result = await rejectFriendRequestAction({
        requestId,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.request;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.incoming(),
      });
    },
  });
}
