"use client";

import type { FormEvent } from "react";
import { Loader2, Send, X } from "lucide-react";
import type { Post } from "@/entities/post";
import { useSharePostMutation } from "../model/use-share-post-mutation";

type SharePostDialogProps = {
  post: Post;
  open: boolean;
  onClose: () => void;
};

export function SharePostDialog({ post, open, onClose }: SharePostDialogProps) {
  const sharePostMutation = useSharePostMutation();

  if (!open) {
    return null;
  }

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-post-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
          <h2 id="share-post-title" className="font-semibold text-zinc-950">
            Share post
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-zinc-500 hover:bg-zinc-100"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <textarea
            name="content"
            rows={4}
            maxLength={5000}
            placeholder="Say something about this..."
            className="w-full resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm text-zinc-900 outline-none focus:border-blue-300 focus:bg-white"
          />

          <div className="mt-3 rounded-xl border border-zinc-100 bg-zinc-50 p-3">
            <p className="text-sm font-semibold text-zinc-950">
              {post.author.fullName}
            </p>
            <p className="mt-1 line-clamp-3 text-sm leading-5 whitespace-pre-wrap text-zinc-600">
              {post.content || "Media post"}
            </p>
          </div>

          {sharePostMutation.error instanceof Error && (
            <p className="mt-3 text-sm text-red-600">
              {sharePostMutation.error.message}
            </p>
          )}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sharePostMutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {sharePostMutation.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Share
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
