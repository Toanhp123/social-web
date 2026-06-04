"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import {
  requestPasswordResetAction,
  resetPasswordAction,
} from "./password-reset.action";

export function useRequestPasswordResetMutation() {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await requestPasswordResetAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result;
    },
  });
}

export function useResetPasswordMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await resetPasswordAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      router.replace(ROUTES.login);
      router.refresh();
    },
  });
}
