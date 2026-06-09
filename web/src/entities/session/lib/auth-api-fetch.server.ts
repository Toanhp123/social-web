import { ApiError } from "@/shared/api/api-error";
import { apiFetch } from "@/shared/api/api-fetch.server";
import { getAccessToken, getRefreshToken } from "./auth-cookie.server";
import { refreshAuthSession } from "./refresh-session.server";

export async function authApiFetch<T>(endpoint: string, init?: RequestInit) {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken) {
    if (!refreshToken) {
      throw new ApiError(401, "AUTH_REQUIRED", "Bạn cần đăng nhập.");
    }

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

export async function optionalAuthApiFetch<T>(
  endpoint: string,
  init?: RequestInit,
) {
  const accessToken = await getAccessToken();

  if (!accessToken && !(await getRefreshToken())) {
    return apiFetch<T>(endpoint, init);
  }

  try {
    return await authApiFetch<T>(endpoint, init);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return apiFetch<T>(endpoint, init);
    }

    throw error;
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
