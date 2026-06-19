"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";
import { useRealtime } from "@/features/realtime";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { NotificationItem } from "@/entities/notification";

type NotificationPopoverProps = {
  label: string;
  className?: string;
  buttonClassName?: string;
  popoverClassName?: string;
};

type NotificationPanelPosition = {
  top: number;
  right: number;
  width: number;
  maxHeight: number;
  density: "compact" | "comfortable";
};

export function NotificationPopover({
  label,
  className,
  buttonClassName,
  popoverClassName,
}: NotificationPopoverProps) {
  const { notifications, unreadNotificationCount, clearUnreadNotifications } =
    useRealtime();

  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [panelPosition, setPanelPosition] =
    useState<NotificationPanelPosition | null>(null);

  const t = useTranslations().notifications;
  const visibleBadgeCount = Math.min(unreadNotificationCount, 99);

  useEffect(() => {
    if (!isOpen) return;

    const updatePanelPosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();

      if (!rect) return;

      const isCompact = window.matchMedia("(max-width: 639px)").matches;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const gap = isCompact ? 12 : 8;
      const horizontalInset = isCompact ? 12 : 16;
      const width = isCompact ? viewportWidth - horizontalInset * 2 : 320;

      setPanelPosition({
        top: isCompact ? 72 : rect.bottom + gap,
        right: isCompact
          ? horizontalInset
          : Math.max(horizontalInset, viewportWidth - rect.right),
        width,
        maxHeight: Math.max(
          160,
          isCompact
            ? viewportHeight - 96
            : Math.min(420, viewportHeight - rect.bottom - gap - 16),
        ),
        density: isCompact ? "compact" : "comfortable",
      });
    };

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);

    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [isOpen]);

  return (
    <div className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className={cn(
          "rounded-pill border-subtle bg-surface text-secondary",
          "hover:border-brand-border hover:text-brand",
          "focus-visible:ring-brand-ring focus-visible:ring-4 focus-visible:outline-none",
          "shadow-control relative grid size-10 place-items-center border transition",
          buttonClassName,
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

      {isOpen &&
        panelPosition &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              aria-label={label}
              className="fixed inset-0 z-40 cursor-default bg-transparent"
              onClick={() => setIsOpen(false)}
            />

            <div
              className={cn(
                "border-subtle bg-surface-elevated shadow-popover rounded-card fixed z-50 border p-3 backdrop-blur",
                panelPosition.density === "compact" && "p-2.5",
                popoverClassName,
              )}
              style={{
                top: panelPosition.top,
                right: panelPosition.right,
                width: panelPosition.width,
                maxHeight: panelPosition.maxHeight,
              }}
            >
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
                <div
                  className="space-y-2 overflow-y-auto pr-1"
                  style={{ maxHeight: panelPosition.maxHeight - 52 }}
                >
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      t={t}
                      density={panelPosition.density}
                    />
                  ))}
                </div>
              )}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
