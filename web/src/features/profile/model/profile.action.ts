"use server";

import { ApiError } from "@/shared/api/api-error";
import {
  createMyProfileApi,
  deleteMyProfileApi,
  getUserProfileApi,
  updateMyProfileApi,
  uploadMyProfileImageApi,
  type UserProfileInput,
} from "../api/profile-api.server";
import type { UserProfile } from "@/entities/user";

export type ProfileActionResult =
  | { ok: true; profile: UserProfile }
  | { ok: false; error: string };

export type DeleteProfileActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function getUserProfileAction(
  userId: string,
): Promise<ProfileActionResult> {
  try {
    return {
      ok: true,
      profile: await getUserProfileApi(userId),
    };
  } catch (error) {
    return toProfileActionError(error);
  }
}

export async function saveMyProfileAction(
  formData: FormData,
): Promise<ProfileActionResult> {
  const input = toProfileInput(formData);
  const mode = formData.get("mode") === "create" ? "create" : "update";

  try {
    return {
      ok: true,
      profile:
        mode === "create"
          ? await createMyProfileApi(input)
          : await updateMyProfileApi(input),
    };
  } catch (error) {
    return toProfileActionError(error);
  }
}

export async function deleteMyProfileAction(): Promise<DeleteProfileActionResult> {
  try {
    await deleteMyProfileApi();

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}

export async function uploadMyProfileImageAction(
  formData: FormData,
): Promise<ProfileActionResult> {
  const kind = formData.get("kind") === "cover" ? "cover" : "avatar";
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      error: "Vui long chon anh de tai len.",
    };
  }

  try {
    return {
      ok: true,
      profile: await uploadMyProfileImageApi(kind, file),
    };
  } catch (error) {
    return toProfileActionError(error);
  }
}

function toProfileInput(formData: FormData): UserProfileInput {
  return {
    bio: nullableString(formData.get("bio")),
    website: nullableString(formData.get("website")),
    gender: nullableString(formData.get("gender")),
    relationshipStatus: nullableString(formData.get("relationshipStatus")),
    birthday: nullableString(formData.get("birthday")),
    isBirthdayPublic: formData.get("isBirthdayPublic") === "on",
    isFriendListPublic: formData.get("isFriendListPublic") === "on",
    locationName: nullableString(formData.get("locationName")),
  };
}

function nullableString(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") {
    return null;
  }

  return value.trim() || null;
}

function toProfileActionError(error: unknown): ProfileActionResult {
  if (error instanceof ApiError) {
    return {
      ok: false,
      error: error.message,
    };
  }

  return {
    ok: false,
    error: "Da co loi xay ra.",
  };
}
