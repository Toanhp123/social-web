"use server";

import { ApiError } from "@/shared/api/api-error";
import {
  createMyProfileApi,
  deleteMyProfileApi,
  updateMyProfileApi,
  uploadMyProfileImageApi,
} from "../api/profile-api.server";
import { getUserProfileApi, type UserProfile } from "@/entities/user";
import { saveProfileSchema, uploadProfileImageSchema } from "./profile.schema";

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
  const parsedInput = saveProfileSchema.safeParse({
    mode: formData.get("mode"),
    profile: {
      bio: formData.get("bio"),
      website: formData.get("website"),
      gender: formData.get("gender"),
      relationshipStatus: formData.get("relationshipStatus"),
      birthday: formData.get("birthday"),
      isBirthdayPublic: formData.get("isBirthdayPublic"),
      isFriendListPublic: formData.get("isFriendListPublic"),
      locationName: formData.get("locationName"),
    },
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      profile:
        parsedInput.data.mode === "create"
          ? await createMyProfileApi(parsedInput.data.profile)
          : await updateMyProfileApi(parsedInput.data.profile),
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
  const parsedInput = uploadProfileImageSchema.safeParse({
    kind: formData.get("kind"),
    file: formData.get("file"),
  });

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      profile: await uploadMyProfileImageApi(
        parsedInput.data.kind,
        parsedInput.data.file,
      ),
    };
  } catch (error) {
    return toProfileActionError(error);
  }
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
