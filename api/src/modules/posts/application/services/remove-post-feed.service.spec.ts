import { jest } from '@jest/globals';
import { RemovePostFeedService } from './remove-post-feed.service.js';
import type { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import type { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

describe(RemovePostFeedService.name, () => {
  it('deletes one post feed page and enqueues the next page without invalidating cache when more items remain', async () => {
    const postFeedRepository = {
      findPostFeedItemPage: jest.fn().mockResolvedValue({
        items: [
          {
            userId: 'viewer-1',
            createdAt: new Date('2026-06-01T00:00:00.000Z'),
          },
        ],
        nextCursor: 'next-cursor',
      }),
      deleteFeedItemsForPost: jest.fn().mockResolvedValue(1),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueuePostFeedRemovalPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishFeedUpdated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new RemovePostFeedService(
      postFeedRepository,
      postFeedCache,
      postFeedJobQueue,
      realtimePublisher,
    );

    await service.execute({ postId: 'post-1' });

    expect(postFeedRepository.findPostFeedItemPage).toHaveBeenCalledWith({
      postId: 'post-1',
      cursor: undefined,
      limit: 500,
    });
    expect(postFeedRepository.deleteFeedItemsForPost).toHaveBeenCalledWith({
      postId: 'post-1',
      userIds: ['viewer-1'],
    });
    expect(postFeedJobQueue.enqueuePostFeedRemovalPage).toHaveBeenCalledWith({
      postId: 'post-1',
      cursor: 'next-cursor',
    });
    expect(postFeedCache.invalidateAll).not.toHaveBeenCalled();
    expect(realtimePublisher.publishFeedUpdated).not.toHaveBeenCalled();
  });

  it('invalidates cached feeds and publishes feed.updated when the last page is deleted', async () => {
    const postFeedRepository = {
      findPostFeedItemPage: jest.fn().mockResolvedValue({
        items: [],
        nextCursor: null,
      }),
      deleteFeedItemsForPost: jest.fn().mockResolvedValue(0),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueuePostFeedRemovalPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishFeedUpdated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new RemovePostFeedService(
      postFeedRepository,
      postFeedCache,
      postFeedJobQueue,
      realtimePublisher,
    );

    await service.execute({ postId: 'post-1' });

    expect(postFeedRepository.deleteFeedItemsForPost).not.toHaveBeenCalled();
    expect(postFeedJobQueue.enqueuePostFeedRemovalPage).not.toHaveBeenCalled();
    expect(postFeedCache.invalidateAll).toHaveBeenCalledTimes(1);
    expect(realtimePublisher.publishFeedUpdated).toHaveBeenCalledTimes(1);
  });
});
