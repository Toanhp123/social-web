import { ApiError } from "@/shared/api/api-error";
import { apiFetch } from "@/shared/api/api-fetch.server";
import type { VerifyEmailResult } from "../model/verify-email-result";
import { verifyEmailSchema } from "../model/email-verification.schema";

export async function verifyEmailApi(
  token: string | undefined,
): Promise<VerifyEmailResult> {
  const parsedInput = verifyEmailSchema.safeParse({ token });

  if (!parsedInput.success) {
    return {
      ok: false,
      message:
        parsedInput.error.issues[0]?.message ??
        "The verification link is missing its token.",
    };
  }

  try {
    await apiFetch<void>("/auth/email-verification/verify", {
      method: "POST",
      body: JSON.stringify({ token: parsedInput.data.token }),
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
