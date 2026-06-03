import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { DEVICE_ID_COOKIE_NAME } from "@/entities/session";
import {
  AUTH_ROUTES,
  CALLBACK_URL_SEARCH_PARAM,
} from "@/shared/config/routes";
import { env } from "@/shared/config/env.server";
import { getSafeRedirectPath } from "@/shared/lib/redirect-path";

const DEVICE_ID_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const existingDeviceId = cookieStore.get(DEVICE_ID_COOKIE_NAME)?.value;
  const deviceId = existingDeviceId ?? randomUUID();
  const callbackUrl = getSafeRedirectPath(
    request.nextUrl.searchParams.get(CALLBACK_URL_SEARCH_PARAM),
    "",
    AUTH_ROUTES,
  );
  const googleAuthUrl = new URL("/auth/google", env.API_PUBLIC_URL);

  googleAuthUrl.searchParams.set("deviceId", deviceId);

  if (callbackUrl) {
    googleAuthUrl.searchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);
  }

  const response = NextResponse.redirect(googleAuthUrl);

  if (!existingDeviceId) {
    response.cookies.set(DEVICE_ID_COOKIE_NAME, deviceId, {
      httpOnly: true,
      secure: env.IS_PRODUCTION,
      sameSite: "lax",
      path: "/",
      maxAge: DEVICE_ID_MAX_AGE_SECONDS,
    });
  }

  return response;
}
