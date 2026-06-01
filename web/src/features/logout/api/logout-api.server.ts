import { REFRESH_TOKEN_COOKIE_NAME } from "@/entities/session";
import { apiFetch } from "@/shared/api/api-fetch.server";

export function authLogoutApi(refreshToken: string, deviceId?: string) {
  return apiFetch<void>("/auth/logout", {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
      ...(deviceId ? { "x-device-id": deviceId } : {}),
    },
  });
}
