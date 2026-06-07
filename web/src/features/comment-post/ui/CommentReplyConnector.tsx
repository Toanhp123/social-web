"use client";

import { type CSSProperties, type ReactNode } from "react";
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
};

const DEFAULT_REPLY_CONNECTOR_RADIUS = "12px";

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
  };

  return (
    <div
      ref={rootRef}
      style={style}
      className={["relative", enabled ? getConnectorClass(isFirst, isLast) : ""]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </div>
  );
}
function getConnectorClass(isFirst: boolean, isLast: boolean) {
  return [
    // nhánh cong: từ trục dọc bo vào mép avatar reply
    [
      "before:absolute",
      "before:left-[var(--reply-connector-x)]",
      "before:top-[calc(var(--reply-connector-y)_-_var(--reply-connector-radius))]",
      "before:h-[var(--reply-connector-radius)]",
      "before:w-[calc(var(--reply-avatar-left-x)_-_var(--reply-connector-x))]",
      "before:rounded-bl-[var(--reply-connector-radius)]",
      "before:border-b",
      "before:border-l",
      "before:border-zinc-200",
      "before:bg-transparent",
    ].join(" "),

    // trục dọc
    [
      "after:absolute",
      "after:left-[var(--reply-connector-x)]",
      "after:w-px",
      "after:-translate-x-1/2",
      "after:rounded-full",
      "after:bg-zinc-200",
    ].join(" "),

    // chỉ có 1 reply: trục dọc dừng ở đầu đoạn cong
    isFirst && isLast
      ? "after:top-[var(--first-reply-connector-top)] after:bottom-[calc(100%_-_var(--reply-connector-y)_+_var(--reply-connector-radius))]"
      : "",

    // reply đầu nhưng còn reply sau: trục dọc vẫn kéo xuống
    isFirst && !isLast
      ? "after:top-[var(--first-reply-connector-top)] after:-bottom-3"
      : "",

    // reply cuối: trục dọc dừng ở đầu đoạn cong
    !isFirst && isLast
      ? "after:-top-3 after:bottom-[calc(100%_-_var(--reply-connector-y)_+_var(--reply-connector-radius))]"
      : "",

    // reply giữa: trục dọc xuyên qua
    !isFirst && !isLast ? "after:-top-3 after:-bottom-3" : "",
  ]
    .filter(Boolean)
    .join(" ");
}
