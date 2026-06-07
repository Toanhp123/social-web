import Image from "next/image";
import {
  Globe2,
  Lock,
  MoreHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Post } from "../model/types";

type VisibilityConfig = {
  icon: LucideIcon;
  label: string;
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
    label: "Công khai",
    className: "bg-blue-50 text-blue-700",
  },
  FRIENDS_ONLY: {
    icon: Users,
    label: "Bạn bè",
    className: "bg-emerald-50 text-emerald-700",
  },
  PRIVATE: {
    icon: Lock,
    label: "Riêng tư",
    className: "bg-zinc-100 text-zinc-600",
  },
} satisfies Record<Post["visibility"], VisibilityConfig>;

export function PostHeader({
  post,
  authorInitial,
  metaLabel,
}: PostHeaderProps) {
  return (
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
          authorInitial
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
          {post.author.username ? `@${post.author.username}` : "Thành viên"}
          {metaLabel ? ` · ${metaLabel}` : ""}
        </p>
      </div>

      <button
        type="button"
        className="grid size-9 shrink-0 place-items-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
        aria-label="Tùy chọn bài viết"
      >
        <MoreHorizontal className="size-5" />
      </button>
    </div>
  );
}

function VisibilityBadge({ visibility }: { visibility: Post["visibility"] }) {
  const config = VISIBILITY_CONFIGS[visibility];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        config.className,
      )}
    >
      <Icon className="size-3" />
      {config.label}
    </span>
  );
}
