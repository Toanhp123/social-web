import { REFRESH_TOKEN_COOKIE_NAME } from "@/entities/session";
import { ApiError } from "@/shared/api/api-error";
import { apiFetchWithResponse } from "@/shared/api/api-fetch.server";
import { readResponseCookie } from "@/shared/lib/set-cookie";
import type { LoginRequestDto, LoginResultDto } from "../model/login.types";

export async function authLoginApi(
  body: LoginRequestDto,
): Promise<LoginResultDto> {
  const { data, response } = await apiFetchWithResponse<{ accessToken: string }>(
    "/auth/login",
    {
      method: "POST",
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
      "Không nhận được phiên đăng nhập.",
    );
  }

  return {
    accessToken: data.accessToken,
    refreshToken: refreshCookie.value,
    refreshTokenExpiresAt: refreshCookie.expires,
  };
}
