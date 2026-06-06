import type { Comment } from "../model/types";

type CommentItemProps = {
  comment: Comment;
  metaLabel?: string;
  onReplyClick?: (comment: Comment) => void;
};

export function CommentItem({
  comment,
  metaLabel,
  onReplyClick,
}: CommentItemProps) {
  const authorInitial =
    comment.author.fullName.trim().slice(0, 1).toUpperCase() || "?";

  return (
    <article className="flex min-w-0 gap-3">
      {comment.author.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={comment.author.avatarUrl}
          alt=""
          className="size-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <div className="grid size-8 shrink-0 place-items-center rounded-full bg-zinc-100 text-xs font-semibold text-zinc-600">
          {authorInitial}
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="inline-block max-w-full rounded-2xl bg-zinc-100 px-3 py-2">
          <p className="truncate text-sm font-semibold text-zinc-950">
            {comment.author.fullName}
          </p>
          <p className="mt-1 text-sm leading-5 whitespace-pre-wrap text-zinc-800">
            {comment.content}
          </p>
        </div>

        <div className="mt-1 flex items-center gap-3 px-2 text-xs font-medium text-zinc-500">
          {metaLabel && <span>{metaLabel}</span>}
          {onReplyClick && (
            <button
              type="button"
              onClick={() => onReplyClick(comment)}
              className="hover:text-blue-600"
            >
              Reply
            </button>
          )}
          {comment.replyCount > 0 && (
            <span>
              {comment.replyCount}{" "}
              {comment.replyCount === 1 ? "reply" : "replies"}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
