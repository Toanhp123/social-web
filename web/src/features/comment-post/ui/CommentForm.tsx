"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { MentionTextarea } from "@/features/mention-users";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
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
  const t = useTranslations().comment;
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
      <MentionTextarea
        rows={compact ? 1 : 2}
        value={content}
        onValueChange={setContent}
        onFocus={() => {
          if (!canInteract) {
            onRequireAuth?.();
          }
        }}
        placeholder={compact ? t.writeReply : t.writeComment}
        wrapperClassName="flex-1"
      />

      <button
        type="submit"
        disabled={isDisabled}
        className="rounded-pill bg-brand text-inverse hover:bg-brand-hover grid size-10 shrink-0 place-items-center transition disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={t.send}
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
