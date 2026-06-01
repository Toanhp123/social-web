"use server";

import { env } from "@/shared/config/env.server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEVICE_ID_COOKIE_NAME,
  REFRESH_TOKEN_COOKIE_NAME,
} from "../model/cookie-names";

const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

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

export async function getOrCreateDeviceId() {
  const cookieStore = await cookies();
  const deviceId = cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;

  if (deviceId) {
    return deviceId;
  }

  const nextDeviceId = randomUUID();

  cookieStore.set(DEVICE_ID_COOKIE_NAME, nextDeviceId, {
    httpOnly: true,
    secure: env.IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_ID_MAX_AGE_SECONDS,
  });

  return nextDeviceId;
}
