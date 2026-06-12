"use client";

import { useQueries } from "@tanstack/react-query";
import type { FriendUser } from "@/entities/friend";
import { mentionQueryKeys } from "./mention-query-keys";
import { listMentionCandidatesAction } from "../server/list-mention-candidates.action";

const MENTION_PATTERN = /(^|[^\w.])@([a-zA-Z0-9_.]{3,30})\b/g;
const MAX_MENTION_RESOLVE_COUNT = 10;

export function useMentionedUsersMap(content: string): Map<string, FriendUser> {
  const usernames = extractMentionUsernames(content).slice(
    0,
    MAX_MENTION_RESOLVE_COUNT,
  );
  const results = useQueries({
    queries: usernames.map((username) => ({
      queryKey: mentionQueryKeys.resolve(username),
      queryFn: async () => {
        const result = await listMentionCandidatesAction({
          query: username,
          limit: 5,
        });

        if (!result.ok) {
          throw new Error(result.error);
        }

        return (
          result.candidates.find(
            (candidate) => candidate.username?.toLowerCase() === username,
          ) ?? null
        );
      },
      staleTime: 60_000,
    })),
  });

  const usersByUsername = new Map<string, FriendUser>();

  results.forEach((result) => {
    const user = result.data;

    if (user?.username) {
      usersByUsername.set(user.username.toLowerCase(), user);
    }
  });

  return usersByUsername;
}

function extractMentionUsernames(content: string): string[] {
  const usernames = new Set<string>();

  for (const match of content.matchAll(MENTION_PATTERN)) {
    usernames.add((match[2] ?? "").toLowerCase());
  }

  return [...usernames].filter(Boolean);
}
