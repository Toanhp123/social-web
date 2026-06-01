"use server";

import { setAuthCookies } from "@/entities/session/server";
import { ApiError } from "@/shared/api/api-error";
import { authLoginApi } from "../api/login-api.server";
import { loginSchema } from "./login.schema";
import type { LoginActionResult } from "./login.types";

export async function loginAction(formData: FormData): Promise<LoginActionResult> {
  const rawInput = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsedInput = loginSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    const result = await authLoginApi(parsedInput.data);

    await setAuthCookies({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      refreshTokenExpiresAt: result.refreshTokenExpiresAt,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: false,
      error: "Đã có lỗi xảy ra.",
    };
  }

  return {
    ok: true,
  };
}
