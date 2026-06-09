"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendRequestQueryKeys } from "./friend-request-query-keys";
import { cancelFriendRequestAction } from "../server/cancel-friend-request.action";

type CancelFriendRequestVariables = {
  requestId: string;
};

export function useCancelFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: CancelFriendRequestVariables) => {
      const result = await cancelFriendRequestAction({
        requestId,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.outgoing(),
      });
    },
  });
}
