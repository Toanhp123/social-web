import { GroupJoinRequestStatus } from '@/generated/prisma/client.js';
import { GroupUser } from '@/modules/groups/domain/entities/group-user.entity.js';

export class GroupJoinRequest {
  constructor(
    public readonly id: string,
    public readonly groupId: string,
    public readonly requesterId: string,
    public readonly status: GroupJoinRequestStatus,
    public readonly createdAt: Date,
    public readonly requester: GroupUser | null = null,
  ) {}
}
