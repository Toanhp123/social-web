"use client";

import { SquarePen } from "lucide-react";
import { useCurrentSession } from "@/entities/session";
import { useTranslations } from "@/shared/i18n";
import { useRequireAuthRedirect } from "@/shared/lib/use-require-auth-redirect";
import { useCreatePostDialogController } from "../model/use-create-post-dialog-controller";
import { CreatePostDialog } from "./CreatePostDialog";

type CreatePostHeaderButtonProps = {
  className?: string;
};

export function CreatePostHeaderButton({
  className,
}: CreatePostHeaderButtonProps) {
  const t = useTranslations().createPost;
  const { currentUser } = useCurrentSession();
  const requireAuth = useRequireAuthRedirect();
  const createPostDialog = useCreatePostDialogController();

  function handleOpen() {
    if (!currentUser) {
      requireAuth();
      return;
    }

    createPostDialog.open();
  }

  return (
    <>
      <button
        type="button"
        aria-label={t.title}
        aria-haspopup="dialog"
        aria-expanded={createPostDialog.isOpen}
        onClick={handleOpen}
        className={className}
      >
        <SquarePen className="size-5" />
      </button>

      <CreatePostDialog
        open={createPostDialog.isOpen}
        formKey={createPostDialog.formKey}
        isSubmitting={createPostDialog.isSubmitting}
        errorMessage={createPostDialog.errorMessage}
        onClose={createPostDialog.close}
        onSubmit={createPostDialog.submit}
      />
    </>
  );
}
