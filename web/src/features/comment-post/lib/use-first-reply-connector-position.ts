"use client";

import { useLayoutEffect, useState, type RefObject } from "react";

type UseFirstReplyConnectorPositionParams = {
  enabled: boolean;
  commentItemRef: RefObject<HTMLDivElement | null>;
  repliesListRef: RefObject<HTMLDivElement | null>;
};

type FirstReplyConnectorPosition = {
  top: string;
  x: string;
};

const DEFAULT_FIRST_REPLY_CONNECTOR_POSITION: FirstReplyConnectorPosition = {
  top: "-2.5rem",
  x: "-1.5rem",
};

const PARENT_AVATAR_CONNECTOR_GAP = 4;

export function useFirstReplyConnectorPosition({
  enabled,
  commentItemRef,
  repliesListRef,
}: UseFirstReplyConnectorPositionParams) {
  const [position, setPosition] = useState(
    DEFAULT_FIRST_REPLY_CONNECTOR_POSITION,
  );

  useLayoutEffect(() => {
    if (!enabled) return;

    const commentItemElement = commentItemRef.current;
    const repliesListElement = repliesListRef.current;

    if (!commentItemElement || !repliesListElement) return;

    const avatarElement = commentItemElement.querySelector<HTMLElement>(
      "[data-comment-avatar]",
    );

    if (!avatarElement) return;

    const updatePosition = () => {
      const avatarRect = avatarElement.getBoundingClientRect();
      const repliesListRect = repliesListElement.getBoundingClientRect();

      const avatarCenterY =
        avatarRect.top + avatarRect.height / 2 - repliesListRect.top;

      const avatarCenterX =
        avatarRect.left + avatarRect.width / 2 - repliesListRect.left;

      const connectorStartY =
        avatarCenterY + avatarRect.height / 2 + PARENT_AVATAR_CONNECTOR_GAP;

      setPosition({
        top: `${connectorStartY}px`,
        x: `${avatarCenterX}px`,
      });
    };

    updatePosition();

    const resizeObserver = new ResizeObserver(updatePosition);

    resizeObserver.observe(commentItemElement);
    resizeObserver.observe(repliesListElement);
    resizeObserver.observe(avatarElement);

    return () => {
      resizeObserver.disconnect();
    };
  }, [enabled, commentItemRef, repliesListRef]);

  return position;
}
