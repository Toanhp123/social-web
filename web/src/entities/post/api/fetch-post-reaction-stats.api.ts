import type { PostReactionStats } from "../model/types";

export async function fetchPostReactionStats(
  postId: string,
): Promise<PostReactionStats | null> {
  const response = await fetch(`/api/posts/${postId}/reaction-stats`, {
    cache: "no-store",
  });

  if (response.status === 404 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch post reaction stats.");
  }

  return (await response.json()) as PostReactionStats;
}
