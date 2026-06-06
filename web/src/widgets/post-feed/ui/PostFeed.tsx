"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Newspaper, RefreshCw, WifiOff } from "lucide-react";
import { PostCard, type Post, type ReactionType } from "@/entities/post";
import { PostComments } from "@/features/comment-post";
import { usePostFeedQuery } from "@/features/post-feed";
import { useReactPostMutation } from "@/features/react-post";
import { SharePostDialog } from "@/features/share-post";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";

type PostFeedProps = {
  canInteract?: boolean;
};

export function PostFeed({ canInteract = true }: PostFeedProps) {
  const router = useRouter();
  const pathname = usePathname();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [openCommentsPostIds, setOpenCommentsPostIds] = useState<
    Record<string, boolean>
  >({});
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const feedQuery = usePostFeedQuery();
  const reactPostMutation = useReactPostMutation();
  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data],
  );
  const errorMessage =
    feedQuery.error instanceof Error ? feedQuery.error.message : "";

  function requireAuth() {
    const callbackUrl = pathname ?? ROUTES.home;
    const searchParams = new URLSearchParams();

    searchParams.set(CALLBACK_URL_SEARCH_PARAM, callbackUrl);

    router.push(`${ROUTES.login}?${searchParams.toString()}`);
  }

  function handleReactionChange(postId: string, type: ReactionType | null) {
    if (!canInteract) {
      requireAuth();
      return;
    }

    reactPostMutation.mutate({ postId, type });
  }

  function toggleComments(postId: string) {
    setOpenCommentsPostIds((current) => ({
      ...current,
      [postId]: !current[postId],
    }));
  }

  function handleShareClick(post: Post) {
    if (!canInteract) {
      requireAuth();
      return;
    }

    setSharingPost(post);
  }

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
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white bg-white px-4 py-3 shadow-sm shadow-zinc-200/70">
        <div>
          <h2 id="feed-title" className="text-lg font-semibold text-zinc-950">
            Moi nhat
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Bai viet moi tu cong dong se xuat hien tai day.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void feedQuery.refetch()}
          disabled={feedQuery.isRefetching}
          className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 shadow-sm hover:border-blue-200 hover:text-blue-600 disabled:opacity-60"
        >
          <RefreshCw
            className={["size-4", feedQuery.isRefetching ? "animate-spin" : ""]
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
            <PostCard
              key={post.id}
              post={post}
              metaLabel={formatPostDate(post.createdAt)}
              isReacting={
                reactPostMutation.isPending &&
                reactPostMutation.variables?.postId === post.id
              }
              onReactionChange={(type) => handleReactionChange(post.id, type)}
              onCommentClick={() => toggleComments(post.id)}
              onShareClick={() => handleShareClick(post)}
              commentsSlot={
                openCommentsPostIds[post.id] ? (
                  <PostComments
                    postId={post.id}
                    canInteract={canInteract}
                    onRequireAuth={requireAuth}
                  />
                ) : null
              }
            />
          ))}
        </div>
      )}

      {sharingPost && (
        <SharePostDialog
          post={sharingPost}
          open={Boolean(sharingPost)}
          onClose={() => setSharingPost(null)}
        />
      )}

      <div ref={loadMoreRef} className="h-1" />

      {feedQuery.isFetchingNextPage && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white bg-white py-4 text-sm text-zinc-500 shadow-sm shadow-zinc-200/70">
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
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-6 shadow-sm shadow-zinc-200/70">
      <div className="flex items-start gap-4">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-zinc-950">{title}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
            {description}
          </p>
          {actionLabel && onAction && (
            <button
              type="button"
              onClick={onAction}
              className="mt-4 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
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
    <div className="rounded-2xl border border-white bg-white p-4 opacity-80 shadow-sm shadow-zinc-200/70">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-zinc-100" />
        <div className="space-y-2">
          <div className="h-3 w-32 rounded-full bg-zinc-100" />
          <div className="h-2.5 w-20 rounded-full bg-zinc-100" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-3 w-full rounded-full bg-zinc-100" />
        <div className="h-3 w-10/12 rounded-full bg-zinc-100" />
        {!compact && <div className="h-3 w-7/12 rounded-full bg-zinc-100" />}
      </div>
      {!compact && <div className="mt-4 aspect-video rounded-xl bg-zinc-100" />}
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
