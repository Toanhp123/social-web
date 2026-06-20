import { GroupJoinRequestStatus } from '@/generated/prisma/client.js';

export class GroupJoinRequest {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly requesterId: string,
    public readonly status: GroupJoinRequestStatus,
    public readonly createdAt: Date,
  ) {}
}
