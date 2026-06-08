"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Button, Input } from "@/shared/ui";
import { useRequestPasswordResetMutation } from "../model/use-password-reset-mutation";

export function ForgotPasswordForm() {
  const mutation = useRequestPasswordResetMutation();
  const t = useTranslations().auth;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  }

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : "";

  if (mutation.isSuccess) {
    return (
      <div className="space-y-5">
        <p className="rounded-control bg-brand-soft px-3 py-2 text-sm text-brand">
          {t.resetEmailSent}
        </p>
        <Link
          className="block text-center text-sm text-brand hover:text-brand-hover"
          href={ROUTES.login}
        >
          {t.backToLogin}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm text-secondary">{t.email}</label>
        <Input name="email" type="email" required />
      </div>

      {errorMessage && (
        <p className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t.sending : t.sendResetLink}
      </Button>

      <Link
        className="block text-center text-sm text-brand hover:text-brand-hover"
        href={ROUTES.login}
      >
        {t.backToLogin}
      </Link>
    </form>
  );
}

