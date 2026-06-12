"use server";

import { ApiError } from "@/shared/api/api-error";
import {
  listIncomingFriendRequestsApi,
  type FriendRequest,
} from "@/entities/friend";

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
