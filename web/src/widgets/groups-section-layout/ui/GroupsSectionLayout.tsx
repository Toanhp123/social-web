"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Plus, type LucideIcon } from "lucide-react";
import { AppLayout } from "@/widgets/app-layout";
import { ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { GroupsSidebar } from "./GroupsSidebar";

type GroupsSectionLayoutProps = {
  children: ReactNode;
  rightSidebar?: ReactNode;
  contentClassName?: string;
};

const GROUPS_DISCOVER_ROUTE = `${ROUTES.groups}/discover`;
const GROUPS_CREATE_ROUTE = `${ROUTES.groups}/create`;

export function GroupsSectionLayout({
  children,
  rightSidebar,
  contentClassName,
}: GroupsSectionLayoutProps) {
  return (
    <AppLayout
      showPageHeader={false}
      leftSidebar={<GroupsSidebar />}
      rightSidebar={rightSidebar}
      contentClassName={cn("min-w-0", contentClassName)}
    >
      <div className="space-y-4">
        <GroupsMobileNav />
        {children}
      </div>
    </AppLayout>
  );
}

function GroupsMobileNav() {
  const t = useTranslations().groups;
  const pathname = usePathname() ?? "";

  const items = [
    {
      href: ROUTES.groups,
      label: t.yourFeed,
      icon: Home,
      active: pathname === ROUTES.groups,
    },
    {
      href: GROUPS_DISCOVER_ROUTE,
      label: t.discover,
      icon: Compass,
      active: pathname.startsWith(GROUPS_DISCOVER_ROUTE),
    },
    {
      href: GROUPS_CREATE_ROUTE,
      label: t.createGroup,
      icon: Plus,
      active: pathname.startsWith(GROUPS_CREATE_ROUTE),
    },
  ];

  return (
    <nav
      className="border-soft bg-surface shadow-card sticky top-30 z-20 grid grid-cols-3 gap-1 rounded-card border p-1 lg:hidden"
      aria-label={t.title}
    >
      {items.map((item) => (
        <GroupsMobileNavLink key={item.href} {...item} />
      ))}
    </nav>
  );
}

function GroupsMobileNavLink({
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
      className={cn(
        "rounded-control flex min-h-11 min-w-0 flex-col items-center justify-center gap-1 px-2 text-center text-xs font-semibold transition",
        active
          ? "bg-brand text-inverse"
          : "text-secondary hover:bg-surface-soft hover:text-brand",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="w-full truncate">{label}</span>
    </Link>
  );
}
