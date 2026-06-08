"use client";

import type { FormEvent } from "react";
import { useTranslations } from "@/shared/i18n";
import { Button, Input } from "@/shared/ui";
import { useResetPasswordMutation } from "../model/use-password-reset-mutation";

type ResetPasswordFormProps = {
  token?: string;
};

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const mutation = useResetPasswordMutation();
  const t = useTranslations().auth;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  }

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : "";

  if (!token) {
    return (
      <p className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
        {t.invalidResetLink}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="token" value={token} />

      <div>
        <label className="text-sm text-auth-label">{t.newPassword}</label>
        <Input name="password" type="password" required minLength={6} />
      </div>

      {errorMessage && (
        <p className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? t.updating : t.resetPassword}
      </Button>
    </form>
  );
}

