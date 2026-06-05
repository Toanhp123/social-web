"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postQueryKeys, type Post } from "@/entities/post";
import { createPostAction } from "./create-post.action";

type UseCreatePostMutationOptions = {
  onCreated?: (post: Post) => void;
};

export function useCreatePostMutation(options?: UseCreatePostMutationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData: FormData) => {
      const result = await createPostAction(formData);

      if (!result.ok) {
        throw new Error(result.error);
      }

      return result.post;
    },
    onSuccess: (post) => {
      options?.onCreated?.(post);
      void queryClient.invalidateQueries({ queryKey: postQueryKeys.feed() });
    },
  });
}
