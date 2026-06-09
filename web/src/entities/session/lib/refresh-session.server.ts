import { ApiError } from "@/shared/api/api-error";
import { apiFetchWithResponse } from "@/shared/api/api-fetch.server";
import { readResponseCookie } from "@/shared/lib/set-cookie";
import {
  clearAuthCookies,
  getDeviceId,
  getRefreshToken,
  setAuthCookies,
} from "./auth-cookie.server";
import { REFRESH_TOKEN_COOKIE_NAME } from "../model/cookie-names";

type RefreshResponseDto = {
  accessToken: string;
};

export async function refreshAuthSession() {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    await clearAuthCookies();

    throw new ApiError(
      401,
      "REFRESH_TOKEN_MISSING",
      "Phiên đăng nhập đã hết hạn.",
    );
  }

  try {
    const deviceId = await getDeviceId();

    if (!deviceId) {
      throw new ApiError(
        400,
        "DEVICE_ID_MISSING",
        "Không đọc được thiết bị hiện tại.",
      );
    }

    const { data, response } = await apiFetchWithResponse<RefreshResponseDto>(
      "/auth/refresh",
      {
        method: "POST",
        headers: {
          Cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
          "x-device-id": deviceId,
        },
      },
    );

    const nextRefreshCookie = readResponseCookie(
      response.headers,
      REFRESH_TOKEN_COOKIE_NAME,
    );

    if (!nextRefreshCookie) {
      throw new ApiError(
        502,
        "REFRESH_COOKIE_MISSING",
        "Không thể gia hạn phiên đăng nhập.",
      );
    }

    await setAuthCookies({
      accessToken: data.accessToken,
      refreshToken: nextRefreshCookie.value,
      refreshTokenExpiresAt: nextRefreshCookie.expires,
    });

    return {
      accessToken: data.accessToken,
      refreshToken: nextRefreshCookie.value,
    };
  } catch (error) {
    await clearAuthCookies();

    throw error;
  }
}
