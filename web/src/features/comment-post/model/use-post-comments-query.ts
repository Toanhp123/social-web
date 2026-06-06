"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { postQueryKeys } from "@/entities/post";
import { listPostCommentsAction } from "./comment-post.action";

const COMMENT_PAGE_SIZE = 10;

export function usePostCommentsQuery(input: {
  postId: string;
  parentId?: string | null;
  enabled?: boolean;
}) {
  return useInfiniteQuery({
    queryKey: postQueryKeys.comments(input.postId, input.parentId),
    initialPageParam: null as string | null,
    enabled: input.enabled ?? true,
    queryFn: async ({ pageParam }) => {
      const result = await listPostCommentsAction({
        postId: input.postId,
        parentId: input.parentId,
        cursor: pageParam,
        limit: COMMENT_PAGE_SIZE,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.page;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
