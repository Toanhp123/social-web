import { Inject, Injectable } from '@nestjs/common';
import {
  COMMENT_REPOSITORY,
  POST_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { NotifyMentionedUsersService } from '@/modules/notifications/application/services/notify-mentioned-users.service.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import { CommentDraft } from '@/modules/comments/domain/entities/comment-draft.entity.js';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CommentRepository } from '@/modules/comments/domain/repositories/comment.repository.interface.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';

export type CreateCommentServiceInput = {
  userId: string;
  postId: string;
  content: string;
  parentId?: string;
};

@Injectable()
export class CreateCommentService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,

    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    private readonly realtimePublisher: RealtimePublisher,

    private readonly createNotificationService: CreateNotificationService,

    private readonly notifyMentionedUsersService: NotifyMentionedUsersService,
  ) {}

  async execute(input: CreateCommentServiceInput): Promise<Comment> {
    const draft = CommentDraft.create(input);

    const comment = await this.unitOfWork.execute(() =>
      this.commentRepository.create(draft.toCreateInput()),
    );

    await this.postFeedCacheInvalidation.invalidatePost(comment.postId);
    this.publishCommentCreated(comment);
    await this.notifyPostActivity(comment);
    await this.notifyMentionedUsers(comment);

    return comment;
  }

  private publishCommentCreated(comment: Comment): void {
    this.realtimePublisher.publishPostCommentCreated({
      postId: comment.postId,
      commentId: comment.id,
      parentId: comment.parentId,
      authorId: comment.author.id,
    });
  }

  private async notifyPostActivity(comment: Comment): Promise<void> {
    const [postAuthorId, parentAuthorId] = await Promise.all([
      this.postRepository.findAuthorId(comment.postId),
      comment.parentId
        ? this.commentRepository.findAuthorId(comment.parentId)
        : Promise.resolve(null),
    ]);

    if (postAuthorId) {
      await this.createNotificationService.execute({
        userId: postAuthorId,
        actorId: comment.author.id,
        type: 'POST_COMMENT',
        refId: comment.postId,
        aggregateKey: `post-comment:${comment.postId}`,
      });
    }

    if (comment.parentId && parentAuthorId && parentAuthorId !== postAuthorId) {
      await this.createNotificationService.execute({
        userId: parentAuthorId,
        actorId: comment.author.id,
        type: 'COMMENT_REPLY',
        refId: comment.id,
        aggregateKey: `comment-reply:${comment.parentId}`,
      });
    }
  }

  private async notifyMentionedUsers(comment: Comment): Promise<void> {
    await this.notifyMentionedUsersService.execute({
      actorId: comment.author.id,
      content: comment.content,
      refId: comment.id,
      source: 'comment',
    });
  }
}
