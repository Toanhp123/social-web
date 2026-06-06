"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { PostCard, type Post } from "@/entities/post";
import { useCreatePostMutation } from "../model/use-create-post-mutation";
import { CreatePostTrigger } from "./CreatePostTrigger";
import { CreatePostDialog } from "./CreatePostDialog";

export function CreatePostComposer() {
  const [isOpen, setIsOpen] = useState(false);
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const [formKey, setFormKey] = useState(0);

  const createPostMutation = useCreatePostMutation({
    onCreated: (post) => {
      setCreatedPost(post);
      setFormKey((key) => key + 1);
      setIsOpen(false);
    },
  });

  const errorMessage =
    createPostMutation.error instanceof Error
      ? createPostMutation.error.message
      : "";

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    if (createPostMutation.isPending) {
      return;
    }

    setIsOpen(false);
    setFormKey((key) => key + 1);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCreatedPost(null);
    createPostMutation.mutate(new FormData(event.currentTarget));
  }

  return (
    <>
      <CreatePostTrigger isOpen={isOpen} onOpen={handleOpen} />

      {createdPost && (
        <PostCard post={createdPost} className="mt-4" metaLabel="Vua dang" />
      )}

      <CreatePostDialog
        open={isOpen}
        formKey={formKey}
        isSubmitting={createPostMutation.isPending}
        errorMessage={errorMessage}
        onClose={handleClose}
        onSubmit={handleSubmit}
      />
    </>
  );
}
