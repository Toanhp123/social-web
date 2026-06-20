import {
  GroupJoinRequestStatus,
  GroupMemberRole,
  GroupPrivacy,
} from '@/generated/prisma/client.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import { ListGroupsPage } from '@/modules/groups/domain/types/group.type.js';

export class GroupViewerResponseDto {
  role!: GroupMemberRole | null;
  joinRequestStatus!: GroupJoinRequestStatus | null;
}

export class GroupResponseDto {
  id!: string;
  ownerId!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  privacy!: GroupPrivacy;
  avatarUrl!: string | null;
  coverUrl!: string | null;
  memberCount!: number;
  createdAt!: string;
  viewer!: GroupViewerResponseDto;

  static fromDomain(group: Group): GroupResponseDto {
    return {
      id: group.id,
      ownerId: group.ownerId,
      name: group.name,
      slug: group.slug,
      description: group.description,
      privacy: group.privacy,
      avatarUrl: group.avatarUrl,
      coverUrl: group.coverUrl,
      memberCount: group.memberCount,
      createdAt: group.createdAt.toISOString(),
      viewer: group.viewer,
    };
  }
}

export class GroupPageResponseDto {
  items!: GroupResponseDto[];
  nextCursor!: string | null;

  static fromDomain(page: ListGroupsPage): GroupPageResponseDto {
    return {
      items: page.items.map((group) => GroupResponseDto.fromDomain(group)),
      nextCursor: page.nextCursor,
    };
  }
}

export class JoinGroupResponseDto {
  status!: 'member' | 'pending';
  group!: GroupResponseDto;
}

export class GroupJoinRequestResponseDto {
  id!: string;
  groupId!: string;
  requesterId!: string;
  status!: GroupJoinRequestStatus;
  createdAt!: string;

  static fromDomain(request: GroupJoinRequest): GroupJoinRequestResponseDto {
    return {
      id: request.id,
      groupId: request.groupId,
      requesterId: request.requesterId,
      status: request.status,
      createdAt: request.createdAt.toISOString(),
    };
  }
}
