"use client";

import Image from "next/image";
import { MoreHorizontal, Pencil, UserRound } from "lucide-react";
import { ProfileImageUploader } from "@/features/profile";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import type { ProfileMetaItem, ProfilePanelVariant } from "../model/types";

type ProfileHeaderProps = {
  profile: UserProfile | null;
  currentUser: CurrentSessionUser;
  variant: ProfilePanelVariant;
  metaItems: ProfileMetaItem[];
  onProfileChange: (profile: UserProfile | null) => void;
};

export function ProfileHeader({
  profile,
  currentUser,
  variant,
  metaItems,
  onProfileChange,
}: ProfileHeaderProps) {
  const t = useTranslations().profile;
  const isSidebar = variant === "sidebar";

  const displayName = profile?.fullName?.trim() || currentUser.email;
  const usernameLabel = profile?.username
    ? `@${profile.username}`
    : currentUser.email;

  return (
    <div
      className={cn(
        "border-b border-subtle",
        isSidebar
          ? "pb-4"
          : "flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 gap-4",
          isSidebar ? "-mt-10 flex-col" : "-mt-9 items-end",
        )}
      >
        <div
          className={cn(
            "relative grid shrink-0 place-items-center overflow-hidden rounded-pill border-4 border-surface bg-surface-muted shadow-card",
            isSidebar ? "size-24" : "size-32 sm:size-40",
          )}
        >
          {profile?.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={`${t.avatarAlt} ${displayName}`}
              width={isSidebar ? 96 : 160}
              height={isSidebar ? 96 : 160}
              sizes={isSidebar ? "96px" : "160px"}
              className="size-full object-cover"
            />
          ) : (
            <UserRound
              className={cn(
                "text-placeholder",
                isSidebar ? "size-11" : "size-16",
              )}
            />
          )}
        </div>

        <div className={cn("min-w-0", !isSidebar && "pb-5")}>
          <h2
            className={cn(
              "truncate font-bold tracking-tight text-primary",
              isSidebar ? "text-xl" : "text-3xl",
            )}
          >
            {displayName}
          </h2>

          <p className="mt-1 truncate text-sm font-medium text-muted">
            {usernameLabel}
          </p>

          {!isSidebar && (
            <p className="mt-1 text-sm text-muted">
              {metaItems.length > 0
                ? `${metaItems.length} ${t.addedInfo}`
                : t.noProfileInfo}
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          isSidebar ? "mt-4" : "pb-5",
        )}
      >
        <ProfileImageUploader kind="avatar" onUploaded={onProfileChange} />

        {!isSidebar && (
          <>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-control bg-surface-muted px-4 py-2 text-sm font-semibold text-primary transition hover:bg-surface-muted"
            >
              <Pencil className="size-4" />
              {t.editProfile}
            </button>

            <button
              type="button"
              aria-label={t.moreOptions}
              className="grid size-10 place-items-center rounded-control bg-surface-muted text-secondary transition hover:bg-surface-muted"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

