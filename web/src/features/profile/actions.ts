"use server";

import {
  uploadMyProfileImageAction as uploadMyProfileImage,
  type ProfileActionResult,
} from "./model/profile.action";

export async function uploadMyProfileImageAction(
  formData: FormData,
): Promise<ProfileActionResult> {
  return uploadMyProfileImage(formData);
}
