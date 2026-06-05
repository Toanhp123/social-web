"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { postQueryKeys } from "@/entities/post";
import { listPostFeedAction } from "./list-post-feed.action";

const POST_FEED_PAGE_SIZE = 10;

export function usePostFeedQuery() {
  return useInfiniteQuery({
    queryKey: postQueryKeys.feed(),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const result = await listPostFeedAction({
        cursor: pageParam,
        limit: POST_FEED_PAGE_SIZE,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.page;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
