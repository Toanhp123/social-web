"use client";

import type { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { MentionTextarea } from "@/features/mention-users";
import { useTranslations } from "@/shared/i18n";
import { Button, Combobox, Dialog, MediaPicker } from "@/shared/ui";
import { useVisibilityOptions } from "./VisibilityOptions";

type CreatePostDialogProps = {
  open: boolean;
  formKey: number;
  isSubmitting: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function CreatePostDialog({
  open,
  formKey,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: CreatePostDialogProps) {
  const t = useTranslations().createPost;
  const visibilityOptions = useVisibilityOptions();

  const handleClose = () => {
    if (isSubmitting) return;

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      closeLabel={t.close}
      className="bg-overlay z-9999 backdrop-blur-sm"
      contentClassName="max-w-xl rounded-panel"
      bodyClassName="p-0"
    >
      <header className="border-soft border-b px-5 py-4">
        <h2
          id="create-post-title"
          className="text-primary text-center text-lg font-semibold"
        >
          {t.title}
        </h2>
      </header>

      <form key={formKey} onSubmit={onSubmit} className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-pill bg-brand-gradient text-inverse grid size-11 shrink-0 place-items-center text-sm font-semibold">
            SW
          </div>

          <div className="min-w-0">
            <p className="text-primary truncate font-semibold">Social Web</p>

            <Combobox
              name="visibility"
              defaultValue="PUBLIC"
              size="xs"
              variant="compact"
              options={visibilityOptions}
              className="mt-1"
            />
          </div>
        </div>

        <MentionTextarea
          name="content"
          rows={5}
          maxLength={5000}
          autoFocus
          placeholder={t.placeholder}
          variant="composer"
          className="mt-4 min-h-36"
        />

        <div className="rounded-card border-subtle bg-surface-soft mt-4 border p-3">
          <MediaPicker name="media" label={t.addMedia} maxFiles={10} />
        </div>

        {errorMessage && (
          <p className="rounded-card bg-danger-soft text-danger mt-4 px-4 py-3 text-sm font-medium">
            {errorMessage}
          </p>
        )}

        <div className="border-soft mt-5 border-t pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            fullWidth
            className="rounded-pill inline-flex h-11 items-center justify-center gap-2"
          >
            <SendHorizontal className="size-4" />
            {isSubmitting ? t.posting : t.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
