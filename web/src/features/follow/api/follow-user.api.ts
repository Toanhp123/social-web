import { authApiFetch } from "@/entities/session/server";
import type { FollowStatus } from "@/entities/follow";

export async function followUserApi(userId: string): Promise<FollowStatus> {
  return authApiFetch<FollowStatus>(`/follows/${userId}`, {
    method: "POST",
  });
}
