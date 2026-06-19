"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { getSearchRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { cn } from "@/shared/lib/utils";
import { useSearchPreviewController } from "../model/use-search-preview-controller";
import {
  SearchPreviewLoading,
  SearchPreviewPostItem,
  SearchPreviewSection,
  SearchPreviewUserItem,
} from "./SearchPreviewItems";

type AppSearchBoxProps = {
  className?: string;
};

export function AppSearchBox({ className }: AppSearchBoxProps) {
  const t = useTranslations().search;
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { normalizedQuery, canSearch, previewQuery, users, posts } =
    useSearchPreviewController(query);
  const searchHref = getSearchRoute(normalizedQuery);

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
      className={cn(
        "relative hidden min-w-0 flex-1 md:block md:max-w-md",
        className,
      )}
    >
      <form
        onSubmit={handleSubmit}
        className="rounded-pill border-subtle bg-surface-muted text-muted focus-within:border-brand-border focus-within:bg-surface flex min-w-0 items-center gap-3 border px-4 py-2 text-sm transition"
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
            <SearchPreviewLoading />
          ) : previewQuery.isError ? (
            <p className="text-danger px-3 py-2 text-sm">{t.loadError}</p>
          ) : users.length === 0 && posts.length === 0 ? (
            <p className="text-muted px-3 py-2 text-sm">{t.empty}</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {users.length > 0 && (
                <SearchPreviewSection title={t.people}>
                  {users.map((user) => (
                    <SearchPreviewUserItem
                      key={user.id}
                      user={user}
                      t={t}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </SearchPreviewSection>
              )}

              {posts.length > 0 && (
                <SearchPreviewSection title={t.posts}>
                  {posts.map((post) => (
                    <SearchPreviewPostItem
                      key={post.id}
                      post={post}
                      href={searchHref}
                      t={t}
                      onClick={() => setIsOpen(false)}
                    />
                  ))}
                </SearchPreviewSection>
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
