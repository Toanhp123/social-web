import { authApiFetch } from "@/entities/session/server";
import type { FriendRequest, Friendship, FriendUser } from "../model/types";

export async function listFriendsApi(): Promise<Friendship[]> {
  return authApiFetch<Friendship[]>("/friends");
}

export async function listFriendCandidatesApi(input: {
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
    `/users/discover${queryString ? `?${queryString}` : ""}`,
  );
}

export async function listIncomingFriendRequestsApi(): Promise<
  FriendRequest[]
> {
  return authApiFetch<FriendRequest[]>("/friend-requests/incoming");
}

export async function listOutgoingFriendRequestsApi(): Promise<
  FriendRequest[]
> {
  return authApiFetch<FriendRequest[]>("/friend-requests/outgoing");
}
