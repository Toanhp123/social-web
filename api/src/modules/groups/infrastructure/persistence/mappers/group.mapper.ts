import {
  GroupJoinRequestStatus,
  GroupMemberRole,
  type Prisma,
} from '@/generated/prisma/client.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import { CreateGroupInput } from '@/modules/groups/domain/types/group.type.js';

export function getGroupInclude(viewerId?: string) {
  return {
    members: {
      where: { userId: viewerId ?? '__anonymous_viewer__' },
      select: { role: true },
      take: 1,
    },
    joinRequests: {
      where: {
        requesterId: viewerId ?? '__anonymous_viewer__',
        status: GroupJoinRequestStatus.PENDING,
      },
      select: { status: true },
      take: 1,
    },
  } as const;
}

type GroupPayload = Prisma.GroupGetPayload<{
  include: ReturnType<typeof getGroupInclude>;
}>;

type GroupJoinRequestPayload = Prisma.GroupJoinRequestGetPayload<object>;

export class GroupMapper {
  static includeForViewer = getGroupInclude;

  static toDomain(group: GroupPayload): Group {
    return new Group(
      group.id,
      group.ownerId,
      group.name,
      group.slug,
      group.description,
      group.privacy,
      group.avatarUrl,
      group.coverUrl,
      group.memberCount,
      group.createdAt,
      {
        role: group.members.at(0)?.role ?? null,
        joinRequestStatus: group.joinRequests.at(0)?.status ?? null,
      },
    );
  }

  static toJoinRequestDomain(
    request: GroupJoinRequestPayload,
  ): GroupJoinRequest {
    return new GroupJoinRequest(
      request.id,
      request.groupId,
      request.requesterId,
      request.status,
      request.createdAt,
    );
  }

  static toPersistence(input: CreateGroupInput & { slug: string }) {
    return {
      ownerId: input.ownerId,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      privacy: input.privacy,
      members: {
        create: {
          userId: input.ownerId,
          role: GroupMemberRole.OWNER,
        },
      },
    } satisfies Prisma.GroupUncheckedCreateInput;
  }
}
