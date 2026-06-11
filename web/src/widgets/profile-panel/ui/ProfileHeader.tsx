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
  profileOwner?: Pick<User, "email" | "fullName" | "username">;
  variant: ProfilePanelVariant;
  metaItems: ProfileMetaItem[];
  onProfileChange: (profile: UserProfile | null) => void;
  canEdit?: boolean;
  actions?: ReactNode;
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
          : "flex flex-col gap-4 pb-4 sm:flex-row sm:items-end sm:justify-between",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 gap-4",
          isSidebar ? "-mt-10 flex-col" : "-mt-9 items-end",
        )}
      >
        <Avatar
          src={profile?.avatarUrl}
          alt={`${t.avatarAlt} ${displayName}`}
          name={displayName}
          size={isSidebar ? 96 : 160}
          className={cn(
            "border-surface-border shadow-card border-4",
            isSidebar ? "size-24 text-3xl" : "size-32 text-5xl sm:size-40",
          )}
        />

        <div className={cn("min-w-0", !isSidebar && "pb-5")}>
          <h2
            className={cn(
              "text-primary truncate font-bold tracking-tight",
              isSidebar ? "text-xl" : "text-3xl",
            )}
          >
            {displayName}
          </h2>

          <p className="text-muted mt-1 truncate text-sm font-medium">
            {usernameLabel}
          </p>

          {!isSidebar && (
            <p className="text-muted mt-1 text-sm">
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
        {canEdit && (
          <ProfileImageUploader kind="avatar" onUploaded={onProfileChange} />
        )}

        {!isSidebar && canEdit && (
          <>
            <button
              type="button"
              className="rounded-control bg-surface-muted text-primary hover:bg-surface-muted inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold transition"
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

        {actions}
      </div>
    </div>
  );
}
