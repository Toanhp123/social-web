import { authApiFetch } from "@/entities/session/server";
import type { Follow, FollowStatus } from "../model/types";

export async function getFollowStatusApi(
  userId: string,
): Promise<FollowStatus> {
  return authApiFetch<FollowStatus>(`/follows/${userId}/status`);
}

export async function listFollowersApi(): Promise<Follow[]> {
  return authApiFetch<Follow[]>("/follows/followers");
}

export async function listFollowingApi(): Promise<Follow[]> {
  return authApiFetch<Follow[]>("/follows/following");
}
