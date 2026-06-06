import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { CommentListQuery } from '@/modules/comments/domain/value-objects/comment-list-query.value-object.js';

describe('CommentListQuery', () => {
  it('uses a safe default limit', () => {
    const query = CommentListQuery.create({
      postId: 'post-1',
    });

    expect(query.limit).toBe(20);
    expect(query.cursor).toBeUndefined();
  });

  it('rejects invalid page limits', () => {
    expect(() =>
      CommentListQuery.create({
        postId: 'post-1',
        limit: 51,
      }),
    ).toThrow(DomainError);
  });

  it('encodes and decodes a cursor', () => {
    const cursor = {
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      id: 'comment-1',
    };
    const encodedCursor = CommentListQuery.encodeCursor(cursor);
    const query = CommentListQuery.create({
      postId: 'post-1',
      cursor: encodedCursor,
    });

    expect(query.cursor).toEqual(cursor);
  });

  it('rejects invalid cursors', () => {
    expect(() =>
      CommentListQuery.create({
        postId: 'post-1',
        cursor: 'invalid',
      }),
    ).toThrow(DomainError);
  });
});
