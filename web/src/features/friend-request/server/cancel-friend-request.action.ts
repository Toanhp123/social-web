"use server";

import { z } from "zod";
import { ApiError } from "@/shared/api/api-error";
import { cancelFriendRequestApi } from "../api/cancel-friend-request.api";

const cancelFriendRequestSchema = z.object({
  requestId: z.string().min(1),
});

export type CancelFriendRequestActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function cancelFriendRequestAction(input: {
  requestId: string;
}): Promise<CancelFriendRequestActionResult> {
  const parsedInput = cancelFriendRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    await cancelFriendRequestApi(parsedInput.data.requestId);

    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
