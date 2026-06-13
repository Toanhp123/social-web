import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui/Avatar";

type FriendUserCardProps = {
  avatarUrl?: string | null;
  fullName: string;
  username?: string | null;
  avatarAlt: string;
  href?: string;
  action?: ReactNode;
  variant?: "card" | "listItem";
  density?: "compact" | "comfortable";
  avatarSize?: number;
  className?: string;
  actionClassName?: string;
};

export function FriendUserCard({
  avatarUrl,
  fullName,
  avatarAlt,
  href,
  action,
  variant = "card",
  density = "comfortable",
  avatarSize,
  className,
  actionClassName,
}: FriendUserCardProps) {
  const isListItem = variant === "listItem";
  const isCompact = density === "compact";
  const resolvedAvatarSize = avatarSize ?? (isListItem ? 44 : 60);

  const profileContent = (
    <>
      <Avatar
        src={avatarUrl}
        alt={`${avatarAlt} ${fullName}`}
        name={fullName}
        size={resolvedAvatarSize}
        className="ring-surface-border ring-2"
      />

      <div
        className={cn("min-w-0", isListItem ? "flex-1" : "w-full text-center")}
      >
        <p
          className={cn(
            "text-primary truncate leading-tight font-semibold",
            isListItem ? "text-sm" : "text-base",
          )}
        >
          {fullName}
        </p>
      </div>
    </>
  );

  const profileClassName = cn(
    "min-w-0",
    isListItem
      ? "flex flex-1 items-center gap-3"
      : "flex flex-col items-center gap-3",
  );

  const profileBlock = href ? (
    <Link href={href} className={cn("group", profileClassName)}>
      {profileContent}
    </Link>
  ) : (
    <div className={profileClassName}>{profileContent}</div>
  );

  return (
    <article
      className={cn(
        "rounded-card border-surface-border bg-surface shadow-card border transition",
        "hover:border-brand-border hover:bg-surface-soft",
        isListItem
          ? "flex w-full items-center justify-between gap-3 p-3"
          : cn(
              "flex w-full flex-col justify-between gap-3 p-3",
              isCompact ? "min-h-36" : "min-h-40",
            ),
        className,
      )}
    >
      {profileBlock}

      {action && (
        <div
          className={cn(isListItem ? "shrink-0" : "w-full", actionClassName)}
        >
          {action}
        </div>
      )}
    </article>
  );
}
