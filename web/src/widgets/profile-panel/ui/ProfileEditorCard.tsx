"use client";

import type { UserProfile } from "@/entities/user";
import { ProfileEditor } from "@/features/profile";
import { useTranslations } from "@/shared/i18n";

type ProfileEditorCardProps = {
  profile: UserProfile | null;
  onProfileChange: (profile: UserProfile | null) => void;
};

export function ProfileEditorCard({
  profile,
  onProfileChange,
}: ProfileEditorCardProps) {
  const t = useTranslations().profile;

  return (
    <div className="rounded-card bg-surface p-4 shadow-card sm:p-6">
      <div className="mb-5">
        <h3 className="text-lg font-bold text-primary">{t.profileInfo}</h3>

        <p className="mt-1 text-sm leading-6 text-muted">
          {t.profileInfoDescription}
        </p>
      </div>

      <ProfileEditor profile={profile} onProfileChange={onProfileChange} />
    </div>
  );
}

