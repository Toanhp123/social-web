"use server";

import {
  clearAuthCookies,
  getDeviceId,
  getRefreshToken,
} from "@/entities/session/server";
import { authLogoutApi } from "../api/logout-api.server";

export async function logoutAction() {
  const refreshToken = await getRefreshToken();

  try {
    if (refreshToken) {
      await authLogoutApi(refreshToken, await getDeviceId());
    }
  } catch {
    // Logout should still clear the local browser session if backend revocation fails.
  } finally {
    await clearAuthCookies();
  }

  return {
    ok: true,
  };
}
