"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useCurrentSession } from "@/entities/session";
import { useSearchUsersQuery } from "@/features/search";
import { getProfileRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Avatar } from "@/shared/ui/Avatar";
import { PostFeed } from "@/widgets/post-feed";

type SearchResultsProps = {
  query: string;
};

export function SearchResults({ query }: SearchResultsProps) {
  const t = useTranslations().search;
  const { currentUser } = useCurrentSession();
  const normalizedQuery = query.trim();
  const usersQuery = useSearchUsersQuery(normalizedQuery);
  const canInteract = Boolean(currentUser);

  if (normalizedQuery.length < 2) {
    return <EmptyState title={t.startTitle} description={t.startDescription} />;
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-primary text-base font-semibold">{t.people}</h2>
          </div>

          <div className="space-y-2">
            {usersQuery.isLoading ? (
              <ResultSkeleton />
            ) : usersQuery.isError ? (
              <p className="text-danger rounded-card bg-danger-soft px-4 py-3 text-sm">
                {t.loadError}
              </p>
            ) : usersQuery.data?.length ? (
              usersQuery.data.map((user) => (
                <Link
                  key={user.id}
                  href={getProfileRoute(user.id)}
                  className="rounded-card border-surface-border bg-surface hover:bg-surface-soft flex items-center gap-3 border p-3 transition"
                >
                  <Avatar
                    src={user.avatarUrl}
                    alt={`${t.avatarAlt} ${user.fullName}`}
                    name={user.fullName}
                    size={44}
                  />
                  <span className="min-w-0">
                    <span className="text-primary block truncate text-sm font-semibold">
                      {user.fullName}
                    </span>
                    {user.username && (
                      <span className="text-muted block truncate text-xs">
                        @{user.username}
                      </span>
                    )}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-muted rounded-card border-surface-border bg-surface border px-4 py-3 text-sm">
                {t.emptyPeople}
              </p>
            )}
          </div>
        </section>

        <section className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-primary text-base font-semibold">{t.posts}</h2>
          </div>

          <PostFeed
            canInteract={canInteract}
            search={normalizedQuery}
            showHeader={false}
            emptyTitle={t.emptyPosts}
            emptyDescription={t.emptyPostsDescription}
          />
        </section>
      </div>
    </>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border-surface-border bg-surface flex flex-col items-center border px-6 py-12 text-center">
      <span className="bg-brand-soft text-brand grid size-12 place-items-center rounded-full">
        <Search className="size-5" />
      </span>
      <h2 className="text-primary mt-4 text-lg font-semibold">{title}</h2>
      <p className="text-muted mt-2 max-w-md text-sm">{description}</p>
    </div>
  );
}

function ResultSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="rounded-card border-surface-border bg-surface flex items-center gap-3 border p-3"
        >
          <div className="bg-surface-muted size-11 animate-pulse rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-surface-muted h-3 w-2/3 animate-pulse rounded" />
            <div className="bg-surface-muted h-2 w-1/2 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
