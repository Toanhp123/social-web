"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { Loader2, MessageCircle, Send } from "lucide-react";
import { CommentItem, type Comment } from "@/entities/comment";
import { useCreateCommentMutation } from "../model/use-create-comment-mutation";
import { usePostCommentsQuery } from "../model/use-post-comments-query";

type PostCommentsProps = {
  postId: string;
  canInteract?: boolean;
  onRequireAuth?: () => void;
};

export function PostComments({
  postId,
  canInteract = true,
  onRequireAuth,
}: PostCommentsProps) {
  const commentsQuery = usePostCommentsQuery({ postId });
  const comments = useMemo(
    () => commentsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [commentsQuery.data],
  );

  return (
    <div className="border-t border-zinc-100 bg-white px-4 py-3">
      <CommentForm
        postId={postId}
        canInteract={canInteract}
        onRequireAuth={onRequireAuth}
      />

      <div className="mt-4 space-y-4">
        {commentsQuery.isLoading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="size-4 animate-spin" />
            Loading comments
          </div>
        ) : commentsQuery.error instanceof Error ? (
          <p className="text-sm text-red-600">{commentsQuery.error.message}</p>
        ) : comments.length === 0 ? (
          <div className="flex items-center gap-2 rounded-xl bg-zinc-50 px-3 py-3 text-sm text-zinc-500">
            <MessageCircle className="size-4" />
            Be the first to comment.
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
      </div>

      {commentsQuery.hasNextPage && (
        <button
          type="button"
          disabled={commentsQuery.isFetchingNextPage}
          onClick={() => void commentsQuery.fetchNextPage()}
          className="mt-4 w-full rounded-xl bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 disabled:opacity-60"
        >
          {commentsQuery.isFetchingNextPage
            ? "Loading..."
            : "View more comments"}
        </button>
      )}
    </div>
  );
}

function CommentThread({
  comment,
  canInteract,
  onRequireAuth,
}: {
  comment: Comment;
  canInteract: boolean;
  onRequireAuth?: () => void;
}) {
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
          <button
            type="button"
            onClick={() => setShowReplies(true)}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            View replies
          </button>
        )}

        {showReplies && (
          <div className="space-y-3">
            {repliesQuery.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <Loader2 className="size-4 animate-spin" />
                Loading replies
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
              <button
                type="button"
                disabled={repliesQuery.isFetchingNextPage}
                onClick={() => void repliesQuery.fetchNextPage()}
                className="text-sm font-medium text-blue-600 hover:text-blue-500 disabled:opacity-60"
              >
                {repliesQuery.isFetchingNextPage
                  ? "Loading..."
                  : "View more replies"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  compact,
  canInteract,
  onRequireAuth,
  onCreated,
}: {
  postId: string;
  parentId?: string;
  compact?: boolean;
  canInteract: boolean;
  onRequireAuth?: () => void;
  onCreated?: () => void;
}) {
  const [content, setContent] = useState("");
  const createCommentMutation = useCreateCommentMutation();
  const isDisabled = createCommentMutation.isPending || !content.trim();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canInteract) {
      onRequireAuth?.();
      return;
    }

    const nextContent = content.trim();

    if (!nextContent) return;

    createCommentMutation.mutate(
      { postId, parentId, content: nextContent },
      {
        onSuccess: () => {
          setContent("");
          onCreated?.();
        },
      },
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={["flex items-end gap-2", compact ? "text-sm" : ""].join(" ")}
    >
      <textarea
        rows={compact ? 1 : 2}
        value={content}
        onFocus={() => {
          if (!canInteract) {
            onRequireAuth?.();
          }
        }}
        onChange={(event) => setContent(event.target.value)}
        placeholder={compact ? "Write a reply..." : "Write a comment..."}
        className="min-h-10 flex-1 resize-none rounded-2xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-300 focus:bg-white"
      />
      <button
        type="submit"
        disabled={isDisabled}
        className="grid size-10 shrink-0 place-items-center rounded-full bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
        aria-label="Send comment"
      >
        {createCommentMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </button>
    </form>
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
