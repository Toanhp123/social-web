"use client";

import { useState } from "react";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { UserProfile } from "@/entities/user";
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
  variant?: ProfilePanelVariant;
};

export function ProfilePanel({
  currentUser,
  initialProfile,
  variant = "default",
}: ProfilePanelProps) {
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);

  const isSidebar = variant === "sidebar";
  const metaItems = buildProfileMetaItems(profile);

  return (
    <section className="w-full space-y-4">
      <div className="w-full overflow-hidden rounded-2xl bg-white shadow-sm shadow-zinc-200/70">
        <ProfileCover
          profile={profile}
          variant={variant}
          onProfileChange={setProfile}
        />

        <div className={isSidebar ? "px-4" : "px-6"}>
          <ProfileHeader
            profile={profile}
            currentUser={currentUser}
            variant={variant}
            metaItems={metaItems}
            onProfileChange={setProfile}
          />

          {!isSidebar && <ProfileTabs />}
        </div>
      </div>

      <div
        className={[
          "grid w-full gap-4",
          isSidebar ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-[380px_1fr]",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <div className="space-y-4">
          <ProfileAboutCard profile={profile} metaItems={metaItems} />
        </div>

        <ProfileEditorCard profile={profile} onProfileChange={setProfile} />
      </div>
    </section>
  );
}
