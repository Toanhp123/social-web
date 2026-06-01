import { NextRequest, NextResponse } from "next/server";
import {
  clearAuthCookies,
  hasFreshAccessToken,
  hasRefreshToken,
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

  if (isProtectedPath(pathname)) {
    return handleProtectedRoute(request);
  }

  if (isAuthPath(pathname)) {
    return handleAuthRoute(request);
  }

  return NextResponse.next();
}

async function handleProtectedRoute(request: NextRequest) {
  if (hasFreshAccessToken(request)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();

  if (hasRefreshToken(request)) {
    const refreshed = await refreshAuthSessionInMiddleware(request, response);

    if (refreshed) {
      return response;
    }
  }

  const redirectResponse = NextResponse.redirect(
    createLoginRedirectUrl(request),
  );

  clearAuthCookies(redirectResponse);

  return redirectResponse;
}

async function handleAuthRoute(request: NextRequest) {
  if (hasFreshAccessToken(request)) {
    return redirectToCallbackOrDashboard(request);
  }

  const response = NextResponse.next();

  if (!hasRefreshToken(request)) {
    return response;
  }

  const refreshed = await refreshAuthSessionInMiddleware(request, response);

  if (!refreshed) {
    return response;
  }

  const redirectResponse = redirectToCallbackOrDashboard(request);

  response.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

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
