"use client";

import { useQuery } from "@tanstack/react-query";
import { searchUsersAction } from "../server/search.action";
import { searchQueryKeys } from "./search-query-keys";

export function useSearchUsersQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: searchQueryKeys.users(normalizedQuery),
    enabled: normalizedQuery.length >= 2,
    placeholderData: (previousData) => previousData,
    queryFn: async () => {
      const result = await searchUsersAction({
        query: normalizedQuery,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.users;
    },
  });
}
