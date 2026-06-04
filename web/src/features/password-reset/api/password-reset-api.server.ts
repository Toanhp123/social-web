import { apiFetch } from "@/shared/api/api-fetch.server";

export function requestPasswordResetApi(email: string) {
  return apiFetch<{ sent: true }>("/auth/password-reset/request", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordApi(input: { token: string; password: string }) {
  return apiFetch<void>("/auth/password-reset/confirm", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
