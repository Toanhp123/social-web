export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  profile: "/profile",
  friends: "/friends",
  groups: "/groups",
  search: "/search",
} as const;

export const AUTH_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
  ROUTES.resetPassword,
] as const;

export const CALLBACK_URL_SEARCH_PARAM = "callbackUrl";

export function getProfileRoute(userId: string): string {
  return `${ROUTES.profile}/${userId}`;
}

export function getGroupRoute(groupId: string): string {
  return `${ROUTES.groups}/${groupId}`;
}

export function getSearchRoute(query: string): string {
  const searchParams = new URLSearchParams();
  searchParams.set("q", query);

  return `${ROUTES.search}?${searchParams.toString()}`;
}
