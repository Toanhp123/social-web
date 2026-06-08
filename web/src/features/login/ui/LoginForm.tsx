"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GoogleLoginLink } from "@/features/oauth";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { getAuthRouteHref } from "@/shared/lib/auth-redirect";
import { Button, Input } from "@/shared/ui";
import { useLoginMutation } from "../model/use-login-mutation";

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const searchParams = useSearchParams();
  const t = useTranslations().auth;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    loginMutation.mutate(new FormData(event.currentTarget));
  }

  const errorMessage =
    loginMutation.error instanceof Error ? loginMutation.error.message : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <GoogleLoginLink
        callbackUrl={searchParams?.get(CALLBACK_URL_SEARCH_PARAM)}
      />

      <div className="flex items-center gap-3 text-xs uppercase text-auth-muted">
        <span className="h-px flex-1 bg-auth-divider" />
        <span>{t.email}</span>
        <span className="h-px flex-1 bg-auth-divider" />
      </div>

      <div>
        <label className="text-sm text-auth-label">{t.email}</label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <label className="text-sm text-auth-label">{t.password}</label>
        <Input name="password" type="password" required />
        <Link
          href={ROUTES.forgotPassword}
          className="mt-2 block text-right text-sm text-auth-brand hover:text-auth-brand-hover"
        >
          {t.forgotPassword}
        </Link>
      </div>

      {errorMessage && (
        <p className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? t.loggingIn : t.login}
      </Button>

      <p className="text-center text-sm text-auth-muted">
        {t.noAccount}{" "}
        <Link
          href={getAuthRouteHref(
            ROUTES.register,
            searchParams?.get(CALLBACK_URL_SEARCH_PARAM),
          )}
          className="font-medium text-auth-brand hover:text-auth-brand-hover"
        >
          {t.register}
        </Link>
      </p>
    </form>
  );
}

