import { authApiFetch } from "@/entities/session/server";
import type { PostPage } from "@/entities/post";

type ListPostFeedParams = {
  cursor?: string | null;
  limit?: number;
};

export async function listPostFeedApi({
  cursor,
  limit = 10,
}: ListPostFeedParams): Promise<PostPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return authApiFetch<PostPage>(`/posts?${searchParams.toString()}`);
}
