"use client";

import Link from "next/link";
import { Compass, Newspaper, Plus } from "lucide-react";
import { useCurrentSession } from "@/entities/session";
import { CreateGroupForm } from "@/features/create-group";
import { useGroupsQuery } from "@/features/group-membership";
import { ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Card } from "@/shared/ui";
import { GroupsSectionLayout } from "@/widgets/groups-section-layout";
import { GroupsOverview } from "@/widgets/groups-overview";
import { PostFeed } from "@/widgets/post-feed";

const GROUPS_DISCOVER_ROUTE = `${ROUTES.groups}/discover`;
const GROUPS_CREATE_ROUTE = `${ROUTES.groups}/create`;

export function GroupsPage() {
  const t = useTranslations().groups;
  const { currentUser } = useCurrentSession();
  const groupsQuery = useGroupsQuery();
  const groups = groupsQuery.data?.items ?? [];
  const joinedGroups = groups.filter((group) => group.viewer.role);

  return (
    <GroupsSectionLayout>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Card className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-brand text-xs font-semibold tracking-wide uppercase">
                {t.feedEyebrow}
              </p>
              <h1 className="text-primary mt-1 text-2xl font-bold">
                {t.feedTitle}
              </h1>
              <p className="text-muted mt-1 text-sm leading-6">
                {t.feedDescription}
              </p>
            </div>

            <Link
              href={GROUPS_DISCOVER_ROUTE}
              className="rounded-control bg-brand text-inverse hover:bg-brand-hover inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition"
            >
              <Compass className="size-4" />
              {t.discover}
            </Link>
          </div>
        </Card>

        {groupsQuery.isLoading ? (
          <GroupsFeedSkeleton />
        ) : joinedGroups.length === 0 ? (
          <Card className="grid min-h-60 place-items-center text-center">
            <div>
              <Newspaper className="text-muted mx-auto size-8" />
              <h2 className="text-primary mt-3 font-semibold">
                {t.feedEmptyTitle}
              </h2>
              <p className="text-muted mt-1 max-w-md text-sm leading-6">
                {t.feedEmptyDescription}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                <Link
                  href={GROUPS_DISCOVER_ROUTE}
                  className="rounded-control bg-brand text-inverse hover:bg-brand-hover inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition"
                >
                  <Compass className="size-4" />
                  {t.discoverGroups}
                </Link>
                {currentUser && (
                  <Link
                    href={GROUPS_CREATE_ROUTE}
                    className="rounded-control bg-surface-soft text-secondary hover:bg-surface-muted inline-flex h-10 items-center justify-center gap-2 px-4 text-sm font-semibold transition"
                  >
                    <Plus className="size-4" />
                    {t.createGroup}
                  </Link>
                )}
              </div>
            </div>
          </Card>
        ) : (
          <section className="space-y-3">
            <PostFeed
              canInteract={Boolean(currentUser)}
              groupFeed
              emptyTitle={t.detail.emptyPostsTitle}
              emptyDescription={t.detail.emptyPostsDescription}
            />
          </section>
        )}
      </div>
    </GroupsSectionLayout>
  );
}

export function DiscoverGroupsPage() {
  return (
    <GroupsSectionLayout>
      <GroupsOverview />
    </GroupsSectionLayout>
  );
}

export function CreateGroupPage() {
  const t = useTranslations().groups;

  return (
    <GroupsSectionLayout>
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <Card className="space-y-2">
          <p className="text-brand text-xs font-semibold tracking-wide uppercase">
            {t.createEyebrow}
          </p>
          <h1 className="text-primary text-2xl font-bold">{t.createTitle}</h1>
          <p className="text-muted text-sm leading-6">{t.createDescription}</p>
        </Card>

        <CreateGroupForm idPrefix="groups-create-page" />
      </div>
    </GroupsSectionLayout>
  );
}

function GroupsFeedSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} padding="none" className="overflow-hidden opacity-80">
          <div className="bg-surface-muted h-28 animate-pulse" />
          <div className="space-y-3 p-4">
            <div className="bg-surface-muted rounded-control h-12 w-12 animate-pulse" />
            <div className="bg-surface-muted rounded-control h-4 w-2/3 animate-pulse" />
            <div className="bg-surface-muted rounded-control h-3 w-1/2 animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}
