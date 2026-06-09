import type { AppMessages } from "@/shared/i18n";
import { Notification } from "../model/type";

type NotificationItemProps = {
  notification: Notification;
  t: AppMessages["notifications"];
};

export function NotificationItem({ notification, t }: NotificationItemProps) {
  return (
    <article className="border-subtle bg-surface-soft hover:bg-surface-muted rounded-control border p-3 transition">
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
    case "POST_SHARE":
      return t.postShare;
    default:
      return t.fallback;
  }
}
