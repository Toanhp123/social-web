import type { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@/entities/session";
import { env } from "@/shared/config/env.server";
import { readResponseCookie } from "@/shared/lib/set-cookie";

const ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 15;
const REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const EXPIRATION_SKEW_SECONDS = 30;

type RefreshResponseDto = {
  accessToken: string;
};

export function hasFreshAccessToken(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  return Boolean(accessToken && !isJwtExpired(accessToken));
}

export function hasRefreshToken(request: NextRequest) {
  return Boolean(request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value);
}

export async function refreshAuthSessionInMiddleware(
  request: NextRequest,
  response: NextResponse,
) {
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshToken) {
    clearAuthCookies(response);

    return false;
  }

  const refreshResponse = await fetch(`${env.API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: `${REFRESH_TOKEN_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
    },
    cache: "no-store",
  });

  if (!refreshResponse.ok) {
    clearAuthCookies(response);

    return false;
  }

  const data = (await refreshResponse.json()) as RefreshResponseDto;
  const nextRefreshCookie = readResponseCookie(
    refreshResponse.headers,
    REFRESH_TOKEN_COOKIE_NAME,
  );

  if (!nextRefreshCookie) {
    clearAuthCookies(response);

    return false;
  }

  setAccessTokenCookie(response, data.accessToken);
  setRefreshTokenCookie(
    response,
    nextRefreshCookie.value,
    nextRefreshCookie.expires,
  );

  return true;
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  response.cookies.delete(REFRESH_TOKEN_COOKIE_NAME);
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

function isJwtExpired(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    return true;
  }

  try {
    const decodedPayload = JSON.parse(decodeBase64Url(payload)) as {
      exp?: unknown;
    };

    if (typeof decodedPayload.exp !== "number") {
      return true;
    }

    return decodedPayload.exp <= Date.now() / 1000 + EXPIRATION_SKEW_SECONDS;
  } catch {
    return true;
  }
}

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

  return atob(padded);
}
