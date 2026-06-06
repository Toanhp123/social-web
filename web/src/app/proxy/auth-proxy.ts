import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getProxyDeviceId,
  hasFreshAccessToken,
  hasRefreshToken,
  persistDeviceIdIfMissing,
  refreshAuthSessionInProxy,
} from "./auth-session";
import { PROTECTED_ROUTES } from "./protected-routes";
import {
  AUTH_ROUTES,
  CALLBACK_URL_SEARCH_PARAM,
  ROUTES,
} from "@/shared/config/routes";
import { getPostAuthRedirectPath } from "@/shared/lib/auth-redirect";

export async function authProxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const deviceId = getProxyDeviceId(request);

  if (isProtectedPath(pathname)) {
    return handleProtectedRoute(request, deviceId);
  }

  if (isAuthPath(pathname)) {
    return handleAuthRoute(request, deviceId);
  }

  return handlePublicRoute(request, deviceId);
}

async function handleProtectedRoute(request: NextRequest, deviceId: string) {
  if (hasFreshAccessToken(request)) {
    const response = NextResponse.next();

    persistDeviceIdIfMissing(request, response, deviceId);

    return response;
  }

  const response = NextResponse.next();

  if (hasRefreshToken(request)) {
    try {
      const refreshed = await refreshAuthSessionInProxy(
        request,
        response,
        deviceId,
      );

      if (refreshed) {
        persistDeviceIdIfMissing(request, response, deviceId);

        return response;
      }
    } catch (error) {
      console.error("Failed to refresh auth session in proxy:", error);
    }
  }

  const redirectResponse = NextResponse.redirect(
    createLoginRedirectUrl(request),
  );

  clearAuthCookies(redirectResponse);
  persistDeviceIdIfMissing(request, redirectResponse, deviceId);

  return redirectResponse;
}

async function handleAuthRoute(request: NextRequest, deviceId: string) {
  if (hasFreshAccessToken(request)) {
    const response = redirectToCallbackOrDashboard(request);

    persistDeviceIdIfMissing(request, response, deviceId);

    return response;
  }

  const response = NextResponse.next();

  if (!hasRefreshToken(request)) {
    persistDeviceIdIfMissing(request, response, deviceId);

    return response;
  }

  const refreshed = await refreshAuthSessionInProxy(
    request,
    response,
    deviceId,
  );

  if (!refreshed) {
    persistDeviceIdIfMissing(request, response, deviceId);

    return response;
  }

  const redirectResponse = redirectToCallbackOrDashboard(request);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  persistDeviceIdIfMissing(request, redirectResponse, deviceId);

  return redirectResponse;
}

async function handlePublicRoute(request: NextRequest, deviceId: string) {
  const response = NextResponse.next();

  if (!hasFreshAccessToken(request) && hasRefreshToken(request)) {
    const refreshed = await refreshAuthSessionInProxy(
      request,
      response,
      deviceId,
    );

    if (!refreshed) {
      clearAuthCookies(response);
    }
  }

  persistDeviceIdIfMissing(request, response, deviceId);

  return response;
}

function createLoginRedirectUrl(request: NextRequest) {
  const url = new URL(ROUTES.login, request.url);
  const callbackUrl = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  url.searchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);

  return url;
}

function redirectToCallbackOrDashboard(request: NextRequest) {
  const redirectPath = getPostAuthRedirectPath(
    request.nextUrl.searchParams.get(CALLBACK_URL_SEARCH_PARAM),
  );

  return NextResponse.redirect(new URL(redirectPath, request.url));
}

function isAuthPath(pathname: string) {
  return AUTH_ROUTES.some((authPath) => pathname === authPath);
}

function isProtectedPath(pathname: string) {
  return PROTECTED_ROUTES.some(
    (protectedPath) =>
      pathname === protectedPath || pathname.startsWith(`${protectedPath}/`),
  );
}
