import { jest } from '@jest/globals';
import { PostFeedJobQueue } from '@/modules/posts/application/ports/post-feed-job-queue.port.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { RemovePostService } from './remove-post.service.js';

describe(RemovePostService.name, () => {
  it('soft deletes a post when requested by the author', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      softDelete: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostRepository;
    const postFeedJobQueue = {
      enqueuePostFeedRemovalPage: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostFeedJobQueue;
    const service = new RemovePostService(postRepository, postFeedJobQueue);

    await service.execute({ postId: 'post-1', userId: 'author-1' });

    expect(postRepository.softDelete).toHaveBeenCalledWith({
      postId: 'post-1',
      deletedById: 'author-1',
    });
    expect(postFeedJobQueue.enqueuePostFeedRemovalPage).toHaveBeenCalledWith({
      postId: 'post-1',
    });
  });

  it('rejects removal by a non-author', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      softDelete: jest.fn(),
    } as unknown as PostRepository;
    const service = new RemovePostService(postRepository, {
      enqueuePostFeedRemovalPage: jest.fn(),
    } as unknown as PostFeedJobQueue);

    await expect(
      service.execute({ postId: 'post-1', userId: 'viewer-1' }),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(postRepository.softDelete).not.toHaveBeenCalled();
  });
});
