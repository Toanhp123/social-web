"use server";

import { z } from "zod";
import type { FollowStatus } from "@/entities/follow";
import { ApiError } from "@/shared/api/api-error";
import { unfollowUserApi } from "../api/unfollow-user.api";

const unfollowUserSchema = z.object({
  userId: z.string().min(1),
});

export type UnfollowUserActionResult =
  | { ok: true; status: FollowStatus }
  | { ok: false; error: string };

export async function unfollowUserAction(input: {
  userId: string;
}): Promise<UnfollowUserActionResult> {
  const parsedInput = unfollowUserSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      status: await unfollowUserApi(parsedInput.data.userId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
