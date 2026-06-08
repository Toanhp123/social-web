"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Post } from "@/entities/post";
import { createPostApi } from "../api/create-post-api.server";
import { createPostSchema } from "./create-post.schema";

export type CreatePostActionResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

export async function createPostAction(
  formData: FormData,
): Promise<CreatePostActionResult> {
  const parsedInput = createPostSchema.safeParse({
    content: formData.get("content"),
    visibility: formData.get("visibility"),
    media: formData.getAll("media"),
  });

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
      post: await createPostApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
