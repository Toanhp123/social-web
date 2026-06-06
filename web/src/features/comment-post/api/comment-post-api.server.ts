import { authApiFetch, optionalAuthApiFetch } from "@/entities/session/server";
import type { Comment, CommentPage } from "@/entities/comment";

type ListPostCommentsInput = {
  postId: string;
  parentId?: string | null;
  cursor?: string | null;
  limit?: number;
};

type CreatePostCommentInput = {
  postId: string;
  parentId?: string;
  content: string;
};

export async function listPostCommentsApi({
  postId,
  parentId,
  cursor,
  limit = 20,
}: ListPostCommentsInput): Promise<CommentPage> {
  const searchParams = new URLSearchParams({ limit: String(limit) });

  if (parentId) {
    searchParams.set("parentId", parentId);
  }

  if (cursor) {
    searchParams.set("cursor", cursor);
  }

  return optionalAuthApiFetch<CommentPage>(
    `/posts/${postId}/comments?${searchParams.toString()}`,
  );
}

export async function createPostCommentApi({
  postId,
  parentId,
  content,
}: CreatePostCommentInput): Promise<Comment> {
  const endpoint = parentId
    ? `/posts/${postId}/comments/${parentId}/replies`
    : `/posts/${postId}/comments`;

  return authApiFetch<Comment>(endpoint, {
    method: "POST",
    body: JSON.stringify({ content }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
