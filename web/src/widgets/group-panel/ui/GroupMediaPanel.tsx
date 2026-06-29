"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageIcon, PlayCircle } from "lucide-react";
import type { Group } from "@/entities/group";
import { useGroupMediaQuery } from "@/features/group-membership";
import { getProfileRoute } from "@/shared/config/routes";
import { Avatar, Card, EmptyState } from "@/shared/ui";
import type { GroupMessages } from "./group-panel.types";

type GroupMediaPanelProps = {
  group: Group;
  canView: boolean;
  t: GroupMessages;
};

export function GroupMediaPanel({ group, canView, t }: GroupMediaPanelProps) {
  const mediaQuery = useGroupMediaQuery(group.id, canView);
  const mediaItems = mediaQuery.data?.items ?? [];

  if (!canView) {
    return (
      <EmptyState
        icon={<ImageIcon className="size-8" />}
        title={t.detail.privateMediaTitle}
        description={t.detail.privateMediaDescription}
      />
    );
  }

  return (
    <Card variant="elevated" padding="none" className="overflow-hidden">
      <header className="border-soft border-b p-4 sm:p-5">
        <h2 className="text-primary text-lg font-semibold">
          {t.detail.mediaTitle}
        </h2>
        <p className="text-muted mt-1 text-sm">{t.detail.mediaDescription}</p>
      </header>

      <div className="p-3 sm:p-5">
        {mediaQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="rounded-control bg-surface-muted aspect-square animate-pulse"
              />
            ))}
          </div>
        ) : mediaQuery.isError ? (
          <p className="text-danger text-sm">{mediaQuery.error.message}</p>
        ) : mediaItems.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="size-8" />}
            title={t.detail.mediaEmptyTitle}
            description={t.detail.mediaEmptyDescription}
            className="grid min-h-40 place-items-center text-center"
          />
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {mediaItems.map((media) => (
              <article
                key={media.id}
                className="rounded-control group bg-surface-muted relative aspect-square overflow-hidden"
              >
                {media.type === "IMAGE" ? (
                  <Image
                    src={media.url}
                    alt={media.alt ?? t.detail.mediaAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : media.thumbnailUrl ? (
                  <Image
                    src={media.thumbnailUrl}
                    alt={media.alt ?? t.detail.mediaAlt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <div className="grid size-full place-items-center">
                    <ImageIcon className="text-muted size-7" />
                  </div>
                )}

                {media.type === "VIDEO" && (
                  <div className="absolute inset-0 grid place-items-center bg-black/20">
                    <PlayCircle className="text-white size-9 drop-shadow" />
                  </div>
                )}

                <Link
                  href={getProfileRoute(media.author.id)}
                  className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-gradient-to-t from-black/70 to-transparent p-2 pt-8 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Avatar
                    src={media.author.avatarUrl}
                    name={media.author.fullName}
                    alt={media.author.fullName}
                    size={24}
                    className="border-white/30 border"
                  />
                  <span className="min-w-0 truncate text-xs font-medium">
                    {media.author.fullName}
                  </span>
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
