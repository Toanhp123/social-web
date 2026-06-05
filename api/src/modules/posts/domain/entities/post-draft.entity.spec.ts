import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { MediaType, PostVisibility } from '@/generated/prisma/client.js';
import { PostDraft } from '@/modules/posts/domain/entities/post-draft.entity.js';

describe('PostDraft', () => {
  it('normalizes content and defaults visibility', () => {
    const draft = PostDraft.create({
      authorId: 'user-1',
      content: '  Hello world  ',
    });

    expect(draft.toCreateInput()).toEqual({
      authorId: 'user-1',
      content: 'Hello world',
      visibility: PostVisibility.PUBLIC,
      media: [],
    });
  });

  it('requires content or media', () => {
    expect(() =>
      PostDraft.create({ authorId: 'user-1', content: '   ', media: [] }),
    ).toThrow(
      expect.objectContaining<Partial<DomainError>>({
        code: ErrorCode.VALIDATION_ERROR,
      }),
    );
  });

  it('allows media-only posts', () => {
    const draft = PostDraft.create({
      authorId: 'user-1',
      media: [
        {
          url: 'https://cdn.example.com/image.jpg',
          type: MediaType.IMAGE,
          order: 0,
        },
      ],
    });

    expect(draft.toCreateInput()).toMatchObject({
      authorId: 'user-1',
      content: '',
      visibility: PostVisibility.PUBLIC,
      media: [expect.objectContaining({ type: MediaType.IMAGE, order: 0 })],
    });
  });
});
