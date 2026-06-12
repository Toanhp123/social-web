"use server";

import { ApiError } from "@/shared/api/api-error";
import {
  listOutgoingFriendRequestsApi,
  type FriendRequest,
} from "@/entities/friend";

export type ListOutgoingFriendRequestsActionResult =
  | { ok: true; requests: FriendRequest[] }
  | { ok: false; error: string };

export async function listOutgoingFriendRequestsAction(): Promise<ListOutgoingFriendRequestsActionResult> {
  try {
    return {
      ok: true,
      requests: await listOutgoingFriendRequestsApi(),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
