"use client";

import { useQuery } from "@tanstack/react-query";
import { friendRequestQueryKeys } from "./friend-request-query-keys";
import { listIncomingFriendRequestsAction } from "../server/list-incoming-friend-requests.action";

export function useIncomingFriendRequestsQuery() {
  return useQuery({
    queryKey: friendRequestQueryKeys.incoming(),
    queryFn: async () => {
      const result = await listIncomingFriendRequestsAction();

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.requests;
    },
  });
}
