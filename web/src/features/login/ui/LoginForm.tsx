"use client";

import type { FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button, Input } from "@/shared/ui";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";
import { getAuthRouteHref } from "@/shared/lib/auth-redirect";
import { GoogleLoginLink } from "@/features/oauth/ui/GoogleLoginLink";
import { useLoginMutation } from "../model/use-login-mutation";

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const searchParams = useSearchParams();

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

      <div className="flex items-center gap-3 text-xs uppercase text-zinc-500">
        <span className="h-px flex-1 bg-zinc-800" />
        <span>Email</span>
        <span className="h-px flex-1 bg-zinc-800" />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Email</label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Mật khẩu</label>
        <Input name="password" type="password" required />
        <Link
          href={ROUTES.forgotPassword}
          className="mt-2 block text-right text-sm text-blue-400 hover:text-blue-300"
        >
          Quên mật khẩu?
        </Link>
      </div>

      {errorMessage && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={loginMutation.isPending}>
        {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <p className="text-center text-sm text-zinc-400">
        Chưa có tài khoản?{" "}
        <Link
          href={getAuthRouteHref(
            ROUTES.register,
            searchParams?.get(CALLBACK_URL_SEARCH_PARAM),
          )}
          className="font-medium text-blue-400 hover:text-blue-300"
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
