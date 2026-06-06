import { PostVisibility } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import {
  CreatePostInput,
  CreatePostMediaInput,
} from '@/modules/posts/domain/types/create-post-input.type.js';

type CreatePostDraftInput = {
  authorId: string;
  content?: string | null;
  visibility?: PostVisibility;
  media?: CreatePostMediaInput[];
};

const MAX_POST_CONTENT_LENGTH = 5000;
const MAX_POST_MEDIA_ITEMS = 10;

export class PostDraft {
  private constructor(
    public readonly authorId: string,
    public readonly content: string,
    public readonly visibility: PostVisibility,
    public readonly media: readonly CreatePostMediaInput[],
  ) {}

  static create(input: CreatePostDraftInput): PostDraft {
    const authorId = input.authorId.trim();
    const content = input.content?.trim() ?? '';
    const media = [...(input.media ?? [])];

    if (!authorId) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Post author is required',
      );
    }

    if (!content && media.length === 0) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Post content or media is required',
      );
    }

    if (content.length > MAX_POST_CONTENT_LENGTH) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Post content is too long',
        400,
        { maxLength: MAX_POST_CONTENT_LENGTH },
      );
    }

    if (media.length > MAX_POST_MEDIA_ITEMS) {
      throw new DomainError(
        ErrorCode.VALIDATION_ERROR,
        'Too many media files',
        400,
        { maxFiles: MAX_POST_MEDIA_ITEMS },
      );
    }

    return new PostDraft(
      authorId,
      content,
      input.visibility ?? PostVisibility.PUBLIC,
      media,
    );
  }

  toCreateInput(): CreatePostInput {
    return {
      authorId: this.authorId,
      content: this.content,
      visibility: this.visibility,
      media: [...this.media],
    };
  }
}
