"use client";

import { useMutation } from "@tanstack/react-query";
import type { Post } from "@/entities/post";
import { createPostAction } from "./create-post.action";

type UseCreatePostMutationOptions = {
  onCreated?: (post: Post) => void;
};

export function useCreatePostMutation(options?: UseCreatePostMutationOptions) {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createPostAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.post;
    },
    onSuccess: (post) => options?.onCreated?.(post),
  });
}
