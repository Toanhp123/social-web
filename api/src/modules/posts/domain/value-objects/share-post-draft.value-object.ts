import { PostVisibility } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { SharePostInput } from '@/modules/posts/domain/types/share-post-input.type.js';

type CreateSharePostDraftInput = {
  authorId: string;
  originalPostId: string;
  content?: string | null;
  visibility?: PostVisibility;
};

const MAX_SHARE_CONTENT_LENGTH = 5000;

export class SharePostDraft {
  private constructor(
    public readonly authorId: string,
    public readonly originalPostId: string,
    public readonly content: string,
    public readonly visibility: PostVisibility | undefined,
  ) {}

  static create(input: CreateSharePostDraftInput): SharePostDraft {
    const content = input.content?.trim() ?? '';

    if (content.length > MAX_SHARE_CONTENT_LENGTH) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Share content is too long',
        400,
        { maxLength: MAX_SHARE_CONTENT_LENGTH },
      );
    }

    return new SharePostDraft(
      input.authorId,
      input.originalPostId,
      content,
      input.visibility,
    );
  }

  toShareInput(): SharePostInput {
    return {
      authorId: this.authorId,
      originalPostId: this.originalPostId,
      content: this.content,
      visibility: this.visibility,
    };
  }
}
