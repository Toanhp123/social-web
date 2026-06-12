import { authApiFetch } from "@/entities/session/server";
import type { Comment } from "@/entities/comment";
import type { CreatePostCommentInput } from "../model/comment-post.schema";

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
