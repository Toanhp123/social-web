"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Post } from "@/entities/post";
import { createPostApi } from "../api/create-post-api.server";

export type CreatePostActionResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

export async function createPostAction(
  formData: FormData,
): Promise<CreatePostActionResult> {
  try {
    return {
      ok: true,
      post: await createPostApi(formData),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
