"use server";

import { ApiError } from "@/shared/api/api-error";
import { listFriendsApi, type Friendship } from "@/entities/friend";

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
