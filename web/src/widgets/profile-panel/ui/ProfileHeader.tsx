"use client";

import { MoreHorizontal, Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { ProfileImageUploader } from "@/features/profile";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { User, UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui/Avatar";
import type { ProfileMetaItem, ProfilePanelVariant } from "../model/types";

type ProfileHeaderProps = {
  profile: UserProfile | null;
  currentUser: CurrentSessionUser;
  profileOwner?: Pick<User, "id" | "email" | "fullName" | "username">;
  variant: ProfilePanelVariant;
  metaItems: ProfileMetaItem[];
  onProfileChange: (profile: UserProfile | null) => void;
  canEdit?: boolean;
  actions?: ReactNode;
  stats?: ReactNode;
};

export function ProfileHeader({
  profile,
  currentUser,
  profileOwner,
  variant,
  metaItems,
  onProfileChange,
  canEdit = true,
  actions,
  stats,
}: ProfileHeaderProps) {
  const t = useTranslations().profile;
  const isSidebar = variant === "sidebar";

  const displayName =
    profile?.fullName?.trim() ||
    profileOwner?.fullName?.trim() ||
    (canEdit ? currentUser.email : t.memberFallback);
  const usernameLabel = profile?.username
    ? `@${profile.username}`
    : profileOwner?.username
      ? `@${profileOwner.username}`
      : canEdit && profileOwner?.email
        ? profileOwner.email
        : canEdit
          ? currentUser.email
          : t.memberFallback;

  return (
    <div
      className={cn(
        "border-subtle border-b",
        isSidebar
          ? "pb-4"
          : "flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 gap-4",
          isSidebar ? "-mt-10 flex-col" : "-mt-8 items-end sm:-mt-9",
        )}
      >
        <Avatar
          src={profile?.avatarUrl}
          alt={`${t.avatarAlt} ${displayName}`}
          name={displayName}
          size={isSidebar ? 96 : 160}
          className={cn(
            "border-surface-border shadow-card border-4",
            isSidebar ? "size-24 text-3xl" : "size-24 text-3xl sm:size-40 sm:text-5xl",
          )}
        />

        <div className={cn("min-w-0", !isSidebar && "pb-3 sm:pb-5")}>
          <h2
            className={cn(
              "text-primary truncate font-bold tracking-tight",
              isSidebar ? "text-xl" : "text-2xl sm:text-3xl",
            )}
          >
            {displayName}
          </h2>

          <p className="text-muted mt-1 truncate text-sm font-medium">
            {usernameLabel}
          </p>

          {!isSidebar && (stats || metaItems.length > 0) && (
            <p className="text-muted mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {stats}

              {metaItems.length > 0 ? (
                <span>{`${metaItems.length} ${t.addedInfo}`}</span>
              ) : null}
            </p>
          )}
        </div>
      </div>

      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          isSidebar ? "mt-4" : "pb-3 sm:pb-5",
        )}
      >
        {canEdit && (
          <ProfileImageUploader kind="avatar" onUploaded={onProfileChange} />
        )}

        {!isSidebar && canEdit && (
          <>
            <button
              type="button"
              className="rounded-control bg-surface-muted text-primary hover:bg-surface-muted inline-flex h-10 items-center justify-center gap-2 px-3 text-sm font-semibold transition sm:px-4"
            >
              <Pencil className="size-4" />
              {t.editProfile}
            </button>

            <button
              type="button"
              aria-label={t.moreOptions}
              className="rounded-control bg-surface-muted text-secondary hover:bg-surface-muted grid size-10 place-items-center transition"
            >
              <MoreHorizontal className="size-5" />
            </button>
          </>
        )}

        {actions && (
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-none">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
