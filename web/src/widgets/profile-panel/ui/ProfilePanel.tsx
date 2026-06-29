"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { User, UserProfile } from "@/entities/user";
import { cn } from "@/shared/lib/utils";
import { PostFeed } from "@/widgets/post-feed";
import { buildProfileMetaItems } from "../lib/build-profile-meta-items";
import type { ProfilePanelVariant } from "../model/types";
import { ProfileAboutCard } from "./ProfileAboutCard";
import { ProfileCover } from "./ProfileCover";
import { ProfileEditorCard } from "./ProfileEditorCard";
import { ProfileHeader } from "./ProfileHeader";
import { ProfileTabs, type ProfileTab } from "./ProfileTabs";

type ProfilePanelProps = {
  currentUser: CurrentSessionUser;
  initialProfile: UserProfile | null;
  profileOwner?: Pick<User, "id" | "email" | "fullName" | "username">;
  variant?: ProfilePanelVariant;
  canEdit?: boolean;
  headerActions?: ReactNode;
  profileStats?: ReactNode;
};

export function ProfilePanel({
  currentUser,
  initialProfile,
  profileOwner,
  variant = "default",
  canEdit = true,
  headerActions,
  profileStats,
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [activeTab, setActiveTab] = useState<ProfileTab>("posts");

  const isSidebar = variant === "sidebar";
  const metaItems = buildProfileMetaItems(profile);
  const profileUserId = profile?.userId ?? profileOwner?.id ?? currentUser.id;

  return (
    <section className="mx-auto w-full max-w-280 space-y-4">
      <div className="border-surface-border rounded-card bg-surface shadow-card w-full overflow-hidden border">
        <ProfileCover
          profile={profile}
          variant={variant}
          onProfileChange={setProfile}
          canEdit={canEdit}
        />

        <div className={isSidebar ? "px-4" : "px-3 sm:px-6"}>
          <ProfileHeader
            profile={profile}
            currentUser={currentUser}
            profileOwner={profileOwner}
            variant={variant}
            metaItems={metaItems}
            onProfileChange={setProfile}
            canEdit={canEdit}
            actions={headerActions}
            stats={profileStats}
            onEditProfile={() => setActiveTab("about")}
          />

          {!isSidebar && (
            <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
          )}
        </div>
      </div>

      {activeTab === "posts" && !isSidebar && (
        <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,680px)] lg:items-start lg:justify-center">
          <aside className="space-y-4 lg:sticky lg:top-20">
            <ProfileAboutCard profile={profile} metaItems={metaItems} compact />
          </aside>

          <div className="min-w-0">
            <PostFeed canInteract authorId={profileUserId} showHeader={false} />
          </div>
        </div>
      )}

      {(activeTab === "about" || isSidebar) && (
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
      )}
    </section>
  );
}
