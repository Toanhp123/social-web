"use client";

import { useState } from "react";
import { PostCard, type Post } from "@/entities/post";
import { useTranslations } from "@/shared/i18n";
import { useCreatePostDialogController } from "../model/use-create-post-dialog-controller";
import { CreatePostTrigger } from "./CreatePostTrigger";
import { CreatePostDialog } from "./CreatePostDialog";

type CreatePostComposerProps = {
  groupId?: string;
};

export function CreatePostComposer({ groupId }: CreatePostComposerProps) {
  const t = useTranslations().createPost;
  const [createdPost, setCreatedPost] = useState<Post | null>(null);
  const createPostDialog = useCreatePostDialogController({
    onCreated: (post) => {
      setCreatedPost(post);
    },
  });

  function handleOpen() {
    setCreatedPost(null);
    createPostDialog.open();
  }

  return (
    <>
      <CreatePostTrigger
        isOpen={createPostDialog.isOpen}
        onOpen={handleOpen}
      />

      {createdPost && (
        <PostCard post={createdPost} className="mt-4" metaLabel={t.justPosted} />
      )}

      <CreatePostDialog
        open={createPostDialog.isOpen}
        formKey={createPostDialog.formKey}
        groupId={groupId}
        isSubmitting={createPostDialog.isSubmitting}
        errorMessage={createPostDialog.errorMessage}
        onClose={createPostDialog.close}
        onSubmit={createPostDialog.submit}
      />
    </>
  );
}
