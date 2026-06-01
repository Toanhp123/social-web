import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  getMiddlewareDeviceId,
  hasFreshAccessToken,
  hasRefreshToken,
  persistDeviceIdIfMissing,
  refreshAuthSessionInMiddleware,
} from "./auth-session";
import { PROTECTED_ROUTES } from "./protected-routes";
import {
  AUTH_ROUTES,
  CALLBACK_URL_SEARCH_PARAM,
  ROUTES,
} from "@/shared/config/routes";
import { getPostAuthRedirectPath } from "@/shared/lib/auth-redirect";

export async function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const deviceId = getMiddlewareDeviceId(request);

  if (isProtectedPath(pathname)) {
    return handleProtectedRoute(request, deviceId);
  }

  if (isAuthPath(pathname)) {
    return handleAuthRoute(request, deviceId);
  }

  const response = NextResponse.next();

  persistDeviceIdIfMissing(request, response, deviceId);

  return response;
}

async function handleProtectedRoute(request: NextRequest, deviceId: string) {
  if (hasFreshAccessToken(request)) {
    const response = NextResponse.next();

    persistDeviceIdIfMissing(request, response, deviceId);

    return response;
  }

  const response = NextResponse.next();

  if (hasRefreshToken(request)) {
    const refreshed = await refreshAuthSessionInMiddleware(
      request,
      response,
      deviceId,
    );

    if (refreshed) {
      persistDeviceIdIfMissing(request, response, deviceId);

      return response;
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

  const refreshed = await refreshAuthSessionInMiddleware(
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
