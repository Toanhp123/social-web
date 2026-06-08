import { Notification } from '@/modules/notifications/domain/entities/notification.entity.js';
import { CreateNotificationInput } from '@/modules/notifications/domain/types/create-notification-input.type.js';

export abstract class NotificationRepository {
  abstract upsert(input: CreateNotificationInput): Promise<Notification>;
}
