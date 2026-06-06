import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { SharePostInput } from '@/modules/posts/domain/types/share-post-input.type.js';
import { SharePostDraft } from '@/modules/posts/domain/value-objects/share-post-draft.value-object.js';

@Injectable()
export class SharePostService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    @Inject(UNIT_OF_WORK)
    private readonly unitOfWork: UnitOfWork,

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(input: SharePostInput): Promise<Post> {
    const draft = SharePostDraft.create(input);

    const post = await this.unitOfWork.execute(() =>
      this.postRepository.share(draft.toShareInput()),
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
