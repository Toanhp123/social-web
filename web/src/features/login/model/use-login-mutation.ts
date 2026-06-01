"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { CALLBACK_URL_SEARCH_PARAM } from "@/shared/config/routes";
import { getPostAuthRedirectPath } from "@/shared/lib/auth-redirect";
import { loginAction } from "./login.action";

export function useLoginMutation() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await loginAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result;
    },
    onSuccess: () => {
      router.replace(
        getPostAuthRedirectPath(searchParams?.get(CALLBACK_URL_SEARCH_PARAM)),
      );
    },
  });
}
