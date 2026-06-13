import { jest } from '@jest/globals';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { PostRepository } from '@/modules/posts/domain/repositories/post.repository.interface.js';
import { CancelPostReportService } from './cancel-post-report.service.js';

describe(CancelPostReportService.name, () => {
  it('cancels a pending report and notifies the author and reporter', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      cancelReport: jest.fn().mockResolvedValue(true),
    } as unknown as PostRepository;
    const createNotificationService = {
      execute: jest.fn().mockResolvedValue(null),
    } as unknown as CreateNotificationService;
    const service = new CancelPostReportService(
      postRepository,
      createNotificationService,
    );

    await expect(
      service.execute({ postId: 'post-1', reporterId: 'viewer-1' }),
    ).resolves.toEqual({ canceled: true });

    expect(postRepository.cancelReport).toHaveBeenCalledWith({
      postId: 'post-1',
      reporterId: 'viewer-1',
    });
    expect(createNotificationService.execute).toHaveBeenCalledWith({
      userId: 'author-1',
      actorId: null,
      type: 'POST_REPORT_CANCELED',
      refId: 'post-1',
      aggregateKey: 'post-report-canceled:author:post-1',
      message: 'A report on your post was canceled.',
    });
    expect(createNotificationService.execute).toHaveBeenCalledWith({
      userId: 'viewer-1',
      actorId: null,
      type: 'POST_REPORT_CANCELED',
      refId: 'post-1',
      aggregateKey: 'post-report-canceled:reporter:post-1',
      message: 'You canceled your report on this post.',
    });
  });

  it('does not notify when there is no pending report to cancel', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue('author-1'),
      cancelReport: jest.fn().mockResolvedValue(false),
    } as unknown as PostRepository;
    const createNotificationService = {
      execute: jest.fn(),
    } as unknown as CreateNotificationService;
    const service = new CancelPostReportService(
      postRepository,
      createNotificationService,
    );

    await expect(
      service.execute({ postId: 'post-1', reporterId: 'viewer-1' }),
    ).resolves.toEqual({ canceled: false });

    expect(createNotificationService.execute).not.toHaveBeenCalled();
  });

  it('rejects canceling a report for a missing post', async () => {
    const postRepository = {
      findAuthorId: jest.fn().mockResolvedValue(null),
      cancelReport: jest.fn(),
    } as unknown as PostRepository;
    const service = new CancelPostReportService(postRepository, {
      execute: jest.fn(),
    } as unknown as CreateNotificationService);

    await expect(
      service.execute({ postId: 'post-1', reporterId: 'viewer-1' }),
    ).rejects.toMatchObject({
      statusCode: 404,
    });
    expect(postRepository.cancelReport).not.toHaveBeenCalled();
  });
});
