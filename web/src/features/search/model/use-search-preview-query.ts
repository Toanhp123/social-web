"use client";

import { useQuery } from "@tanstack/react-query";
import { searchPreviewAction } from "../server/search.action";
import { searchQueryKeys } from "./search-query-keys";

export function useSearchPreviewQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: searchQueryKeys.preview(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const result = await searchPreviewAction({
        query: normalizedQuery,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return {
        users: result.users,
        posts: result.posts,
      };
    },
  });
}
