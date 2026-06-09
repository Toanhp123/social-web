import { authApiFetch } from "@/entities/session/server";

export async function removeFriendApi(friendId: string): Promise<void> {
  await authApiFetch<void>(`/friends/${friendId}`, {
    method: "DELETE",
  });
}
