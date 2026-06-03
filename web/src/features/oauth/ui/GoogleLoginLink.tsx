"use client";

import { AUTH_ROUTES, CALLBACK_URL_SEARCH_PARAM } from "@/shared/config/routes";
import { getSafeRedirectPath } from "@/shared/lib/redirect-path";

type GoogleLoginLinkProps = {
  callbackUrl?: string | null;
};

export function GoogleLoginLink({ callbackUrl }: GoogleLoginLinkProps) {
  const safeCallbackUrl = getSafeRedirectPath(callbackUrl, "", AUTH_ROUTES);
  const searchParams = new URLSearchParams();

  if (safeCallbackUrl) {
    searchParams.set(CALLBACK_URL_SEARCH_PARAM, safeCallbackUrl);
  }

  const href = `/api/auth/google${
    searchParams.size > 0 ? `?${searchParams.toString()}` : ""
  }`;

  return (
    <a
      href={href}
      className={[
        "flex w-full items-center justify-center gap-3 rounded-xl",
        "border border-zinc-700 bg-white px-4 py-3",
        "font-medium text-zinc-950 transition hover:bg-zinc-100",
      ].join(" ")}
    >
      <span className="grid size-5 place-items-center rounded-full border border-zinc-300 text-sm font-semibold">
        G
      </span>
      Continue with Google
    </a>
  );
}
