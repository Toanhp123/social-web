"use client";

import { useQuery } from "@tanstack/react-query";
import { friendRequestQueryKeys } from "./friend-request-query-keys";
import { listFriendCandidatesAction } from "../server/list-friend-candidates.action";

const FRIEND_CANDIDATE_LIMIT = 8;

export function useFriendCandidatesQuery(query: string) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: friendRequestQueryKeys.candidates(normalizedQuery),
    queryFn: async () => {
      const result = await listFriendCandidatesAction({
        query: normalizedQuery || undefined,
        limit: FRIEND_CANDIDATE_LIMIT,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.candidates;
    },
  });
}
