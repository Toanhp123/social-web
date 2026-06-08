"use client";

import { type CSSProperties, type ReactNode } from "react";
import { cn } from "@/shared/lib/utils";
import { useReplyConnectorPosition } from "../lib/use-reply-connector-position";

type CommentReplyConnectorProps = {
  children: ReactNode;
  enabled: boolean;
  isFirst: boolean;
  isLast: boolean;
  firstReplyConnectorTop: string;
  replyConnectorX: string;
};

type ConnectorStyle = CSSProperties & {
  "--first-reply-connector-top": string;
  "--reply-connector-x": string;
  "--reply-connector-y": string;
  "--reply-avatar-left-x": string;
  "--reply-connector-radius": string;
  "--reply-connector-end-gap": string;
};

const DEFAULT_REPLY_CONNECTOR_RADIUS = "12px";
const DEFAULT_REPLY_CONNECTOR_END_GAP = "6px";

export function CommentReplyConnector({
  children,
  enabled,
  isFirst,
  isLast,
  firstReplyConnectorTop,
  replyConnectorX,
}: CommentReplyConnectorProps) {
  const { rootRef, replyConnectorY, replyAvatarLeftX } =
    useReplyConnectorPosition({ enabled });

  const style: ConnectorStyle = {
    "--first-reply-connector-top": firstReplyConnectorTop,
    "--reply-connector-x": replyConnectorX,
    "--reply-connector-y": replyConnectorY,
    "--reply-avatar-left-x": replyAvatarLeftX,
    "--reply-connector-radius": DEFAULT_REPLY_CONNECTOR_RADIUS,
    "--reply-connector-end-gap": DEFAULT_REPLY_CONNECTOR_END_GAP,
  };

  return (
    <div
      ref={rootRef}
      style={style}
      className={cn("relative", enabled && getConnectorClass(isFirst, isLast))}
    >
      {children}
    </div>
  );
}

function getConnectorClass(isFirst: boolean, isLast: boolean) {
  return cn(
    // nhánh cong: từ trục dọc bo vào mép avatar reply
    "before:absolute",
    "before:left-[var(--reply-connector-x)]",
    "before:top-[calc(var(--reply-connector-y)_-_var(--reply-connector-radius))]",
    "before:h-[var(--reply-connector-radius)]",
    "before:w-[calc(var(--reply-avatar-left-x)_-_var(--reply-connector-x)_-_var(--reply-connector-end-gap))]",
    "before:rounded-bl-[var(--reply-connector-radius)]",
    "before:border-b-2",
    "before:border-l-2",
    "before:border-[var(--comment-connector)]",
    "before:bg-transparent",

    // trục dọc
    "after:absolute",
    "after:left-[var(--reply-connector-x)]",
    "after:w-0",
    "after:border-l-2",
    "after:border-[var(--comment-connector)]",

    isFirst &&
      isLast &&
      "after:top-[var(--first-reply-connector-top)] after:bottom-[calc(100%_-_var(--reply-connector-y)_+_var(--reply-connector-radius))]",

    isFirst &&
      !isLast &&
      "after:top-[var(--first-reply-connector-top)] after:-bottom-3",

    !isFirst &&
      isLast &&
      "after:-top-3 after:bottom-[calc(100%_-_var(--reply-connector-y)_+_var(--reply-connector-radius))]",

    !isFirst && !isLast && "after:-top-3 after:-bottom-3",
  );
}
