import { authApiFetch } from "@/entities/session/server";

export async function cancelFriendRequestApi(requestId: string): Promise<void> {
  await authApiFetch<void>(`/friend-requests/${requestId}`, {
    method: "DELETE",
  });
}
