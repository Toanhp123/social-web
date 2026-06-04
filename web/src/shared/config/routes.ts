export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  dashboard: "/dashboard",
} as const;

export const AUTH_ROUTES = [ROUTES.login, ROUTES.register] as const;

export const CALLBACK_URL_SEARCH_PARAM = "callbackUrl";
