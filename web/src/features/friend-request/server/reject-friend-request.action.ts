"use server";

import { z } from "zod";
import { ApiError } from "@/shared/api/api-error";
import type { FriendRequest } from "@/entities/friend";
import { rejectFriendRequestApi } from "../api/reject-friend-request.api";

const rejectFriendRequestSchema = z.object({
  requestId: z.string().min(1),
});

export type RejectFriendRequestActionResult =
  | { ok: true; request: FriendRequest }
  | { ok: false; error: string };

export async function rejectFriendRequestAction(input: {
  requestId: string;
}): Promise<RejectFriendRequestActionResult> {
  const parsedInput = rejectFriendRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      request: await rejectFriendRequestApi(parsedInput.data.requestId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
