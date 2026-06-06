"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { InfiniteData } from "@tanstack/react-query";
import type { CommentPage } from "@/entities/comment";
import { postQueryKeys, type PostPage } from "@/entities/post";
import { createPostCommentAction } from "./comment-post.action";

type CreateCommentMutationInput = {
  postId: string;
  parentId?: string;
  content: string;
};

export function useCreateCommentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCommentMutationInput) => {
      const result = await createPostCommentAction(input);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.comment;
    },

    onSuccess: (comment, input) => {
      queryClient.setQueryData<InfiniteData<CommentPage>>(
        postQueryKeys.comments(input.postId, input.parentId),
        (current) => appendComment(current, comment),
      );

      const parentId = input.parentId;

      if (parentId) {
        queryClient.setQueryData<InfiniteData<CommentPage>>(
          postQueryKeys.comments(input.postId, null),
          (current) => incrementReplyCount(current, parentId),
        );
      }

      queryClient.setQueryData<InfiniteData<PostPage>>(
        postQueryKeys.feed(),
        (current) => incrementPostCommentCount(current, input.postId),
      );
    },
  });
}

function appendComment(
  current: InfiniteData<CommentPage> | undefined,
  comment: CommentPage["items"][number],
): InfiniteData<CommentPage> | undefined {
  if (!current) return current;

  const pages = [...current.pages];
  const lastPage = pages.at(-1);

  if (!lastPage) return current;

  pages[pages.length - 1] = {
    ...lastPage,
    items: [...lastPage.items, comment],
  };

  return {
    ...current,
    pages,
  };
}

function incrementReplyCount(
  current: InfiniteData<CommentPage> | undefined,
  parentId: string,
): InfiniteData<CommentPage> | undefined {
  if (!current) return current;

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((comment) =>
        comment.id === parentId
          ? { ...comment, replyCount: comment.replyCount + 1 }
          : comment,
      ),
    })),
  };
}

function incrementPostCommentCount(
  current: InfiniteData<PostPage> | undefined,
  postId: string,
): InfiniteData<PostPage> | undefined {
  if (!current) return current;

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactionStats: {
                ...post.reactionStats,
                commentCount: post.reactionStats.commentCount + 1,
              },
            }
          : post,
      ),
    })),
  };
}
