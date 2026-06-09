import { authApiFetch } from "@/entities/session/server";
import type { FriendRequest } from "@/entities/friend";

export async function rejectFriendRequestApi(
  requestId: string,
): Promise<FriendRequest> {
  return authApiFetch<FriendRequest>(`/friend-requests/${requestId}/reject`, {
    method: "POST",
  });
}
