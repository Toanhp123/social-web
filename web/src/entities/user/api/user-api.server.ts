import { authApiFetch } from "@/entities/session/server";
import type { User } from "../model/user";
import type { UserProfile } from "../model/profile";

export async function getUserApi(userId: string): Promise<User> {
  return authApiFetch<User>(`/users/${userId}`);
}

export async function getUserProfileApi(userId: string): Promise<UserProfile> {
  return authApiFetch<UserProfile>(`/users/${userId}/profile`);
}
