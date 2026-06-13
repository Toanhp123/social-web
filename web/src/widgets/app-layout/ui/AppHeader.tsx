"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogIn,
  MessageCircle,
  UserPlus,
  UserRound,
  Users,
  type LucideIcon,
} from "lucide-react";
import { AppSettingsButton } from "@/features/app-settings";
import { CreatePostHeaderButton } from "@/features/create-post";
import { NotificationPopover } from "@/features/notification";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { LogoutButton } from "@/features/logout";
import { AppSearchBox, MobileSearchButton } from "@/features/search";
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
    <div className="mx-auto max-w-7xl px-3 py-2 md:hidden">
      <div className="flex h-11 min-w-0 items-center gap-2">
        <AppBrand t={t} compact={false} />

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {mobileActions}

          <MobileSearchButton className="rounded-pill border-subtle bg-surface text-secondary shadow-control hover:text-brand grid size-10 place-items-center border transition" />

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
    <div className="mx-auto hidden h-14 max-w-7xl min-w-0 items-center gap-3 px-6 py-2 md:flex lg:px-8">
      <AppBrand t={t} />

      <AppSearchBox className="ml-2" />

      <AppNavigation t={t} />

      <div className="ml-auto flex min-w-0 shrink-0 items-center gap-2">
        <HeaderIconButton
          icon={MessageCircle}
          label={t.messages}
          className="grid"
        />

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
    <nav className="mt-2 grid grid-cols-4 gap-1">
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
      <NotificationPopover
        label={t.notifications}
        className="flex justify-center"
        buttonClassName="h-11 w-full rounded-control border-0 bg-transparent shadow-none"
        popoverClassName="right-1/2 w-[calc(100vw-1.5rem)] translate-x-1/2"
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
