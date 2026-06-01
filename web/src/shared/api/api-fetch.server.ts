import { env } from "@/shared/config/env.server";
import { baseFetch, baseFetchWithResponse } from "./base-fetch";

export function apiFetch<T>(endpoint: string, init?: RequestInit) {
  return baseFetch<T>(env.API_URL, endpoint, init);
}

export function apiFetchWithResponse<T>(endpoint: string, init?: RequestInit) {
  return baseFetchWithResponse<T>(env.API_URL, endpoint, init);
}
