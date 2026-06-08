import { authApiFetch } from "@/entities/session/server";
import type { Post } from "@/entities/post";
import type { CreatePostInput } from "../model/create-post.schema";
import { createPostInputToFormData } from "./create-post-form-data.mapper";

export async function createPostApi(input: CreatePostInput): Promise<Post> {
  return authApiFetch<Post>("/posts", {
    method: "POST",
    body: createPostInputToFormData(input),
  });
}
