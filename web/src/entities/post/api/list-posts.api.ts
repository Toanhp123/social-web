import { optionalAuthApiFetch } from "@/entities/session/server";
import type { PostPage } from "../model/types";

export type ListPostsApiInput = {
  cursor?: string | null;
  limit?: number;
  authorId?: string | null;
};

export async function listPostsApi({
  cursor,
  limit = 10,
  authorId,
}: ListPostsApiInput): Promise<PostPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  if (authorId) {
    searchParams.set("authorId", authorId);
  }

  return optionalAuthApiFetch<PostPage>(`/posts?${searchParams.toString()}`);
}
