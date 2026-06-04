import { authApiFetch } from "@/entities/session/server";
import type { Post } from "@/entities/post";

export async function createPostApi(formData: FormData): Promise<Post> {
  return authApiFetch<Post>("/posts", {
    method: "POST",
    body: formData,
  });
}
