"use client";

import { useMemo } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";
import { usePostCommentsQuery } from "../model/use-post-comments-query";
import { CommentThread } from "./CommentThread";

type PostCommentsListProps = {
  postId: string;
  canInteract?: boolean;
  onRequireAuth?: () => void;
  className?: string;
};

export function PostCommentsList({
  postId,
  canInteract = true,
  onRequireAuth,
  className,
}: PostCommentsListProps) {
  const commentsQuery = usePostCommentsQuery({ postId });

  const comments = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [commentsQuery.data],
  );

  return (
    <div className={cn("space-y-4", className)}>
      {commentsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Loader2 className="size-4 animate-spin" />
          Đang tải bình luận
        </div>
      ) : commentsQuery.error instanceof Error ? (
        <p className="text-sm text-red-600">{commentsQuery.error.message}</p>
      ) : comments.length === 0 ? (
        <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
          <MessageCircle className="size-4" />
          Hãy là người đầu tiên bình luận.
        </div>
      ) : (
        comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            canInteract={canInteract}
            onRequireAuth={onRequireAuth}
          />
        ))
      )}

      {commentsQuery.hasNextPage && (
        <Button
          type="button"
          variant="link"
          fullWidth={false}
          disabled={commentsQuery.isFetchingNextPage}
          onClick={() => void commentsQuery.fetchNextPage()}
          className="inline-flex items-center gap-2"
        >
          {commentsQuery.isFetchingNextPage && (
            <Loader2 className="size-4 animate-spin" />
          )}

          {commentsQuery.isFetchingNextPage
            ? "Đang tải..."
            : "Xem thêm bình luận"}
        </Button>
      )}
    </div>
  );
}
