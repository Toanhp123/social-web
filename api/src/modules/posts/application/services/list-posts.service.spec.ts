import { jest } from '@jest/globals';
import { ListPostsService } from './list-posts.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { Post } from '@/modules/posts/domain/entities/post.entity.js';
import type { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';
import type { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import type { ListPostsPage } from '@/modules/posts/domain/types/list-posts-query.type.js';

describe('ListPostsService', () => {
  it('reads the personalized feed when a viewer is present and no author filter is requested', async () => {
    const post = { id: 'post-1' } as unknown as Post;
    const feedPage: ListPostsPage = {
      items: [post],
      nextCursor: null,
    };
    const postRepository = {
      findPage: jest.fn(),
    } as unknown as PostRepository;
    const postFeedRepository = {
      findPage: jest.fn().mockResolvedValue(feedPage),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const service = new ListPostsService(
      postRepository,
      postFeedRepository,
      postFeedCache,
    );

    await service.execute({ viewerId: 'viewer-1', limit: 10 });

    expect(postFeedRepository.findPage).toHaveBeenCalledWith({
      viewerId: 'viewer-1',
      limit: 10,
      cursor: undefined,
    });
    expect(postRepository.findPage).not.toHaveBeenCalled();
  });
});
