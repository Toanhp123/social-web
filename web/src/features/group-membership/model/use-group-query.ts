"use client";

import { useQuery } from "@tanstack/react-query";
import type { Group } from "@/entities/group";
import { groupQueryKeys } from "./group-membership-query-keys";
import { getGroupAction } from "./get-group.action";

export function useGroupQuery(groupId: string, initialData?: Group) {
  return useQuery({
    queryKey: groupQueryKeys.detail(groupId),
    initialData,
    queryFn: async () => {
      const result = await getGroupAction({ groupId });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.group;
    },
  });
}
