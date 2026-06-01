"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";
import { getAuthRouteHref } from "@/shared/lib/auth-redirect";
import { Button, Input } from "@/shared/ui";
import { useRegisterMutation } from "../model/use-register-mutation";

export function RegisterForm() {
  const registerMutation = useRegisterMutation();
  const searchParams = useSearchParams();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    registerMutation.mutate(new FormData(event.currentTarget));
  }

  const errorMessage =
    registerMutation.error instanceof Error
      ? registerMutation.error.message
      : "";

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="text-sm text-zinc-300">Họ tên</label>
        <Input name="fullName" type="text" required minLength={5} />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Username</label>
        <Input name="username" type="text" minLength={6} />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Email</label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Mật khẩu</label>
        <Input name="password" type="password" required minLength={6} />
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        Đã có tài khoản?{" "}
        <Link
          href={getAuthRouteHref(
            ROUTES.login,
            searchParams?.get(CALLBACK_URL_SEARCH_PARAM),
          )}
          className="font-medium text-blue-400 hover:text-blue-300"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
