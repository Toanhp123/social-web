"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import type { Post } from "@/entities/post";
import { useCreatePostMutation } from "./use-create-post-mutation";

type UseCreatePostDialogControllerOptions = {
  onCreated?: (post: Post) => void;
};

export function useCreatePostDialogController(
  options?: UseCreatePostDialogControllerOptions,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const createPostMutation = useCreatePostMutation({
    onCreated: (post) => {
      options?.onCreated?.(post);
      resetForm();
      setIsOpen(false);
    },
  });

  const errorMessage =
    createPostMutation.error instanceof Error
      ? createPostMutation.error.message
      : "";

  function resetForm() {
    setFormKey((key) => key + 1);
  }

  function open() {
    setIsOpen(true);
  }

  function close() {
    if (createPostMutation.isPending) {
      return;
    }

    setIsOpen(false);
    resetForm();
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    createPostMutation.mutate(new FormData(event.currentTarget));
  }

  return {
    isOpen,
    formKey,
    isSubmitting: createPostMutation.isPending,
    errorMessage,
    open,
    close,
    submit,
  };
}
