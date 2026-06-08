import { Inject, Injectable } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { RealtimePublisher } from '@/core/realtime/realtime-publisher.service.js';
import { Notification } from '@/modules/notifications/domain/entities/notification.entity.js';
import { NotificationRepository } from '@/modules/notifications/domain/repositories/notification.repository.interface.js';
import { CreateNotificationInput } from '@/modules/notifications/domain/types/create-notification-input.type.js';

@Injectable()
export class CreateNotificationService {
  constructor(
    @Inject(NOTIFICATION_REPOSITORY)
    private readonly notificationRepository: NotificationRepository,

    private readonly realtimePublisher: RealtimePublisher,
  ) {}

  async execute(input: CreateNotificationInput): Promise<Notification | null> {
    if (!input.actorId || input.actorId === input.userId) {
      return null;
    }

    const notification = await this.notificationRepository.upsert(input);

    this.realtimePublisher.publishToUser(notification.userId, {
      type: 'notification.created',
      data: {
        id: notification.id,
        userId: notification.userId,
        actorId: notification.actorId,
        type: notification.type,
        refId: notification.refId,
        message: notification.message,
        count: notification.count,
        readAt: notification.readAt?.toISOString() ?? null,
        createdAt: notification.createdAt.toISOString(),
      },
    });

    return notification;
  }
}
