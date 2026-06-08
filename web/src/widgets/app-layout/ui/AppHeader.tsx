"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Bell,
  Home,
  MessageCircle,
  Search,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppSettingsButton } from "@/features/app-settings";
import { useRealtime } from "@/features/realtime";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

type AppHeaderProps = {
  actions?: ReactNode;
  mobileActions?: ReactNode;
  t: AppMessages["app"];
};

export function AppHeader({ actions, mobileActions, t }: AppHeaderProps) {
  const { unreadNotificationCount, clearUnreadNotifications } = useRealtime();

  return (
    <header className="border-soft bg-surface-elevated/95 sticky top-0 z-30 overflow-x-clip border-b px-2 py-2 backdrop-blur sm:px-6 lg:px-8">
      <div className="mx-auto flex h-12 max-w-7xl min-w-0 items-center gap-2 sm:h-14 sm:gap-3">
        <AppBrand t={t} />

        <AppSearch t={t} />

        <AppNavigation t={t} />

        <div className="ml-auto flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          <HeaderIconButton
            icon={MessageCircle}
            label={t.messages}
            className="hidden sm:grid"
          />

          <HeaderIconButton
            icon={Bell}
            label={t.notifications}
            badgeCount={unreadNotificationCount}
            onClick={clearUnreadNotifications}
            className="hidden sm:grid"
          />

          <AppSettingsButton />

          {mobileActions && (
            <div className="flex min-w-0 shrink-0 items-center sm:hidden">
              {mobileActions}
            </div>
          )}

          {actions && (
            <div className="hidden min-w-0 shrink-0 items-center sm:flex">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function AppBrand({ t }: { t: AppMessages["app"] }) {
  return (
    <Link
      href={ROUTES.home}
      className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
    >
      <span className="rounded-control bg-brand text-inverse shadow-card grid size-9 shrink-0 place-items-center sm:size-10">
        <UserRound className="size-4 sm:size-5" />
      </span>

      <span className="text-primary hidden truncate text-sm font-semibold tracking-wide sm:inline">
        {t.brand}
      </span>
    </Link>
  );
}

function AppSearch({ t }: { t: AppMessages["app"] }) {
  return (
    <label className="rounded-pill border-subtle bg-surface-muted text-muted ml-2 hidden min-w-0 flex-1 items-center gap-3 border px-4 py-2 text-sm md:flex md:max-w-md">
      <Search className="size-4 shrink-0" />
      <span className="truncate">{t.searchPlaceholder}</span>
    </label>
  );
}

function AppNavigation({ t }: { t: AppMessages["app"] }) {
  return (
    <nav className="rounded-pill border-subtle bg-surface-muted ml-auto hidden items-center gap-1 border p-1 lg:flex">
      <Link
        href={ROUTES.home}
        className="rounded-pill bg-surface text-primary inline-flex items-center gap-2 px-3 py-2 text-sm font-medium shadow-sm"
      >
        <Home className="text-brand size-4" />
        {t.feed}
      </Link>

      <span className="rounded-pill text-muted inline-flex items-center gap-2 px-3 py-2 text-sm">
        <Users className="size-4" />
        {t.friends}
      </span>
    </nav>
  );
}

type HeaderIconButtonProps = {
  icon: LucideIcon;
  label: string;
  badgeCount?: number;
  onClick?: () => void;
  className?: string;
};

function HeaderIconButton({
  icon: Icon,
  label,
  badgeCount = 0,
  onClick,
  className,
}: HeaderIconButtonProps) {
  const visibleBadgeCount = Math.min(badgeCount, 99);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-pill border-subtle bg-surface text-secondary hover:text-brand relative size-10 place-items-center border shadow-sm transition",
        className,
      )}
      aria-label={label}
    >
      <Icon className="size-4" />
      {badgeCount > 0 && (
        <span className="bg-danger text-inverse absolute -top-1 -right-1 grid min-h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] leading-none font-semibold">
          {visibleBadgeCount}
        </span>
      )}
    </button>
  );
}
