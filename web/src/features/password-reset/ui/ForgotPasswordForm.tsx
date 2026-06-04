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
        <p className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-300">
          Nếu email tồn tại, liên kết đặt lại mật khẩu đã được gửi.
        </p>
        <Link
          className="block text-center text-sm text-blue-400"
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
        <label className="text-sm text-zinc-300">Email</label>
        <Input name="email" type="email" required />
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? "Đang gửi..." : "Gửi liên kết đặt lại"}
      </Button>

      <Link
        className="block text-center text-sm text-blue-400"
        href={ROUTES.login}
      >
        Quay lại đăng nhập
      </Link>
    </form>
  );
}
