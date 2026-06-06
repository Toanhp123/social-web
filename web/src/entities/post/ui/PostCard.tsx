"use client";

import type { ReactNode } from "react";
import type { Post, ReactionType } from "../model/types";
import { PostHeader } from "./PostHeader";
import { PostMediaGrid } from "./PostMediaGrid";
import { PostReactionControls } from "./PostReactionControls";
import { getReactionOption } from "./post-reaction-options";

type PostCardProps = {
  post: Post;
  className?: string;
  metaLabel?: string;
  isReacting?: boolean;
  onReactionChange?: (type: ReactionType | null) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
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
  commentsSlot,
}: PostCardProps) {
  const currentReaction = post.currentReaction
    ? getReactionOption(post.currentReaction)
    : null;
  const authorInitial =
    post.author.fullName?.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border border-white bg-white shadow-sm shadow-zinc-200/70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="p-4 pb-3">
        <PostHeader
          post={post}
          authorInitial={authorInitial}
          metaLabel={metaLabel}
        />

        {post.content && (
          <p className="mt-4 text-sm leading-6 whitespace-pre-wrap text-zinc-800">
            {post.content}
          </p>
        )}
      </div>

      <PostMediaGrid media={post.media} />

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
