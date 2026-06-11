"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { useRealtime } from "@/features/realtime";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { NotificationItem } from "@/entities/notification";

type NotificationPopoverProps = {
  label: string;
  className?: string;
};

export function NotificationPopover({
  label,
  className,
}: NotificationPopoverProps) {
  const { notifications, unreadNotificationCount, clearUnreadNotifications } =
    useRealtime();

  const [isOpen, setIsOpen] = useState(false);

  const t = useTranslations().notifications;
  const visibleBadgeCount = Math.min(unreadNotificationCount, 99);

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={cn(
          "rounded-pill border-subtle bg-surface text-secondary",
          "hover:border-brand-border hover:text-brand",
          "focus-visible:ring-brand-ring focus-visible:ring-4 focus-visible:outline-none",
          "shadow-control relative grid size-10 place-items-center border transition",
        )}
        aria-label={label}
        aria-expanded={isOpen}
      >
        <Bell className="size-4" />

        {unreadNotificationCount > 0 && (
          <span className="bg-danger text-inverse absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] leading-none font-semibold">
            {visibleBadgeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="border-subtle bg-surface-elevated shadow-popover rounded-card absolute top-12 right-0 z-50 w-80 border p-3 backdrop-blur">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-primary text-sm font-semibold">{t.title}</p>

            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={clearUnreadNotifications}
                className="text-muted hover:text-primary text-xs font-medium transition"
              >
                {t.markAllAsRead}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="text-muted text-sm">{t.empty}</p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
