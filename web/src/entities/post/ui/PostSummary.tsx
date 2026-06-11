"use client";

import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import type { Post } from "../model/types";
import {
  REACTION_OPTIONS,
  type PostReactionOption,
} from "../lib/post-reaction-options";

type PostReactionSummaryProps = {
  post: Post;
  currentReaction: PostReactionOption | null;
};

export function PostSummary({
  post,
  currentReaction,
}: PostReactionSummaryProps) {
  const t = useTranslations().post;
  const totalReactionCount = post.reactionStats.totalReactionCount;
  const totalCommentCount = post.reactionStats.commentCount;
  const totalShareCount = post.reactionStats.shareCount;

  const visibleReactions = REACTION_OPTIONS.map((reaction) => ({
    ...reaction,
    count: post.reactionStats[reaction.countKey],
  }))
    .filter((reaction) => reaction.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="border-soft border-t px-4 py-3">
      <div className="text-muted flex min-h-5 items-center justify-between gap-3 text-xs">
        <div className="flex min-w-0 items-center gap-1.5">
          {totalReactionCount > 0 ? (
            <>
              <div
                className="flex -space-x-1"
                aria-label={`${totalReactionCount} reactions`}
              >
                {visibleReactions.map((reaction) => (
                  <span
                    key={reaction.type}
                    title={reaction.label}
                    className={cn(
                      "rounded-pill border-surface-border shadow-control grid size-5 place-items-center border text-[11px]",
                      reaction.className,
                    )}
                  >
                    <span aria-hidden>{reaction.emoji}</span>
                  </span>
                ))}
              </div>

              <span className="text-secondary truncate font-medium">
                {totalReactionCount}
              </span>
            </>
          ) : (
            <span>0 {t.like}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {currentReaction && <span>{currentReaction.emoji} You</span>}

          {totalCommentCount > 0 && (
            <span>
              {totalCommentCount} {t.comments}
            </span>
          )}

          {totalCommentCount > 0 && totalShareCount > 0 && <span>·</span>}

          {totalShareCount > 0 && (
            <span>
              {totalShareCount} {t.shares}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
