import { Module } from '@nestjs/common';
import { NOTIFICATION_REPOSITORY } from '@/common/constants/provider-token.constant.js';
import { DatabaseModule } from '@/infrastructure/database/database.module.js';
import { RealtimeModule } from '@/core/realtime/realtime.module.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { PrismaNotificationRepository } from '@/modules/notifications/infrastructure/persistence/prisma-notification.repository.js';

@Module({
  imports: [DatabaseModule, RealtimeModule],
  providers: [
    CreateNotificationService,
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: PrismaNotificationRepository,
    },
  ],
  exports: [CreateNotificationService],
})
export class NotificationsModule {}
