import { optionalAuthApiFetch } from "@/entities/session/server";
import type { PostPage } from "../model/types";

export type ListPostsApiInput = {
  cursor?: string | null;
  limit?: number;
  authorId?: string | null;
  groupId?: string | null;
  search?: string | null;
};

export async function listPostsApi({
  cursor,
  limit = 10,
  authorId,
  groupId,
  search,
}: ListPostsApiInput): Promise<PostPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  if (authorId) {
    searchParams.set("authorId", authorId);
  }

  if (groupId) {
    searchParams.set("groupId", groupId);
  }

  if (search?.trim()) {
    searchParams.set("search", search.trim());
  }

  return optionalAuthApiFetch<PostPage>(`/posts?${searchParams.toString()}`);
}
