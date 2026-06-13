"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { getProfileRoute, ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { Avatar } from "@/shared/ui/Avatar";
import { useDebouncedValue } from "../model/use-debounced-value";
import { useSearchPreviewQuery } from "../model/use-search-preview-query";

type MobileSearchButtonProps = {
  className?: string;
};

export function MobileSearchButton({ className }: MobileSearchButtonProps) {
  const t = useTranslations().search;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const normalizedQuery = query.trim();
  const previewQuery = useSearchPreviewQuery(debouncedQuery);
  const users = previewQuery.data?.users ?? [];
  const posts = previewQuery.data?.posts ?? [];
  const searchHref = getSearchRoute(normalizedQuery);
  const canSearch = normalizedQuery.length >= 2;

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => inputRef.current?.focus(), 0);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function closeSearch() {
    setIsOpen(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSearch) return;

    closeSearch();
    router.push(searchHref);
  }

  return (
    <>
      <button
        type="button"
        aria-label={t.title}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Search className="size-5" />
      </button>

      {isOpen &&
        createPortal(
          <div className="bg-app fixed inset-0 z-9999 flex flex-col">
            <div className="border-soft bg-surface-elevated/95 shrink-0 border-b px-3 py-3 backdrop-blur">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label={t.close}
                  className="rounded-pill text-secondary hover:bg-surface-soft hover:text-primary grid size-10 shrink-0 place-items-center transition"
                >
                  <ArrowLeft className="size-5" />
                </button>

                <div className="rounded-pill border-subtle bg-surface-muted text-muted focus-within:border-brand-border focus-within:bg-surface flex min-w-0 flex-1 items-center gap-2 border px-3 py-2 text-sm transition">
                  <Search className="size-4 shrink-0" />
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t.placeholder}
                    className="placeholder:text-muted text-primary min-w-0 flex-1 bg-transparent outline-none"
                  />
                  {query && (
                    <button
                      type="button"
                      aria-label={t.clear}
                      onClick={() => setQuery("")}
                      className="text-muted hover:text-primary"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
              {!query ? (
                <EmptySearchPrompt
                  title={t.startTitle}
                  description={t.typeMore}
                />
              ) : !canSearch ? (
                <EmptySearchPrompt title={t.title} description={t.typeMore} />
              ) : previewQuery.isLoading ? (
                <SearchLoading />
              ) : previewQuery.isError ? (
                <p className="text-danger bg-danger-soft rounded-card px-4 py-3 text-sm">
                  {t.loadError}
                </p>
              ) : users.length === 0 && posts.length === 0 ? (
                <EmptySearchPrompt title={t.empty} description={t.empty} />
              ) : (
                <div className="space-y-4">
                  {users.length > 0 && (
                    <SearchSection title={t.people}>
                      {users.map((user) => (
                        <Link
                          key={user.id}
                          href={getProfileRoute(user.id)}
                          onClick={closeSearch}
                          className="rounded-card border-surface-border bg-surface hover:bg-surface-soft flex items-center gap-3 border p-3 transition"
                        >
                          <Avatar
                            src={user.avatarUrl}
                            alt={`${t.avatarAlt} ${user.fullName}`}
                            name={user.fullName}
                            size={42}
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
                      ))}
                    </SearchSection>
                  )}

                  {posts.length > 0 && (
                    <SearchSection title={t.posts}>
                      {posts.map((post) => (
                        <Link
                          key={post.id}
                          href={searchHref}
                          onClick={closeSearch}
                          className="rounded-card border-surface-border bg-surface hover:bg-surface-soft block border p-3 transition"
                        >
                          <p className="text-primary truncate text-sm font-semibold">
                            {post.author.fullName}
                          </p>
                          <p className="text-muted mt-1 line-clamp-3 text-sm leading-5">
                            {post.content || t.mediaPost}
                          </p>
                        </Link>
                      ))}
                    </SearchSection>
                  )}

                  <Link
                    href={searchHref}
                    onClick={closeSearch}
                    className="rounded-pill bg-brand text-inverse hover:bg-brand-hover flex h-11 items-center justify-center px-4 text-sm font-semibold transition"
                  >
                    {t.viewAll}
                  </Link>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

function SearchSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-muted px-1 text-xs font-semibold uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

function EmptySearchPrompt({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-card border-surface-border bg-surface flex flex-col items-center border px-5 py-12 text-center">
      <span className="bg-brand-soft text-brand grid size-12 place-items-center rounded-full">
        <Search className="size-5" />
      </span>
      <h2 className="text-primary mt-4 text-base font-semibold">{title}</h2>
      <p className="text-muted mt-2 max-w-sm text-sm leading-6">
        {description}
      </p>
    </div>
  );
}

function SearchLoading() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
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

function getSearchRoute(query: string): string {
  const searchParams = new URLSearchParams();
  searchParams.set("q", query);

  return `${ROUTES.search}?${searchParams.toString()}`;
}
