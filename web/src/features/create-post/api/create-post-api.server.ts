import { authApiFetch } from "@/entities/session/server";
import type { Post } from "@/entities/post";

export async function createPostApi(formData: FormData): Promise<Post> {
  return authApiFetch<Post>("/posts", {
    method: "POST",
    body: toCreatePostFormData(formData),
  });
}

function toCreatePostFormData(formData: FormData) {
  const normalizedFormData = new FormData();

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size > 0) {
        normalizedFormData.append(key, value, value.name);
      }

      continue;
    }

    normalizedFormData.append(key, value);
  }

  return normalizedFormData;
}
