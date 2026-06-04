import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthResponseCookies,
  DEVICE_ID_COOKIE_NAME,
  persistDeviceIdIfMissing,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/entities/session/server";
import { authOAuthSessionApi } from "../api/oauth-session-api.server";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";
import { getPostAuthRedirectPath } from "@/shared/lib/auth-redirect";

export async function handleOAuthCallbackRequest(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const callbackUrl = request.nextUrl.searchParams.get(
    CALLBACK_URL_SEARCH_PARAM,
  );
  const deviceId =
    request.cookies.get(DEVICE_ID_COOKIE_NAME)?.value ?? crypto.randomUUID();

  if (!code) {
    return redirectToLogin(request, callbackUrl, deviceId);
  }

  try {
    const result = await authOAuthSessionApi(code, deviceId);
    const response = NextResponse.redirect(
      createBrowserRedirectUrl(getPostAuthRedirectPath(callbackUrl), request),
    );

    persistDeviceIdIfMissing(request, response, deviceId);
    setAccessTokenCookie(response, result.accessToken);
    setRefreshTokenCookie(
      response,
      result.refreshToken,
      result.refreshTokenExpiresAt,
    );

    return response;
  } catch {
    return redirectToLogin(request, callbackUrl, deviceId);
  }
}

function redirectToLogin(
  request: NextRequest,
  callbackUrl: string | null,
  deviceId: string,
): NextResponse {
  const loginUrl = createBrowserRedirectUrl(ROUTES.login, request);

  loginUrl.searchParams.set("error", "oauth_failed");

  if (callbackUrl) {
    loginUrl.searchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);
  }

  const response = NextResponse.redirect(loginUrl);

  clearAuthResponseCookies(response);
  persistDeviceIdIfMissing(request, response, deviceId);

  return response;
}

function createBrowserRedirectUrl(path: string, request: NextRequest): URL {
  const url = new URL(path, request.url);

  if (url.hostname === "0.0.0.0") {
    url.hostname = "localhost";
  }

  return url;
}
