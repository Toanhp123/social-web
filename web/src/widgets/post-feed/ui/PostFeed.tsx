"use client";

import { Loader2, Newspaper, WifiOff } from "lucide-react";
import { PostCard } from "@/entities/post";
import { CommentForm, PostCommentsList } from "@/features/comment-post";
import { PostManagementMenu } from "@/features/manage-post";
import { SharePostDialog } from "@/features/share-post";
import { useTranslations } from "@/shared/i18n";
import { PostDetailsDialog } from "@/widgets/post-details-dialog";
import { formatPostDate } from "../lib/format-post-date";
import { usePostFeedController } from "../model/use-post-feed-controller";
import { FeedHeader } from "./FeedHeader";
import { FeedNotice } from "./FeedNotice";
import { PostSkeleton } from "./PostSkeleton";

type PostFeedProps = {
  canInteract?: boolean;
  authorId?: string;
  groupId?: string;
  search?: string;
  showHeader?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function PostFeed({
  canInteract = true,
  authorId,
  groupId,
  search,
  showHeader = false,
  emptyTitle,
  emptyDescription,
}: PostFeedProps) {
  const t = useTranslations().feed;
  const {
    density,
    feedQuery,
    posts,
    selectedPost,
    sharingPost,
    loadMoreRef,
    reactPostMutation,
    errorMessage,
    requireAuth,
    handleReactionChange,
    openPostDetails,
    closePostDetails,
    handleShareClick,
    closeShareDialog,
    handlePostRemoved,
  } = usePostFeedController({
    canInteract,
    authorId,
    groupId,
    search,
  });

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
          <PostSkeleton density={density} />
          <PostSkeleton density={density} compact />
          <PostSkeleton density={density} />
        </div>
      ) : errorMessage ? (
        <FeedNotice
          icon={<WifiOff className="size-5" />}
          title={t.cannotLoad}
          description={errorMessage}
          density={density}
          actionLabel={t.retry}
          onAction={() => void feedQuery.refetch()}
        />
      ) : posts.length === 0 ? (
        <FeedNotice
          icon={<Newspaper className="size-5" />}
          title={emptyTitle ?? t.emptyTitle}
          description={emptyDescription ?? t.emptyDescription}
          density={density}
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              metaLabel={formatPostDate(post.createdAt)}
              density={density}
              isReacting={
                reactPostMutation.isPending &&
                reactPostMutation.variables?.postId === post.id
              }
              onReactionChange={(type) => handleReactionChange(post.id, type)}
              onMediaClick={() => openPostDetails(post.id)}
              onCommentClick={() => openPostDetails(post.id)}
              onShareClick={() => handleShareClick(post)}
              menuSlot={
                <PostManagementMenu
                  post={post}
                  canInteract={canInteract}
                  onRequireAuth={requireAuth}
                  onRemoved={() => handlePostRemoved(post.id)}
                />
              }
            />
          ))}
        </div>
      )}

      {sharingPost && (
        <SharePostDialog
          post={sharingPost}
          open={Boolean(sharingPost)}
          onClose={closeShareDialog}
        />
      )}

      {selectedPost && (
        <PostDetailsDialog
          key={selectedPost.id}
          open
          post={selectedPost}
          metaLabel={formatPostDate(selectedPost.createdAt)}
          density={density}
          isReacting={
            reactPostMutation.isPending &&
            reactPostMutation.variables?.postId === selectedPost.id
          }
          onClose={closePostDetails}
          onReactionChange={(type) =>
            handleReactionChange(selectedPost.id, type)
          }
          onShareClick={() => handleShareClick(selectedPost)}
          menuSlot={
            <PostManagementMenu
              post={selectedPost}
              canInteract={canInteract}
              onRequireAuth={requireAuth}
              onRemoved={closePostDetails}
            />
          }
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
