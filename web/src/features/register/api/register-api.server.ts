import { REFRESH_TOKEN_COOKIE_NAME } from "@/entities/session";
import { ApiError } from "@/shared/api/api-error";
import { apiFetchWithResponse } from "@/shared/api/api-fetch.server";
import { readResponseCookie } from "@/shared/lib/set-cookie";
import type {
  RegisterRequestDto,
  RegisterResultDto,
} from "../model/register.types";

export async function authRegisterApi(
  body: RegisterRequestDto,
  deviceId: string,
): Promise<RegisterResultDto> {
  const { data, response } = await apiFetchWithResponse<{ accessToken: string }>(
    "/auth/register",
    {
      method: "POST",
      headers: {
        "x-device-id": deviceId,
      },
      body: JSON.stringify(body),
    },
  );

  const refreshCookie = readResponseCookie(
    response.headers,
    REFRESH_TOKEN_COOKIE_NAME,
  );

  if (!refreshCookie) {
    throw new ApiError(
      502,
      "REFRESH_COOKIE_MISSING",
      "Không nhận được phiên đăng ký.",
    );
  }

  return {
    accessToken: data.accessToken,
    refreshToken: refreshCookie.value,
    refreshTokenExpiresAt: refreshCookie.expires,
  };
}
