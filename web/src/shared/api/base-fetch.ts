import { ApiError } from "./api-error";

type BackendErrorResponse = {
  requestId?: string;
  code?: string;
  message?: string;
  metadata?: unknown;
};

export async function baseFetch<T>(
  baseUrl: string,
  endpoint: string,
  init?: RequestInit,
): Promise<T> {
  const { data } = await baseFetchWithResponse<T>(baseUrl, endpoint, init);

  return data;
}

export async function baseFetchWithResponse<T>(
  baseUrl: string,
  endpoint: string,
  init?: RequestInit,
): Promise<{ data: T; response: Response }> {
  const headers = new Headers(init?.headers);

  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(joinUrl(baseUrl, endpoint), {
    ...init,
    headers,
    cache: init?.cache ?? "no-store",
  });

  if (!response.ok) {
    const errorBody = await parseErrorBody(response);

    throw new ApiError(
      response.status,
      errorBody?.code ?? "UNKNOWN_ERROR",
      errorBody?.message ?? "Request failed",
      errorBody?.requestId,
      errorBody?.metadata,
    );
  }

  if (response.status === 204) {
    return {
      data: undefined as T,
      response,
    };
  }

  return {
    data: (await response.json()) as T,
    response,
  };
}

function joinUrl(baseUrl: string, endpoint: string) {
  return `${baseUrl.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

async function parseErrorBody(
  response: Response,
): Promise<BackendErrorResponse | null> {
  const contentType = response.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");

  return text
    ? {
        message: text,
      }
    : null;
}
