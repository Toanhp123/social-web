import { getUserApi, getUserProfileApi } from "@/features/profile/server";
import { ApiError } from "@/shared/api/api-error";

export async function getUserOrNull(userId: string) {
  try {
    return await getUserApi(userId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404 &&
      ["RESOURCE_NOT_FOUND", "USER_NOT_FOUND"].includes(error.code)
    ) {
      return null;
    }

    throw error;
  }
}

export async function getCurrentProfileOrNull(userId: string) {
  try {
    return await getUserProfileApi(userId);
  } catch (error) {
    if (
      error instanceof ApiError &&
      error.status === 404 &&
      ["RESOURCE_NOT_FOUND", "USER_NOT_FOUND"].includes(error.code)
    ) {
      return null;
    }

    throw error;
  }
}
