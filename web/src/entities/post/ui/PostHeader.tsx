"use client";

import Image from "next/image";
import {
  Globe2,
  Lock,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import type { Post } from "../model/types";

type VisibilityConfig = {
  icon: LucideIcon;
  labelKey: "public" | "friends" | "private";
  className: string;
};

type PostHeaderProps = {
  post: Post;
  authorInitial: string;
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

export function PostHeader({
  post,
  authorInitial,
  metaLabel,
}: PostHeaderProps) {
  const t = useTranslations().post;

  return (
    <div className="flex items-start gap-3">
      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-pill bg-brand-gradient text-sm font-semibold text-inverse">
        {post.author.avatarUrl ? (
          <Image
            src={post.author.avatarUrl}
            alt=""
            width={44}
            height={44}
            className="size-full object-cover"
          />
        ) : (
          authorInitial
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-primary">
            {post.author.fullName}
          </p>

          <VisibilityBadge visibility={post.visibility} />
        </div>

        <p className="truncate text-xs text-muted">
          {post.author.username ? `@${post.author.username}` : "Member"}
          {metaLabel ? ` · ${metaLabel}` : ""}
        </p>
      </div>

      <button
        type="button"
        className="grid size-9 shrink-0 place-items-center rounded-pill text-placeholder transition hover:bg-surface-muted hover:text-secondary"
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
        "inline-flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      <Icon className="size-3" />
      {t[config.labelKey]}
    </span>
  );
}

