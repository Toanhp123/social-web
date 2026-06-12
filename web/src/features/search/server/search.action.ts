"use server";

import { listFriendCandidatesApi } from "@/entities/friend/server";
import type { FriendUser } from "@/entities/friend";
import { listPostsApi } from "@/entities/post/server";
import type { Post } from "@/entities/post";
import { ApiError } from "@/shared/api/api-error";
import {
  searchPreviewSchema,
  searchUsersSchema,
  type SearchPreviewInput,
  type SearchUsersInput,
} from "../model/search.schema";

export type SearchPreviewActionResult =
  | { ok: true; users: FriendUser[]; posts: Post[] }
  | { ok: false; error: string };

export type SearchUsersActionResult =
  | { ok: true; users: FriendUser[] }
  | { ok: false; error: string };

export async function searchPreviewAction(
  input: SearchPreviewInput,
): Promise<SearchPreviewActionResult> {
  const parsedInput = searchPreviewSchema.safeParse(input);

  if (!parsedInput.success) {
    return toSearchError(parsedInput.error.issues[0]?.message);
  }

  const query = parsedInput.data.query;

  if (!query) {
    return { ok: true, users: [], posts: [] };
  }

  try {
    const [users, postPage] = await Promise.all([
      listFriendCandidatesApi({
        query,
        limit: parsedInput.data.userLimit ?? 5,
      }),
      listPostsApi({
        search: query,
        limit: parsedInput.data.postLimit ?? 3,
      }),
    ]);

    return {
      ok: true,
      users,
      posts: postPage.items,
    };
  } catch (error) {
    return toSearchError(error);
  }
}

export async function searchUsersAction(
  input: SearchUsersInput,
): Promise<SearchUsersActionResult> {
  const parsedInput = searchUsersSchema.safeParse(input);

  if (!parsedInput.success) {
    return toSearchError(parsedInput.error.issues[0]?.message);
  }

  const query = parsedInput.data.query;

  if (!query) {
    return { ok: true, users: [] };
  }

  try {
    return {
      ok: true,
      users: await listFriendCandidatesApi({
        query,
        limit: parsedInput.data.limit ?? 20,
      }),
    };
  } catch (error) {
    return toSearchError(error);
  }
}

function toSearchError(error: unknown): { ok: false; error: string } {
  if (error instanceof ApiError) {
    return { ok: false, error: error.message };
  }

  return {
    ok: false,
    error: typeof error === "string" ? error : "Something went wrong.",
  };
}
