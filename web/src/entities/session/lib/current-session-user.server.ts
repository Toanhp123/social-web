"use server";

import { getAccessToken } from "./auth-cookie.server";
import type { CurrentSessionUser } from "../model/current-session-user";

type AccessTokenPayload = {
  id?: unknown;
  email?: unknown;
  fullName?: unknown;
  username?: unknown;
  role?: unknown;
  exp?: unknown;
};

const EXPIRATION_SKEW_SECONDS = 30;

export async function getCurrentSessionUser(): Promise<CurrentSessionUser | null> {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  return parseCurrentSessionUser(token);
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
      typeof decoded.role !== "string" ||
      isExpired(decoded.exp)
    ) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      fullName: typeof decoded.fullName === "string" ? decoded.fullName : null,
      username: typeof decoded.username === "string" ? decoded.username : null,
      role: decoded.role,
    };
  } catch {
    return null;
  }
}

function isExpired(exp: unknown): boolean {
  if (typeof exp !== "number") {
    return true;
  }

  return exp <= Date.now() / 1000 + EXPIRATION_SKEW_SECONDS;
}

function toBase64(value: string): string {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const paddingLength = (4 - (base64.length % 4)) % 4;

  return `${base64}${"=".repeat(paddingLength)}`;
}
