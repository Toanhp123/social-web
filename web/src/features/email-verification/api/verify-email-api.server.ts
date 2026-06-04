import { ApiError } from "@/shared/api/api-error";
import { apiFetch } from "@/shared/api/api-fetch.server";

export type VerifyEmailResult = {
  ok: boolean;
  message: string;
};

export async function verifyEmailApi(
  token: string | undefined,
): Promise<VerifyEmailResult> {
  if (!token) {
    return {
      ok: false,
      message: "The verification link is missing its token.",
    };
  }

  try {
    await apiFetch<void>("/auth/email-verification/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });

    return {
      ok: true,
      message: "Your email address has been verified.",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        message: error.message,
      };
    }

    throw error;
  }
}
