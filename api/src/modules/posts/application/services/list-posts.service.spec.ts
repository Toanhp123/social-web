import { jest } from '@jest/globals';
import { ListPostsService } from './list-posts.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { Post } from '@/modules/posts/domain/entities/post.entity.js';
import type { GroupAccessService } from '@/modules/groups/application/services/group-access.service.js';
import type { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';
import type { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import type { ListPostsPage } from '@/modules/posts/domain/types/list-posts-query.type.js';

describe('ListPostsService', () => {
  const createPostFeedCache = (): PostFeedCache =>
    ({
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    }) as unknown as PostFeedCache;
  const createGroupAccessService = (): GroupAccessService =>
    ({
      assertCanView: jest.fn().mockResolvedValue(undefined),
    }) as unknown as GroupAccessService;

  it('reads the personalized feed when a viewer is present and no author filter is requested', async () => {
    const post = { id: 'post-1' } as unknown as Post;
    const feedPage: ListPostsPage = {
      items: [post],
      nextCursor: null,
    };
    const postRepository = {
      findPage: jest.fn(),
      findDiscoveryPage: jest.fn(),
      softDelete: jest.fn(),
      report: jest.fn(),
    } as unknown as PostRepository;
    const postFeedRepository = {
      findPage: jest.fn().mockResolvedValue(feedPage),
      createFeedItemsForRecipient: jest.fn(),
    } as unknown as PostFeedRepository;
    const postFeedCache = createPostFeedCache();
    const service = new ListPostsService(
      postRepository,
      postFeedRepository,
      postFeedCache,
      createGroupAccessService(),
    );

    await service.execute({ viewerId: 'viewer-1', limit: 10 });

    expect(postFeedRepository.findPage).toHaveBeenCalledWith({
      viewerId: 'viewer-1',
      limit: 10,
      cursor: undefined,
    });
    expect(postRepository.findPage).not.toHaveBeenCalled();
  });

  it('returns a discovery cursor after the final personalized feed page', async () => {
    const post = { id: 'post-1' } as unknown as Post;
    const feedPage: ListPostsPage = {
      items: [post],
      nextCursor: null,
    };
    const postRepository = {
      findPage: jest.fn(),
      findDiscoveryPage: jest.fn(),
      softDelete: jest.fn(),
      report: jest.fn(),
    } as unknown as PostRepository;
    const postFeedRepository = {
      findPage: jest.fn().mockResolvedValue(feedPage),
      createFeedItemsForRecipient: jest.fn(),
    } as unknown as PostFeedRepository;
    const service = new ListPostsService(
      postRepository,
      postFeedRepository,
      createPostFeedCache(),
      createGroupAccessService(),
    );

    const result = await service.execute({ viewerId: 'viewer-1', limit: 10 });

    expect(result.nextCursor).toEqual(expect.any(String));
    expect(
      Buffer.from(result.nextCursor ?? '', 'base64url').toString('utf8'),
    ).toContain('"phase":"discover"');
  });

  it('reads discovery posts when the cursor is in discovery phase', async () => {
    const post = { id: 'post-2', createdAt: new Date() } as unknown as Post;
    const discoveryPage: ListPostsPage = {
      items: [post],
      nextCursor: null,
    };
    const postRepository = {
      findPage: jest.fn(),
      findDiscoveryPage: jest.fn().mockResolvedValue(discoveryPage),
      softDelete: jest.fn(),
      report: jest.fn(),
    } as unknown as PostRepository;
    const postFeedRepository = {
      findPage: jest.fn(),
      createFeedItemsForRecipient: jest.fn().mockResolvedValue(1),
    } as unknown as PostFeedRepository;
    const service = new ListPostsService(
      postRepository,
      postFeedRepository,
      createPostFeedCache(),
      createGroupAccessService(),
    );
    const cursor = Buffer.from(
      JSON.stringify({
        createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
        id: 'post-3',
        phase: 'discover',
      }),
      'utf8',
    ).toString('base64url');

    await service.execute({ viewerId: 'viewer-1', limit: 10, cursor });

    expect(postRepository.findDiscoveryPage).toHaveBeenCalledWith({
      viewerId: 'viewer-1',
      limit: 10,
      cursor: {
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        id: 'post-3',
        phase: 'discover',
      },
    });
    expect(postFeedRepository.findPage).not.toHaveBeenCalled();
  });

  it('does not store discovered posts in the viewer feed yet', async () => {
    const post = {
      id: 'post-2',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    } as unknown as Post;
    const discoveryPage: ListPostsPage = {
      items: [post],
      nextCursor: null,
    };
    const postRepository = {
      findPage: jest.fn(),
      findDiscoveryPage: jest.fn().mockResolvedValue(discoveryPage),
      softDelete: jest.fn(),
      report: jest.fn(),
    } as unknown as PostRepository;
    const postFeedRepository = {
      findPage: jest.fn().mockResolvedValue({ items: [], nextCursor: null }),
      createFeedItemsForRecipient: jest.fn().mockResolvedValue(1),
    } as unknown as PostFeedRepository;
    const service = new ListPostsService(
      postRepository,
      postFeedRepository,
      createPostFeedCache(),
      createGroupAccessService(),
    );

    await service.execute({ viewerId: 'viewer-1', limit: 10 });

    expect(
      postFeedRepository.createFeedItemsForRecipient,
    ).not.toHaveBeenCalled();
  });

  it('reads posts from joined groups when group feed is requested', async () => {
    const post = { id: 'group-post-1' } as unknown as Post;
    const page: ListPostsPage = {
      items: [post],
      nextCursor: null,
    };
    const postRepository = {
      findPage: jest.fn().mockResolvedValue(page),
      findDiscoveryPage: jest.fn(),
      softDelete: jest.fn(),
      report: jest.fn(),
    } as unknown as PostRepository;
    const postFeedRepository = {
      findPage: jest.fn(),
      createFeedItemsForRecipient: jest.fn(),
    } as unknown as PostFeedRepository;
    const postFeedCache = createPostFeedCache();
    const service = new ListPostsService(
      postRepository,
      postFeedRepository,
      postFeedCache,
      createGroupAccessService(),
    );

    await service.execute({
      viewerId: 'viewer-1',
      groupFeed: true,
      limit: 10,
    });

    expect(postRepository.findPage).toHaveBeenCalledWith({
      viewerId: 'viewer-1',
      authorId: undefined,
      groupId: undefined,
      groupFeed: true,
      search: undefined,
      limit: 10,
      cursor: undefined,
    });
    expect(postFeedRepository.findPage).not.toHaveBeenCalled();
    expect(postFeedCache.get).not.toHaveBeenCalled();
  });
});
