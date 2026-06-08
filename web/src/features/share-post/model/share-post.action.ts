"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Post, PostVisibility } from "@/entities/post";
import { sharePostApi } from "../api/share-post-api.server";
import { sharePostSchema } from "./share-post.schema";

export type SharePostActionResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

export async function sharePostAction(input: {
  postId: string;
  content?: string;
  visibility?: PostVisibility;
}): Promise<SharePostActionResult> {
  const parsedInput = sharePostSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error:
        parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      post: await sharePostApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
