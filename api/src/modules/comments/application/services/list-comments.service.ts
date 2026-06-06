import { Inject, Injectable } from '@nestjs/common';
import { COMMENT_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { CommentListQuery } from '@/modules/comments/domain/value-objects/comment-list-query.value-object.js';
import { Comment } from '@/modules/comments/domain/entities/comment.entity.js';
import { CommentRepository } from '@/modules/comments/domain/repositories/comment.repository.interface.js';

export type ListCommentsInput = {
  postId: string;
  viewerId?: string;
  parentId?: string;
  limit?: number;
  cursor?: string;
};

export type ListCommentsResult = {
  items: Comment[];
  nextCursor: string | null;
};

@Injectable()
export class ListCommentsService {
  constructor(
    @Inject(COMMENT_REPOSITORY)
    private readonly commentRepository: CommentRepository,
  ) {}

  async execute(input: ListCommentsInput): Promise<ListCommentsResult> {
    const query = CommentListQuery.create(input);
    const page = await this.commentRepository.findPage({
      postId: query.postId,
      viewerId: query.viewerId,
      parentId: query.parentId,
      limit: query.limit,
      cursor: query.cursor,
    });

    return {
      items: page.items,
      nextCursor: page.nextCursor
        ? CommentListQuery.encodeCursor(page.nextCursor)
        : null,
    };
  }
}
