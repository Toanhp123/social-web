import { NextResponse } from "next/server";
import { optionalAuthApiFetch } from "@/entities/session/server";
import type { PostReactionStats } from "@/entities/post";

export async function handlePostReactionStatsRequest(
  _request: Request,
  context: { params: Promise<{ postId: string }> },
) {
  const { postId } = await context.params;

  if (!postId) {
    return NextResponse.json(
      { message: "Post id is required." },
      { status: 400 },
    );
  }

  const stats = await optionalAuthApiFetch<PostReactionStats>(
    `/posts/${postId}/reaction-stats`,
  );

  return NextResponse.json(stats);
}
