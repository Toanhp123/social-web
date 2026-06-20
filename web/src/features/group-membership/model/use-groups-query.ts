"use client";

import { useQuery } from "@tanstack/react-query";
import { groupQueryKeys } from "./group-membership-query-keys";
import { listGroupsAction } from "./list-groups.action";

export function useGroupsQuery(input: { search?: string | null } = {}) {
  return useQuery({
    queryKey: groupQueryKeys.list(input),
    queryFn: async () => {
      const result = await listGroupsAction({
        limit: 30,
        search: input.search,
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.page;
    },
  });
}
