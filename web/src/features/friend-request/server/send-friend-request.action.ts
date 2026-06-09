"use server";

import { z } from "zod";
import { ApiError } from "@/shared/api/api-error";
import type { FriendRequest } from "@/entities/friend";
import { sendFriendRequestApi } from "../api/send-friend-request.api";

const sendFriendRequestSchema = z.object({
  receiverId: z.string().min(1),
});

export type SendFriendRequestActionResult =
  | { ok: true; request: FriendRequest }
  | { ok: false; error: string };

export async function sendFriendRequestAction(input: {
  receiverId: string;
}): Promise<SendFriendRequestActionResult> {
  const parsedInput = sendFriendRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      request: await sendFriendRequestApi(parsedInput.data.receiverId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
