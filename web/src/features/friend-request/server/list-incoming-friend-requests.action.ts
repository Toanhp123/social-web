"use server";

import { ApiError } from "@/shared/api/api-error";
import type { FriendRequest } from "@/entities/friend";
import { listIncomingFriendRequestsApi } from "@/entities/friend/server";

export type ListIncomingFriendRequestsActionResult =
  | { ok: true; requests: FriendRequest[] }
  | { ok: false; error: string };

export async function listIncomingFriendRequestsAction(): Promise<ListIncomingFriendRequestsActionResult> {
  try {
    return {
      ok: true,
      requests: await listIncomingFriendRequestsApi(),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
