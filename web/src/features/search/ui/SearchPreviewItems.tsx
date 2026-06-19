"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import type { FriendUser } from "@/entities/friend";
import type { Post } from "@/entities/post";
import { getProfileRoute } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui/Avatar";

type SearchTranslations = AppMessages["search"];
type SearchPreviewDensity = "compact" | "comfortable";

export function SearchPreviewSection({
  title,
  children,
  density = "compact",
}: {
  title: string;
  children: ReactNode;
  density?: SearchPreviewDensity;
}) {
  return (
    <section className={density === "comfortable" ? "space-y-2" : "py-1"}>
      <h2
        className={cn(
          "text-muted text-xs font-semibold uppercase",
          density === "comfortable" ? "px-1" : "px-3 py-1",
        )}
      >
        {title}
      </h2>
      {children}
    </section>
  );
}

export function SearchPreviewUserItem({
  user,
  t,
  density = "compact",
  onClick,
}: {
  user: FriendUser;
  t: SearchTranslations;
  density?: SearchPreviewDensity;
  onClick?: () => void;
}) {
  const isComfortable = density === "comfortable";

  return (
    <Link
      href={getProfileRoute(user.id)}
      onClick={onClick}
      className={cn(
        "hover:bg-surface-soft flex items-center gap-3 transition",
        isComfortable
          ? "rounded-card border-surface-border bg-surface border p-3"
          : "rounded-control px-3 py-2",
      )}
    >
      <Avatar
        src={user.avatarUrl}
        alt={`${t.avatarAlt} ${user.fullName}`}
        name={user.fullName}
        size={isComfortable ? 42 : 36}
      />
      <span className="min-w-0">
        <span className="text-primary block truncate text-sm font-semibold">
          {user.fullName}
        </span>
        {user.username && (
          <span className="text-muted block truncate text-xs">
            @{user.username}
          </span>
        )}
      </span>
    </Link>
  );
}

export function SearchPreviewPostItem({
  post,
  href,
  t,
  density = "compact",
  onClick,
}: {
  post: Post;
  href: string;
  t: SearchTranslations;
  density?: SearchPreviewDensity;
  onClick?: () => void;
}) {
  const isComfortable = density === "comfortable";

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "hover:bg-surface-soft block transition",
        isComfortable
          ? "rounded-card border-surface-border bg-surface border p-3"
          : "rounded-control px-3 py-2",
      )}
    >
      <p className="text-primary truncate text-sm font-semibold">
        {post.author.fullName}
      </p>
      <p
        className={cn(
          "text-muted mt-1 text-sm",
          isComfortable ? "line-clamp-3 leading-5" : "line-clamp-2",
        )}
      >
        {post.content || t.mediaPost}
      </p>
    </Link>
  );
}

export function SearchPreviewLoading({
  density = "compact",
}: {
  density?: SearchPreviewDensity;
}) {
  const isComfortable = density === "comfortable";

  return (
    <div className={isComfortable ? "space-y-3" : "space-y-2 p-2"}>
      {Array.from({ length: isComfortable ? 6 : 3 }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "flex items-center gap-3",
            isComfortable
              ? "rounded-card border-surface-border bg-surface border p-3"
              : "px-2 py-1",
          )}
        >
          <div
            className={cn(
              "bg-surface-muted animate-pulse rounded-full",
              isComfortable ? "size-11" : "size-9",
            )}
          />
          <div className="min-w-0 flex-1 space-y-2">
            <div
              className={cn(
                "bg-surface-muted h-3 animate-pulse rounded",
                isComfortable ? "w-2/3" : "w-3/4",
              )}
            />
            <div className="bg-surface-muted h-2 w-1/2 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
