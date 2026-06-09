"use server";

import { z } from "zod";
import { ApiError } from "@/shared/api/api-error";
import { removeFriendApi } from "../api/remove-friend.api";

const removeFriendSchema = z.object({
  friendId: z.string().min(1),
});

export type RemoveFriendActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function removeFriendAction(input: {
  friendId: string;
}): Promise<RemoveFriendActionResult> {
  const parsedInput = removeFriendSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    await removeFriendApi(parsedInput.data.friendId);

    return { ok: true };
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
