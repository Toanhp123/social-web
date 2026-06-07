"use client";

import { useMemo, useRef, useState } from "react";
import { CommentItem, type Comment } from "@/entities/comment";
import { Button } from "@/shared/ui";
import { usePostCommentsQuery } from "../model/use-post-comments-query";
import { CommentForm } from "./CommentForm";
import { CommentReplies } from "./CommentReplies";
import { useFirstReplyConnectorPosition } from "../lib/use-first-reply-connector-position";

const MAX_COMMENT_VISUAL_DEPTH = 3;

type CommentThreadProps = {
  comment: Comment;
  canInteract: boolean;
  onRequireAuth?: () => void;
  depth?: number;
};

export function CommentThread({
  comment,
  canInteract,
  onRequireAuth,
  depth = 0,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const commentItemRef = useRef<HTMLDivElement | null>(null);
  const repliesListRef = useRef<HTMLDivElement | null>(null);

  const shouldIndentReplies = depth < MAX_COMMENT_VISUAL_DEPTH;
  const isFlattenedDepth = depth >= MAX_COMMENT_VISUAL_DEPTH;
  const nextDepth = depth + 1;

  const repliesQuery = usePostCommentsQuery({
    postId: comment.postId,
    parentId: comment.id,
    enabled: showReplies,
  });

  const replies = useMemo(
    () => repliesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [repliesQuery.data],
  );

  const hasReplies = comment.replyCount > 0 || replies.length > 0;
  const replyCountLabel = replies.length || comment.replyCount;

  const firstReplyConnectorPosition = useFirstReplyConnectorPosition({
    enabled: showReplies && !repliesQuery.isLoading && replies.length > 0,
    commentItemRef,
    repliesListRef,
  });

  const handleReplyClick = () => {
    if (!canInteract) {
      onRequireAuth?.();
      return;
    }

    setIsReplying((value) => !value);
  };

  return (
    <div className="relative space-y-3">
      <div ref={commentItemRef}>
        <CommentItem
          comment={comment}
          metaLabel={formatCommentDate(comment.createdAt)}
          onReplyClick={handleReplyClick}
        />
      </div>

      <div
        className={["space-y-3", shouldIndentReplies ? "ml-11" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {isReplying && (
          <ReplyComposer
            comment={comment}
            canInteract={canInteract}
            onRequireAuth={onRequireAuth}
            showReplyTarget={isFlattenedDepth}
            onCreated={() => {
              setIsReplying(false);
              setShowReplies(true);
            }}
          />
        )}

        {hasReplies && !showReplies && (
          <Button
            type="button"
            variant="link"
            fullWidth={false}
            onClick={() => setShowReplies(true)}
          >
            Xem {replyCountLabel} phản hồi
          </Button>
        )}

        {showReplies && (
          <CommentReplies
            replies={replies}
            depth={depth}
            repliesListRef={repliesListRef}
            shouldIndentReplies={shouldIndentReplies}
            firstReplyConnectorTop={firstReplyConnectorPosition.top}
            replyConnectorX={firstReplyConnectorPosition.x}
            isLoading={repliesQuery.isLoading}
            hasNextPage={repliesQuery.hasNextPage}
            isFetchingNextPage={repliesQuery.isFetchingNextPage}
            onLoadMore={() => void repliesQuery.fetchNextPage()}
            onCollapse={() => setShowReplies(false)}
            renderReply={(reply) => (
              <CommentThread
                comment={reply}
                canInteract={canInteract}
                onRequireAuth={onRequireAuth}
                depth={nextDepth}
              />
            )}
          />
        )}
      </div>
    </div>
  );
}

type ReplyComposerProps = {
  comment: Comment;
  canInteract: boolean;
  showReplyTarget: boolean;
  onRequireAuth?: () => void;
  onCreated: () => void;
};

function ReplyComposer({
  comment,
  canInteract,
  showReplyTarget,
  onRequireAuth,
  onCreated,
}: ReplyComposerProps) {
  return (
    <div className="space-y-2">
      {showReplyTarget && (
        <p className="text-xs text-zinc-500">
          Đang trả lời{" "}
          <span className="font-medium text-zinc-700">
            {comment.author.fullName}
          </span>
        </p>
      )}

      <CommentForm
        postId={comment.postId}
        parentId={comment.id}
        compact
        canInteract={canInteract}
        onRequireAuth={onRequireAuth}
        onCreated={onCreated}
      />
    </div>
  );
}

function formatCommentDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
