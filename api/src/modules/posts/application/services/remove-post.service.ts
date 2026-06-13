import { Inject, Injectable } from '@nestjs/common';
import {
  POST_FEED_JOB_QUEUE,
  POST_REPOSITORY,
} from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';

export type RemovePostInput = {
  postId: string;
  userId: string;
};

@Injectable()
export class RemovePostService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,

    @Inject(POST_FEED_JOB_QUEUE)
    private readonly postFeedJobQueue: PostFeedJobQueue,
  ) {}

  async execute(input: RemovePostInput): Promise<void> {
    const authorId = await this.postRepository.findAuthorId(input.postId);

    if (!authorId) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Post not found',
        404,
      );
    }

    if (authorId !== input.userId) {
      throw new DomainError(
        ErrorCode.PERMISSION_DENIED,
        'Only the author can remove this post',
        403,
      );
    }

    await this.postRepository.softDelete({
      postId: input.postId,
      deletedById: input.userId,
    });
    await this.postFeedJobQueue.enqueuePostFeedRemovalPage({
      postId: input.postId,
    });
  }
}
