import { authApiFetch } from "@/entities/session/server";
import type { Post } from "@/entities/post";
import type { CreatePostInput } from "../model/create-post.schema";

export async function createPostApi(input: CreatePostInput): Promise<Post> {
  return authApiFetch<Post>("/posts", {
    method: "POST",
    body: toCreatePostFormData(input),
  });
}

function toCreatePostFormData(input: CreatePostInput) {
  const formData = new FormData();

  formData.set("content", input.content);
  formData.set("visibility", input.visibility);
  input.media.forEach((file) => formData.append("media", file, file.name));

  return formData;
}
