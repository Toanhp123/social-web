import type { CreatePostInput } from "../model/create-post.schema";

export function createPostInputToFormData(input: CreatePostInput) {
  const formData = new FormData();

  formData.set("content", input.content);
  formData.set("visibility", input.visibility);
  if (input.groupId) {
    formData.set("groupId", input.groupId);
  }
  input.media.forEach((file) => formData.append("media", file, file.name));

  return formData;
}
