"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { CommentItem, type Comment } from "@/entities/comment";
import { Button } from "@/shared/ui";
import { usePostCommentsQuery } from "../model/use-post-comments-query";
import { CommentForm } from "./CommentForm";

type CommentThreadProps = {
  comment: Comment;
  canInteract: boolean;
  onRequireAuth?: () => void;
};

export function CommentThread({
  comment,
  canInteract,
  onRequireAuth,
}: CommentThreadProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const repliesQuery = usePostCommentsQuery({
    postId: comment.postId,
    parentId: comment.id,
    enabled: showReplies,
  });

  const replies = useMemo(
    () => repliesQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [repliesQuery.data],
  );

  return (
    <div className="space-y-3">
      <CommentItem
        comment={comment}
        metaLabel={formatCommentDate(comment.createdAt)}
        onReplyClick={() => {
          if (!canInteract) {
            onRequireAuth?.();
            return;
          }

          setIsReplying((value) => !value);
        }}
      />

      <div className="ml-11 space-y-3">
        {isReplying && (
          <CommentForm
            postId={comment.postId}
            parentId={comment.id}
            compact
            canInteract={canInteract}
            onRequireAuth={onRequireAuth}
            onCreated={() => {
              setIsReplying(false);
              setShowReplies(true);
            }}
          />
        )}

        {comment.replyCount > 0 && !showReplies && (
          <Button
            type="button"
            variant="link"
            fullWidth={false}
            onClick={() => setShowReplies(true)}
          >
            Xem {comment.replyCount} phản hồi
          </Button>
        )}

        {showReplies && (
          <div className="space-y-3">
            {repliesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="size-4 animate-spin" />
                Đang tải phản hồi
              </div>
            ) : (
              replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  metaLabel={formatCommentDate(reply.createdAt)}
                />
              ))
            )}

            {repliesQuery.hasNextPage && (
              <Button
                type="button"
                variant="link"
                fullWidth={false}
                disabled={repliesQuery.isFetchingNextPage}
                onClick={() => void repliesQuery.fetchNextPage()}
                className="mt-1 inline-flex items-center gap-2"
              >
                {repliesQuery.isFetchingNextPage && (
                  <Loader2 className="size-4 animate-spin" />
                )}

                {repliesQuery.isFetchingNextPage
                  ? "Đang tải..."
                  : "Xem thêm phản hồi"}
              </Button>
            )}
          </div>
        )}
      </div>
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
