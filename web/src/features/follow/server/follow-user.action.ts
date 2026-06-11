"use server";

import { z } from "zod";
import type { FollowStatus } from "@/entities/follow";
import { ApiError } from "@/shared/api/api-error";
import { followUserApi } from "../api/follow-user.api";

const followUserSchema = z.object({
  userId: z.string().min(1),
});

export type FollowUserActionResult =
  | { ok: true; status: FollowStatus }
  | { ok: false; error: string };

export async function followUserAction(input: {
  userId: string;
}): Promise<FollowUserActionResult> {
  const parsedInput = followUserSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      status: await followUserApi(parsedInput.data.userId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
