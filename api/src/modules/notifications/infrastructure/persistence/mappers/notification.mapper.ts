import { Prisma } from '@/generated/prisma/client.js';
import { Notification } from '@/modules/notifications/domain/entities/notification.entity.js';
import { CreateNotificationInput } from '@/modules/notifications/domain/types/create-notification-input.type.js';

type NotificationPayload = Prisma.NotificationGetPayload<object>;

export class NotificationMapper {
  static toDomain(notification: NotificationPayload): Notification {
    return new Notification(
      notification.id,
      notification.userId,
      notification.actorId,
      notification.type,
      notification.refId,
      notification.message,
      notification.readAt,
      notification.createdAt,
      notification.count,
    );
  }

  static toCreateData(
    input: CreateNotificationInput,
  ): Prisma.NotificationUncheckedCreateInput {
    return {
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type,
      refId: input.refId ?? null,
      aggregateKey: input.aggregateKey,
      message: input.message ?? null,
    };
  }

  static toUpdateData(
    input: CreateNotificationInput,
  ): Prisma.NotificationUncheckedUpdateInput {
    return {
      actorId: input.actorId ?? null,
      refId: input.refId ?? null,
      message: input.message ?? null,
      readAt: null,
      deletedAt: null,
      count: {
        increment: 1,
      },
    };
  }
}
