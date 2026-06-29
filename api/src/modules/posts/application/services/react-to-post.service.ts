import { Inject, Injectable } from '@nestjs/common';
import {
  POST_REACTION_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { PostFeedCacheInvalidationService } from '@/modules/posts/application/services/post-feed-cache-invalidation.service.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostReactionRepository } from '@/modules/posts/domain/repositories/post-reaction.repository.interface.js';
import {
  RemovePostReactionInput,
  SetPostReactionInput,
} from '@/modules/posts/domain/types/post-reaction.type.js';

@Injectable()
export class ReactToPostService {
  constructor(
    @Inject(POST_REACTION_REPOSITORY)
    private readonly postReactionRepository: PostReactionRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    private readonly postFeedCacheInvalidation: PostFeedCacheInvalidationService,

    private readonly realtimePublisher: RealtimePublisher,

    private readonly createNotificationService: CreateNotificationService,
  ) {}

  async setReaction(input: SetPostReactionInput): Promise<Post> {
    const post = await this.unitOfWork.execute(() =>
      this.postReactionRepository.set(input),
    );

    await this.postFeedCacheInvalidation.invalidatePost(post.id);
    this.realtimePublisher.publishPostReactionUpdated({
      postId: post.id,
      actorId: input.userId,
      reactionType: input.type,
    });
    await this.notifyPostAuthor(post, input);

    return post;
  }

  async removeReaction(input: RemovePostReactionInput): Promise<Post> {
    const post = await this.unitOfWork.execute(() =>
      this.postReactionRepository.remove(input),
    );

    await this.postFeedCacheInvalidation.invalidatePost(post.id);
    this.realtimePublisher.publishPostReactionUpdated({
      postId: post.id,
      actorId: input.userId,
      reactionType: null,
    });

    return post;
  }

  private async notifyPostAuthor(
    post: Post,
    input: SetPostReactionInput,
  ): Promise<void> {
    await this.createNotificationService.execute({
      userId: post.author.id,
      actorId: input.userId,
      type: 'POST_REACTION',
      refId: post.id,
      aggregateKey: `post-reaction:${post.id}`,
    });
  }
}
