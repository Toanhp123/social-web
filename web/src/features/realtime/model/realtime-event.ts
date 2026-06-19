import type { PostVisibility, ReactionType } from "@/entities/post";
import type { NotificationType } from "@/entities/notification";

export type RealtimeEventPayload =
  | RealtimeConnectedEvent
  | FeedUpdatedEvent
  | PostCreatedEvent
  | PostReactionUpdatedEvent
  | PostCommentCreatedEvent
  | NotificationCreatedEvent
  | GenericRealtimeEvent;

export type RealtimeConnectedEvent = {
  type: "realtime.connected";
  data?: {
    authenticated?: boolean;
  };
  occurredAt: string;
};

export type FeedUpdatedEvent = {
  type: "feed.updated";
  data?: {
    scope?: "post-feed";
  };
  occurredAt: string;
};

export type PostCreatedEvent = {
  type: "post.created";
  data?: {
    postId?: string;
    authorId?: string;
    visibility?: PostVisibility;
  };
  occurredAt: string;
};

export type PostReactionUpdatedEvent = {
  type: "post.reaction.updated";
  data?: {
    postId?: string;
    actorId?: string;
    reactionType?: ReactionType | null;
  };
  occurredAt: string;
};

export type PostCommentCreatedEvent = {
  type: "post.comment.created";
  data?: {
    postId?: string;
    commentId?: string;
    parentId?: string | null;
    authorId?: string;
  };
  occurredAt: string;
};

export type NotificationCreatedEvent = {
  type: "notification.created";
  data?: {
    id?: string;
    userId?: string;
    actorId?: string | null;
    notificationType?: NotificationType;
    refId?: string | null;
    message?: string | null;
    count?: number;
    readAt?: string | null;
    createdAt?: string;
  };
  occurredAt: string;
};

export type GenericRealtimeEvent = {
  type: string;
  data?: unknown;
  occurredAt: string;
};

export type RealtimeSession = {
  socketUrl: string;
  token: string | null;
};

export type RealtimeNotification = {
  id: string;
  userId: string;
  actorId: string | null;
  type: NotificationType;
  refId: string | null;
  count: number;
  readAt: string | null;
  createdAt: string;
};
