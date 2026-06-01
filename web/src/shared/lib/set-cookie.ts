type HeadersWithGetSetCookie = Headers & {
  getSetCookie?: () => string[];
};

export type ResponseCookie = {
  value: string;
  expires?: Date;
};

export function readResponseCookie(
  headers: Headers,
  cookieName: string,
): ResponseCookie | undefined {
  for (const setCookie of getSetCookieHeaders(headers)) {
    const [cookiePair, ...attributes] = setCookie.split(";");
    const separatorIndex = cookiePair.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const name = cookiePair.slice(0, separatorIndex).trim();

    if (name !== cookieName) {
      continue;
    }

    return {
      value: decodeCookieValue(cookiePair.slice(separatorIndex + 1)),
      expires: readExpiresAttribute(attributes),
    };
  }
}

function getSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = (headers as HeadersWithGetSetCookie).getSetCookie;
  const setCookies = getSetCookie?.call(headers);

  if (setCookies?.length) {
    return setCookies;
  }

  const setCookie = headers.get("set-cookie");

  return setCookie ? [setCookie] : [];
}

function decodeCookieValue(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function readExpiresAttribute(attributes: string[]): Date | undefined {
  const expiresAttribute = attributes.find((attribute) =>
    attribute.trim().toLowerCase().startsWith("expires="),
  );

  if (!expiresAttribute) {
    return undefined;
  }

  const expiresAt = new Date(expiresAttribute.split("=").slice(1).join("="));

  return Number.isNaN(expiresAt.getTime()) ? undefined : expiresAt;
}
