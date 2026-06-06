import { authApiFetch } from "@/entities/session/server";
import type { Post, PostVisibility } from "@/entities/post";

type SharePostInput = {
  postId: string;
  content?: string;
  visibility?: PostVisibility;
};

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
