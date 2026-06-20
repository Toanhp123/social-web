"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Lock, Users } from "lucide-react";
import type { Group } from "@/entities/group";
import { getGroupRoute } from "@/shared/config/routes";
import { cn } from "@/shared/lib/utils";

type GroupCardProps = {
  group: Group;
  actionSlot?: ReactNode;
  className?: string;
};

export function GroupCard({ group, actionSlot, className }: GroupCardProps) {
  const initial = group.name.trim().charAt(0).toUpperCase() || "G";

  return (
    <article
      className={cn(
        "rounded-card border-surface-border bg-surface-elevated shadow-card overflow-hidden border",
        className,
      )}
    >
      <Link href={getGroupRoute(group.id)} className="block">
        <div className="bg-surface-muted h-24" />

        <div className="px-4 pb-4">
          <div className="rounded-control bg-brand text-inverse shadow-card -mt-8 grid size-16 place-items-center text-xl font-semibold">
            {initial}
          </div>

          <div className="mt-3 min-w-0">
            <h2 className="text-primary truncate text-base font-semibold">
              {group.name}
            </h2>

            <div className="text-muted mt-1 flex flex-wrap items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1">
                {group.privacy === "PRIVATE" ? (
                  <Lock className="size-3.5" />
                ) : (
                  <Users className="size-3.5" />
                )}
                {group.privacy === "PRIVATE" ? "Private" : "Public"}
              </span>

              <span>{group.memberCount} members</span>
            </div>

            {group.description && (
              <p className="text-secondary mt-2 line-clamp-2 text-sm leading-5">
                {group.description}
              </p>
            )}
          </div>
        </div>
      </Link>

      {actionSlot && <div className="px-4 pb-4">{actionSlot}</div>}
    </article>
  );
}
