export type NotificationType =
  | "POST_REACTION"
  | "POST_COMMENT"
  | "POST_SHARE"
  | "MENTIONED";

export type Notification = {
  id: string;
  type: NotificationType;
  createdAt?: string;
};
