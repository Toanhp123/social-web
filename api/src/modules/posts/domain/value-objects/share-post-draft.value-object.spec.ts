import { describe, expect, it } from '@jest/globals';
import { PostVisibility } from '@/generated/prisma/client.js';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { SharePostDraft } from '@/modules/posts/domain/value-objects/share-post-draft.value-object.js';

describe('SharePostDraft', () => {
  it('normalizes optional share content', () => {
    const draft = SharePostDraft.create({
      authorId: 'user-1',
      originalPostId: 'post-1',
      content: '  Sharing this  ',
      visibility: PostVisibility.PUBLIC,
    });

    expect(draft.toShareInput()).toEqual({
      authorId: 'user-1',
      originalPostId: 'post-1',
      content: 'Sharing this',
      visibility: PostVisibility.PUBLIC,
    });
  });

  it('allows empty share content', () => {
    const draft = SharePostDraft.create({
      authorId: 'user-1',
      originalPostId: 'post-1',
    });

    expect(draft.content).toBe('');
  });

  it('rejects overly long share content', () => {
    expect(() =>
      SharePostDraft.create({
        authorId: 'user-1',
        originalPostId: 'post-1',
        content: 'a'.repeat(5001),
      }),
    ).toThrow(DomainError);
  });
});
