"use client";

import { useMemo, useRef, useState } from "react";
import type { Post, ReactionType } from "@/entities/post";
import { usePostFeedQuery } from "@/features/post-feed";
import { useReactPostMutation } from "@/features/react-post";
import { useRealtimePostSubscription } from "@/features/realtime";
import { useRequireAuthRedirect } from "@/shared/lib/use-require-auth-redirect";
import { useInfiniteFeedObserver } from "./use-infinite-feed-observer";
import { usePostFeedDensity } from "./use-post-feed-density";

type UsePostFeedControllerInput = {
  canInteract: boolean;
  authorId?: string;
  search?: string;
};

export function usePostFeedController({
  canInteract,
  authorId,
  search,
}: UsePostFeedControllerInput) {
  const requireAuth = useRequireAuthRedirect();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [sharingPost, setSharingPost] = useState<Post | null>(null);
  const density = usePostFeedDensity();
  const feedQuery = usePostFeedQuery({ authorId, search });
  const reactPostMutation = useReactPostMutation();
  const posts = useMemo(
    () => feedQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [feedQuery.data],
  );
  const selectedPost = useMemo(
    () => posts.find((post) => post.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  );
  const errorMessage =
    feedQuery.error instanceof Error ? feedQuery.error.message : "";

  useRealtimePostSubscription({
    postId: selectedPost?.id ?? null,
    enabled: Boolean(selectedPost),
  });

  useInfiniteFeedObserver({
    targetRef: loadMoreRef,
    hasNextPage: Boolean(feedQuery.hasNextPage),
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    fetchNextPage: feedQuery.fetchNextPage,
  });

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

  function closeShareDialog() {
    setSharingPost(null);
  }

  function handlePostRemoved(postId: string) {
    if (selectedPostId === postId) {
      closePostDetails();
    }
  }

  return {
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
  };
}
