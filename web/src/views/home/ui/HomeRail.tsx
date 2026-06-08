import { BellDot, Sparkles, UsersRound } from "lucide-react";
import type { AppMessages } from "@/shared/i18n";

type HomeMessages = AppMessages["home"];

type HomeRailProps = {
  currentUserEmail?: string;
  t: HomeMessages;
};

export function HomeRail({ currentUserEmail, t }: HomeRailProps) {
  const items = [
    {
      icon: BellDot,
      label: t.railItems.newNotifications,
      meta: t.railItems.newNotificationsMeta,
    },
    {
      icon: UsersRound,
      label: t.railItems.community,
      meta: t.railItems.communityMeta,
    },
    {
      icon: Sparkles,
      label: t.railItems.highlights,
      meta: t.railItems.highlightsMeta,
    },
  ];

  return (
    <div className="space-y-4">
      <section className="rounded-card border border-surface bg-surface p-4 shadow-card">
        <p className="text-xs font-semibold tracking-wide text-brand uppercase">
          {currentUserEmail ? t.hello : "Social Web"}
        </p>

        <h2 className="mt-2 text-lg font-semibold break-all text-primary">
          {currentUserEmail ?? t.publicFeed}
        </h2>

        <p className="mt-2 text-sm leading-6 text-muted">
          {currentUserEmail ? t.railSignedIn : t.railGuest}
        </p>
      </section>

      <section className="rounded-card border border-surface bg-surface p-3 shadow-card">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="flex w-full items-center gap-3 rounded-control px-3 py-3"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-control bg-surface-muted text-secondary">
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0">
                  <span className="block text-sm font-medium text-primary">
                    {item.label}
                  </span>
                  <span className="block truncate text-xs text-muted">
                    {item.meta}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
