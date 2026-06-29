"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Lock, ShieldCheck, Users } from "lucide-react";
import type { Group } from "@/entities/group";
import { getGroupRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui";

type GroupCardProps = {
  group: Group;
  actionSlot?: ReactNode;
  className?: string;
};

export function GroupCard({ group, actionSlot, className }: GroupCardProps) {
  const t = useTranslations().groups;
  const isJoined = Boolean(group.viewer.role);

  return (
    <article
      className={cn(
        "rounded-card border-surface-border bg-surface shadow-card overflow-hidden border",
        className,
      )}
    >
      <Link href={getGroupRoute(group.id)} className="block">
        <div
          className={cn(
            "bg-surface-muted h-28 bg-cover bg-center",
            !group.coverUrl &&
              "from-brand-soft via-surface-muted to-surface-soft bg-linear-to-br",
          )}
          style={
            group.coverUrl
              ? { backgroundImage: `url("${group.coverUrl}")` }
              : undefined
          }
        />

        <div className="px-4 pb-4">
          <Avatar
            src={group.avatarUrl}
            alt={group.name}
            name={group.name}
            size={64}
            className="rounded-control ring-surface shadow-card -mt-8 ring-4"
          />

          <div className="mt-3 min-w-0">
            <div className="flex min-w-0 items-start justify-between gap-2">
              <h2 className="text-primary min-w-0 truncate text-base font-semibold">
                {group.name}
              </h2>

              {isJoined && (
                <span className="rounded-pill bg-brand-soft text-brand inline-flex shrink-0 items-center gap-1 px-2 py-1 text-xs font-semibold">
                  <ShieldCheck className="size-3" />
                  {t.joined}
                </span>
              )}
            </div>

            <div className="text-muted mt-1 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1">
                {group.privacy === "PRIVATE" ? (
                  <Lock className="size-3.5" />
                ) : (
                  <Users className="size-3.5" />
                )}
                {group.privacy === "PRIVATE" ? t.private : t.public}
              </span>

              <span>{t.membersCount.replace("{count}", String(group.memberCount))}</span>
            </div>

            {group.description && (
              <p className="text-secondary mt-2 line-clamp-2 text-sm leading-5">
                {group.description}
              </p>
            )}
          </div>
        </div>
      </Link>

      {actionSlot && (
        <div className="border-soft border-t px-4 py-3">{actionSlot}</div>
      )}
    </article>
  );
}
