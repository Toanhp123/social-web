"use client";

import { AppLayout } from "@/widgets/app-layout";
import { FriendsOverview } from "@/widgets/friends-overview";
import { useTranslations } from "@/shared/i18n";

export function FriendsPage() {
  const t = useTranslations().friends;

  return (
    <AppLayout title={t.title} description={t.description}>
      <div className="space-y-5">
        <section className="border-subtle bg-surface shadow-card rounded-card border p-5">
          <h2 className="text-primary text-lg font-semibold">{t.title}</h2>
          <p className="text-muted mt-1 text-sm">{t.description}</p>
        </section>

        <FriendsOverview />
      </div>
    </AppLayout>
  );
}
