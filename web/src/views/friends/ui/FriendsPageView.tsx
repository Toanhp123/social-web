"use client";

import { AppLayout } from "@/widgets/app-layout";
import { FriendsOverview } from "@/widgets/friends-overview";
import { useTranslations } from "@/shared/i18n";

export function FriendsPage() {
  const t = useTranslations().friends;

  return (
    <AppLayout title={t.title} description={t.description}>
      <div className="space-y-6">
        <header>
          <h1 className="text-primary text-2xl font-bold tracking-normal">
            {t.title}
          </h1>
        </header>

        <FriendsOverview />
      </div>
    </AppLayout>
  );
}
