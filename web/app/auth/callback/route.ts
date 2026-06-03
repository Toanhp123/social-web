import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEVICE_ID_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/entities/session";
import { authOAuthSessionApi } from "@/features/oauth";
import {
  CALLBACK_URL_SEARCH_PARAM,
  ROUTES,
} from "@/shared/config/routes";
import { env } from "@/shared/config/env.server";
import { getPostAuthRedirectPath } from "@/shared/lib/auth-redirect";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function GET(request: NextRequest) {
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
      new URL(getPostAuthRedirectPath(callbackUrl), request.url),
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
  const loginUrl = new URL(ROUTES.login, request.url);

  if (callbackUrl) {
    loginUrl.searchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);
  }

  const response = NextResponse.redirect(loginUrl);

  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
  persistDeviceIdIfMissing(request, response, deviceId);

  return response;
}

function persistDeviceIdIfMissing(
  request: NextRequest,
  response: NextResponse,
  deviceId: string,
) {
  if (request.cookies.has(DEVICE_ID_COOKIE_NAME)) {
    return;
  }

  response.cookies.set(DEVICE_ID_COOKIE_NAME, deviceId, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_ID_MAX_AGE_SECONDS,
  });
}

function setAccessTokenCookie(response: NextResponse, accessToken: string) {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
}

function setRefreshTokenCookie(
  response: NextResponse,
  refreshToken: string,
  expires?: Date,
) {
  response.cookies.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    ...(expires ? { expires } : { maxAge: REFRESH_TOKEN_MAX_AGE_SECONDS }),
  });
}
