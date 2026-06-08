import { NextResponse } from "next/server";
import {
  getAccessToken,
  getRefreshToken,
  refreshAuthSession,
} from "@/entities/session/server";
import { env } from "@/shared/config/env.server";

export async function handleRealtimeSessionRequest() {
  const accessToken = await getRealtimeAccessToken();

  if (!accessToken) {
    return NextResponse.json({ socketUrl: env.API_PUBLIC_URL, token: null });
  }

  return NextResponse.json({
    socketUrl: env.API_PUBLIC_URL,
    token: accessToken,
  });
}

async function getRealtimeAccessToken() {
  const accessToken = await getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const refreshedSession = await refreshAuthSession();

  return refreshedSession.accessToken;
}
