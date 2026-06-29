import { Module } from '@nestjs/common';
import { RealtimeModule } from '@/core/realtime/realtime.module.js';
import { UserModule } from '@/modules/users/user.module.js';
import { CreateNotificationService } from '@/modules/notifications/application/services/create-notification.service.js';
import { NotifyMentionedUsersService } from '@/modules/notifications/application/services/notify-mentioned-users.service.js';
import { NotificationPersistenceModule } from '@/modules/notifications/infrastructure/persistence/notification-persistence.module.js';

@Module({
  imports: [NotificationPersistenceModule, RealtimeModule, UserModule],
  providers: [CreateNotificationService, NotifyMentionedUsersService],
  exports: [CreateNotificationService, NotifyMentionedUsersService],
})
export class NotificationsModule {}
