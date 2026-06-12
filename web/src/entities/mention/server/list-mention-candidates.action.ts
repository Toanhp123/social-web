"use server";

import { z } from "zod";
import type { FriendUser } from "@/entities/friend";
import { ApiError } from "@/shared/api/api-error";
import { listMentionCandidatesApi } from "../api/list-mention-candidates.api";

const listMentionCandidatesSchema = z.object({
  query: z.string().trim().max(100).optional(),
  limit: z.number().int().min(1).max(20).optional(),
});

export type ListMentionCandidatesActionResult =
  | { ok: true; candidates: FriendUser[] }
  | { ok: false; error: string };

export async function listMentionCandidatesAction(input: {
  query?: string;
  limit?: number;
}): Promise<ListMentionCandidatesActionResult> {
  const parsedInput = listMentionCandidatesSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Invalid input.",
    };
  }

  try {
    return {
      ok: true,
      candidates: await listMentionCandidatesApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Something went wrong." };
  }
}
