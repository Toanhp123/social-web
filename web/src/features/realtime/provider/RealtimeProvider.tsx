"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io, type Socket } from "socket.io-client";
import { syncRealtimeQueryCache } from "../model/realtime-query-cache-sync";
import type {
  RealtimeEventPayload,
  RealtimeNotification,
  RealtimeSession,
} from "../model/realtime-event";
import { toRealtimeNotification } from "../model/realtime-notification.mapper";

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
        void syncRealtimeQueryCache(event, queryClient);
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
