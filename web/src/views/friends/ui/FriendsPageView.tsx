"use client";

import { AppLayout } from "@/widgets/app-layout";
import { FriendsOverview } from "@/widgets/friends-overview";
import { useTranslations } from "@/shared/i18n";

export function FriendsPage() {
  const t = useTranslations().friends;

  return (
    <AppLayout title={t.title} description={t.description}>
      <FriendsOverview />
    </AppLayout>
  );
}
