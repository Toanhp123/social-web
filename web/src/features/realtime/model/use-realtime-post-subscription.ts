"use client";

import { useEffect } from "react";
import { useRealtime } from "../provider/RealtimeProvider";

type UseRealtimePostSubscriptionInput = {
  postId: string | null;
  enabled?: boolean;
};

export function useRealtimePostSubscription({
  postId,
  enabled = true,
}: UseRealtimePostSubscriptionInput) {
  const { socket } = useRealtime();

  useEffect(() => {
    if (!socket || !postId || !enabled) {
      return;
    }

    const subscribe = () => {
      socket.emit("realtime:subscribe", {
        topic: "post",
        postId,
      });
    };

    subscribe();

    socket.on("connect", subscribe);

    return () => {
      socket.off("connect", subscribe);

      socket.emit("realtime:unsubscribe", {
        topic: "post",
        postId,
      });
    };
  }, [socket, postId, enabled]);
}
