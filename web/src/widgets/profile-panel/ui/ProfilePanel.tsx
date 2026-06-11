"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { User, UserProfile } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import { buildProfileMetaItems } from "../lib/build-profile-meta-items";
import type { ProfilePanelVariant } from "../model/types";
import { ProfileAboutCard } from "./ProfileAboutCard";
import { ProfileCover } from "./ProfileCover";
import { ProfileEditorCard } from "./ProfileEditorCard";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs } from "./ProfileTabs";

type ProfilePanelProps = {
  currentUser: CurrentSessionUser;
  initialProfile: UserProfile | null;
  profileOwner?: Pick<User, "email" | "fullName" | "username">;
  variant?: ProfilePanelVariant;
  canEdit?: boolean;
  headerActions?: ReactNode;
};

export function ProfilePanel({
  currentUser,
  initialProfile,
  profileOwner,
  variant = "default",
  canEdit = true,
  headerActions,
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);

  const isSidebar = variant === "sidebar";
  const metaItems = buildProfileMetaItems(profile);

  return (
    <section className="w-full space-y-4">
      <div className="rounded-card bg-surface shadow-card w-full overflow-hidden">
        <ProfileCover
          profile={profile}
          variant={variant}
          onProfileChange={setProfile}
          canEdit={canEdit}
        />

        <div className={isSidebar ? "px-4" : "px-6"}>
          <ProfileHeader
            profile={profile}
            currentUser={currentUser}
            profileOwner={profileOwner}
            variant={variant}
            metaItems={metaItems}
            onProfileChange={setProfile}
            canEdit={canEdit}
            actions={headerActions}
          />

          {!isSidebar && <ProfileTabs />}
        </div>
      </div>

      <div
        className={cn(
          "grid w-full gap-4",
          isSidebar || !canEdit
            ? "grid-cols-1"
            : "grid-cols-1 lg:grid-cols-[380px_1fr]",
        )}
      >
        <div className="space-y-4">
          <ProfileAboutCard profile={profile} metaItems={metaItems} />
        </div>

        {canEdit && (
          <ProfileEditorCard profile={profile} onProfileChange={setProfile} />
        )}
      </div>
    </section>
  );
}
