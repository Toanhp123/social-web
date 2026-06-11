import { jest } from '@jest/globals';
import { FanOutPostFeedService } from './fan-out-post-feed.service.js';
import type { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import type { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

describe('FanOutPostFeedService', () => {
  it('writes one recipient page and enqueues the next page without invalidating cache when more recipients remain', async () => {
    const postFeedRepository = {
      findFanOutRecipientPage: jest.fn().mockResolvedValue({
        items: [
          { userId: 'viewer-1', reason: 'FOLLOWING' },
          { userId: 'viewer-2', reason: 'FRIEND_ACTIVITY' },
        ],
        nextCursor: 'followers:viewer-2',
      }),
      createFeedItems: jest.fn().mockResolvedValue(2),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueueFanOutPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishToPublicFeed: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new FanOutPostFeedService(
      postFeedRepository,
      postFeedCache,
      postFeedJobQueue,
      realtimePublisher,
    );

    await service.execute({ postId: 'post-1', authorId: 'author-1' });

    expect(postFeedRepository.findFanOutRecipientPage).toHaveBeenCalledWith({
      postId: 'post-1',
      authorId: 'author-1',
      cursor: undefined,
      limit: 1000,
    });
    expect(postFeedRepository.createFeedItems).toHaveBeenCalledWith({
      postId: 'post-1',
      recipients: [
        { userId: 'viewer-1', reason: 'FOLLOWING' },
        { userId: 'viewer-2', reason: 'FRIEND_ACTIVITY' },
      ],
    });
    expect(postFeedJobQueue.enqueueFanOutPage).toHaveBeenCalledWith({
      postId: 'post-1',
      authorId: 'author-1',
      cursor: 'followers:viewer-2',
    });
    expect(postFeedCache.invalidateAll).not.toHaveBeenCalled();
    expect(realtimePublisher.publishToPublicFeed).not.toHaveBeenCalled();
  });

  it('invalidates cached feeds and publishes feed.updated when the last recipient page is written', async () => {
    const postFeedRepository = {
      findFanOutRecipientPage: jest.fn().mockResolvedValue({
        items: [{ userId: 'viewer-1', reason: 'FOLLOWING' }],
        nextCursor: null,
      }),
      createFeedItems: jest.fn().mockResolvedValue(1),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueueFanOutPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishToPublicFeed: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new FanOutPostFeedService(
      postFeedRepository,
      postFeedCache,
      postFeedJobQueue,
      realtimePublisher,
    );

    await service.execute({ postId: 'post-1', authorId: 'author-1' });

    expect(postFeedJobQueue.enqueueFanOutPage).not.toHaveBeenCalled();
    expect(postFeedCache.invalidateAll).toHaveBeenCalledTimes(1);
    expect(realtimePublisher.publishToPublicFeed).toHaveBeenCalledWith({
      type: 'feed.updated',
      data: {
        scope: 'post-feed',
      },
    });
  });
});
