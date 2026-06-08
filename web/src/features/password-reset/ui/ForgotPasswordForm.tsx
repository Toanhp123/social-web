"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { ROUTES } from "@/shared/config/routes";
import { Button, Input } from "@/shared/ui";
import { useRequestPasswordResetMutation } from "../model/use-password-reset-mutation";

export function ForgotPasswordForm() {
  const mutation = useRequestPasswordResetMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate(new FormData(event.currentTarget));
  }

  const errorMessage =
    mutation.error instanceof Error ? mutation.error.message : "";

  if (mutation.isSuccess) {
    return (
      <div className="space-y-5">
        <p className="rounded-control bg-brand-soft px-3 py-2 text-sm text-auth-brand">
          Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.
        </p>
        <Link
          className="block text-center text-sm text-auth-brand hover:text-auth-brand-hover"
          href={ROUTES.login}
        >
          Quay lại đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm text-auth-label">Email</label>
        <Input name="email" type="email" required />
      </div>

      {errorMessage && (
        <p className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Đang gửi..." : "Gửi liên kết đặt lại"}
      </Button>

      <Link
        className="block text-center text-sm text-auth-brand hover:text-auth-brand-hover"
        href={ROUTES.login}
      >
        Quay lại đăng nhập
      </Link>
    </form>
  );
}
