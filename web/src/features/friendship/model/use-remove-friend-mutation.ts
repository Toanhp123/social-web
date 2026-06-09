"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { friendshipQueryKeys } from "./friendship-query-keys";
import { removeFriendAction } from "../server/remove-friend.action";

type RemoveFriendVariables = {
  friendId: string;
};

export function useRemoveFriendMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ friendId }: RemoveFriendVariables) => {
      const result = await removeFriendAction({
        friendId,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendshipQueryKeys.friends(),
      });
    },
  });
}
