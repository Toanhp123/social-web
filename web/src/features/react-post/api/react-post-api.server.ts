import { authApiFetch } from "@/entities/session/server";
import type { Post, ReactionType } from "@/entities/post";

export async function setPostReactionApi(input: {
  postId: string;
  type: ReactionType;
}): Promise<Post> {
  return authApiFetch<Post>(`/posts/${input.postId}/reactions`, {
    method: "PUT",
    body: JSON.stringify({ type: input.type }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function removePostReactionApi(postId: string): Promise<Post> {
  return authApiFetch<Post>(`/posts/${postId}/reactions`, {
    method: "DELETE",
  });
}
