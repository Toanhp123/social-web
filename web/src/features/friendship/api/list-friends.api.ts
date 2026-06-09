import { authApiFetch } from "@/entities/session/server";
import type { Friendship } from "@/entities/friend";

export async function listFriendsApi(): Promise<Friendship[]> {
  return authApiFetch<Friendship[]>("/friends");
}
