"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  postQueryKeys,
  type Post,
  type PostPage,
  type ReactionType,
} from "@/entities/post";
import {
  removePostReactionAction,
  setPostReactionAction,
} from "./react-post.action";

type ReactPostMutationInput =
  | { postId: string; type: ReactionType }
  | { postId: string; type: null };

export function useReactPostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ReactPostMutationInput) => {
      const result = input.type
        ? await setPostReactionAction(input)
        : await removePostReactionAction(input.postId);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.post;
    },
    onSuccess: (post) => {
      queryClient.setQueryData<InfiniteData<PostPage>>(
        postQueryKeys.feed(),
        (current) => replacePostInFeed(current, post),
      );
    },
  });
}

function replacePostInFeed(
  current: InfiniteData<PostPage> | undefined,
  nextPost: Post,
): InfiniteData<PostPage> | undefined {
  if (!current) {
    return current;
  }

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.id === nextPost.id ? nextPost : post,
      ),
    })),
  };
}
