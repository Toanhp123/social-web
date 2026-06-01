"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/config/routes";
import { logoutAction } from "./logout.action";

export function useLogoutMutation() {
  const router = useRouter();

  return useMutation({
    mutationFn: logoutAction,
    onSuccess: () => {
      router.replace(ROUTES.login);
      router.refresh();
    },
  });
}
