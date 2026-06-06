"use server";

import { env } from "@/shared/config/env.server";
import { cookies } from "next/headers";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEVICE_ID_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../model/cookie-names";

type AuthTokens = {
  accessToken: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: Date;
};

export async function setAuthCookies(tokens: AuthTokens) {
  const cookieStore = await cookies();

  cookieStore.set(ACCESS_TOKEN_COOKIE_NAME, tokens.accessToken, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15,
  });

  if (tokens.refreshToken) {
    cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, tokens.refreshToken, {
      httpOnly: true,
      secure: env.IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      ...(tokens.refreshTokenExpiresAt
        ? { expires: tokens.refreshTokenExpiresAt }
        : { maxAge: 60 * 60 * 24 * 7 }),
    });
  }
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();

  cookieStore.delete(ACCESS_TOKEN_COOKIE_NAME);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
}

export async function getAccessToken() {
  const cookieStore = await cookies();

  return cookieStore.get(ACCESS_TOKEN_COOKIE_NAME)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();

  return cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;
}

export async function getDeviceId() {
  const cookieStore = await cookies();

  return cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;
}
