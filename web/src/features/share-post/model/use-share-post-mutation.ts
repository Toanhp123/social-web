"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import { postQueryKeys, type Post, type PostPage } from "@/entities/post";
import { sharePostAction } from "./share-post.action";

type SharePostMutationInput = {
  postId: string;
  content?: string;
};

export function useSharePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SharePostMutationInput) => {
      const result = await sharePostAction({
        postId: input.postId,
        content: input.content,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.post;
    },

    onSuccess: (sharedPost, input) => {
      queryClient.setQueryData<InfiniteData<PostPage>>(
        postQueryKeys.feed(),
        (current) => addSharedPostToFeed(current, sharedPost, input.postId),
      );
    },
  });
}

function addSharedPostToFeed(
  current: InfiniteData<PostPage> | undefined,
  sharedPost: Post,
  originalPostId: string,
): InfiniteData<PostPage> | undefined {
  if (!current) return current;

  const [firstPage, ...restPages] = current.pages;

  if (!firstPage) return current;

  return {
    ...current,
    pages: [
      {
        ...firstPage,
        items: [
          sharedPost,
          ...firstPage.items.map((post) =>
            post.id === originalPostId
              ? {
                  ...post,
                  reactionStats: {
                    ...post.reactionStats,
                    shareCount: post.reactionStats.shareCount + 1,
                  },
                }
              : post,
          ),
        ],
      },
      ...restPages,
    ],
  };
}
