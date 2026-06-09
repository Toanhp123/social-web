import { authApiFetch } from "@/entities/session/server";
import type { FriendRequest } from "@/entities/friend";

export async function sendFriendRequestApi(
  receiverId: string,
): Promise<FriendRequest> {
  return authApiFetch<FriendRequest>(`/friend-requests/to/${receiverId}`, {
    method: "POST",
  });
}
