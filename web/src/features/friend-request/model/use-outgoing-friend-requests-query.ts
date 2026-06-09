"use client";

import { useQuery } from "@tanstack/react-query";
import { friendRequestQueryKeys } from "./friend-request-query-keys";
import { listOutgoingFriendRequestsAction } from "../server/list-outgoing-friend-requests.action";

export function useOutgoingFriendRequestsQuery() {
  return useQuery({
    queryKey: friendRequestQueryKeys.outgoing(),
    queryFn: async () => {
      const result = await listOutgoingFriendRequestsAction();

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.requests;
    },
  });
}
