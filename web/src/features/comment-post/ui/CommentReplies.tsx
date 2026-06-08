"use client";

import { type ReactNode, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import type { Comment } from "@/entities/comment";
import { useTranslations } from "@/shared/i18n";
import { Button } from "@/shared/ui";
import { CommentReplyConnector } from "./CommentReplyConnector";

type CommentRepliesProps = {
  replies: Comment[];
  depth: number;
  repliesListRef: RefObject<HTMLDivElement | null>;
  shouldIndentReplies: boolean;
  firstReplyConnectorTop: string;
  replyConnectorX: string;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onCollapse: () => void;
  renderReply: (reply: Comment) => ReactNode;
};

export function CommentReplies({
  replies,
  depth,
  repliesListRef,
  shouldIndentReplies,
  firstReplyConnectorTop,
  replyConnectorX,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
  onCollapse,
  renderReply,
}: CommentRepliesProps) {
  const t = useTranslations().comment;
  const shouldShowCollapseButton = depth === 0 && !isLoading;
  const shouldShowMoreRepliesButton = !isLoading && hasNextPage;
  const shouldShowControls =
    shouldShowCollapseButton || shouldShowMoreRepliesButton;

  return (
    <div className="space-y-3">
      {isLoading ? (
        <RepliesLoading label={t.loadingReplies} />
      ) : (
        <div ref={repliesListRef} className="space-y-3">
          {replies.map((reply, index) => (
            <CommentReplyConnector
              key={reply.id}
              enabled={shouldIndentReplies}
              isFirst={index === 0}
              isLast={index === replies.length - 1}
              firstReplyConnectorTop={firstReplyConnectorTop}
              replyConnectorX={replyConnectorX}
            >
              {renderReply(reply)}
            </CommentReplyConnector>
          ))}
        </div>
      )}

      {shouldShowControls && (
        <ReplyControls
          showMoreButton={Boolean(shouldShowMoreRepliesButton)}
          showCollapseButton={shouldShowCollapseButton}
          isFetchingNextPage={isFetchingNextPage}
          onLoadMore={onLoadMore}
          onCollapse={onCollapse}
          loadMoreLabel={t.loadMoreReplies}
          loadingLabel={t.loadingReplies}
          collapseLabel={t.collapseReplies}
        />
      )}
    </div>
  );
}

function RepliesLoading({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Loader2 className="size-4 animate-spin" />
      {label}
    </div>
  );
}

type ReplyControlsProps = {
  showMoreButton: boolean;
  showCollapseButton: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onCollapse: () => void;
  loadMoreLabel: string;
  loadingLabel: string;
  collapseLabel: string;
};

function ReplyControls({
  showMoreButton,
  showCollapseButton,
  isFetchingNextPage,
  onLoadMore,
  onCollapse,
  loadMoreLabel,
  loadingLabel,
  collapseLabel,
}: ReplyControlsProps) {
  return (
    <div className="flex items-center gap-3">
      {showMoreButton && (
        <Button
          type="button"
          variant="link"
          fullWidth={false}
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
          className="inline-flex items-center gap-2"
        >
          {isFetchingNextPage && <Loader2 className="size-4 animate-spin" />}
          {isFetchingNextPage ? loadingLabel : loadMoreLabel}
        </Button>
      )}

      {showCollapseButton && (
        <Button
          type="button"
          variant="link"
          fullWidth={false}
          onClick={onCollapse}
        >
          {collapseLabel}
        </Button>
      )}
    </div>
  );
}

