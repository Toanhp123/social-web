"use client";

import type { ReactNode } from "react";
import type { Post, ReactionType } from "../model/types";
import { cn } from "@/shared/lib/utils";
import { PostHeader } from "./PostHeader";
import { PostMediaGrid } from "./PostMediaGrid";
import { PostReactionControls } from "./PostReactionControls";
import { PostContent } from "./PostContent";
import { getReactionOption } from "../lib/post-reaction-options";

type PostCardProps = {
  post: Post;
  className?: string;
  metaLabel?: string;
  isReacting?: boolean;
  onReactionChange?: (type: ReactionType | null) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
  onMediaClick?: () => void;
  commentsSlot?: ReactNode;
};

export function PostCard({
  post,
  className,
  metaLabel,
  isReacting,
  onReactionChange,
  onCommentClick,
  onShareClick,
  onMediaClick,
  commentsSlot,
}: PostCardProps) {
  const currentReaction = post.currentReaction
    ? getReactionOption(post.currentReaction)
    : null;

  const authorInitial =
    post.author.fullName?.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <article
      className={cn(
        "rounded-card border-surface bg-surface shadow-card overflow-hidden border",
        className,
      )}
    >
      <div className="p-4 pb-3">
        <PostHeader
          post={post}
          authorInitial={authorInitial}
          metaLabel={metaLabel}
        />

        {post.content && <PostContent content={post.content} />}
      </div>

      <PostMediaGrid media={post.media} onMediaClick={onMediaClick} />

      <PostReactionControls
        post={post}
        currentReaction={currentReaction}
        isReacting={isReacting}
        onReactionChange={onReactionChange}
        onCommentClick={onCommentClick}
        onShareClick={onShareClick}
      />

      {commentsSlot}
    </article>
  );
}
