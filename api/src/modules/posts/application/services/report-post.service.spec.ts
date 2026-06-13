import { jest } from '@jest/globals';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { ReportPostService } from './report-post.service.js';

describe(ReportPostService.name, () => {
  it('creates a report for a post by a non-author', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      hasReportedPost: jest.fn().mockResolvedValue(false),
      report: jest.fn().mockResolvedValue(undefined),
    } as unknown as PostRepository;
    const createNotificationService = {
      execute: jest.fn().mockResolvedValue(null),
    } as unknown as CreateNotificationService;
    const service = new ReportPostService(
      postRepository,
      createNotificationService,
    );

    await expect(
      service.execute({
        postId: 'post-1',
        reporterId: 'viewer-1',
        reason: 'Spam',
      }),
    ).resolves.toEqual({
      alreadyReported: false,
    });

    expect(postRepository.hasReportedPost).toHaveBeenCalledWith({
      postId: 'post-1',
      reporterId: 'viewer-1',
    });
    expect(postRepository.report).toHaveBeenCalledWith({
      postId: 'post-1',
      reporterId: 'viewer-1',
      reason: 'Spam',
    });
    expect(createNotificationService.execute).toHaveBeenCalledWith({
      userId: 'author-1',
      actorId: null,
      type: 'POST_REPORT_SUBMITTED',
      refId: 'post-1',
      aggregateKey: 'post-report-submitted:author:post-1',
      message: 'Your post received a report.',
    });
    expect(createNotificationService.execute).toHaveBeenCalledWith({
      userId: 'viewer-1',
      actorId: null,
      type: 'POST_REPORT_SUBMITTED',
      refId: 'post-1',
      aggregateKey: 'post-report-submitted:reporter:post-1',
      message: 'You reported this post.',
    });
  });

  it('does not create another report when the viewer already reported the post', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      hasReportedPost: jest.fn().mockResolvedValue(true),
      report: jest.fn(),
    } as unknown as PostRepository;
    const createNotificationService = {
      execute: jest.fn(),
    } as unknown as CreateNotificationService;
    const service = new ReportPostService(
      postRepository,
      createNotificationService,
    );

    await expect(
      service.execute({
        postId: 'post-1',
        reporterId: 'viewer-1',
        reason: 'Spam',
      }),
    ).resolves.toEqual({
      alreadyReported: true,
    });

    expect(postRepository.report).not.toHaveBeenCalled();
    expect(createNotificationService.execute).not.toHaveBeenCalled();
  });

  it('rejects reports from the post author', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      hasReportedPost: jest.fn(),
      report: jest.fn(),
    } as unknown as PostRepository;
    const service = new ReportPostService(postRepository, {
      execute: jest.fn(),
    } as unknown as CreateNotificationService);

    await expect(
      service.execute({
        postId: 'post-1',
        reporterId: 'author-1',
        reason: 'Spam',
      }),
    ).rejects.toMatchObject({
      statusCode: 403,
    });
    expect(postRepository.report).not.toHaveBeenCalled();
  });
});
