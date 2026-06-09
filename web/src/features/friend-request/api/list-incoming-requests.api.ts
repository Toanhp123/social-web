import { authApiFetch } from "@/entities/session/server";
import type { FriendRequest } from "@/entities/friend";

export async function listIncomingFriendRequestsApi(): Promise<
  FriendRequest[]
> {
  return authApiFetch<FriendRequest[]>("/friend-requests/incoming");
}
