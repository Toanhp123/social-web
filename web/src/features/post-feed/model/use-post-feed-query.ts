"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { listPostFeedAction } from "./list-post-feed.action";
import { postFeedQueryKeys } from "./post-feed-query-keys";

const POST_FEED_PAGE_SIZE = 10;

type UsePostFeedQueryInput = {
  authorId?: string;
  search?: string;
};

export function usePostFeedQuery(input: UsePostFeedQueryInput = {}) {
  return useInfiniteQuery({
    queryKey: postFeedQueryKeys.feed(input),
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const result = await listPostFeedAction({
        cursor: pageParam,
        limit: POST_FEED_PAGE_SIZE,
        authorId: input.authorId,
        search: input.search,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.page;
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}
