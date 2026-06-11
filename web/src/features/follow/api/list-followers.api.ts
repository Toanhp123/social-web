import { authApiFetch } from "@/entities/session/server";
import type { Follow } from "@/entities/follow";

export async function listFollowersApi(): Promise<Follow[]> {
  return authApiFetch<Follow[]>("/follows/followers");
}
