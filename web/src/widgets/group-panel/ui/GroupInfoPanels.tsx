"use client";

import Image from "next/image";
import { ImageIcon, Info, Lock, PlayCircle, Users, type LucideIcon } from "lucide-react";
import type { Group } from "@/entities/group";
import { useGroupMediaQuery } from "@/features/group-membership";
import { cn } from "@/shared/lib/utils";
import type { GroupMessages } from "./group-panel.types";

export function GroupAboutPanel({
  group,
  compact = false,
  t,
}: {
  group: Group;
  compact?: boolean;
  t: GroupMessages;
}) {
  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card border p-4">
      <h2 className="text-primary flex items-center gap-2 text-base font-semibold">
        <Info className="text-brand size-4" />
        {t.detail.aboutTitle}
      </h2>

      <p className="text-secondary mt-3 text-sm leading-6">
        {group.description || t.detail.noDescription}
      </p>

      <div
        className={cn(
          "mt-4 space-y-3",
          !compact && "sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0",
        )}
      >
        <GroupFact
          icon={group.privacy === "PRIVATE" ? Lock : Users}
          title={getPrivacyLabel(group, t)}
          text={
            group.privacy === "PRIVATE"
              ? t.detail.privateFact
              : t.detail.publicFact
          }
        />
        <GroupFact
          icon={Users}
          title={t.membersCount.replace("{count}", String(group.memberCount))}
          text={t.detail.membersFact}
        />
      </div>
    </section>
  );
}

export function GroupMembersPreview({
  group,
  compact = false,
  t,
}: {
  group: Group;
  compact?: boolean;
  t: GroupMessages;
}) {
  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card border p-4">
      <h2 className="text-primary flex items-center gap-2 text-base font-semibold">
        <Users className="text-brand size-4" />
        {t.detail.tabs.members}
      </h2>
      <p className="text-muted mt-2 text-sm leading-6">
        {compact
          ? t.membersCount.replace("{count}", String(group.memberCount))
          : t.detail.membersPreview}
      </p>

      <div className="mt-4 flex -space-x-2">
        {Array.from({ length: Math.min(group.memberCount, 5) || 1 }).map(
          (_, index) => (
            <span
              key={index}
              className="ring-surface bg-surface-muted text-muted grid size-9 place-items-center rounded-full text-xs font-semibold ring-2"
            >
              {index + 1}
            </span>
          ),
        )}
      </div>
    </section>
  );
}

export function GroupMediaPreview({
  group,
  canView = true,
  compact = false,
  t,
}: {
  group: Group;
  canView?: boolean;
  compact?: boolean;
  t: GroupMessages;
}) {
  const mediaQuery = useGroupMediaQuery(group.id, canView);
  const mediaItems = (mediaQuery.data?.items ?? []).slice(0, compact ? 6 : 9);

  return (
    <section className="rounded-card border-surface-border bg-surface shadow-card border p-4">
      <h2 className="text-primary flex items-center gap-2 text-base font-semibold">
        <ImageIcon className="text-brand size-4" />
        {t.detail.recentMedia}
      </h2>

      {!canView ? (
        <p className="text-muted mt-3 text-sm leading-6">
          {t.detail.privateMediaDescription}
        </p>
      ) : mediaQuery.isLoading ? (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {Array.from({ length: compact ? 6 : 9 }).map((_, index) => (
            <div
              key={index}
              className="rounded-control bg-surface-muted aspect-square animate-pulse"
            />
          ))}
        </div>
      ) : mediaItems.length === 0 ? (
        <p className="text-muted mt-3 text-sm leading-6">
          {t.detail.mediaEmptyDescription}
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-2">
          {mediaItems.map((media) => (
            <div
              key={media.id}
              className="rounded-control bg-surface-muted relative aspect-square overflow-hidden"
            >
              {media.type === "IMAGE" ? (
                <Image
                  src={media.url}
                  alt={media.alt ?? t.detail.mediaAlt}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              ) : media.thumbnailUrl ? (
                <Image
                  src={media.thumbnailUrl}
                  alt={media.alt ?? t.detail.mediaAlt}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              ) : (
                <div className="grid size-full place-items-center">
                  <ImageIcon className="text-muted size-4" />
                </div>
              )}

              {media.type === "VIDEO" && (
                <div className="absolute inset-0 grid place-items-center bg-black/20">
                  <PlayCircle className="text-white size-5 drop-shadow" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function GroupFact({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-control bg-surface-soft flex gap-3 p-3">
      <Icon className="text-secondary mt-0.5 size-4 shrink-0" />
      <span>
        <span className="text-primary block text-sm font-semibold">{title}</span>
        <span className="text-muted mt-0.5 block text-xs leading-5">{text}</span>
      </span>
    </div>
  );
}

function getPrivacyLabel(group: Group, t: GroupMessages) {
  return group.privacy === "PRIVATE" ? t.privateGroup : t.publicGroup;
}
