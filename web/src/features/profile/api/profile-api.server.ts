import { authApiFetch } from "@/entities/session/server";
import type { UserProfile } from "@/entities/user";

export type UserProfileInput = {
  bio?: string | null;
  website?: string | null;
  gender?: string | null;
  relationshipStatus?: string | null;
  birthday?: string | null;
  isBirthdayPublic?: boolean;
  isFriendListPublic?: boolean;
  locationName?: string | null;
};

export async function getUserProfileApi(userId: string): Promise<UserProfile> {
  return authApiFetch<UserProfile>(`/users/${userId}/profile`);
}

export async function createMyProfileApi(
  input: UserProfileInput,
): Promise<UserProfile> {
  return authApiFetch<UserProfile>("/users/me/profile", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function updateMyProfileApi(
  input: UserProfileInput,
): Promise<UserProfile> {
  return authApiFetch<UserProfile>("/users/me/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteMyProfileApi(): Promise<void> {
  await authApiFetch<void>("/users/me/profile", {
    method: "DELETE",
  });
}

export async function uploadMyProfileImageApi(
  kind: "avatar" | "cover",
  file: File,
): Promise<UserProfile> {
  const formData = new FormData();

  formData.set("file", file);

  return authApiFetch<UserProfile>(`/users/me/${kind}`, {
    method: "POST",
    body: formData,
  });
}
