"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { ArrowLeft, Search, X } from "lucide-react";
import { getSearchRoute } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { useSearchPreviewController } from "../model/use-search-preview-controller";
import {
  SearchPreviewLoading,
  SearchPreviewPostItem,
  SearchPreviewSection,
  SearchPreviewUserItem,
} from "./SearchPreviewItems";

type MobileSearchOverlayTriggerProps = {
  className?: string;
};

export function MobileSearchOverlayTrigger({
  className,
}: MobileSearchOverlayTriggerProps) {
  const t = useTranslations().search;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { normalizedQuery, canSearch, previewQuery, users, posts } =
    useSearchPreviewController(query);
  const searchHref = getSearchRoute(normalizedQuery);

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
                <SearchPreviewLoading density="comfortable" />
              ) : previewQuery.isError ? (
                <p className="text-danger bg-danger-soft rounded-card px-4 py-3 text-sm">
                  {t.loadError}
                </p>
              ) : users.length === 0 && posts.length === 0 ? (
                <EmptySearchPrompt title={t.empty} description={t.empty} />
              ) : (
                <div className="space-y-4">
                  {users.length > 0 && (
                    <SearchPreviewSection
                      title={t.people}
                      density="comfortable"
                    >
                      {users.map((user) => (
                        <SearchPreviewUserItem
                          key={user.id}
                          user={user}
                          t={t}
                          density="comfortable"
                          onClick={closeSearch}
                        />
                      ))}
                    </SearchPreviewSection>
                  )}

                  {posts.length > 0 && (
                    <SearchPreviewSection title={t.posts} density="comfortable">
                      {posts.map((post) => (
                        <SearchPreviewPostItem
                          key={post.id}
                          post={post}
                          href={searchHref}
                          t={t}
                          density="comfortable"
                          onClick={closeSearch}
                        />
                      ))}
                    </SearchPreviewSection>
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
