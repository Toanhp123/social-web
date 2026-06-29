"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getGroupRoute } from "@/shared/config/routes";
import { groupQueryKeys } from "@/features/group-membership";
import { createGroupAction } from "./create-group.action";

export function useCreateGroupMutation() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createGroupAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.group;
    },
    onSuccess: (group) => {
      queryClient.invalidateQueries({ queryKey: groupQueryKeys.lists() });
      router.push(getGroupRoute(group.id));
    },
  });
}
