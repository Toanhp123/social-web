"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { PostPage } from "@/entities/post";
import { postFeedQueryKeys } from "@/features/post-feed";
import { removePostAction } from "./manage-post.action";

type RemovePostMutationInput = {
  postId: string;
};

export function useRemovePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RemovePostMutationInput) => {
      const result = await removePostAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return input.postId;
    },
    onSuccess: (postId) => {
      queryClient.setQueriesData<InfiniteData<PostPage>>(
        { queryKey: postFeedQueryKeys.all },
        (current) => removePostFromFeed(current, postId),
      );
    },
  });
}

function removePostFromFeed(
  current: InfiniteData<PostPage> | undefined,
  postId: string,
): InfiniteData<PostPage> | undefined {
  if (!current) return current;

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.filter((post) => post.id !== postId),
    })),
  };
}
