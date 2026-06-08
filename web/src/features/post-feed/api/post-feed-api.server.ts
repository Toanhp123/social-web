import { optionalAuthApiFetch } from "@/entities/session/server";
import type { PostPage } from "@/entities/post";
import type { ListPostFeedInput } from "../model/post-feed.schema";

export async function listPostFeedApi({
  cursor,
  limit = 10,
}: ListPostFeedInput): Promise<PostPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return optionalAuthApiFetch<PostPage>(`/posts?${searchParams.toString()}`);
}
