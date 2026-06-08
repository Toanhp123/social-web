import { NotificationType } from '@/generated/prisma/client.js';

export class Notification {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly actorId: string | null,
    public readonly type: NotificationType,
    public readonly refId: string | null,
    public readonly message: string | null,
    public readonly readAt: Date | null,
    public readonly createdAt: Date,
    public readonly count: number,
  ) {}
}
