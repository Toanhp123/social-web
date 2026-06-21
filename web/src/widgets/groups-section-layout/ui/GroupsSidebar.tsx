"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Home,
  Lock,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useGroupsQuery } from "@/features/group-membership";
import { getGroupRoute, ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar, Card, SearchField } from "@/shared/ui";

const GROUPS_DISCOVER_ROUTE = `${ROUTES.groups}/discover`;
const GROUPS_CREATE_ROUTE = `${ROUTES.groups}/create`;

export function GroupsSidebar() {
  const t = useTranslations().groups;
  const pathname = usePathname() ?? "";
  const [search, setSearch] = useState("");
  const groupsQuery = useGroupsQuery();
  const groups = groupsQuery.data?.items ?? [];
  const joinedGroups = groups.filter((group) => group.viewer.role);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleGroups = normalizedSearch
    ? joinedGroups.filter((group) =>
        group.name.toLowerCase().includes(normalizedSearch),
      )
    : joinedGroups;

  return (
    <aside className="border-soft bg-surface-elevated/70 hidden min-h-[calc(100dvh-3.5rem)] min-w-0 border-r lg:block">
      <div className="sticky top-14 space-y-4 px-4 py-5">
        <div>
          <h2 className="text-primary text-2xl font-bold">{t.title}</h2>
          <SearchField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
            wrapperClassName="mt-3"
          />
        </div>

        <nav className="space-y-1" aria-label={t.title}>
          <GroupsNavLink
            href={ROUTES.groups}
            label={t.yourFeed}
            icon={Home}
            active={pathname === ROUTES.groups}
          />
          <GroupsNavLink
            href={GROUPS_DISCOVER_ROUTE}
            label={t.discover}
            icon={Compass}
            active={pathname.startsWith(GROUPS_DISCOVER_ROUTE)}
          />
          <GroupsNavLink
            href={GROUPS_CREATE_ROUTE}
            label={t.createNewGroup}
            icon={Plus}
            active={pathname.startsWith(GROUPS_CREATE_ROUTE)}
            primary
          />
        </nav>

        <Card className="space-y-3" padding="sm">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-primary text-sm font-semibold">{t.yourGroups}</h3>
            <span className="text-muted text-xs">{joinedGroups.length}</span>
          </div>

          {groupsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="bg-surface-muted size-9 animate-pulse rounded-control" />
                  <div className="bg-surface-muted h-3 flex-1 animate-pulse rounded-control" />
                </div>
              ))}
            </div>
          ) : joinedGroups.length === 0 ? (
            <p className="text-muted text-sm leading-6">
              {t.joinedGroupsEmpty}
            </p>
          ) : visibleGroups.length === 0 ? (
            <p className="text-muted text-sm leading-6">
              {t.notices.noneFound}
            </p>
          ) : (
            <div className="space-y-1">
              {visibleGroups.slice(0, 8).map((group) => (
                <Link
                  key={group.id}
                  href={getGroupRoute(group.id)}
                  className={cn(
                    "rounded-control hover:bg-surface-soft flex min-w-0 items-center gap-3 py-2 pr-2 transition",
                    pathname === getGroupRoute(group.id) && "bg-surface-muted",
                  )}
                >
                  <Avatar
                    src={group.avatarUrl}
                    alt={group.name}
                    name={group.name}
                    size={36}
                    className="rounded-control"
                  />
                  <span className="min-w-0">
                    <span className="text-primary block truncate text-sm font-medium">
                      {group.name}
                    </span>
                    <span className="text-muted flex items-center gap-1 text-xs">
                      {group.privacy === "PRIVATE" ? (
                        <Lock className="size-3" />
                      ) : (
                        <Users className="size-3" />
                      )}
                      {t.membersCount.replace("{count}", String(group.memberCount))}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </aside>
  );
}

function GroupsNavLink({
  href,
  label,
  icon: Icon,
  active,
  primary = false,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-control flex h-11 items-center gap-3 pr-3 pl-0 text-sm font-semibold transition",
        active
          ? "bg-surface-muted text-primary"
          : "text-secondary hover:bg-surface-soft hover:text-brand",
        primary && !active && "text-brand",
      )}
    >
      <span
        className={cn(
          "rounded-control grid size-9 shrink-0 place-items-center",
          active || primary
            ? "bg-brand text-inverse"
            : "bg-surface-muted text-secondary",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="truncate">{label}</span>
    </Link>
  );
}
