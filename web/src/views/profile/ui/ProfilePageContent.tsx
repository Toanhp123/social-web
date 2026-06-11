"use client";

import type { ReactNode } from "react";
import type { CurrentSessionUser } from "@/entities/session/server";
import type { User, UserProfile } from "@/entities/user";
import { useTranslations } from "@/shared/i18n";
import { AppLayout } from "@/widgets/app-layout";
import { ProfilePanel } from "@/widgets/profile-panel";

type ProfilePageContentProps = {
  currentUser: CurrentSessionUser;
  profile: UserProfile | null;
  profileOwner?: Pick<User, "id" | "email" | "fullName" | "username">;
  canEdit?: boolean;
  headerActions?: ReactNode;
  profileStats?: ReactNode;
};

export function ProfilePageContent({
  currentUser,
  profile,
  profileOwner,
  canEdit = true,
  headerActions,
  profileStats,
}: ProfilePageContentProps) {
  const t = useTranslations().home;

  return (
    <AppLayout title={t.profileTitle} description={t.profilePageDescription}>
      <ProfilePanel
        currentUser={currentUser}
        initialProfile={profile}
        profileOwner={profileOwner}
        canEdit={canEdit}
        headerActions={headerActions}
        profileStats={profileStats}
      />
    </AppLayout>
  );
}
