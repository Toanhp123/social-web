import { getCurrentSessionUser } from "@/entities/session/server";
import { ApiError } from "@/shared/api/api-error";

export async function getCurrentSessionUserOrNull() {
  try {
    return await getCurrentSessionUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return null;
    }

    throw error;
  }
}
