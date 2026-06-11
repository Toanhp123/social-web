import { Inject, Injectable } from '@nestjs/common';
import { POST_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PostReactionStats } from '@/modules/posts/domain/entities/post-reaction-stats.entity.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';

export type GetPostReactionStatsInput = {
  postId: string;
  viewerId?: string;
};

@Injectable()
export class GetPostReactionStatsService {
  constructor(
    @Inject(POST_REPOSITORY)
    private readonly postRepository: PostRepository,
  ) {}

  async execute(input: GetPostReactionStatsInput): Promise<PostReactionStats> {
    const stats = await this.postRepository.findReactionStats({
      postId: input.postId,
      viewerId: input.viewerId,
    });

    if (!stats) {
      throw new DomainError(
        ErrorCode.RESOURCE_NOT_FOUND,
        'Post not found',
        404,
      );
    }

    return stats;
  }
}
