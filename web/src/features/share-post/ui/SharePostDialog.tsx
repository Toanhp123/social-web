"use client";

import type { FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import type { Post } from "@/entities/post";
import { useTranslations } from "@/shared/i18n";
import { Dialog } from "@/shared/ui";
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
      <div className="border-b border-soft px-4 py-3 pr-14">
        <h2 id="share-post-title" className="font-semibold text-primary">
          {t.title}
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="p-4">
        <textarea
          name="content"
          rows={4}
          maxLength={5000}
          placeholder={t.placeholder}
          className="w-full resize-none rounded-card border border-subtle bg-surface-soft px-3 py-3 text-sm text-primary outline-none focus:border-brand focus:bg-surface"
        />

        <div className="mt-3 rounded-control border border-soft bg-surface-soft p-3">
          <p className="text-sm font-semibold text-primary">
            {post.author.fullName}
          </p>
          <p className="mt-1 line-clamp-3 text-sm leading-5 whitespace-pre-wrap text-secondary">
            {post.content || "Media post"}
          </p>
        </div>

        {sharePostMutation.error instanceof Error && (
          <p className="mt-3 text-sm text-danger">
            {sharePostMutation.error.message}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-control px-4 py-2 text-sm font-medium text-secondary hover:bg-surface-muted"
          >
            {t.cancel}
          </button>

          <button
            type="submit"
            disabled={sharePostMutation.isPending}
            className="inline-flex items-center gap-2 rounded-control bg-brand px-4 py-2 text-sm font-medium text-inverse hover:bg-brand-hover disabled:opacity-60"
          >
            {sharePostMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            {sharePostMutation.isPending ? t.sharing : t.submit}
          </button>
        </div>
      </form>
    </Dialog>
  );
}

