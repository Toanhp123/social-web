import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import {
  DEVICE_ID_COOKIE_NAME,
  persistDeviceIdIfMissing,
} from "@/entities/session/server";
import { AUTH_ROUTES, CALLBACK_URL_SEARCH_PARAM } from "@/shared/config/routes";
import { env } from "@/shared/config/env.server";
import { getSafeRedirectPath } from "@/shared/lib/redirect-path";

export async function handleGoogleOAuthStartRequest(request: NextRequest) {
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

  persistDeviceIdIfMissing(request, response, deviceId);

  return response;
}
