"use server";

import { z } from "zod";
import { ApiError } from "@/shared/api/api-error";
import { listFriendCandidatesApi, type FriendUser } from "@/entities/friend";

const listFriendCandidatesSchema = z.object({
  query: z.string().trim().max(100).optional(),
  limit: z.number().int().min(1).max(30).optional(),
});

export type ListFriendCandidatesActionResult =
  | { ok: true; candidates: FriendUser[] }
  | { ok: false; error: string };

export async function listFriendCandidatesAction(input: {
  query?: string;
  limit?: number;
}): Promise<ListFriendCandidatesActionResult> {
  const parsedInput = listFriendCandidatesSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      candidates: await listFriendCandidatesApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
