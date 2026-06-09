import { authApiFetch } from "@/entities/session/server";
import type { AcceptFriendRequestResponse } from "@/entities/friend";

export async function acceptFriendRequestApi(
  requestId: string,
): Promise<AcceptFriendRequestResponse> {
  return authApiFetch<AcceptFriendRequestResponse>(
    `/friend-requests/${requestId}/accept`,
    {
      method: "POST",
    },
  );
}
