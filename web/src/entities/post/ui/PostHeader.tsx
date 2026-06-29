"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Globe2, Lock, Users, type LucideIcon } from "lucide-react";
import { getGroupRoute, getProfileRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui";
import type { Post } from "../model/types";

type VisibilityConfig = {
  icon: LucideIcon;
  labelKey: "public" | "friends" | "private";
  className: string;
};

type PostHeaderProps = {
  post: Post;
  metaLabel?: string;
  menuSlot?: ReactNode;
};

const VISIBILITY_CONFIGS = {
  PUBLIC: {
    icon: Globe2,
    labelKey: "public",
    className: "bg-brand-soft text-brand-strong",
  },
  FRIENDS_ONLY: {
    icon: Users,
    labelKey: "friends",
    className: "bg-success-soft text-success",
  },
  PRIVATE: {
    icon: Lock,
    labelKey: "private",
    className: "bg-surface-muted text-secondary",
  },
} satisfies Record<Post["visibility"], VisibilityConfig>;

export function PostHeader({ post, metaLabel, menuSlot }: PostHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <Avatar
        src={post.author.avatarUrl}
        alt={`${post.author.fullName} avatar`}
        name={post.author.fullName}
        size={44}
      />

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1">
          <Link
            href={getProfileRoute(post.author.id)}
            className="text-primary hover:text-brand min-w-0 truncate text-sm font-semibold transition"
          >
            {post.author.fullName}
          </Link>

          {post.group && (
            <>
              <span className="text-muted text-sm font-medium">›</span>
              <Link
                href={getGroupRoute(post.group.id)}
                className="text-primary hover:text-brand min-w-0 truncate text-sm font-semibold transition"
              >
                {post.group.name}
              </Link>
            </>
          )}
        </div>

        <div className="text-muted mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs">
          <span className="min-w-0 truncate">
            {post.author.username ? `@${post.author.username}` : "Member"}
          </span>
          {metaLabel && <span>·</span>}
          {metaLabel && <span>{metaLabel}</span>}
          <VisibilityBadge visibility={post.visibility} />
        </div>
      </div>

      {menuSlot}
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: Post["visibility"] }) {
  const config = VISIBILITY_CONFIGS[visibility];
  const t = useTranslations().createPost.visibility;
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "rounded-pill inline-flex shrink-0 items-center gap-1 px-2 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      <Icon className="size-3" />
      {t[config.labelKey]}
    </span>
  );
}
