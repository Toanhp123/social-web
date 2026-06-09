"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendshipQueryKeys } from "@/features/friendship/model/friendship-query-keys";
import { acceptFriendRequestAction } from "../server/accept-friend-request.action";
import { friendRequestQueryKeys } from "./friend-request-query-keys";

type AcceptFriendRequestVariables = {
  requestId: string;
};

export function useAcceptFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ requestId }: AcceptFriendRequestVariables) => {
      const result = await acceptFriendRequestAction({
        requestId,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.incoming(),
      });

      queryClient.invalidateQueries({
        queryKey: friendshipQueryKeys.friends(),
      });
    },
  });
}
