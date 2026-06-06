"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Post, PostVisibility } from "@/entities/post";
import { sharePostApi } from "../api/share-post-api.server";

export type SharePostActionResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

export async function sharePostAction(input: {
  postId: string;
  content?: string;
  visibility?: PostVisibility;
}): Promise<SharePostActionResult> {
  try {
    return {
      ok: true,
      post: await sharePostApi(input),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
