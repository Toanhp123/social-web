import { jest } from '@jest/globals';
import { RemoveRelationshipFeedService } from './remove-relationship-feed.service.js';
import type { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import type { PostFeedCache } from '@/modules/posts/application/ports/post-feed-cache.port.js';
import type { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import type { PostFeedRepository } from '@/modules/posts/domain/repositories/post-feed.repository.interface.js';

describe('RemoveRelationshipFeedService', () => {
  it('deletes one feed page and enqueues the next page without invalidating cache when more items remain', async () => {
    const postFeedRepository = {
      findRelationshipFeedItemPage: jest.fn().mockResolvedValue({
        items: [
          {
            postId: 'post-1',
            createdAt: new Date('2026-06-01T00:00:00.000Z'),
          },
        ],
        nextCursor: 'next-cursor',
      }),
      deleteFeedItemsForRecipient: jest.fn().mockResolvedValue(1),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
      invalidateViewer: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueueRelationshipRemovalPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishFeedUpdated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new RemoveRelationshipFeedService(
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
      postFeedRepository.findRelationshipFeedItemPage,
    ).toHaveBeenCalledWith({
      recipientId: 'viewer-1',
      sourceUserId: 'author-1',
      reason: 'FRIEND_ACTIVITY',
      cursor: undefined,
      limit: 500,
    });
    expect(postFeedRepository.deleteFeedItemsForRecipient).toHaveBeenCalledWith(
      {
        recipientId: 'viewer-1',
        postIds: ['post-1'],
      },
    );
    expect(
      postFeedJobQueue.enqueueRelationshipRemovalPage,
    ).toHaveBeenCalledWith({
      recipientId: 'viewer-1',
      sourceUserId: 'author-1',
      reason: 'FRIEND_ACTIVITY',
      cursor: 'next-cursor',
    });
    expect(postFeedCache.invalidateAll).not.toHaveBeenCalled();
    expect(postFeedCache.invalidateViewer).not.toHaveBeenCalled();
    expect(realtimePublisher.publishFeedUpdated).not.toHaveBeenCalled();
  });

  it('invalidates cached feeds and publishes feed.updated when the last page is deleted', async () => {
    const postFeedRepository = {
      findRelationshipFeedItemPage: jest.fn().mockResolvedValue({
        items: [],
        nextCursor: null,
      }),
      deleteFeedItemsForRecipient: jest.fn().mockResolvedValue(0),
    } as unknown as PostFeedRepository;
    const postFeedCache = {
      invalidateAll: jest.fn().mockResolvedValue(undefined),
      invalidateViewer: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedCache;
    const postFeedJobQueue = {
      enqueueRelationshipRemovalPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const realtimePublisher = {
      publishFeedUpdated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new RemoveRelationshipFeedService(
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
      postFeedRepository.deleteFeedItemsForRecipient,
    ).not.toHaveBeenCalled();
    expect(
      postFeedJobQueue.enqueueRelationshipRemovalPage,
    ).not.toHaveBeenCalled();
    expect(postFeedCache.invalidateAll).not.toHaveBeenCalled();
    expect(postFeedCache.invalidateViewer).toHaveBeenCalledWith('viewer-1');
    expect(realtimePublisher.publishFeedUpdated).toHaveBeenCalledTimes(1);
  });
});
