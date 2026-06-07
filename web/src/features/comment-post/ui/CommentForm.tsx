"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Textarea } from "@/shared/ui";
import { useCreateCommentMutation } from "../model/use-create-comment-mutation";

type CommentFormProps = {
  postId: string;
  parentId?: string;
  compact?: boolean;
  canInteract: boolean;
  onRequireAuth?: () => void;
  onCreated?: () => void;
};

export function CommentForm({
  postId,
  parentId,
  compact,
  canInteract,
  onRequireAuth,
  onCreated,
}: CommentFormProps) {
  const [content, setContent] = useState("");
  const createCommentMutation = useCreateCommentMutation();
  const isDisabled = createCommentMutation.isPending || !content.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canInteract) {
      onRequireAuth?.();
      return;
    }

    const nextContent = content.trim();

    if (!nextContent) return;

    createCommentMutation.mutate(
      { postId, parentId, content: nextContent },
      {
        onSuccess: () => {
          setContent("");
          onCreated?.();
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex items-end gap-2", compact && "text-sm")}
    >
      <Textarea
        rows={compact ? 1 : 2}
        value={content}
        onFocus={() => {
          if (!canInteract) {
            onRequireAuth?.();
          }
        }}
        onChange={(event) => setContent(event.target.value)}
        placeholder={compact ? "Write a reply..." : "Write a comment..."}
        className="flex-1"
      />

      <button
        type="submit"
        disabled={isDisabled}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Send comment"
      >
        {createCommentMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </button>
    </form>
  );
}
