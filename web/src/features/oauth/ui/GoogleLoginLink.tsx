"use client";

import { AUTH_ROUTES, CALLBACK_URL_SEARCH_PARAM } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { getSafeRedirectPath } from "@/shared/lib/redirect-path";

type GoogleLoginLinkProps = {
  callbackUrl?: string | null;
};

export function GoogleLoginLink({ callbackUrl }: GoogleLoginLinkProps) {
  const t = useTranslations().auth;
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
      className={cn(
        "flex w-full items-center justify-center gap-3 rounded-control",
        "border border-subtle bg-surface px-4 py-3 shadow-card",
        "font-medium text-primary transition hover:bg-surface-muted",
      )}
    >
      <span className="grid size-5 place-items-center rounded-pill border border-subtle text-sm font-semibold">
        G
      </span>
      {t.google}
    </a>
  );
}

