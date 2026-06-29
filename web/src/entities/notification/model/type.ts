export type NotificationType =
  | "FRIEND_REQUEST_RECEIVED"
  | "FRIEND_REQUEST_ACCEPTED"
  | "POST_REACTION"
  | "POST_COMMENT"
  | "POST_SHARE"
  | "COMMENT_REPLY"
  | "COMMENT_REACTION"
  | "MESSAGE_RECEIVED"
  | "MENTIONED"
  | "POST_REPORT_SUBMITTED"
  | "POST_REPORT_CANCELED"
  | "GROUP_PRIVACY_CHANGED"
  | "GROUP_JOIN_REQUEST_RECEIVED";

export type Notification = {
  id: string;
  type: NotificationType;
  createdAt?: string;
};
