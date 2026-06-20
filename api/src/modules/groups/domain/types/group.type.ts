import { GroupMemberRole, GroupPrivacy } from '@/generated/prisma/client.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';

export type CreateGroupInput = {
  ownerId: string;
  name: string;
  description?: string | null;
  privacy?: GroupPrivacy;
};

export type ListGroupsInput = {
  viewerId?: string;
  search?: string;
  limit: number;
  cursor?: string;
};

export type ListGroupsPage = {
  items: Group[];
  nextCursor: string | null;
};

export type GroupMembership = {
  groupId: string;
  userId: string;
  role: GroupMemberRole;
};

export type JoinGroupResult =
  | { status: 'member'; group: Group }
  | { status: 'pending'; group: Group };
