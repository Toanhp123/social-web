"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/shared/ui";
import type { Comment } from "../model/types";
import { cn } from "@/shared/lib/utils";

type CommentItemProps = {
  comment: Comment;
  metaLabel?: string;
  replyToAuthor?: Comment["author"] | null;
  onReplyClick?: (comment: Comment) => void;
};

const COMMENT_PREVIEW_LENGTH = 220;
const COMMENT_PREVIEW_LINES = 3;

export function CommentItem({
  comment,
  metaLabel,
  replyToAuthor,
  onReplyClick,
}: CommentItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const authorInitial =
    comment.author.fullName.trim().slice(0, 1).toUpperCase() || "?";

  const lineCount = comment.content.split(/\r\n|\r|\n/).length;
  const shouldCollapse =
    comment.content.length > COMMENT_PREVIEW_LENGTH ||
    lineCount > COMMENT_PREVIEW_LINES;

  return (
    <article className="flex min-w-0 gap-3">
      {comment.author.avatarUrl ? (
        <Image
          data-comment-avatar
          src={comment.author.avatarUrl}
          alt=""
          width={32}
          height={32}
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div
          data-comment-avatar
          className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600"
        >
          {authorInitial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-zinc-100 px-3 py-2">
          <p className="truncate text-sm font-semibold text-zinc-950">
            {comment.author.fullName}
          </p>

          <p
            className={cn(
              "mt-1 max-w-full text-sm leading-5 wrap-break-word whitespace-pre-wrap text-zinc-800",
              shouldCollapse &&
                !isExpanded &&
                "[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:3]",
            )}
          >
            {replyToAuthor && (
              <span className="mr-1 font-semibold text-blue-600">
                @{replyToAuthor.fullName}
              </span>
            )}

            <span>{comment.content}</span>
          </p>

          {shouldCollapse && (
            <Button
              type="button"
              variant="link"
              fullWidth={false}
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              className="mt-1 text-xs font-semibold text-zinc-500 hover:text-blue-600"
            >
              {isExpanded ? "Ẩn bớt" : "Xem thêm"}
            </Button>
          )}
        </div>

        <div className="mt-1 flex items-center gap-3 px-2 text-xs font-medium text-zinc-500">
          {metaLabel && <span>{metaLabel}</span>}

          {onReplyClick && (
            <Button
              type="button"
              variant="link"
              fullWidth={false}
              onClick={() => onReplyClick(comment)}
              className="text-xs font-semibold text-zinc-500 hover:text-blue-600"
            >
              Trả lời
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
