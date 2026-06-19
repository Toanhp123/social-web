"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";

export function useRequireAuthRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return function requireAuth() {
    const queryString = searchParams?.toString() ?? "";
    const callbackUrl = pathname
      ? queryString
        ? `${pathname}?${queryString}`
        : pathname
      : ROUTES.home;
    const authSearchParams = new URLSearchParams();

    authSearchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);
    router.push(`${ROUTES.login}?${authSearchParams.toString()}`);
  };
}
