import { Inject, Injectable } from '@nestjs/common';
import {
  COMMENT_REPOSITORY,
  POST_FEED_CACHE,
  UNIT_OF_WORK,
} from '@/common/constants/provider-token.constant.js';
import type { UnitOfWork } from '@/core/databases/unit-of-work.interface.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import { CommentDraft } from '@/modules/comments/domain/entities/comment-draft.entity.js';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CommentRepository } from '@/modules/comments/domain/repositories/comment.repository.interface.js';

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

    @Inject(POST_FEED_CACHE)
    private readonly postFeedCache: PostFeedCache,
  ) {}

  async execute(input: CreateCommentServiceInput): Promise<Comment> {
    const draft = CommentDraft.create(input);

    const comment = await this.unitOfWork.execute(() =>
      this.commentRepository.create(draft.toCreateInput()),
    );

    await this.invalidateFeedCache();

    return comment;
  }

  private async invalidateFeedCache(): Promise<void> {
    try {
      await this.postFeedCache.invalidateAll();
    } catch {
      return;
    }
  }
}
