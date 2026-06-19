import type { AppMessages } from "@/shared/i18n";
import { Notification } from "../model/type";

type NotificationItemProps = {
  notification: Notification;
  t: AppMessages["notifications"];
  density?: "compact" | "comfortable";
};

export function NotificationItem({
  notification,
  t,
  density = "comfortable",
}: NotificationItemProps) {
  return (
    <article
      className={[
        "border-subtle bg-surface-soft hover:bg-surface-muted rounded-control border transition",
        density === "compact" ? "p-2.5" : "p-3",
      ].join(" ")}
    >
      <p className="text-primary text-sm font-medium">
        {getNotificationMessage(notification.type, t)}
      </p>

      {notification.createdAt && (
        <time
          dateTime={notification.createdAt}
          className="text-muted mt-1 block text-xs"
        >
          {new Date(notification.createdAt).toLocaleString()}
        </time>
      )}
    </article>
  );
}

function getNotificationMessage(
  type: Notification["type"],
  t: AppMessages["notifications"],
): string {
  switch (type) {
    case "POST_REACTION":
      return t.postReaction;
    case "POST_COMMENT":
      return t.postComment;
    case "COMMENT_REPLY":
      return t.commentReply;
    case "POST_SHARE":
      return t.postShare;
    case "MENTIONED":
      return t.mentioned;
    case "POST_REPORT_SUBMITTED":
      return t.postReportSubmitted;
    case "POST_REPORT_CANCELED":
      return t.postReportCanceled;
    default:
      return t.fallback;
  }
}
