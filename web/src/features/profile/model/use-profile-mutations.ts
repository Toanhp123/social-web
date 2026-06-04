"use client";

import { useMutation } from "@tanstack/react-query";
import type { UserProfile } from "@/entities/user";
import {
  deleteMyProfileAction,
  saveMyProfileAction,
} from "./profile.action";

type MutationOptions = {
  onProfileChange?: (profile: UserProfile | null) => void;
};

export function useSaveProfileMutation(options?: MutationOptions) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await saveMyProfileAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.profile;
    },
    onSuccess: (profile) => options?.onProfileChange?.(profile),
  });
}

export function useDeleteProfileMutation(options?: MutationOptions) {
  return useMutation({
    mutationFn: async () => {
      const result = await deleteMyProfileAction();

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => options?.onProfileChange?.(null),
  });
}
