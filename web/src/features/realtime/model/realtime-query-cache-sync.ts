import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import {
  fetchPostReactionStats,
  type PostPage,
  type PostReactionStats,
} from "@/entities/post";
import { commentPostQueryKeys } from "@/features/comment-post";
import { postFeedQueryKeys } from "@/features/post-feed";
import type { RealtimeEventPayload } from "./realtime-event";

export async function syncRealtimeQueryCache(
  event: RealtimeEventPayload,
  queryClient: QueryClient,
): Promise<void> {
  if (event.type === "feed.updated" || event.type === "post.created") {
    void queryClient.invalidateQueries({ queryKey: postFeedQueryKeys.all });
    return;
  }

  if (event.type === "post.reaction.updated") {
    const postId = getEventPostId(event.data);

    if (postId) {
      await refreshPostReactionStatsInFeedCache(queryClient, postId);
    }

    void queryClient.invalidateQueries({ queryKey: postFeedQueryKeys.all });
    return;
  }

  if (event.type === "post.comment.created") {
    const postId = getEventPostId(event.data);

    if (postId) {
      await refreshPostReactionStatsInFeedCache(queryClient, postId);
    }

    void queryClient.invalidateQueries({ queryKey: postFeedQueryKeys.all });

    if (postId) {
      void queryClient.invalidateQueries({
        queryKey: commentPostQueryKeys.postComments(postId),
      });
    }
  }
}

async function refreshPostReactionStatsInFeedCache(
  queryClient: QueryClient,
  postId: string,
): Promise<void> {
  try {
    const reactionStats = await fetchPostReactionStats(postId);

    if (!reactionStats) {
      return;
    }

    queryClient.setQueriesData<InfiniteData<PostPage>>(
      { queryKey: postFeedQueryKeys.all },
      (current) => replacePostReactionStats(current, postId, reactionStats),
    );
  } catch {
    return;
  }
}

function replacePostReactionStats(
  current: InfiniteData<PostPage> | undefined,
  postId: string,
  reactionStats: PostReactionStats,
): InfiniteData<PostPage> | undefined {
  if (!current) return current;

  return {
    ...current,
    pages: current.pages.map((page) => ({
      ...page,
      items: page.items.map((post) =>
        post.id === postId
          ? {
              ...post,
              reactionStats,
            }
          : post,
      ),
    })),
  };
}

function getEventPostId(data: unknown): string | null {
  if (!data || typeof data !== "object" || !("postId" in data)) {
    return null;
  }

  const postId = data.postId;

  return typeof postId === "string" && postId ? postId : null;
}
