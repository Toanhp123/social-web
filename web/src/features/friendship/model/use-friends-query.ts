"use client";

import { useQuery } from "@tanstack/react-query";
import { friendshipQueryKeys } from "./friendship-query-keys";
import { listFriendsAction } from "../server/list-friends.action";

export function useFriendsQuery() {
  return useQuery({
    queryKey: friendshipQueryKeys.friends(),
    queryFn: async () => {
      const result = await listFriendsAction();

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.friends;
    },
  });
}
