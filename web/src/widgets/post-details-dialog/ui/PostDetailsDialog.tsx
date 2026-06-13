"use client";

import type { ReactNode } from "react";
import type { Post, ReactionType } from "@/entities/post";
import { PostCard } from "@/entities/post";
import { useTranslations } from "@/shared/i18n";
import { Dialog } from "@/shared/ui";

type PostDetailsDialogProps = {
  open: boolean;
  post: Post | null;
  metaLabel?: string;
  isReacting?: boolean;
  commentsSlot?: ReactNode;
  commentFormSlot?: ReactNode;
  onClose: () => void;
  onReactionChange?: (type: ReactionType | null) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  menuSlot?: ReactNode;
};

export function PostDetailsDialog({
  open,
  post,
  metaLabel,
  isReacting,
  commentsSlot,
  commentFormSlot,
  onClose,
  onReactionChange,
  onCommentClick,
  onShareClick,
  menuSlot,
}: PostDetailsDialogProps) {
  const t = useTranslations().post;

  if (!post) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeLabel={t.closeDetails}
      contentClassName="max-w-2xl"
      bodyScrollable={false}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <PostCard
            post={post}
            metaLabel={metaLabel}
            isReacting={isReacting}
            onReactionChange={onReactionChange}
            onCommentClick={onCommentClick}
            onShareClick={onShareClick}
            menuSlot={menuSlot}
            commentsSlot={
              commentsSlot ? (
                <div className="border-t border-soft bg-surface px-4 py-3">
                  {commentsSlot}
                </div>
              ) : null
            }
            className="rounded-none border-0 shadow-none"
          />
        </div>

        {commentFormSlot && (
          <div className="shrink-0 border-t border-soft bg-surface px-4 py-3">
            {commentFormSlot}
          </div>
        )}
      </div>
    </Dialog>
  );
}

