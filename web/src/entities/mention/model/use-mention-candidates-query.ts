"use client";

import { useQuery } from "@tanstack/react-query";
import { mentionQueryKeys } from "./mention-query-keys";
import { listMentionCandidatesAction } from "../server/list-mention-candidates.action";

const MENTION_CANDIDATE_LIMIT = 6;

export function useMentionCandidatesQuery(query: string, enabled: boolean) {
  const normalizedQuery = query.trim();

  return useQuery({
    queryKey: mentionQueryKeys.candidates(normalizedQuery),
    enabled,
    queryFn: async () => {
      const result = await listMentionCandidatesAction({
        query: normalizedQuery || undefined,
        limit: MENTION_CANDIDATE_LIMIT,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.candidates;
    },
  });
}
