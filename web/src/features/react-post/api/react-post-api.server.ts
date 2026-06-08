import { authApiFetch } from "@/entities/session/server";
import type { Post } from "@/entities/post";
import type { SetPostReactionInput } from "../model/react-post.schema";

export async function setPostReactionApi(
  input: SetPostReactionInput,
): Promise<Post> {
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
