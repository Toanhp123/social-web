"use client";

import { useQuery } from "@tanstack/react-query";
import { groupQueryKeys } from "./group-membership-query-keys";
import {
  listGroupJoinRequestsAction,
  listGroupMembersAction,
} from "./group-management.action";

export function useGroupMembersQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupQueryKeys.members(groupId),
    enabled,
    queryFn: async () => {
      const result = await listGroupMembersAction({ groupId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.members;
    },
  });
}

export function useGroupJoinRequestsQuery(groupId: string, enabled = true) {
  return useQuery({
    queryKey: groupQueryKeys.joinRequests(groupId),
    enabled,
    queryFn: async () => {
      const result = await listGroupJoinRequestsAction({ groupId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.requests;
    },
  });
}
