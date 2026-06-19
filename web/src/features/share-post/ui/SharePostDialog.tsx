"use client";

import type { FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import type { Post } from "@/entities/post";
import { useTranslations } from "@/shared/i18n";
import { Button, Dialog, Textarea } from "@/shared/ui";
import { useSharePostMutation } from "../model/use-share-post-mutation";

type SharePostDialogProps = {
  post: Post;
  open: boolean;
  onClose: () => void;
};

export function SharePostDialog({ post, open, onClose }: SharePostDialogProps) {
  const t = useTranslations().sharePost;
  const sharePostMutation = useSharePostMutation();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const content = String(formData.get("content") ?? "").trim();

    sharePostMutation.mutate(
      { postId: post.id, content },
      {
        onSuccess: onClose,
      },
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeLabel={t.title}
      contentClassName="!max-w-lg !overflow-hidden"
    >
      <div className="border-soft border-b px-4 py-3 pr-14">
        <h2 id="share-post-title" className="text-primary font-semibold">
          {t.title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <Textarea
          name="content"
          rows={4}
          maxLength={5000}
          placeholder={t.placeholder}
          size="lg"
        />

        <div className="rounded-control border-soft bg-surface-soft mt-3 border p-3">
          <p className="text-primary text-sm font-semibold">
            {post.author.fullName}
          </p>
          <p className="text-secondary mt-1 line-clamp-3 text-sm leading-5 whitespace-pre-wrap">
            {post.content || "Media post"}
          </p>
        </div>

        {sharePostMutation.error instanceof Error && (
          <p className="text-danger mt-3 text-sm">
            {sharePostMutation.error.message}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            fullWidth={false}
            onClick={onClose}
          >
            {t.cancel}
          </Button>

          <Button
            type="submit"
            size="sm"
            fullWidth={false}
            disabled={sharePostMutation.isPending}
            className="inline-flex items-center gap-2"
          >
            {sharePostMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {sharePostMutation.isPending ? t.sharing : t.submit}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
