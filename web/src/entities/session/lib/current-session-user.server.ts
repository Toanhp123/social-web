"use server";

import { getAccessToken, getRefreshToken } from "./auth-cookie.server";
import { refreshAuthSession } from "./refresh-session.server";
import type { CurrentSessionUser } from "../model/current-session-user";

type AccessTokenPayload = {
  id?: unknown;
  email?: unknown;
  role?: unknown;
};

export async function getCurrentSessionUser(): Promise<CurrentSessionUser | null> {
  const token = await getReadableAccessToken();

  if (!token) {
    return null;
  }

  return parseCurrentSessionUser(token);
}

async function getReadableAccessToken(): Promise<string | undefined> {
  const accessToken = await getAccessToken();

  if (accessToken) {
    return accessToken;
  }

  if (!(await getRefreshToken())) {
    return undefined;
  }

  const refreshedSession = await refreshAuthSession();

  return refreshedSession.accessToken;
}

function parseCurrentSessionUser(token: string): CurrentSessionUser | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    const decoded = JSON.parse(
      Buffer.from(toBase64(payload), "base64").toString("utf8"),
    ) as AccessTokenPayload;

    if (
      typeof decoded.id !== "string" ||
      typeof decoded.email !== "string" ||
      typeof decoded.role !== "string"
    ) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

function toBase64(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (base64.length % 4)) % 4;

  return `${base64}${"=".repeat(paddingLength)}`;
}
