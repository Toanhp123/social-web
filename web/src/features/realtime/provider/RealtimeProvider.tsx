"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import {
  fetchPostReactionStats,
  type PostPage,
  type PostReactionStats,
} from "@/entities/post";
import { commentPostQueryKeys } from "@/features/comment-post";
import { postFeedQueryKeys } from "@/features/post-feed";
import type {
  RealtimeEventPayload,
  RealtimeNotification,
  RealtimeSession,
} from "../model/realtime-event";

type RealtimeContextValue = {
  isConnected: boolean;
  lastEvent: RealtimeEventPayload | null;
  socket: Socket | null;
  notifications: RealtimeNotification[];
  unreadNotificationCount: number;
  clearUnreadNotifications: () => void;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

type RealtimeProviderProps = {
  children: ReactNode;
};

export function RealtimeProvider({ children }: RealtimeProviderProps) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEventPayload | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState<RealtimeNotification[]>(
    [],
  );

  useEffect(() => {
    let isDisposed = false;
    let nextSocket: Socket | null = null;

    async function connect() {
      const session = await getRealtimeSession();

      if (isDisposed || !session?.socketUrl) {
        return;
      }

      nextSocket = io(`${session.socketUrl}/realtime`, {
        auth: {
          token: session.token ?? undefined,
        },
        transports: ["websocket"],
      });

      nextSocket.on("connect", () => setIsConnected(true));
      nextSocket.on("disconnect", () => setIsConnected(false));
      nextSocket.on("realtime:event", (event: RealtimeEventPayload) => {
        setLastEvent(event);
        if (event.type === "notification.created") {
          const notification = toRealtimeNotification(event.data);

          if (notification) {
            setNotifications((items) => [notification, ...items]);
            setUnreadNotificationCount((count) => count + 1);
          }
        }
        void handleRealtimeEvent(event, queryClient);
      });

      setSocket(nextSocket);
    }

    void connect();

    return () => {
      isDisposed = true;
      nextSocket?.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [queryClient]);

  const value = useMemo(
    () => ({
      isConnected,
      lastEvent,
      socket,
      notifications,
      unreadNotificationCount,
      clearUnreadNotifications: () => setUnreadNotificationCount(0),
    }),
    [isConnected, lastEvent, socket, unreadNotificationCount, notifications],
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used within RealtimeProvider");
  }

  return context;
}

async function getRealtimeSession(): Promise<RealtimeSession | null> {
  const response = await fetch("/api/realtime/session", {
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const session = (await response.json()) as {
    socketUrl?: string;
    token?: string | null;
  };

  if (!session.socketUrl) {
    return null;
  }

  return {
    socketUrl: session.socketUrl,
    token: session.token ?? null,
  };
}

async function handleRealtimeEvent(
  event: RealtimeEventPayload,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<void> {
  if (event.type === "feed.updated" || event.type === "post.created") {
    void queryClient.invalidateQueries({ queryKey: postFeedQueryKeys.all });
    return;
  }

  if (event.type === "post.reaction.updated") {
    const postId = getEventPostId(event.data);

    if (postId) {
      await refreshPostReactionStats(queryClient, postId);
    }

    void queryClient.invalidateQueries({ queryKey: postFeedQueryKeys.all });
    return;
  }

  if (event.type === "post.comment.created") {
    const postId = getEventPostId(event.data);

    if (postId) {
      await refreshPostReactionStats(queryClient, postId);
    }

    void queryClient.invalidateQueries({ queryKey: postFeedQueryKeys.all });

    if (postId) {
      void queryClient.invalidateQueries({
        queryKey: commentPostQueryKeys.postComments(postId),
      });
    }
  }
}

async function refreshPostReactionStats(
  queryClient: ReturnType<typeof useQueryClient>,
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

function toRealtimeNotification(data: unknown): RealtimeNotification | null {
  if (!data || typeof data !== "object") return null;

  const n = data as Record<string, unknown>;

  if (typeof n.id !== "string") return null;
  if (typeof n.userId !== "string") return null;
  if (typeof n.actorId !== "string") return null;
  if (typeof n.notificationType !== "string") return null;
  if (typeof n.refId !== "string") return null;

  return {
    id: n.id,
    userId: n.userId,
    actorId: n.actorId,
    type: n.notificationType as RealtimeNotification["type"],
    refId: n.refId,
    count: typeof n.count === "number" ? n.count : 1,
    readAt: typeof n.readAt === "string" ? n.readAt : null,
    createdAt:
      typeof n.createdAt === "string" ? n.createdAt : new Date().toISOString(),
  };
}
