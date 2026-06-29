"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogIn,
  UserPlus,
  UserRound,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { AppSettingsButton } from "@/features/app-settings";
import { CreatePostHeaderButton } from "@/features/create-post";
import { NotificationPopover } from "@/features/notification";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/features/logout";
import { AppSearchBox, MobileSearchOverlayTrigger } from "@/features/search";
import { useCurrentSession } from "@/entities/session";

type AppHeaderProps = {
  actions?: ReactNode;
  mobileActions?: ReactNode;
  t: AppMessages["app"];
};

export function AppHeader({ actions, mobileActions, t }: AppHeaderProps) {
  const { currentUser } = useCurrentSession();

  return (
    <header className="border-soft bg-surface-elevated/95 sticky top-0 z-30 overflow-x-clip border-b backdrop-blur">
      <MobileHeaderContent t={t} mobileActions={mobileActions} />

      <DesktopHeaderContent t={t} currentUser={currentUser} actions={actions} />
    </header>
  );
}

function MobileHeaderContent({
  t,
  mobileActions,
}: {
  t: AppMessages["app"];
  mobileActions?: ReactNode;
}) {
  return (
    <div className="w-full px-3 py-2 md:hidden">
      <div className="flex h-11 min-w-0 items-center gap-2">
        <AppBrand t={t} compact={false} />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {mobileActions}

          <MobileSearchOverlayTrigger className="rounded-pill border-subtle bg-surface text-secondary shadow-control hover:text-brand grid size-10 place-items-center border transition" />

          <CreatePostHeaderButton className="rounded-pill bg-brand text-inverse shadow-control hover:bg-brand-hover grid size-10 place-items-center transition" />
        </div>
      </div>

      <MobileNavigation t={t} />
    </div>
  );
}

function DesktopHeaderContent({
  t,
  currentUser,
  actions,
}: {
  t: AppMessages["app"];
  currentUser: ReturnType<typeof useCurrentSession>["currentUser"];
  actions?: ReactNode;
}) {
  return (
    <div className="hidden h-14 w-full min-w-0 items-center gap-3 px-6 py-2 md:flex lg:px-8">
      <AppBrand t={t} />

      <AppSearchBox className="ml-2" />

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
        <NotificationPopover label={t.notifications} />

        <AppSettingsButton />

        {currentUser ? (
          <AuthenticatedHeaderActions t={t} />
        ) : (
          <GuestHeaderActions t={t} />
        )}

        {actions && (
          <div className="hidden min-w-0 shrink-0 items-center sm:flex">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

function AppBrand({
  t,
  compact = true,
}: {
  t: AppMessages["app"];
  compact?: boolean;
}) {
  return (
    <Link
      href={ROUTES.home}
      className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
    >
      <span className="rounded-control bg-brand text-inverse shadow-card grid size-9 shrink-0 place-items-center sm:size-10">
        <UserRound className="size-4 sm:size-5" />
      </span>

      <span
        className={cn(
          "text-primary truncate text-sm font-semibold tracking-wide",
          compact && "hidden sm:inline",
        )}
      >
        {t.brand}
      </span>
    </Link>
  );
}

function MobileNavigation({ t }: { t: AppMessages["app"] }) {
  const pathname = usePathname() ?? "";

  return (
    <nav className="mt-2 grid grid-cols-5 gap-1">
      <MobileNavLink
        href={ROUTES.home}
        label={t.feed}
        icon={Home}
        active={pathname === ROUTES.home}
      />
      <MobileNavLink
        href={ROUTES.friends}
        label={t.friends}
        icon={Users}
        active={pathname.startsWith(ROUTES.friends)}
      />
      <MobileNavLink
        href={ROUTES.groups}
        label={t.groups}
        icon={UsersRound}
        active={pathname.startsWith(ROUTES.groups)}
      />
      <NotificationPopover
        label={t.notifications}
        className="flex justify-center"
        buttonClassName="h-11 w-full rounded-control border-0 bg-transparent shadow-none"
      />
      <div className="flex justify-center">
        <AppSettingsButton
          className="w-full"
          buttonClassName="h-11 w-full rounded-control border-0 bg-transparent shadow-none"
        />
      </div>
    </nav>
  );
}

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className={cn(
        "rounded-control text-secondary hover:bg-surface-soft hover:text-brand grid h-11 place-items-center transition",
        active && "bg-surface-muted text-brand",
      )}
    >
      <Icon className="size-5" />
    </Link>
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
