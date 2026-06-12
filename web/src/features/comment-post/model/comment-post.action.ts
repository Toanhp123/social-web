"use server";

import { ApiError } from "@/shared/api/api-error";
import { listCommentsApi, type Comment, type CommentPage } from "@/entities/comment";
import { createPostCommentApi } from "../api/comment-post-api.server";
import {
  createPostCommentSchema,
  listPostCommentsSchema,
} from "./comment-post.schema";

export type ListPostCommentsActionResult =
  | { ok: true; page: CommentPage }
  | { ok: false; error: string };

export type CreatePostCommentActionResult =
  | { ok: true; comment: Comment }
  | { ok: false; error: string };

export async function listPostCommentsAction(input: {
  postId: string;
  parentId?: string | null;
  cursor?: string | null;
  limit?: number;
}): Promise<ListPostCommentsActionResult> {
  const parsedInput = listPostCommentsSchema.safeParse(input);

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
      page: await listCommentsApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}

export async function createPostCommentAction(input: {
  postId: string;
  parentId?: string;
  content: string;
}): Promise<CreatePostCommentActionResult> {
  const parsedInput = createPostCommentSchema.safeParse(input);

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
      comment: await createPostCommentApi(parsedInput.data),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
