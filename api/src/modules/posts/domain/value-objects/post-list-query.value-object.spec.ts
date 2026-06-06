import { describe, expect, it } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { PostListQuery } from '@/modules/posts/domain/value-objects/post-list-query.value-object.js';

describe('PostListQuery', () => {
  it('uses a safe default limit', () => {
    const query = PostListQuery.create({
      viewerId: 'user-1',
    });

    expect(query.limit).toBe(10);
    expect(query.cursor).toBeUndefined();
  });

  it('rejects invalid page limits', () => {
    expect(() =>
      PostListQuery.create({
        limit: 31,
      }),
    ).toThrow(DomainError);
  });

  it('encodes and decodes a cursor', () => {
    const cursor = {
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      id: 'post-1',
    };
    const encodedCursor = PostListQuery.encodeCursor(cursor);
    const query = PostListQuery.create({
      cursor: encodedCursor,
    });

    expect(query.cursor).toEqual(cursor);
    expect(query.rawCursor).toBe(encodedCursor);
  });

  it('rejects invalid cursors', () => {
    expect(() =>
      PostListQuery.create({
        cursor: 'invalid',
      }),
    ).toThrow(DomainError);
  });
});
