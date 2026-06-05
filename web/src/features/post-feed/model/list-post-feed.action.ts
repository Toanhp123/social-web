"use server";

import { ApiError } from "@/shared/api/api-error";
import type { PostPage } from "@/entities/post";
import { listPostFeedApi } from "../api/post-feed-api.server";

export type ListPostFeedActionResult =
  | { ok: true; page: PostPage }
  | { ok: false; error: string };

export async function listPostFeedAction(input: {
  cursor?: string | null;
  limit?: number;
}): Promise<ListPostFeedActionResult> {
  try {
    return {
      ok: true,
      page: await listPostFeedApi(input),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
