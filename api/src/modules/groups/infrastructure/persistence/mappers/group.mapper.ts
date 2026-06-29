import {
  GroupJoinRequestStatus,
  GroupMemberRole,
  type Prisma,
} from '@/generated/prisma/client.js';
import { Group } from '@/modules/groups/domain/entities/group.entity.js';
import { GroupJoinRequest } from '@/modules/groups/domain/entities/group-join-request.entity.js';
import { GroupMediaItem } from '@/modules/groups/domain/entities/group-media-item.entity.js';
import { GroupMember } from '@/modules/groups/domain/entities/group-member.entity.js';
import { GroupUser } from '@/modules/groups/domain/entities/group-user.entity.js';
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

type GroupJoinRequestWithRequesterPayload = Prisma.GroupJoinRequestGetPayload<{
  include: {
    requester: {
      select: typeof GROUP_USER_SELECT;
    };
  };
}>;

type GroupMemberPayload = Prisma.GroupMemberGetPayload<{
  include: {
    user: {
      select: typeof GROUP_USER_SELECT;
    };
  };
}>;

type GroupMediaPayload = Prisma.MediaGetPayload<{
  include: {
    post: {
      select: {
        id: true;
        createdAt: true;
        author: {
          select: typeof GROUP_USER_SELECT;
        };
      };
    };
  };
}>;

export const GROUP_USER_SELECT = {
  id: true,
  fullName: true,
  username: true,
  avatarUrl: true,
} as const;

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
    request: GroupJoinRequestPayload | GroupJoinRequestWithRequesterPayload,
  ): GroupJoinRequest {
    return new GroupJoinRequest(
      request.id,
      request.groupId,
      request.requesterId,
      request.status,
      request.createdAt,
      'requester' in request ? this.toUserDomain(request.requester) : null,
    );
  }

  static toMemberDomain(member: GroupMemberPayload): GroupMember {
    return new GroupMember(
      member.groupId,
      member.userId,
      member.role,
      member.joinedAt,
      this.toUserDomain(member.user),
    );
  }

  static toMediaDomain(media: GroupMediaPayload): GroupMediaItem {
    return new GroupMediaItem(
      media.id,
      media.post.id,
      media.url,
      media.thumbnailUrl,
      media.type,
      media.alt,
      media.post.createdAt,
      this.toUserDomain(media.post.author),
    );
  }

  private static toUserDomain(user: {
    id: string;
    fullName: string;
    username: string | null;
    avatarUrl: string | null;
  }): GroupUser {
    return new GroupUser(user.id, user.fullName, user.username, user.avatarUrl);
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
