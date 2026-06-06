import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { CommentDraft } from '@/modules/comments/domain/entities/comment-draft.entity.js';

describe('CommentDraft', () => {
  it('normalizes valid comment content', () => {
    const draft = CommentDraft.create({
      userId: 'user-1',
      postId: 'post-1',
      content: '  Hello comment  ',
    });

    expect(draft.toCreateInput()).toEqual({
      userId: 'user-1',
      postId: 'post-1',
      content: 'Hello comment',
      parentId: undefined,
    });
  });

  it('rejects empty comment content', () => {
    expect(() =>
      CommentDraft.create({
        userId: 'user-1',
        postId: 'post-1',
        content: '   ',
      }),
    ).toThrow(DomainError);
  });

  it('rejects overly long comment content', () => {
    expect(() =>
      CommentDraft.create({
        userId: 'user-1',
        postId: 'post-1',
        content: 'a'.repeat(2001),
      }),
    ).toThrow(DomainError);
  });
});
