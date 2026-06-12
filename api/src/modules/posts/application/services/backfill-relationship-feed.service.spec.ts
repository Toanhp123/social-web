import { jest } from '@jest/globals';
import { BackfillRelationshipFeedService } from './backfill-relationship-feed.service.js';
import type { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import type { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

describe('BackfillRelationshipFeedService', () => {
  it('writes one post page and enqueues the next page without invalidating cache when more posts remain', async () => {
    const postFeedRepository = {
      findRelationshipBackfillPostPage: jest.fn().mockResolvedValue({
        items: [
          {
            postId: 'post-1',
            createdAt: new Date('2026-06-01T00:00:00.000Z'),
            reason: 'FRIEND_ACTIVITY',
          },
        ],
        nextCursor: 'next-cursor',
      }),
      createFeedItemsForRecipient: jest.fn().mockResolvedValue(1),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueueRelationshipBackfillPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishFeedUpdated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new BackfillRelationshipFeedService(
      postFeedRepository,
      postFeedCache,
      postFeedJobQueue,
      realtimePublisher,
    );

    await service.execute({
      recipientId: 'viewer-1',
      sourceUserId: 'author-1',
      reason: 'FRIEND_ACTIVITY',
    });

    expect(
      postFeedRepository.findRelationshipBackfillPostPage,
    ).toHaveBeenCalledWith({
      recipientId: 'viewer-1',
      sourceUserId: 'author-1',
      reason: 'FRIEND_ACTIVITY',
      cursor: undefined,
      limit: 500,
    });
    expect(postFeedRepository.createFeedItemsForRecipient).toHaveBeenCalledWith(
      {
        recipientId: 'viewer-1',
        posts: [
          {
            postId: 'post-1',
            createdAt: new Date('2026-06-01T00:00:00.000Z'),
            reason: 'FRIEND_ACTIVITY',
          },
        ],
      },
    );
    expect(
      postFeedJobQueue.enqueueRelationshipBackfillPage,
    ).toHaveBeenCalledWith({
      recipientId: 'viewer-1',
      sourceUserId: 'author-1',
      reason: 'FRIEND_ACTIVITY',
      cursor: 'next-cursor',
    });
    expect(postFeedCache.invalidateAll).not.toHaveBeenCalled();
    expect(realtimePublisher.publishFeedUpdated).not.toHaveBeenCalled();
  });

  it('invalidates cached feeds and publishes feed.updated when the last page is written', async () => {
    const postFeedRepository = {
      findRelationshipBackfillPostPage: jest.fn().mockResolvedValue({
        items: [],
        nextCursor: null,
      }),
      createFeedItemsForRecipient: jest.fn().mockResolvedValue(0),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueueRelationshipBackfillPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishFeedUpdated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new BackfillRelationshipFeedService(
      postFeedRepository,
      postFeedCache,
      postFeedJobQueue,
      realtimePublisher,
    );

    await service.execute({
      recipientId: 'viewer-1',
      sourceUserId: 'author-1',
      reason: 'FOLLOWING',
    });

    expect(
      postFeedRepository.createFeedItemsForRecipient,
    ).not.toHaveBeenCalled();
    expect(
      postFeedJobQueue.enqueueRelationshipBackfillPage,
    ).not.toHaveBeenCalled();
    expect(postFeedCache.invalidateAll).toHaveBeenCalledTimes(1);
    expect(realtimePublisher.publishFeedUpdated).toHaveBeenCalledTimes(1);
  });
});
