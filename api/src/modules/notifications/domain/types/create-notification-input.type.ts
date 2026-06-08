import { NotificationType } from '@/generated/prisma/client.js';

export type CreateNotificationInput = {
  userId: string;
  actorId?: string | null;
  type: NotificationType;
  refId?: string | null;
  aggregateKey: string;
  message?: string | null;
};
