"use client";

import { type ReactNode, type RefObject } from "react";
import { Loader2 } from "lucide-react";
import type { Comment } from "@/entities/comment";
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
  const shouldShowCollapseButton = depth === 0 && !isLoading;
  const shouldShowMoreRepliesButton = !isLoading && hasNextPage;
  const shouldShowControls =
    shouldShowCollapseButton || shouldShowMoreRepliesButton;

  return (
    <div className="space-y-3">
      {isLoading ? (
        <RepliesLoading />
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
        />
      )}
    </div>
  );
}

function RepliesLoading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted">
      <Loader2 className="size-4 animate-spin" />
      Đang tải phản hồi
    </div>
  );
}

type ReplyControlsProps = {
  showMoreButton: boolean;
  showCollapseButton: boolean;
  isFetchingNextPage: boolean;
  onLoadMore: () => void;
  onCollapse: () => void;
};

function ReplyControls({
  showMoreButton,
  showCollapseButton,
  isFetchingNextPage,
  onLoadMore,
  onCollapse,
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
          {isFetchingNextPage ? "Đang tải..." : "Xem thêm phản hồi"}
        </Button>
      )}

      {showCollapseButton && (
        <Button
          type="button"
          variant="link"
          fullWidth={false}
          onClick={onCollapse}
        >
          Ẩn phản hồi
        </Button>
      )}
    </div>
  );
}
