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
import { Search, X } from "lucide-react";
import { getProfileRoute, ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { Avatar } from "@/shared/ui/Avatar";
import { useDebouncedValue } from "../model/use-debounced-value";
import { useSearchPreviewQuery } from "../model/use-search-preview-query";

type AppSearchBoxProps = {
  className?: string;
};

export function AppSearchBox({ className }: AppSearchBoxProps) {
  const t = useTranslations().search;
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 250);
  const normalizedQuery = query.trim();
  const previewQuery = useSearchPreviewQuery(debouncedQuery);
  const users = previewQuery.data?.users ?? [];
  const posts = previewQuery.data?.posts ?? [];
  const searchHref = getSearchRoute(normalizedQuery);
  const canSearch = normalizedQuery.length >= 2;

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSearch) return;

    setIsOpen(false);
    router.push(searchHref);
  }

  return (
    <div
      ref={rootRef}
      className={cn("relative hidden min-w-0 flex-1 md:block md:max-w-md", className)}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-pill border-subtle bg-surface-muted text-muted flex min-w-0 items-center gap-3 border px-4 py-2 text-sm transition focus-within:border-brand-border focus-within:bg-surface"
      >
        <Search className="size-4 shrink-0" />
        <input
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          placeholder={t.placeholder}
          className="placeholder:text-muted text-primary min-w-0 flex-1 bg-transparent outline-none"
        />
        {query && (
          <button
            type="button"
            aria-label={t.clear}
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="text-muted hover:text-primary"
          >
            <X className="size-4" />
          </button>
        )}
      </form>

      {isOpen && query && (
        <div className="rounded-card border-surface-border bg-surface shadow-popover absolute top-full right-0 left-0 z-50 mt-2 overflow-hidden border p-2">
          {!canSearch ? (
            <p className="text-muted px-3 py-2 text-sm">{t.typeMore}</p>
          ) : previewQuery.isLoading ? (
            <SearchLoading />
          ) : previewQuery.isError ? (
            <p className="text-danger px-3 py-2 text-sm">{t.loadError}</p>
          ) : users.length === 0 && posts.length === 0 ? (
            <p className="text-muted px-3 py-2 text-sm">{t.empty}</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {users.length > 0 && (
                <SearchSection title={t.people}>
                  {users.map((user) => (
                    <Link
                      key={user.id}
                      href={getProfileRoute(user.id)}
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-surface-soft rounded-control flex items-center gap-3 px-3 py-2 transition"
                    >
                      <Avatar
                        src={user.avatarUrl}
                        alt={`${t.avatarAlt} ${user.fullName}`}
                        name={user.fullName}
                        size={36}
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
                      onClick={() => setIsOpen(false)}
                      className="hover:bg-surface-soft rounded-control block px-3 py-2 transition"
                    >
                      <p className="text-primary truncate text-sm font-semibold">
                        {post.author.fullName}
                      </p>
                      <p className="text-muted mt-1 line-clamp-2 text-sm">
                        {post.content || t.mediaPost}
                      </p>
                    </Link>
                  ))}
                </SearchSection>
              )}

              <Link
                href={searchHref}
                onClick={() => setIsOpen(false)}
                className="text-brand hover:bg-brand-soft rounded-control mt-1 block px-3 py-2 text-sm font-semibold transition"
              >
                {t.viewAll}
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
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
    <section className="py-1">
      <h3 className="text-muted px-3 py-1 text-xs font-semibold uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

function SearchLoading() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-2 py-1">
          <div className="bg-surface-muted size-9 animate-pulse rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="bg-surface-muted h-3 w-3/4 animate-pulse rounded" />
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
