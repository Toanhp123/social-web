"use client";

import Image from "next/image";
import type { Post } from "../model/types";

type PostCardProps = {
  post: Post;
  className?: string;
  metaLabel?: string;
};

export function PostCard({ post, className, metaLabel }: PostCardProps) {
  return (
    <article
      className={[
        "rounded-2xl border border-zinc-800 bg-zinc-950 p-4",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex items-center gap-3">
        <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-zinc-800 text-sm font-semibold text-zinc-300">
          {post.author.avatarUrl ? (
            <Image
              src={post.author.avatarUrl}
              alt=""
              width={40}
              height={40}
              className="size-full object-cover"
            />
          ) : (
            post.author.fullName.slice(0, 1).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-white">{post.author.fullName}</p>
          {metaLabel && <p className="text-xs text-zinc-500">{metaLabel}</p>}
        </div>
      </div>

      {post.content && (
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-zinc-200">
          {post.content}
        </p>
      )}

      {post.media.length > 0 && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {post.media.map((media) => (
            <div
              key={media.id}
              className="relative aspect-video overflow-hidden rounded-xl bg-zinc-900"
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
    </article>
  );
}
