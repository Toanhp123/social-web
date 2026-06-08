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
      <section className="rounded-card border-surface bg-surface shadow-card border p-4">
        <p className="text-brand text-xs font-semibold tracking-wide uppercase">
          {currentUserEmail ? t.hello : "Social Web"}
        </p>

        <h2 className="text-primary mt-2 text-lg font-semibold break-all">
          {currentUserEmail ?? t.publicFeed}
        </h2>

        <p className="text-muted mt-2 text-sm leading-6">
          {currentUserEmail ? t.railSignedIn : t.railGuest}
        </p>
      </section>

      <section className="rounded-card border-surface bg-surface shadow-card border p-3">
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.label}
                className="rounded-control flex w-full items-center gap-3 px-3 py-3"
              >
                <span className="rounded-control bg-surface-muted text-secondary grid size-10 shrink-0 place-items-center">
                  <Icon className="size-5" />
                </span>

                <span className="min-w-0">
                  <span className="text-primary block text-sm font-medium">
                    {item.label}
                  </span>
                  <span className="text-muted block truncate text-xs">
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
