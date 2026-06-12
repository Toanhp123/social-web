"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Friendship } from "@/entities/friend";
import { listFriendsApi } from "@/entities/friend/server";

export type ListFriendsActionResult =
  | {
      ok: true;
      friends: Friendship[];
    }
  | {
      ok: false;
      error: string;
    };

export async function listFriendsAction(): Promise<ListFriendsActionResult> {
  try {
    return {
      ok: true,
      friends: await listFriendsApi(),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: false,
      error: "Da co loi xay ra.",
    };
  }
}
