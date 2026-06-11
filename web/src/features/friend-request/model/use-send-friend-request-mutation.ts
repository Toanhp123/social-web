"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendRequestQueryKeys } from "./friend-request-query-keys";
import { sendFriendRequestAction } from "../server/send-friend-request.action";

type SendFriendRequestVariables = {
  receiverId: string;
  query?: string;
};

export function useSendFriendRequestMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ receiverId }: SendFriendRequestVariables) => {
      const result = await sendFriendRequestAction({
        receiverId,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.request;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.outgoing(),
      });
      queryClient.invalidateQueries({
        queryKey: friendRequestQueryKeys.all,
      });
    },
  });
}
