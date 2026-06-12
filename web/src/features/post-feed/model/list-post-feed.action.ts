"use server";

import { ApiError } from "@/shared/api/api-error";
import type { PostPage } from "@/entities/post";
import { listPostsApi } from "@/entities/post/server";
import { listPostFeedSchema } from "./post-feed.schema";

export type ListPostFeedActionResult =
  | { ok: true; page: PostPage }
  | { ok: false; error: string };

export async function listPostFeedAction(input: {
  cursor?: string | null;
  limit?: number;
  authorId?: string | null;
}): Promise<ListPostFeedActionResult> {
  const parsedInput = listPostFeedSchema.safeParse(input);

  if (!parsedInput.success) {
    return {
      ok: false,
      error: parsedInput.error.issues[0]?.message ?? "Du lieu khong hop le.",
    };
  }

  try {
    return {
      ok: true,
      page: await listPostsApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
