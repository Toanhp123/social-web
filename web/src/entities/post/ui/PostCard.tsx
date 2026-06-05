"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import {
  Globe2,
  Heart,
  Lock,
  MessageCircle,
  MoreHorizontal,
  Send,
  Users,
} from "lucide-react";
import type { Post, ReactionType } from "../model/types";

type PostCardProps = {
  post: Post;
  className?: string;
  metaLabel?: string;
  isReacting?: boolean;
  onReactionChange?: (type: ReactionType | null) => void;
};

const REACTION_OPTIONS: Array<{
  type: ReactionType;
  label: string;
  countKey: keyof Post["reactionStats"];
  className: string;
}> = [
  {
    type: "LIKE",
    label: "Like",
    countKey: "likeCount",
    className: "text-blue-600 bg-blue-50",
  },
  {
    type: "LOVE",
    label: "Love",
    countKey: "loveCount",
    className: "text-rose-600 bg-rose-50",
  },
  {
    type: "HAHA",
    label: "Haha",
    countKey: "hahaCount",
    className: "text-amber-600 bg-amber-50",
  },
  {
    type: "WOW",
    label: "Wow",
    countKey: "wowCount",
    className: "text-violet-600 bg-violet-50",
  },
  {
    type: "SAD",
    label: "Sad",
    countKey: "sadCount",
    className: "text-sky-700 bg-sky-50",
  },
  {
    type: "ANGRY",
    label: "Angry",
    countKey: "angryCount",
    className: "text-red-700 bg-red-50",
  },
];

export function PostCard({
  post,
  className,
  metaLabel,
  isReacting,
  onReactionChange,
}: PostCardProps) {
  return (
    <article
      className={[
        "overflow-hidden rounded-2xl border border-white bg-white shadow-sm shadow-zinc-200/70",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br from-blue-600 to-emerald-500 text-sm font-semibold text-white">
            {post.author.avatarUrl ? (
              <Image
                src={post.author.avatarUrl}
                alt=""
                width={44}
                height={44}
                className="size-full object-cover"
              />
            ) : (
              post.author.fullName.slice(0, 1).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-semibold text-zinc-950">
                {post.author.fullName}
              </p>
              <VisibilityBadge visibility={post.visibility} />
            </div>
            <p className="truncate text-xs text-zinc-500">
              {post.author.username ? `@${post.author.username}` : "Thanh vien"}
              {metaLabel ? ` - ${metaLabel}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Tuy chon bai viet"
          >
            <MoreHorizontal className="size-5" />
          </button>
        </div>

        {post.content && (
          <p className="mt-4 text-sm leading-6 whitespace-pre-wrap text-zinc-800">
            {post.content}
          </p>
        )}
      </div>

      {post.media.length > 0 && (
        <div
          className={[
            "grid gap-1 bg-zinc-100",
            post.media.length === 1 ? "grid-cols-1" : "grid-cols-2",
          ].join(" ")}
        >
          {post.media.map((media) => (
            <div
              key={media.id}
              className="relative aspect-video overflow-hidden bg-zinc-200"
            >
              {media.type === "VIDEO" ? (
                <video
                  src={media.url}
                  className="size-full object-cover"
                  controls
                  preload="metadata"
                />
              ) : (
                <Image
                  src={media.url}
                  alt={media.alt ?? ""}
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-zinc-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3 text-xs text-zinc-500">
          <span>{post.reactionStats.totalReactionCount} reaction</span>
          {post.currentReaction && (
            <span>{getReactionLabel(post.currentReaction)} cua ban</span>
          )}
        </div>

        {onReactionChange && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {REACTION_OPTIONS.map((reaction) => {
              const isActive = post.currentReaction === reaction.type;
              const count = post.reactionStats[reaction.countKey];

              return (
                <button
                  key={reaction.type}
                  type="button"
                  disabled={isReacting}
                  onClick={() =>
                    onReactionChange(isActive ? null : reaction.type)
                  }
                  className={[
                    "inline-flex min-w-0 items-center justify-center gap-1 rounded-full px-2 py-2 text-xs font-semibold transition disabled:opacity-60",
                    isActive
                      ? reaction.className
                      : "bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800",
                  ].join(" ")}
                  aria-pressed={isActive}
                >
                  <span className="truncate">{reaction.label}</span>
                  {count > 0 && <span>{count}</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-zinc-100 px-2 py-2">
        <PostAction
          icon={<Heart className="size-4" />}
          label={
            post.currentReaction ? getReactionLabel(post.currentReaction) : "Thich"
          }
        />
        <PostAction
          icon={<MessageCircle className="size-4" />}
          label="Binh luan"
        />
        <PostAction icon={<Send className="size-4" />} label="Chia se" />
      </div>
    </article>
  );
}

function getReactionLabel(type: ReactionType) {
  return (
    REACTION_OPTIONS.find((reaction) => reaction.type === type)?.label ?? type
  );
}

function VisibilityBadge({ visibility }: { visibility: Post["visibility"] }) {
  const config = {
    PUBLIC: {
      icon: Globe2,
      label: "Cong khai",
      className: "bg-blue-50 text-blue-700",
    },
    FRIENDS_ONLY: {
      icon: Users,
      label: "Ban be",
      className: "bg-emerald-50 text-emerald-700",
    },
    PRIVATE: {
      icon: Lock,
      label: "Rieng tu",
      className: "bg-zinc-100 text-zinc-600",
    },
  }[visibility];
  const Icon = config.icon;

  return (
    <span
      className={[
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        config.className,
      ].join(" ")}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}

function PostAction({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-zinc-500 hover:bg-zinc-50 hover:text-blue-600"
    >
      {icon}
      <span className="truncate">{label}</span>
    </button>
  );
}
