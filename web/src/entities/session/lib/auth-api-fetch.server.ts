import { ApiError } from "@/shared/api/api-error";
import { apiFetch } from "@/shared/api/api-fetch.server";
import { getAccessToken, getRefreshToken } from "./auth-cookie.server";
import { refreshAuthSession } from "./refresh-session.server";

export async function authApiFetch<T>(endpoint: string, init?: RequestInit) {
  const accessToken = await getAccessToken();

  if (!accessToken && (await getRefreshToken())) {
    const refreshedSession = await refreshAuthSession();

    return apiFetch<T>(
      endpoint,
      withAuthorization(init, refreshedSession.accessToken),
    );
  }

  try {
    return await apiFetch<T>(endpoint, withAuthorization(init, accessToken));
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const refreshedSession = await refreshAuthSession();

    return apiFetch<T>(
      endpoint,
      withAuthorization(init, refreshedSession.accessToken),
    );
  }
}

function withAuthorization(
  init?: RequestInit,
  accessToken?: string,
): RequestInit {
  const headers = new Headers(init?.headers);

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  return {
    ...init,
    headers,
  };
}
