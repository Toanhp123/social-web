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
        <label className="text-sm text-auth-label">Họ tên</label>
        <Input name="fullName" type="text" required minLength={5} />
      </div>

      <div>
        <label className="text-sm text-auth-label">Username</label>
        <Input name="username" type="text" minLength={6} />
      </div>

      <div>
        <label className="text-sm text-auth-label">Email</label>
        <Input name="email" type="email" required />
      </div>

      <div>
        <label className="text-sm text-auth-label">Mật khẩu</label>
        <Input name="password" type="password" required minLength={6} />
      </div>

      {errorMessage && (
        <p className="rounded-control bg-danger-soft px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}

      <Button type="submit" disabled={registerMutation.isPending}>
        {registerMutation.isPending ? "Đang đăng ký..." : "Đăng ký"}
      </Button>

      <p className="text-center text-sm text-auth-muted">
        Đã có tài khoản?{" "}
        <Link
          href={getAuthRouteHref(
            ROUTES.login,
            searchParams?.get(CALLBACK_URL_SEARCH_PARAM),
          )}
          className="font-medium text-auth-brand hover:text-auth-brand-hover"
        >
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
