"use client";

import { useLayoutEffect, useRef, useState } from "react";

type ReplyConnectorPosition = {
  y: string;
  avatarLeftX: string;
};

const DEFAULT_REPLY_CONNECTOR_POSITION: ReplyConnectorPosition = {
  y: "20px",
  avatarLeftX: "0px",
};

type UseReplyConnectorPositionParams = {
  enabled: boolean;
};

export function useReplyConnectorPosition({
  enabled,
}: UseReplyConnectorPositionParams) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [position, setPosition] = useState(DEFAULT_REPLY_CONNECTOR_POSITION);

  useLayoutEffect(() => {
    if (!enabled) return;

    const rootElement = rootRef.current;
    if (!rootElement) return;

    const avatarElement = rootElement.querySelector<HTMLElement>(
      "[data-comment-avatar]",
    );

    if (!avatarElement) return;

    const updatePosition = () => {
      const rootRect = rootElement.getBoundingClientRect();
      const avatarRect = avatarElement.getBoundingClientRect();

      const avatarCenterY =
        avatarRect.top + avatarRect.height / 2 - rootRect.top;

      const avatarLeftX = avatarRect.left - rootRect.left;

      setPosition({
        y: `${avatarCenterY}px`,
        avatarLeftX: `${avatarLeftX}px`,
      });
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);

    resizeObserver.observe(rootElement);
    resizeObserver.observe(avatarElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled]);

  return {
    rootRef,
    replyConnectorY: position.y,
    replyAvatarLeftX: position.avatarLeftX,
  };
}
