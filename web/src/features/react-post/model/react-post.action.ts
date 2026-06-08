"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Post, ReactionType } from "@/entities/post";
import {
  removePostReactionApi,
  setPostReactionApi,
} from "../api/react-post-api.server";
import {
  removePostReactionSchema,
  setPostReactionSchema,
} from "./react-post.schema";

export type ReactPostActionResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

export async function setPostReactionAction(input: {
  postId: string;
  type: ReactionType;
}): Promise<ReactPostActionResult> {
  const parsedInput = setPostReactionSchema.safeParse(input);

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
      post: await setPostReactionApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}

export async function removePostReactionAction(
  postId: string,
): Promise<ReactPostActionResult> {
  const parsedInput = removePostReactionSchema.safeParse({ postId });

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
      post: await removePostReactionApi(parsedInput.data.postId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
