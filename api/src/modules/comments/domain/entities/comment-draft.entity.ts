import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { CreateCommentInput } from '@/modules/comments/domain/types/create-comment-input.type.js';

type CreateCommentDraftInput = {
  userId: string;
  postId: string;
  content: string;
  parentId?: string;
};

const MAX_COMMENT_CONTENT_LENGTH = 2000;
const MAX_COMMENT_DEPTH = 10;

export class CommentDraft {
  private constructor(
    public readonly userId: string,
    public readonly postId: string,
    public readonly content: string,
    public readonly parentId?: string,
  ) {}

  static create(input: CreateCommentDraftInput): CommentDraft {
    const content = input.content.trim();

    if (!content) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Comment content is required',
      );
    }

    if (content.length > MAX_COMMENT_CONTENT_LENGTH) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Comment content is too long',
        400,
        { maxLength: MAX_COMMENT_CONTENT_LENGTH },
      );
    }

    return new CommentDraft(
      input.userId,
      input.postId,
      content,
      input.parentId,
    );
  }

  static assertReplyDepth(depth: number): void {
    if (depth > MAX_COMMENT_DEPTH) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Comment nesting is too deep',
        400,
        { maxDepth: MAX_COMMENT_DEPTH },
      );
    }
  }

  toCreateInput(): CreateCommentInput {
    return {
      userId: this.userId,
      postId: this.postId,
      content: this.content,
      parentId: this.parentId,
    };
  }
}
