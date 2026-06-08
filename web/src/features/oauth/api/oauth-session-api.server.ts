import { REFRESH_TOKEN_COOKIE_NAME } from "@/entities/session";
import { ApiError } from "@/shared/api/api-error";
import { apiFetchWithResponse } from "@/shared/api/api-fetch.server";
import { readResponseCookie } from "@/shared/lib/set-cookie";
import { oauthSessionSchema } from "../model/oauth-session.schema";

type OAuthSessionResultDto = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt?: Date;
};

export async function authOAuthSessionApi(
  code: string,
  deviceId: string,
): Promise<OAuthSessionResultDto> {
  const parsedInput = oauthSessionSchema.parse({ code, deviceId });

  const { data, response } = await apiFetchWithResponse<{
    accessToken: string;
  }>("/auth/oauth/session", {
    method: "POST",
    headers: {
      "x-device-id": parsedInput.deviceId,
    },
    body: JSON.stringify({ code: parsedInput.code }),
  });

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
