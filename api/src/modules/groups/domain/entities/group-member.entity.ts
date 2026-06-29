import { GroupMemberRole } from '@/generated/prisma/client.js';
import { GroupUser } from '@/modules/groups/domain/entities/group-user.entity.js';

export class GroupMember {
  constructor(
    public readonly groupId: string,
    public readonly userId: string,
    public readonly role: GroupMemberRole,
    public readonly joinedAt: Date,
    public readonly user: GroupUser,
  ) {}
}
