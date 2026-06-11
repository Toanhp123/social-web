"use client";

import {
  Globe2,
  Lock,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui/Avatar";
import type { Post } from "../model/types";

type VisibilityConfig = {
  icon: LucideIcon;
  labelKey: "public" | "friends" | "private";
  className: string;
};

type PostHeaderProps = {
  post: Post;
  metaLabel?: string;
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
    className: "bg-emerald-50 text-emerald-700",
  },
  PRIVATE: {
    icon: Lock,
    labelKey: "private",
    className: "bg-surface-muted text-secondary",
  },
} satisfies Record<Post["visibility"], VisibilityConfig>;

export function PostHeader({ post, metaLabel }: PostHeaderProps) {
  const t = useTranslations().post;

  return (
    <div className="flex items-start gap-3">
      <Avatar
        src={post.author.avatarUrl}
        alt={`${post.author.fullName} avatar`}
        name={post.author.fullName}
        size={44}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-primary truncate text-sm font-semibold">
            {post.author.fullName}
          </p>

          <VisibilityBadge visibility={post.visibility} />
        </div>

        <p className="text-muted truncate text-xs">
          {post.author.username ? `@${post.author.username}` : "Member"}
          {metaLabel ? ` · ${metaLabel}` : ""}
        </p>
      </div>

      <button
        type="button"
        className="rounded-pill text-placeholder hover:bg-surface-muted hover:text-secondary grid size-9 shrink-0 place-items-center transition"
        aria-label={t.menu}
      >
        <MoreHorizontal className="size-5" />
      </button>
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
