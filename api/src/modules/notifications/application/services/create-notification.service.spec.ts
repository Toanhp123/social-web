import { jest } from '@jest/globals';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import { Notification } from '@/modules/notifications/domain/entities/notification.entity.js';
import { NotificationRepository } from '@/modules/notifications/domain/repositories/notification.repository.interface.js';
import { CreateNotificationService } from './create-notification.service.js';

describe(CreateNotificationService.name, () => {
  it('creates a system notification without an actor', async () => {
    const notification = new Notification(
      'notification-1',
      'user-1',
      null,
      'POST_REPORT_SUBMITTED',
      'post-1',
      'Your post received a report.',
      null,
      new Date('2026-06-13T00:00:00.000Z'),
      1,
    );
    const notificationRepository = {
      upsert: jest.fn().mockResolvedValue(notification),
    } as unknown as NotificationRepository;
    const realtimePublisher = {
      publishNotificationCreated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new CreateNotificationService(
      notificationRepository,
      realtimePublisher,
    );

    await expect(
      service.execute({
        userId: 'user-1',
        actorId: null,
        type: 'POST_REPORT_SUBMITTED',
        refId: 'post-1',
        aggregateKey: 'post-report-submitted:author:post-1',
        message: 'Your post received a report.',
      }),
    ).resolves.toBe(notification);

    expect(notificationRepository.upsert).toHaveBeenCalledTimes(1);
    expect(realtimePublisher.publishNotificationCreated).toHaveBeenCalledWith({
      id: 'notification-1',
      userId: 'user-1',
      actorId: null,
      notificationType: 'POST_REPORT_SUBMITTED',
      refId: 'post-1',
      count: 1,
      readAt: null,
      createdAt: '2026-06-13T00:00:00.000Z',
    });
  });

  it('skips notifications when the actor is the recipient', async () => {
    const notificationRepository = {
      upsert: jest.fn(),
    } as unknown as NotificationRepository;
    const realtimePublisher = {
      publishNotificationCreated: jest.fn(),
    } as unknown as RealtimePublisher;
    const service = new CreateNotificationService(
      notificationRepository,
      realtimePublisher,
    );

    await expect(
      service.execute({
        userId: 'user-1',
        actorId: 'user-1',
        type: 'POST_REACTION',
        refId: 'post-1',
        aggregateKey: 'post-reaction:post-1',
      }),
    ).resolves.toBeNull();

    expect(notificationRepository.upsert).not.toHaveBeenCalled();
  });
});
