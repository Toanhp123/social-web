"use client";

import { Pencil } from "lucide-react";
import type { ReactNode } from "react";
import { ProfileImageUploader } from "@/features/profile";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { User, UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar, Button } from "@/shared/ui";
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
  onEditProfile?: () => void;
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
  onEditProfile,
}: ProfileHeaderProps) {
  const t = useTranslations().profile;
  const isSidebar = variant === "sidebar";
  const currentUserName = currentUser.fullName?.trim() || currentUser.email;
  const currentUserMeta = currentUser.username
    ? `@${currentUser.username}`
    : currentUser.email;

  const displayName =
    profile?.fullName?.trim() ||
    profileOwner?.fullName?.trim() ||
    (canEdit ? currentUserName : t.memberFallback);
  const usernameLabel = profile?.username
    ? `@${profile.username}`
    : profileOwner?.username
      ? `@${profileOwner.username}`
      : canEdit && profileOwner?.email
        ? profileOwner.email
        : canEdit
          ? currentUserMeta
          : t.memberFallback;

  return (
    <div
      className={cn(
        "border-subtle",
        isSidebar
          ? "pb-4"
          : "flex flex-col gap-3 pb-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 gap-4",
          isSidebar
            ? "-mt-10 flex-col"
            : "-mt-12 flex-col items-center text-center sm:-mt-14 sm:flex-row sm:items-end sm:text-left",
        )}
      >
        <Avatar
          src={profile?.avatarUrl}
          alt={`${t.avatarAlt} ${displayName}`}
          name={displayName}
          size={isSidebar ? 96 : 160}
          className={cn(
            "border-surface shadow-card border-4",
            isSidebar
              ? "size-24 text-3xl"
              : "size-28 text-4xl sm:size-40 sm:text-5xl",
          )}
        />

        <div
          className={cn(
            "min-w-0",
            !isSidebar && "w-full pb-1 sm:w-auto sm:pb-5",
          )}
        >
          <h2
            className={cn(
              "text-primary font-bold tracking-tight",
              isSidebar ? "text-xl" : "text-2xl sm:text-4xl",
            )}
          >
            {displayName}
          </h2>

          <p className="text-muted mt-1 truncate text-sm font-medium">
            {usernameLabel}
          </p>

          {!isSidebar && (stats || metaItems.length > 0) && (
            <p className="text-muted mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm sm:justify-start">
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
          isSidebar ? "mt-4" : "justify-center pb-1 sm:justify-end sm:pb-5",
        )}
      >
        {canEdit && isSidebar && (
          <ProfileImageUploader kind="avatar" onUploaded={onProfileChange} />
        )}

        {!isSidebar && canEdit && (
          <>
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              className="inline-flex items-center gap-2"
              onClick={onEditProfile}
            >
              <Pencil className="size-4" />
              {t.editProfile}
            </Button>

            <ProfileImageUploader kind="avatar" onUploaded={onProfileChange} />
          </>
        )}

        {actions && (
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-center gap-2 sm:flex-none sm:justify-end">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
