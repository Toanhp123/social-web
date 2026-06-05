"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef } from "react";
import { Loader2, Newspaper, RefreshCw, WifiOff } from "lucide-react";
import { PostCard } from "@/entities/post";
import { usePostFeedQuery } from "@/features/post-feed";

export function PostFeed() {
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const feedQuery = usePostFeedQuery();
  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data],
  );
  const errorMessage =
    feedQuery.error instanceof Error ? feedQuery.error.message : "";

  useEffect(() => {
    const target = loadMoreRef.current;

    if (!target || !feedQuery.hasNextPage) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (
          entry.isIntersecting &&
          feedQuery.hasNextPage &&
          !feedQuery.isFetchingNextPage
        ) {
          void feedQuery.fetchNextPage();
        }
      },
      { rootMargin: "480px 0px" },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [feedQuery]);

  return (
    <section className="space-y-4" aria-labelledby="feed-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="feed-title" className="text-lg font-semibold text-white">
            Bang tin
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Bai viet moi se xuat hien tai day.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void feedQuery.refetch()}
          disabled={feedQuery.isRefetching}
          className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-300 hover:border-zinc-700 hover:text-white disabled:opacity-60"
        >
          <RefreshCw
            className={[
              "size-4",
              feedQuery.isRefetching ? "animate-spin" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          />
          Lam moi
        </button>
      </div>

      {feedQuery.isLoading ? (
        <div className="space-y-4" aria-label="Dang tai bang tin">
          <PostSkeleton />
          <PostSkeleton compact />
          <PostSkeleton />
        </div>
      ) : errorMessage ? (
        <FeedNotice
          icon={<WifiOff className="size-5" />}
          title="Khong tai duoc bang tin"
          description={errorMessage}
          actionLabel="Thu lai"
          onAction={() => void feedQuery.refetch()}
        />
      ) : posts.length === 0 ? (
        <FeedNotice
          icon={<Newspaper className="size-5" />}
          title="Chua co bai viet nao"
          description="Dang bai dau tien de bat dau bang tin cua ban."
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} metaLabel={formatPostDate(post.createdAt)} />
          ))}
        </div>
      )}

      <div ref={loadMoreRef} className="h-1" />

      {feedQuery.isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-900 bg-zinc-950/60 py-4 text-sm text-zinc-400">
          <Loader2 className="size-4 animate-spin" />
          Dang tai them
        </div>
      )}

      {!feedQuery.hasNextPage && posts.length > 0 && (
        <p className="py-4 text-center text-sm text-zinc-600">
          Ban da xem het bai viet hien co.
        </p>
      )}
    </section>
  );
}

type FeedNoticeProps = {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

function FeedNotice({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: FeedNoticeProps) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-6">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-500/10 text-blue-300">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-white">{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
            >
              {actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PostSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div className="rounded-2xl border border-zinc-900 bg-zinc-950/40 p-4 opacity-70">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-zinc-900" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-full bg-zinc-900" />
          <div className="h-2.5 w-20 rounded-full bg-zinc-900" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded-full bg-zinc-900" />
        <div className="h-3 w-10/12 rounded-full bg-zinc-900" />
        {!compact && <div className="h-3 w-7/12 rounded-full bg-zinc-900" />}
      </div>
      {!compact && <div className="mt-4 aspect-video rounded-xl bg-zinc-900" />}
    </div>
  );
}

function formatPostDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
