"use server";

import { ApiError } from "@/shared/api/api-error";
import {
  requestPasswordResetApi,
  resetPasswordApi,
} from "../api/password-reset-api.server";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "./password-reset.schema";

export type PasswordResetActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function requestPasswordResetAction(
  formData: FormData,
): Promise<PasswordResetActionResult> {
  const parsedInput = requestPasswordResetSchema.safeParse({
    email: formData.get("email"),
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    await requestPasswordResetApi(parsedInput.data.email);
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Đã có lỗi xảy ra." };
  }

  return { ok: true };
}

export async function resetPasswordAction(
  formData: FormData,
): Promise<PasswordResetActionResult> {
  const parsedInput = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Dữ liệu không hợp lệ.",
    };
  }

  try {
    await resetPasswordApi(parsedInput.data);
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Đã có lỗi xảy ra." };
  }

  return { ok: true };
}
