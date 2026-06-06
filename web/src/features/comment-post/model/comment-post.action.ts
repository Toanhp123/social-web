"use server";

import { ApiError } from "@/shared/api/api-error";
import type { Comment, CommentPage } from "@/entities/comment";
import {
  createPostCommentApi,
  listPostCommentsApi,
} from "../api/comment-post-api.server";

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
  try {
    return {
      ok: true,
      page: await listPostCommentsApi(input),
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
  try {
    return {
      ok: true,
      comment: await createPostCommentApi(input),
    };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }

    return { ok: false, error: "Da co loi xay ra." };
  }
}
