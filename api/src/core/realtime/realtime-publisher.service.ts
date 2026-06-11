import { Injectable } from '@nestjs/common';
import { RealtimeGateway } from '@/core/realtime/realtime.gateway.js';
import type { RealtimeEventPayload } from '@/core/realtime/realtime-event.type.js';

type PostCreatedInput = {
  postId: string;
  authorId: string;
  visibility: string;
};

type PostCommentCreatedInput = {
  postId: string;
  commentId: string;
  parentId: string | null;
  authorId: string;
};

type PostReactionUpdatedInput = {
  postId: string;
  actorId: string;
  reactionType: string | null;
};

type NotificationCreatedInput = {
  id: string;
  userId: string;
  actorId: string | null;
  notificationType: string;
  refId: string | null;
  count: number;
  readAt: string | null;
  createdAt: string;
};

@Injectable()
export class RealtimePublisher {
  constructor(private readonly gateway: RealtimeGateway) {}

  publishFeedUpdated(): void {
    this.emitToPublicFeed({
      type: 'feed.updated',
      data: {
        scope: 'post-feed',
      },
    });
  }

  publishPostCreatedForAuthor(input: PostCreatedInput): void {
    this.emitToUser(input.authorId, {
      type: 'post.created',
      data: input,
    });
  }

  publishPostCommentCreated(input: PostCommentCreatedInput): void {
    this.emitToPost(input.postId, {
      type: 'post.comment.created',
      data: input,
    });
  }

  publishPostReactionUpdated(input: PostReactionUpdatedInput): void {
    this.emitToPost(input.postId, {
      type: 'post.reaction.updated',
      data: input,
    });
  }

  publishNotificationCreated(input: NotificationCreatedInput): void {
    this.emitToUser(input.userId, {
      type: 'notification.created',
      data: input,
    });
  }

  private emitToPublicFeed(input: Omit<RealtimeEventPayload, 'occurredAt'>) {
    this.gateway.emitToPublicFeed(this.createEvent(input));
  }

  private emitToPost(
    postId: string,
    input: Omit<RealtimeEventPayload, 'occurredAt'>,
  ) {
    this.gateway.emitToPost(postId, this.createEvent(input));
  }

  private emitToUser(
    userId: string,
    input: Omit<RealtimeEventPayload, 'occurredAt'>,
  ) {
    this.gateway.emitToUser(userId, this.createEvent(input));
  }

  private createEvent(
    input: Omit<RealtimeEventPayload, 'occurredAt'>,
  ): RealtimeEventPayload {
    return {
      ...input,
      occurredAt: new Date().toISOString(),
    };
  }
}
