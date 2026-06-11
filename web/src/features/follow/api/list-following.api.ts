import { authApiFetch } from "@/entities/session/server";
import type { Follow } from "@/entities/follow";

export async function listFollowingApi(): Promise<Follow[]> {
  return authApiFetch<Follow[]>("/follows/following");
}
