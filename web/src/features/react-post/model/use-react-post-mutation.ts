"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import {
  postQueryKeys,
  type PostReactionStats,
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

const REACTION_COUNT_KEY_BY_TYPE = {
  LIKE: "likeCount",
  LOVE: "loveCount",
  HAHA: "hahaCount",
  WOW: "wowCount",
  SAD: "sadCount",
  ANGRY: "angryCount",
} satisfies Record<
  ReactionType,
  keyof Omit<PostReactionStats, "totalReactionCount">
>;

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

    onMutate: async (input) => {
      await queryClient.cancelQueries({
        queryKey: postQueryKeys.feed(),
      });

      const previousFeed = queryClient.getQueryData<InfiniteData<PostPage>>(
        postQueryKeys.feed(),
      );

      queryClient.setQueryData<InfiniteData<PostPage>>(
        postQueryKeys.feed(),
        (current) =>
          updatePostInFeed(current, input.postId, (post) =>
            applyOptimisticReaction(post, input.type),
          ),
      );

      return { previousFeed };
    },

    onError: (_error, _input, context) => {
      if (context?.previousFeed) {
        queryClient.setQueryData(postQueryKeys.feed(), context.previousFeed);
      }
    },

    onSuccess: (post) => {
      queryClient.setQueryData<InfiniteData<PostPage>>(
        postQueryKeys.feed(),
        (current) => replacePostInFeed(current, post),
      );
    },
  });
}

function updatePostInFeed(
  current: InfiniteData<PostPage> | undefined,
  postId: string,
  updater: (post: Post) => Post,
): InfiniteData<PostPage> | undefined {
  if (!current) return current;

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.id === postId ? updater(post) : post,
      ),
    })),
  };
}

function replacePostInFeed(
  current: InfiniteData<PostPage> | undefined,
  nextPost: Post,
): InfiniteData<PostPage> | undefined {
  if (!current) return current;

  return updatePostInFeed(current, nextPost.id, () => nextPost);
}

function applyOptimisticReaction(
  post: Post,
  nextReaction: ReactionType | null,
): Post {
  const previousReaction = post.currentReaction;

  if (previousReaction === nextReaction) {
    return post;
  }

  return {
    ...post,
    currentReaction: nextReaction,
    reactionStats: getNextReactionStats(
      post.reactionStats,
      previousReaction,
      nextReaction,
    ),
  };
}

function getNextReactionStats(
  reactionStats: PostReactionStats,
  previousReaction: ReactionType | null,
  nextReaction: ReactionType | null,
): PostReactionStats {
  const nextStats = { ...reactionStats };

  if (previousReaction === nextReaction) {
    return nextStats;
  }

  if (previousReaction) {
    const key = getReactionCountKey(previousReaction);
    nextStats[key] = Math.max(0, nextStats[key] - 1);
  }

  if (nextReaction) {
    const key = getReactionCountKey(nextReaction);
    nextStats[key] = nextStats[key] + 1;
  }

  if (!previousReaction && nextReaction) {
    nextStats.totalReactionCount += 1;
  }

  if (previousReaction && !nextReaction) {
    nextStats.totalReactionCount = Math.max(
      0,
      nextStats.totalReactionCount - 1,
    );
  }

  return nextStats;
}

function getReactionCountKey(
  type: ReactionType,
): keyof Omit<PostReactionStats, "totalReactionCount"> {
  return REACTION_COUNT_KEY_BY_TYPE[type];
}
