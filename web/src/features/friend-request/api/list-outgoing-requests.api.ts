import { authApiFetch } from "@/entities/session/server";
import type { FriendRequest } from "@/entities/friend";

export async function listOutgoingFriendRequestsApi(): Promise<
  FriendRequest[]
> {
  return authApiFetch<FriendRequest[]>("/friend-requests/outgoing");
}
