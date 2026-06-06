"use server";

import { getDeviceId, setAuthCookies } from "@/entities/session/server";
import { ApiError } from "@/shared/api/api-error";
import { authRegisterApi } from "../api/register-api.server";
import { registerSchema } from "./register.schema";
import type { RegisterActionResult } from "./register.types";

export async function registerAction(
  formData: FormData,
): Promise<RegisterActionResult> {
  const rawInput = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    username: formData.get("username"),
  };

  const parsedInput = registerSchema.safeParse(rawInput);

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    const deviceId = await getDeviceId();

    if (!deviceId) {
      return {
        ok: false,
        error: "Khong doc duoc thiet bi hien tai.",
      };
    }

    const result = await authRegisterApi(parsedInput.data, deviceId);

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
