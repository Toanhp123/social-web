import type { NextRequest, NextResponse } from "next/server";
import { env } from "@/shared/config/env.server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEVICE_ID_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../model/cookie-names";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export function persistDeviceIdIfMissing(
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

export function setAccessTokenCookie(
  response: NextResponse,
  accessToken: string,
) {
  response.cookies.set(ACCESS_TOKEN_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: ACCESS_TOKEN_MAX_AGE_SECONDS,
  });
}

export function setRefreshTokenCookie(
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

export function clearAuthResponseCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
}
