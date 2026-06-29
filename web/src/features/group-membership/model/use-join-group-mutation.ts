"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postFeedQueryKeys } from "@/features/post-feed";
import { groupQueryKeys } from "./group-membership-query-keys";
import { joinGroupAction } from "./join-group.action";

export function useJoinGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ groupId }: { groupId: string }) => {
      const result = await joinGroupAction({ groupId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.result;
    },
    onSuccess: (result) => {
      queryClient.setQueryData(
        groupQueryKeys.detail(result.group.id),
        result.group,
      );
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: postFeedQueryKeys.feed({ groupId: result.group.id }),
      });
    },
  });
}
