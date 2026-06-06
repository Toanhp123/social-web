"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import type { Post, ReactionType } from "../model/types";
import type { PostReactionOption } from "./post-reaction-options";
import { PostAction } from "./PostAction";
import { PostReactionSummary } from "./PostReactionSummary";
import { ReactionPicker } from "./ReactionPicker";

const REACTION_PICKER_OPEN_DELAY_MS = 1000;

type PostReactionControlsProps = {
  post: Post;
  currentReaction: PostReactionOption | null;
  isReacting?: boolean;
  onReactionChange?: (type: ReactionType | null) => void;
  onCommentClick?: () => void;
  onShareClick?: () => void;
};

export function PostReactionControls({
  post,
  currentReaction,
  isReacting,
  onReactionChange,
  onCommentClick,
  onShareClick,
}: PostReactionControlsProps) {
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearOpenTimer = () => {
    if (openTimerRef.current) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
  };

  const openReactionPickerWithDelay = () => {
    if (!onReactionChange || isReacting) return;

    clearOpenTimer();

    openTimerRef.current = setTimeout(() => {
      setIsReactionPickerOpen(true);
    }, REACTION_PICKER_OPEN_DELAY_MS);
  };

  const closeReactionPicker = () => {
    clearOpenTimer();
    setIsReactionPickerOpen(false);
  };

  const handleLikeClick = () => {
    if (!onReactionChange || isReacting) return;

    closeReactionPicker();
    onReactionChange(post.currentReaction ? null : "LIKE");
  };

  const handleReactionChange = (type: ReactionType | null) => {
    if (!onReactionChange || isReacting) return;

    closeReactionPicker();
    onReactionChange(type);
  };

  useEffect(() => {
    return () => {
      clearOpenTimer();
    };
  }, []);

  return (
    <>
      <PostReactionSummary post={post} currentReaction={currentReaction} />

      <div className="flex items-center justify-between border-t border-zinc-100 px-2 py-2">
        <div
          className="relative flex-1"
          onMouseEnter={openReactionPickerWithDelay}
          onMouseLeave={closeReactionPicker}
          onFocus={() => {
            if (onReactionChange && !isReacting) {
              setIsReactionPickerOpen(true);
            }
          }}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              closeReactionPicker();
            }
          }}
        >
          {onReactionChange && isReactionPickerOpen && (
            <ReactionPicker
              currentReaction={post.currentReaction}
              reactionStats={post.reactionStats}
              isReacting={isReacting}
              onSelectReaction={handleReactionChange}
            />
          )}

          <PostAction
            icon={<Heart className="size-4" />}
            label={currentReaction ? currentReaction.label : "Like"}
            active={Boolean(currentReaction)}
            disabled={isReacting}
            onClick={handleLikeClick}
          />
        </div>

        <PostAction
          icon={<MessageCircle className="size-4" />}
          label={
            post.reactionStats.commentCount > 0
              ? String(post.reactionStats.commentCount)
              : "Comment"
          }
          onClick={onCommentClick}
        />

        <PostAction
          icon={<Send className="size-4" />}
          label={
            post.reactionStats.shareCount > 0
              ? String(post.reactionStats.shareCount)
              : "Share"
          }
          onClick={onShareClick}
        />
      </div>
    </>
  );
}
