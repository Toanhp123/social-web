"use client";

import type { FormEvent } from "react";
import { SendHorizontal } from "lucide-react";
import { Button, Combobox, Dialog, MediaPicker, Textarea } from "@/shared/ui";
import { VISIBILITY_OPTIONS } from "./VisibilityOptions";

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
  const handleClose = () => {
    if (isSubmitting) return;

    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      closeLabel="Đóng"
      className="z-9999 bg-zinc-950/60 backdrop-blur-sm"
      contentClassName="max-w-xl rounded-3xl"
      bodyClassName="p-0"
    >
      <header className="border-b border-zinc-100 px-5 py-4">
        <h2
          id="create-post-title"
          className="text-center text-lg font-semibold text-zinc-950"
        >
          Tạo bài viết
        </h2>
      </header>

      <form key={formKey} onSubmit={onSubmit} className="p-5">
        <div className="flex items-center gap-3">
          <div className="grid size-11 shrink-0 place-items-center rounded-full bg-linear-to-br from-blue-600 to-emerald-500 text-sm font-semibold text-white">
            SW
          </div>

          <div className="min-w-0">
            <p className="truncate font-semibold text-zinc-950">Social Web</p>

            <Combobox
              name="visibility"
              defaultValue="PUBLIC"
              size="xs"
              variant="compact"
              options={VISIBILITY_OPTIONS}
              className="mt-1"
            />
          </div>
        </div>

        <Textarea
          name="content"
          rows={5}
          maxLength={5000}
          autoFocus
          placeholder="Bạn đang nghĩ gì?"
          variant="composer"
          className="mt-4 min-h-36"
        />

        <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50/40 p-3">
          <MediaPicker name="media" label="Thêm ảnh/video" maxFiles={10} />
        </div>

        {errorMessage && (
          <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {errorMessage}
          </p>
        )}

        <div className="mt-5 border-t border-zinc-100 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            fullWidth
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full"
          >
            <SendHorizontal className="size-4" />
            {isSubmitting ? "Đang đăng..." : "Đăng bài"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
