"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, Newspaper, WifiOff } from "lucide-react";
import { PostCard, type Post, type ReactionType } from "@/entities/post";
import { CommentForm, PostCommentsList } from "@/features/comment-post";
import { usePostFeedQuery } from "@/features/post-feed";
import { useReactPostMutation } from "@/features/react-post";
import { useRealtimePostSubscription } from "@/features/realtime";
import { SharePostDialog } from "@/features/share-post";
import { CALLBACK_URL_SEARCH_PARAM, ROUTES } from "@/shared/config/routes";
import { useTranslations } from "@/shared/i18n";
import { PostDetailsDialog } from "@/widgets/post-details-dialog";
import { FeedHeader } from "./FeedHeader";
import { FeedNotice } from "./FeedNotice";
import { PostSkeleton } from "./PostSkeleton";

type PostFeedProps = {
  canInteract?: boolean;
  authorId?: string;
  showHeader?: boolean;
};

export function PostFeed({
  canInteract = true,
  authorId,
  showHeader = true,
}: PostFeedProps) {
  const t = useTranslations().feed;
  const router = useRouter();
  const pathname = usePathname();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const feedQuery = usePostFeedQuery({ authorId });
  const reactPostMutation = useReactPostMutation();
  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data],
  );
  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  );
  useRealtimePostSubscription({
    postId: selectedPost?.id ?? null,
    enabled: Boolean(selectedPost),
  });
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

  function openPostDetails(postId: string) {
    setSelectedPostId(postId);
  }

  function closePostDetails() {
    setSelectedPostId(null);
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
    <section
      className="space-y-4"
      aria-labelledby={showHeader ? "feed-title" : undefined}
    >
      {showHeader && (
        <FeedHeader
          isRefetching={feedQuery.isRefetching}
          onRefresh={() => void feedQuery.refetch()}
        />
      )}

      {feedQuery.isLoading ? (
        <div className="space-y-4" aria-label={t.loadingFeed}>
          <PostSkeleton />
          <PostSkeleton compact />
          <PostSkeleton />
        </div>
      ) : errorMessage ? (
        <FeedNotice
          icon={<WifiOff className="size-5" />}
          title={t.cannotLoad}
          description={errorMessage}
          actionLabel={t.retry}
          onAction={() => void feedQuery.refetch()}
        />
      ) : posts.length === 0 ? (
        <FeedNotice
          icon={<Newspaper className="size-5" />}
          title={t.emptyTitle}
          description={t.emptyDescription}
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
              onMediaClick={() => openPostDetails(post.id)}
              onCommentClick={() => openPostDetails(post.id)}
              onShareClick={() => handleShareClick(post)}
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

      {selectedPost && (
        <PostDetailsDialog
          key={selectedPost.id}
          open
          post={selectedPost}
          metaLabel={formatPostDate(selectedPost.createdAt)}
          isReacting={
            reactPostMutation.isPending &&
            reactPostMutation.variables?.postId === selectedPost.id
          }
          onClose={closePostDetails}
          onReactionChange={(type) =>
            handleReactionChange(selectedPost.id, type)
          }
          onShareClick={() => handleShareClick(selectedPost)}
          commentsSlot={
            <PostCommentsList
              postId={selectedPost.id}
              canInteract={canInteract}
              onRequireAuth={requireAuth}
            />
          }
          commentFormSlot={
            <CommentForm
              postId={selectedPost.id}
              canInteract={canInteract}
              onRequireAuth={requireAuth}
            />
          }
        />
      )}

      <div ref={loadMoreRef} className="h-1" />

      {feedQuery.isFetchingNextPage && (
        <div className="rounded-card border-surface-border bg-surface text-muted shadow-card flex items-center justify-center gap-2 border py-4 text-sm">
          <Loader2 className="size-4 animate-spin" />
          {t.loadingMore}
        </div>
      )}

      {!feedQuery.hasNextPage && posts.length > 0 && (
        <p className="text-secondary py-4 text-center text-sm">{t.end}</p>
      )}
    </section>
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
