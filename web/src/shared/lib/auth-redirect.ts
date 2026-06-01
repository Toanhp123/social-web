import {
  AUTH_ROUTES,
  CALLBACK_URL_SEARCH_PARAM,
  ROUTES,
} from "@/shared/config/routes";
import { getSafeRedirectPath } from "./redirect-path";

export function getPostAuthRedirectPath(callbackUrl: string | null | undefined) {
  return getSafeRedirectPath(callbackUrl, ROUTES.dashboard, AUTH_ROUTES);
}

export function getAuthRouteHref(
  route: (typeof AUTH_ROUTES)[number],
  callbackUrl: string | null | undefined,
) {
  const safeCallbackUrl = getSafeRedirectPath(callbackUrl, "", AUTH_ROUTES);

  if (!safeCallbackUrl) {
    return route;
  }

  const searchParams = new URLSearchParams({
    [CALLBACK_URL_SEARCH_PARAM]: safeCallbackUrl,
  });

  return `${route}?${searchParams.toString()}`;
}
