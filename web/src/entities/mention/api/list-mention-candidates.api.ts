import type { FriendUser } from "@/entities/friend";
import { authApiFetch } from "@/entities/session/server";

export async function listMentionCandidatesApi(input: {
  query?: string;
  limit?: number;
}): Promise<FriendUser[]> {
  const searchParams = new URLSearchParams();

  if (input.query?.trim()) {
    searchParams.set("query", input.query.trim());
  }

  if (input.limit) {
    searchParams.set("limit", String(input.limit));
  }

  const queryString = searchParams.toString();

  return authApiFetch<FriendUser[]>(
    `/users/mentions${queryString ? `?${queryString}` : ""}`,
  );
}
