import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_CACHE,
  POST_REPOSITORY,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { SharePostInput } from '@/modules/posts/domain/types/share-post-input.type.js';

const MAX_SHARE_CONTENT_LENGTH = 5000;

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
    const content = this.normalizeContent(input.content);

    const post = await this.unitOfWork.execute(() =>
      this.postRepository.share({
        ...input,
        content,
      }),
    );

    await this.invalidateFeedCache();

    return post;
  }

  private normalizeContent(content?: string | null): string {
    const normalizedContent = content?.trim() ?? '';

    if (normalizedContent.length > MAX_SHARE_CONTENT_LENGTH) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Share content is too long',
        400,
        { maxLength: MAX_SHARE_CONTENT_LENGTH },
      );
    }

    return normalizedContent;
  }

  private async invalidateFeedCache(): Promise<void> {
    try {
      await this.postFeedCache.invalidateAll();
    } catch {
      return;
    }
  }
}
