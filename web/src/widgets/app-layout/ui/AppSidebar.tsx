"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  LogIn,
  MessageCircle,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useCurrentSession } from "@/entities/session";
import { ROUTES } from "@/shared/config/routes";
import type { AppMessages } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";

type AppSidebarProps = {
  t: AppMessages["app"];
};

export function AppSidebar({ t }: AppSidebarProps) {
  const pathname = usePathname() ?? "";
  const { currentUser } = useCurrentSession();
  const displayName = currentUser?.fullName?.trim() || currentUser?.email || "";
  const displayMeta = currentUser?.username
    ? `@${currentUser.username}`
    : currentUser?.email;

  const items = [
    {
      href: ROUTES.home,
      label: t.feed,
      icon: Home,
      active: pathname === ROUTES.home,
    },
    {
      href: ROUTES.friends,
      label: t.friends,
      icon: Users,
      active: pathname.startsWith(ROUTES.friends),
      authOnly: true,
    },
    {
      href: ROUTES.groups,
      label: t.groups,
      icon: UsersRound,
      active: pathname.startsWith(ROUTES.groups),
    },
  ];

  return (
    <aside className="border-soft bg-surface-elevated/70 hidden min-h-[calc(100dvh-3.5rem)] min-w-0 border-r lg:block">
      <div className="sticky top-14 space-y-4 px-4 py-5">
        {currentUser && (
          <Link
            href={ROUTES.profile}
            className="rounded-control hover:bg-surface-soft flex min-w-0 items-center gap-3 py-2.5 pr-3 pl-0 transition"
          >
            <span className="rounded-pill bg-brand text-inverse grid size-10 shrink-0 place-items-center text-sm font-semibold">
              {(displayName.trim().charAt(0) || "U").toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="text-primary block truncate text-sm font-semibold">
                {displayName}
              </span>
              {displayMeta && (
                <span className="text-muted block truncate text-xs">
                  {displayMeta}
                </span>
              )}
            </span>
          </Link>
        )}

        <section className="space-y-1">
          <nav className="space-y-1" aria-label="Primary">
            {items
              .filter((item) => !item.authOnly || currentUser)
              .map((item) => (
                <SidebarLink key={item.href} {...item} />
              ))}

            {!currentUser && (
              <SidebarLink
                href={ROUTES.login}
                label={t.login}
                icon={LogIn}
                active={pathname === ROUTES.login}
              />
            )}

            <SidebarButton icon={MessageCircle} label={t.messages} />
          </nav>
        </section>
      </div>
    </aside>
  );
}

type SidebarLinkProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
};

function SidebarLink({ href, label, icon: Icon, active }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-control flex h-11 items-center gap-3 py-0 pr-3 pl-0 text-sm font-medium transition",
        active
          ? "bg-surface-muted text-primary"
          : "text-secondary hover:bg-surface-soft hover:text-brand",
      )}
    >
      <span
        className={cn(
          "rounded-control grid size-8 shrink-0 place-items-center",
          active ? "bg-brand text-inverse" : "bg-surface-muted text-secondary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

function SidebarButton({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <button
      type="button"
      className="rounded-control text-secondary hover:bg-surface-soft hover:text-brand flex h-11 w-full items-center gap-3 pr-3 pl-0 text-sm font-medium transition"
    >
      <span className="rounded-control bg-surface-muted text-secondary grid size-8 shrink-0 place-items-center">
        <Icon className="size-4" />
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}
