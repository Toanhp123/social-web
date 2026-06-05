import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_REACTION_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
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

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async setReaction(input: SetPostReactionInput): Promise<Post> {
    const post = await this.unitOfWork.execute(() =>
      this.postReactionRepository.set(input),
    );

    await this.invalidateFeedCache();

    return post;
  }

  async removeReaction(input: RemovePostReactionInput): Promise<Post> {
    const post = await this.unitOfWork.execute(() =>
      this.postReactionRepository.remove(input),
    );

    await this.invalidateFeedCache();

    return post;
  }

  private async invalidateFeedCache(): Promise<void> {
    try {
      await this.postFeedCache.invalidateAll();
    } catch {
      return;
    }
  }
}
