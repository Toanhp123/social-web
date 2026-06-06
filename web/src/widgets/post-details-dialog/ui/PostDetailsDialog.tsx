"use client";

import type { ReactNode } from "react";
import type { Post, ReactionType } from "@/entities/post";
import { PostCard } from "@/entities/post";
import { Dialog } from "@/shared/ui";

type PostDetailsDialogProps = {
  open: boolean;
  post: Post | null;
  metaLabel?: string;
  isReacting?: boolean;
  commentsSlot?: ReactNode;
  onClose: () => void;
  onReactionChange?: (type: ReactionType | null) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
};

export function PostDetailsDialog({
  open,
  post,
  metaLabel,
  isReacting,
  commentsSlot,
  onClose,
  onReactionChange,
  onCommentClick,
  onShareClick,
}: PostDetailsDialogProps) {
  if (!post) {
    return null;
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      closeLabel="Đóng bài viết"
      contentClassName="max-w-2xl"
    >
      <PostCard
        post={post}
        metaLabel={metaLabel}
        isReacting={isReacting}
        onReactionChange={onReactionChange}
        onCommentClick={onCommentClick}
        onShareClick={onShareClick}
        commentsSlot={commentsSlot}
        className="rounded-none border-0 shadow-none"
      />
    </Dialog>
  );
}
