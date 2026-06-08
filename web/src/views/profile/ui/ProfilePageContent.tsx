"use client";

import type { CurrentSessionUser } from "@/entities/session/server";
import type { UserProfile } from "@/entities/user";
import { LogoutButton } from "@/features/logout";
import { useTranslations } from "@/shared/i18n";
import { AppLayout } from "@/widgets/app-layout";
import { ProfilePanel } from "@/widgets/profile-panel";

type ProfilePageContentProps = {
  currentUser: CurrentSessionUser;
  profile: UserProfile | null;
};

export function ProfilePageContent({
  currentUser,
  profile,
}: ProfilePageContentProps) {
  const t = useTranslations().home;

  return (
    <AppLayout
      title={t.profileTitle}
      description={t.profilePageDescription}
      actions={<LogoutButton />}
    >
      <ProfilePanel currentUser={currentUser} initialProfile={profile} />
    </AppLayout>
  );
}
