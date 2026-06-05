import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { DomainError } from '@/core/exceptions/domain.exception.js';
import { ErrorCode } from '@/core/exceptions/error-codes.js';
import { PostAuthor } from '@/modules/posts/domain/entities/post-author.entity.js';
import { Post } from '@/modules/posts/domain/entities/post.entity.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { ListPostsService } from '@/modules/posts/application/services/list-posts.service.js';
import { PostType, PostVisibility } from '@/generated/prisma/client.js';

describe('ListPostsService', () => {
  const post = new Post(
    'post-1',
    new PostAuthor('user-1', 'Example User', 'exampleuser', null),
    'Hello world',
    PostType.TEXT,
    PostVisibility.PUBLIC,
    [],
    new Date('2026-01-01T00:00:00.000Z'),
  );

  let postRepository: jest.Mocked<PostRepository>;
  let postFeedCache: jest.Mocked<PostFeedCache>;
  let service: ListPostsService;

  beforeEach(() => {
    postRepository = {
      create: jest.fn(),
      findPage: jest.fn().mockResolvedValue({
        items: [post],
        nextCursor: {
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          id: 'post-1',
        },
      }),
    };
    postFeedCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      invalidateAll: jest.fn(),
    };
    service = new ListPostsService(postRepository, postFeedCache);
  });

  it('uses the default page size and returns an opaque next cursor', async () => {
    const result = await service.execute({ viewerId: 'user-1' });

    expect(postRepository.findPage).toHaveBeenCalledWith({
      viewerId: 'user-1',
      limit: 10,
      cursor: undefined,
    });
    expect(result.items).toEqual([post]);
    expect(result.nextCursor).toEqual(expect.any(String));
    expect(postFeedCache.set).toHaveBeenCalledWith(
      { viewerId: 'user-1', limit: 10, cursor: undefined },
      result,
    );
  });

  it('returns cached feed pages without querying the repository', async () => {
    postFeedCache.get.mockResolvedValue({ items: [post], nextCursor: null });

    await expect(service.execute({ viewerId: 'user-1' })).resolves.toEqual({
      items: [post],
      nextCursor: null,
    });

    expect(postRepository.findPage).not.toHaveBeenCalled();
  });

  it('decodes a returned cursor on the next request', async () => {
    const firstPage = await service.execute({ viewerId: 'user-1' });
    const cursor = firstPage.nextCursor;

    expect(cursor).toEqual(expect.any(String));

    await service.execute({
      viewerId: 'user-1',
      cursor: cursor ?? undefined,
      limit: 5,
    });

    expect(postRepository.findPage).toHaveBeenLastCalledWith({
      viewerId: 'user-1',
      limit: 5,
      cursor: {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        id: 'post-1',
      },
    });
  });

  it('rejects invalid cursors', async () => {
    await expect(
      service.execute({ viewerId: 'user-1', cursor: 'not-a-cursor' }),
    ).rejects.toMatchObject<Partial<DomainError>>({
      code: ErrorCode.VALIDATION_ERROR,
    });
  });
});
