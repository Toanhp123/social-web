import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service.js';
import { mapPrismaError } from '@/infrastructure/database/prisma-error.mapper.js';
import { Notification } from '@/modules/notifications/domain/entities/notification.entity.js';
import { NotificationRepository } from '@/modules/notifications/domain/repositories/notification.repository.interface.js';
import { CreateNotificationInput } from '@/modules/notifications/domain/types/create-notification-input.type.js';
import { NotificationMapper } from '@/modules/notifications/infrastructure/persistence/mappers/notification.mapper.js';

@Injectable()
export class PrismaNotificationRepository implements NotificationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsert(input: CreateNotificationInput): Promise<Notification> {
    try {
      const notification = await this.prisma.notification.upsert({
        where: {
          userId_aggregateKey: {
            userId: input.userId,
            aggregateKey: input.aggregateKey,
          },
        },
        create: NotificationMapper.toCreateData(input),
        update: NotificationMapper.toUpdateData(input),
      });

      return NotificationMapper.toDomain(notification);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
