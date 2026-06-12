import { optionalAuthApiFetch } from "@/entities/session/server";
import type { PostPage } from "../model/types";

export type ListPostsApiInput = {
  cursor?: string | null;
  limit?: number;
  authorId?: string | null;
  search?: string | null;
};

export async function listPostsApi({
  cursor,
  limit = 10,
  authorId,
  search,
}: ListPostsApiInput): Promise<PostPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  if (authorId) {
    searchParams.set("authorId", authorId);
  }

  if (search?.trim()) {
    searchParams.set("search", search.trim());
  }

  return optionalAuthApiFetch<PostPage>(`/posts?${searchParams.toString()}`);
}
