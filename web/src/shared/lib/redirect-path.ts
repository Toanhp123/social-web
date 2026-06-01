export function getSafeRedirectPath(
  path: string | null | undefined,
  fallbackPath: string,
  blockedPaths: readonly string[] = [],
) {
  const trimmedPath = path?.trim();

  if (
    !trimmedPath ||
    !trimmedPath.startsWith("/") ||
    trimmedPath.startsWith("//") ||
    trimmedPath.includes("\\")
  ) {
    return fallbackPath;
  }

  try {
    const url = new URL(trimmedPath, "https://app.local");
    const redirectPath = `${url.pathname}${url.search}${url.hash}`;

    if (isBlockedPath(redirectPath, blockedPaths)) {
      return fallbackPath;
    }

    return redirectPath;
  } catch {
    return fallbackPath;
  }
}

function isBlockedPath(path: string, blockedPaths: readonly string[]) {
  return blockedPaths.some(
    (blockedPath) =>
      path === blockedPath ||
      path.startsWith(`${blockedPath}?`) ||
      path.startsWith(`${blockedPath}#`) ||
      path.startsWith(`${blockedPath}/`),
  );
}
