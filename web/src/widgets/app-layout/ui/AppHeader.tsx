"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogIn,
  MessageCircle,
  Search,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppSettingsButton } from "@/features/app-settings";
import { NotificationPopover } from "@/features/notification";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/features/logout";
import { useCurrentSession } from "@/entities/session";

type AppHeaderProps = {
  actions?: ReactNode;
  mobileActions?: ReactNode;
  t: AppMessages["app"];
};

export function AppHeader({ actions, mobileActions, t }: AppHeaderProps) {
  const { currentUser } = useCurrentSession();

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

          <NotificationPopover
            label={t.notifications}
            className="hidden sm:block"
          />

          <AppSettingsButton />

          {currentUser ? (
            <AuthenticatedHeaderActions t={t} />
          ) : (
            <GuestHeaderActions t={t} />
          )}

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
  const pathname = usePathname() ?? "";

  const isHome = pathname === ROUTES.home;
  const isFriends = pathname.startsWith(ROUTES.friends);

  return (
    <nav className="rounded-pill border-subtle bg-surface-muted ml-auto hidden items-center gap-1 border p-1 lg:flex">
      <Link
        href={ROUTES.home}
        className={cn(
          "rounded-pill inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition",
          isHome
            ? "bg-surface text-primary shadow-control"
            : "text-muted hover:text-primary",
        )}
      >
        <Home className={cn("size-4", isHome && "text-brand")} />
        {t.feed}
      </Link>

      <Link
        href={ROUTES.friends}
        className={cn(
          "rounded-pill inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition",
          isFriends
            ? "bg-surface text-primary shadow-control"
            : "text-muted hover:text-primary",
        )}
      >
        <Users className={cn("size-4", isFriends && "text-brand")} />
        {t.friends}
      </Link>
    </nav>
  );
}

type HeaderIconButtonProps = {
  icon: LucideIcon;
  label: string;
  className?: string;
};

function HeaderIconButton({
  icon: Icon,
  label,
  className,
}: HeaderIconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "rounded-pill border-subtle bg-surface text-secondary hover:text-brand shadow-control relative size-10 place-items-center border transition",
        className,
      )}
      aria-label={label}
    >
      <Icon className="size-4" />
    </button>
  );
}

function AuthenticatedHeaderActions({ t }: { t: AppMessages["app"] }) {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href={ROUTES.profile}
        className={cn(
          "rounded-pill shadow-control inline-flex h-10 items-center border px-3 text-sm font-medium transition",
          "border-subtle bg-surface text-secondary hover:text-brand",
        )}
      >
        {t.profile}
      </Link>

      <LogoutButton />
    </div>
  );
}

function GuestHeaderActions({ t }: { t: AppMessages["app"] }) {
  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href={ROUTES.login}
        className={cn(
          "rounded-pill shadow-control inline-flex h-10 items-center gap-2 border px-3 text-sm font-medium transition",
          "border-subtle bg-surface text-secondary hover:text-brand",
        )}
      >
        <LogIn className="size-4" />
        {t.login}
      </Link>

      <Link
        href={ROUTES.register}
        className={cn(
          "rounded-pill shadow-control inline-flex h-10 items-center gap-2 px-3 text-sm font-medium transition",
          "bg-brand text-inverse hover:bg-brand-hover",
        )}
      >
        <UserPlus className="size-4" />
        {t.register}
      </Link>
    </div>
  );
}
