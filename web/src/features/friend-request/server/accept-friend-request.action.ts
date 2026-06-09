"use server";

import { z } from "zod";
import { ApiError } from "@/shared/api/api-error";
import type { AcceptFriendRequestResponse } from "@/entities/friend";
import { acceptFriendRequestApi } from "../api/accept-friend-request.api";

const acceptFriendRequestSchema = z.object({
  requestId: z.string().min(1),
});

export type AcceptFriendRequestActionResult =
  | { ok: true; data: AcceptFriendRequestResponse }
  | { ok: false; error: string };

export async function acceptFriendRequestAction(input: {
  requestId: string;
}): Promise<AcceptFriendRequestActionResult> {
  const parsedInput = acceptFriendRequestSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      data: await acceptFriendRequestApi(parsedInput.data.requestId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
