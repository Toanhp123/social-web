"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Post, ReactionType } from "@/entities/post";
import {
  removePostReactionApi,
  setPostReactionApi,
} from "../api/react-post-api.server";

export type ReactPostActionResult =
  | { ok: true; post: Post }
  | { ok: false; error: string };

export async function setPostReactionAction(input: {
  postId: string;
  type: ReactionType;
}): Promise<ReactPostActionResult> {
  try {
    return {
      ok: true,
      post: await setPostReactionApi(input),
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
  try {
    return {
      ok: true,
      post: await removePostReactionApi(postId),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
