import { authApiFetch } from "@/entities/session/server";
import type { Post } from "@/entities/post";
import type { SharePostInput } from "../model/share-post.schema";

export async function sharePostApi({
  postId,
  content,
  visibility,
}: SharePostInput): Promise<Post> {
  return authApiFetch<Post>(`/posts/${postId}/shares`, {
    method: "POST",
    body: JSON.stringify({ content, visibility }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}
