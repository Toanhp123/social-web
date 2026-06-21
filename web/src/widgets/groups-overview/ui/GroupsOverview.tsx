"use client";

import { Users } from "lucide-react";
import { useMemo, useState } from "react";
import type { Group } from "@/entities/group";
import { GroupCard } from "@/entities/group";
import { useCurrentSession } from "@/entities/session";
import { GroupJoinButton, useGroupsQuery } from "@/features/group-membership";
import { useTranslations } from "@/shared/i18n";
import { Card, EmptyState, SearchField, SegmentedTabs } from "@/shared/ui";

type GroupsFilter = "all" | "joined" | "public" | "private";

export function GroupsOverview() {
  const t = useTranslations().groups;
  const { currentUser } = useCurrentSession();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<GroupsFilter>("all");
  const groupsQuery = useGroupsQuery({ search });
  const groups = useMemo(() => groupsQuery.data?.items ?? [], [groupsQuery.data]);
  const filteredGroups = useMemo(
    () => filterGroups(groups, activeFilter),
    [activeFilter, groups],
  );
  const counts = getGroupCounts(groups);

  return (
    <section className="space-y-4">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-brand text-xs font-semibold tracking-wide uppercase">
              {t.discoverEyebrow}
            </p>
            <h1 className="text-primary mt-1 text-2xl font-bold">
              {t.discoverTitle}
            </h1>
            <p className="text-muted mt-1 text-sm leading-6">
              {t.discoverDescription}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center md:w-64">
            <GroupCount label={t.stats.groups} value={counts.all} />
            <GroupCount label={t.stats.joined} value={counts.joined} />
            <GroupCount label={t.stats.private} value={counts.private} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <label className="sr-only" htmlFor="group-search">
            {t.searchPlaceholder}
          </label>
          <SearchField
            id="group-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
          />

          <GroupsFilterTabs
            activeFilter={activeFilter}
            counts={counts}
            labels={t.filters}
            onFilterChange={setActiveFilter}
          />
        </div>
      </Card>

      {groupsQuery.isLoading ? (
        <GroupsSkeleton />
      ) : groupsQuery.error instanceof Error ? (
        <GroupNotice
          title={t.notices.cannotLoad}
          text={groupsQuery.error.message}
        />
      ) : filteredGroups.length === 0 ? (
        <GroupNotice
          title={t.notices.noneFound}
          text={
            groups.length === 0
              ? t.notices.noGroups
              : t.notices.noFilterResults
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              actionSlot={
                <GroupJoinButton
                  group={group}
                  canInteract={Boolean(currentUser)}
                  fullWidth
                />
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function GroupsFilterTabs({
  activeFilter,
  counts,
  labels,
  onFilterChange,
}: {
  activeFilter: GroupsFilter;
  counts: ReturnType<typeof getGroupCounts>;
  labels: Record<GroupsFilter, string>;
  onFilterChange: (filter: GroupsFilter) => void;
}) {
  const filters: Array<{ value: GroupsFilter; label: string; count: number }> = [
    { value: "all", label: labels.all, count: counts.all },
    { value: "joined", label: labels.joined, count: counts.joined },
    { value: "public", label: labels.public, count: counts.public },
    { value: "private", label: labels.private, count: counts.private },
  ];

  return (
    <SegmentedTabs
      items={filters}
      value={activeFilter}
      onValueChange={onFilterChange}
      ariaLabel={labels.all}
      variant="pill"
      size="sm"
    />
  );
}

function GroupCount({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-control bg-surface-soft px-3 py-2">
      <span className="text-primary block text-sm font-semibold">{value}</span>
      <span className="text-muted block text-xs">{label}</span>
    </div>
  );
}

function GroupNotice({ title, text }: { title: string; text?: string }) {
  return (
    <EmptyState icon={<Users className="size-6" />} title={title} description={text} />
  );
}

function GroupsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Card
          key={index}
          padding="none"
          className="overflow-hidden opacity-80"
        >
          <div className="bg-surface-muted h-28 animate-pulse" />
          <div className="space-y-3 p-4">
            <div className="bg-surface-muted h-12 w-12 animate-pulse rounded-control" />
            <div className="bg-surface-muted h-4 w-2/3 animate-pulse rounded-control" />
            <div className="bg-surface-muted h-3 w-1/2 animate-pulse rounded-control" />
            <div className="bg-surface-muted h-9 animate-pulse rounded-control" />
          </div>
        </Card>
      ))}
    </div>
  );
}

function filterGroups(groups: Group[], filter: GroupsFilter) {
  if (filter === "joined") {
    return groups.filter((group) => group.viewer.role);
  }

  if (filter === "public") {
    return groups.filter((group) => group.privacy === "PUBLIC");
  }

  if (filter === "private") {
    return groups.filter((group) => group.privacy === "PRIVATE");
  }

  return groups;
}

function getGroupCounts(groups: Group[]) {
  return {
    all: groups.length,
    joined: groups.filter((group) => group.viewer.role).length,
    public: groups.filter((group) => group.privacy === "PUBLIC").length,
    private: groups.filter((group) => group.privacy === "PRIVATE").length,
  };
}
