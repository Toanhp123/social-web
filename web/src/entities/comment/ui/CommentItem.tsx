"use client";

import Link from "next/link";
import { useState } from "react";
import { LinkedMentionText } from "@/entities/mention";
import { getProfileRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";
import { Avatar } from "@/shared/ui/Avatar";
import type { Comment } from "../model/types";

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
  const t = useTranslations().comment;
  const [isExpanded, setIsExpanded] = useState(false);

  const lineCount = comment.content.split(/\r\n|\r|\n/).length;
  const shouldCollapse =
    comment.content.length > COMMENT_PREVIEW_LENGTH ||
    lineCount > COMMENT_PREVIEW_LINES;

  return (
    <article className="flex min-w-0 gap-3">
      <span data-comment-avatar className="block size-8 shrink-0">
        <Avatar
          src={comment.author.avatarUrl}
          alt={`${comment.author.fullName} avatar`}
          name={comment.author.fullName}
          size={32}
          className="text-xs"
        />
      </span>

      <div className="min-w-0 flex-1">
        <div className="rounded-card bg-surface-muted inline-block max-w-full px-3 py-2">
          <Link
            href={getProfileRoute(comment.author.id)}
            className="text-primary hover:text-brand block truncate text-sm font-semibold transition"
          >
            {comment.author.fullName}
          </Link>

          <p
            className={cn(
              "text-secondary mt-1 max-w-full text-sm leading-5 wrap-break-word whitespace-pre-wrap",
              shouldCollapse &&
                !isExpanded &&
                "[display:-webkit-box] overflow-hidden [-webkit-box-orient:vertical] [-webkit-line-clamp:3]",
            )}
          >
            {replyToAuthor && (
              <Link
                href={getProfileRoute(replyToAuthor.id)}
                className="text-brand hover:text-brand-hover mr-1 font-semibold transition"
              >
                @{replyToAuthor.fullName}
              </Link>
            )}

            <LinkedMentionText>{comment.content}</LinkedMentionText>
          </p>

          {shouldCollapse && (
            <Button
              type="button"
              variant="link"
              fullWidth={false}
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              className="text-muted hover:text-brand mt-1 text-xs font-semibold"
            >
              {isExpanded ? t.hide : t.showMore}
            </Button>
          )}
        </div>

        <div className="text-muted mt-1 flex items-center gap-3 px-2 text-xs font-medium">
          {metaLabel && <span>{metaLabel}</span>}

          {onReplyClick && (
            <Button
              type="button"
              variant="link"
              fullWidth={false}
              onClick={() => onReplyClick(comment)}
              className="text-muted hover:text-brand text-xs font-semibold"
            >
              {t.reply}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
